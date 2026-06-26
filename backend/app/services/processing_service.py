from sqlalchemy.orm import Session

import os

from app.repositories import TrainingRepository, LabelRepository, RatioDataRepository
from app.database.models import Training, Label, RatioDataSplit

from app.schemas.processing_schemas import AddRatio

from app.ml.processing.training_dataset import TrainingDataset

class ProcessingService:
  def __init__(self):
    self.training_repository = TrainingRepository()
    self.label_repository = LabelRepository()
    self.ratio_repository = RatioDataRepository()

  def get_all_models(self, db: Session):
    models = self.training_repository.get_all(db)
    result = []
    for m in models:
        result.append({
            "idTraining": m.idTraining,
            "idDataset": m.idDataset,
            "idRatioDataSplit": m.idRatioDataSplit,
            "modelName": m.modelName,
            "LSTMUnits1": m.LSTMUnits1,
            "LSTMUnits2": m.LSTMUnits2,
            "dropout1": m.dropout1,
            "dropout2": m.dropout2,
            "denseUnits": m.denseUnits,
            "epochs": m.epochs,
            "batchSize": m.batchSize,
            "learningRate": m.learningRate,
            "accuracy": m.accuracy,
            "precision": m.precision,
            "recall": m.recall,
            "f1score": m.f1score,
            "confusionMatrix": m.confusionMatrix,
            "weightedAverage": m.weightedAverage,
            "macroAverage": m.macroAverage,
            "trainLoss": m.trainLoss,
            "valLoss": m.valLoss,
            "mcc": m.mcc,
            "trainModelPath": m.trainModelPath,
            "createdAt": m.createdAt.isoformat() if m.createdAt else None,
            "datasetName": m.dataset.datasetName if m.dataset else None,
            "totalData": m.dataset.totalData if m.dataset else 0,
            "totalLabel": m.dataset.totalLabel if m.dataset else 0,
            "trainRatio": m.ratio_data_split.trainRatio if m.ratio_data_split else None
        })
    return result
  
  # Ratio Data
  def get_all_ratio(self, db: Session):
    return self.ratio_repository.get_all(db)
  
  def add_ratio(self, db: Session, ratio_data: AddRatio):
    db_ratio = RatioDataSplit(
        trainRatio=ratio_data.trainRatio,
        # bestRatio=False # opsional, bisa set default
    )
    return self.ratio_repository.create(db, db_ratio)
  
  def get_best_ratio(self, db: Session):
    return self.ratio_repository.get_by_best_ratio(db, True)
  
  # def start_test_ratio(self, db: Session, dataset_path, bestRatio: bool):

  # Training
  def start_training(
      self,
      db: Session,
      dataset_path,
      lstm_units1,
      lstm_units2,
      dropout1,
      dropout2,
      dense_units,
      epochs,
      batch_size,
      learning_rate
  ):
      bestRatio = self.ratio_repository.get_by_best_ratio(db, True)
      test_size = 0.2
      if bestRatio and bestRatio.trainRatio:
          try:
              parts = bestRatio.trainRatio.split(":")
              if len(parts) == 2:
                  train_val = float(parts[0])
                  test_val = float(parts[1])
                  test_size = test_val / (train_val + test_val)
          except Exception:
              pass

      trainer = TrainingDataset(
          dataset_path=dataset_path,
          lstm_units1=lstm_units1,
          lstm_units2=lstm_units2,
          dropout1=dropout1,
          dropout2=dropout2,
          dense_units=dense_units,
          epochs=epochs,
          batch_size=batch_size,
          learning_rate=learning_rate,
          test_size=test_size
      )

      return trainer.train()

  def delete_ratio(self, db: Session, idRatioDataSplit: int):
      ratio = self.ratio_repository.get_by_id(db, idRatioDataSplit, RatioDataSplit.idRatioDataSplit)
      if not ratio:
          raise ValueError("Ratio not found")
      self.ratio_repository.delete(db, ratio)
      return True

  def test_ratios_generator(self, db: Session, epochs: int, batch_size: int, learning_rate: float):
      import queue
      import threading
      import json
      from app.database.models import Dataset
      
      q = queue.Queue()
      
      def run_training():
          from app.database.connection import SessionLocal
          thread_db = SessionLocal()
          try:
              # 1. Get all ratios
              ratios = thread_db.query(RatioDataSplit).all()
              if not ratios:
                  q.put({"type": "error", "message": "Tidak ada split ratio terdaftar. Tambahkan ratio terlebih dahulu."})
                  q.put({"type": "done"})
                  return
                  
              # 2. Get latest dataset with preprocessingResultPath
              dataset = thread_db.query(Dataset).filter(Dataset.preprocessingResultPath != None).order_by(Dataset.idDataset.desc()).first()
              if not dataset:
                  q.put({"type": "error", "message": "Tidak ada dataset yang siap (belum dipreprocess)"})
                  q.put({"type": "done"})
                  return
                  
              dataset_path = dataset.preprocessingResultPath
              
              best_acc = -1.0
              best_ratio_id = None
              
              for ratio in ratios:
                  # parse test_size from "80:20"
                  test_size = 0.2
                  try:
                      parts = ratio.trainRatio.split(":")
                      if len(parts) == 2:
                          train_val = float(parts[0])
                          test_val = float(parts[1])
                          test_size = test_val / (train_val + test_val)
                  except Exception:
                      pass
                  
                  q.put({"type": "ratio_start", "ratio": ratio.trainRatio})
                  
                  # Define callback for Keras epoch ends
                  def epoch_callback(epoch, logs):
                      q.put({
                          "type": "epoch",
                          "ratio": ratio.trainRatio,
                          "epoch": epoch,
                          "loss": float(logs.get("loss", 0)),
                          "accuracy": float(logs.get("accuracy", 0)),
                          "val_loss": float(logs.get("val_loss", 0)),
                          "val_accuracy": float(logs.get("val_accuracy", 0))
                      })
                  
                  # Initialize and run trainer
                  trainer = TrainingDataset(
                      dataset_path=dataset_path,
                      lstm_units1=128,
                      lstm_units2=64,
                      dropout1=0.3,
                      dropout2=0.3,
                      dense_units=64,
                      epochs=epochs,
                      batch_size=batch_size,
                      learning_rate=learning_rate,
                      test_size=test_size
                  )
                  
                  model, encoder, results = trainer.train(epoch_callback=epoch_callback)
                  
                  # Update ratio metrics in DB
                  ratio.epochs = str(epochs)
                  ratio.batchSize = str(batch_size)
                  ratio.learningRate = learning_rate
                  ratio.accuracy = results["accuracy"]
                  ratio.precision = results["precision"]
                  ratio.recall = results["recall"]
                  ratio.f1score = results["f1score"]
                  thread_db.commit()
                  
                  # Check for best ratio
                  if results["accuracy"] > best_acc:
                      best_acc = results["accuracy"]
                      best_ratio_id = ratio.idRatioDataSplit
              
              # Update bestRatio flag in DB
              for ratio in ratios:
                  if ratio.idRatioDataSplit == best_ratio_id:
                      ratio.bestRatio = True
                  else:
                      ratio.bestRatio = False
              thread_db.commit()
              
              # Send the final ratios list to client
              # Map SQLAlchemy object to dictionary for JSON serialization
              ratios_data = []
              for r in ratios:
                  ratios_data.append({
                      "idRatioDataSplit": r.idRatioDataSplit,
                      "trainRatio": r.trainRatio,
                      "epochs": r.epochs,
                      "batchSize": r.batchSize,
                      "learningRate": r.learningRate,
                      "accuracy": r.accuracy,
                      "precision": r.precision,
                      "recall": r.recall,
                      "f1score": r.f1score,
                      "bestRatio": r.bestRatio
                  })
                  
              q.put({"type": "complete", "data": ratios_data})
              q.put({"type": "done"})
          except Exception as e:
              import traceback
              traceback.print_exc()
              q.put({"type": "error", "message": str(e)})
              q.put({"type": "done"})
          finally:
              thread_db.close()
 
      # Run training in background thread
      t = threading.Thread(target=run_training)
      t.start()
      
      # Yield from queue
      while True:
          try:
              item = q.get(timeout=0.5)
              if item.get("type") == "done":
                  break
              yield json.dumps(item) + "\n"
          except queue.Empty:
              if not t.is_alive():
                  break

  def train_model_generator(
      self,
      db: Session,
      modelName: str,
      lstm_units1: int,
      lstm_units2: int,
      dropout1: float,
      dropout2: float,
      dense_units: int,
      epochs: int,
      batch_size: int,
      learning_rate: float
  ):
      import queue
      import threading
      import json
      import os
      from app.database.models import Dataset, RatioDataSplit, Training
      
      q = queue.Queue()
      
      def run_training():
          from app.database.connection import SessionLocal
          thread_db = SessionLocal()
          try:
              # 1. Get latest dataset with preprocessingResultPath
              dataset = thread_db.query(Dataset).filter(Dataset.preprocessingResultPath != None).order_by(Dataset.idDataset.desc()).first()
              if not dataset:
                  q.put({"type": "error", "message": "Tidak ada dataset yang siap (belum dipreprocess)"})
                  q.put({"type": "done"})
                  return
                  
              dataset_path = dataset.preprocessingResultPath
              
              # 2. Get best split ratio
              bestRatio = thread_db.query(RatioDataSplit).filter(RatioDataSplit.bestRatio == True).first()
              test_size = 0.2
              idRatioDataSplit = None
              if bestRatio:
                  idRatioDataSplit = bestRatio.idRatioDataSplit
                  try:
                      parts = bestRatio.trainRatio.split(":")
                      if len(parts) == 2:
                          train_val = float(parts[0])
                          test_val = float(parts[1])
                          test_size = test_val / (train_val + test_val)
                  except Exception:
                      pass
              
              q.put({"type": "training_start", "modelName": modelName})
              
              # Define callback for Keras epoch ends
              def epoch_callback(epoch, logs):
                  q.put({
                      "type": "epoch",
                      "modelName": modelName,
                      "epoch": epoch,
                      "loss": float(logs.get("loss", 0)),
                      "accuracy": float(logs.get("accuracy", 0)),
                      "val_loss": float(logs.get("val_loss", 0)),
                      "val_accuracy": float(logs.get("val_accuracy", 0))
                  })
              
              # Initialize and run trainer
              trainer = TrainingDataset(
                  dataset_path=dataset_path,
                  lstm_units1=lstm_units1,
                  lstm_units2=lstm_units2,
                  dropout1=dropout1,
                  dropout2=dropout2,
                  dense_units=dense_units,
                  epochs=epochs,
                  batch_size=batch_size,
                  learning_rate=learning_rate,
                  test_size=test_size
              )
              
              model, encoder, results = trainer.train(epoch_callback=epoch_callback)
              
              # Save model to file
              model_dir = os.path.join("storage", "models")
              os.makedirs(model_dir, exist_ok=True)
              model_filename = f"{modelName}.h5"
              model_path = os.path.join(model_dir, model_filename)
              model.save(model_path)
              
              import datetime
              now = datetime.datetime.now(datetime.timezone.utc)

              # Save training data to DB
              new_training = Training(
                  idDataset=dataset.idDataset,
                  idRatioDataSplit=idRatioDataSplit,
                  modelName=modelName,
                  LSTMUnits1=lstm_units1,
                  LSTMUnits2=lstm_units2,
                  dropout1=dropout1,
                  dropout2=dropout2,
                  denseUnits=dense_units,
                  epochs=epochs,
                  batchSize=batch_size,
                  learningRate=learning_rate,
                  accuracy=results["accuracy"],
                  precision=results["precision"],
                  recall=results["recall"],
                  f1score=results["f1score"],
                  confusionMatrix=results["confusionMatrix"],
                  weightedAverage=results["weightedAverage"],
                  macroAverage=results["macroAverage"],
                  trainLoss=results["trainLoss"],
                  valLoss=results["valLoss"],
                  mcc=results["mcc"],
                  trainModelPath=model_path,
                  createdAt=now,
                  updatedAt=now
              )
              thread_db.add(new_training)
              thread_db.commit()
              thread_db.refresh(new_training)
              
              # Map SQLAlchemy object to dictionary for JSON serialization
              training_data = {
                  "idTraining": new_training.idTraining,
                  "idDataset": new_training.idDataset,
                  "idRatioDataSplit": new_training.idRatioDataSplit,
                  "modelName": new_training.modelName,
                  "LSTMUnits1": new_training.LSTMUnits1,
                  "LSTMUnits2": new_training.LSTMUnits2,
                  "dropout1": new_training.dropout1,
                  "dropout2": new_training.dropout2,
                  "denseUnits": new_training.denseUnits,
                  "epochs": new_training.epochs,
                  "batchSize": new_training.batchSize,
                  "learningRate": new_training.learningRate,
                  "accuracy": new_training.accuracy,
                  "precision": new_training.precision,
                  "recall": new_training.recall,
                  "f1score": new_training.f1score,
                  "confusionMatrix": new_training.confusionMatrix,
                  "weightedAverage": new_training.weightedAverage,
                  "macroAverage": new_training.macroAverage,
                  "trainLoss": new_training.trainLoss,
                  "valLoss": new_training.valLoss,
                  "mcc": new_training.mcc,
                  "trainModelPath": new_training.trainModelPath,
                  "createdAt": new_training.createdAt.isoformat() if new_training.createdAt else None
              }
              
              q.put({"type": "complete", "data": training_data})
              q.put({"type": "done"})
          except Exception as e:
              import traceback
              traceback.print_exc()
              q.put({"type": "error", "message": str(e)})
              q.put({"type": "done"})
          finally:
              thread_db.close()
              
      # Run training in background thread
      t = threading.Thread(target=run_training)
      t.start()
      
      # Yield from queue
      while True:
          try:
              item = q.get(timeout=0.5)
              if item.get("type") == "done":
                  break
              yield json.dumps(item) + "\n"
          except queue.Empty:
              if not t.is_alive():
                  break

  def get_model_by_id(self, db: Session, idTraining: int):
      model = self.training_repository.get_by_id(db, idTraining, Training.idTraining)
      
      if not model:
          raise ValueError("Model not found")
      
      return self.training_repository.get_by_id(db, idTraining, Training.idTraining)

  def delete_model(self, db: Session, idTraining: int):
      import os
      from app.database.models import Training
      training = self.training_repository.get_by_id(db, idTraining, Training.idTraining)
      if not training:
          raise ValueError("Model not found")
          
      # Delete file if exists
      if training.trainModelPath and os.path.exists(training.trainModelPath):
          try:
              os.remove(training.trainModelPath)
          except Exception as e:
              print(f"Error removing model file: {e}")
              
      self.training_repository.delete(db, training)
      return True