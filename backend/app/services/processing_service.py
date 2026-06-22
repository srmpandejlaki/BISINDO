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
    return self.training_repository.get_all(db)
  
  # Ratio Data
  def get_all_ratio(self, db: Session):
    return self.ratio_repository.get_all(db)
  
  def add_ratio(self, db: Session, ratio_data: AddRatio):
    db_ratio = RatioDataSplit(
        trainRatio=ratio_data.trainRatio,
        # bestRatio=False # opsional, bisa set default
    )
    return self.ratio_repository.create(db, db_ratio)

  def delete_ratio(self, db: Session, idRatioDataSplit: int):
    return self.ratio_repository.delete(db, idRatioDataSplit)
  
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

      trainer = TrainingDataset(
          dataset_path=dataset_path,
          bestRatio=bestRatio,

          lstm_units1=lstm_units1,
          lstm_units2=lstm_units2,

          dropout1=dropout1,
          dropout2=dropout2,

          dense_units=dense_units,

          epochs=epochs,
          batch_size=batch_size,

          learning_rate=learning_rate
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
          try:
              # 1. Get all ratios
              ratios = self.ratio_repository.get_all(db)
              if not ratios:
                  q.put({"type": "error", "message": "Tidak ada split ratio terdaftar. Tambahkan ratio terlebih dahulu."})
                  q.put({"type": "done"})
                  return
                  
              # 2. Get latest dataset with preprocessingResultPath
              dataset = db.query(Dataset).filter(Dataset.preprocessingResultPath != None).order_by(Dataset.idDataset.desc()).first()
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
                  db.commit()
                  
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
              db.commit()
              
              # Send the final ratios list to client
              updated_ratios = self.ratio_repository.get_all(db)
              # Map SQLAlchemy object to dictionary for JSON serialization
              ratios_data = []
              for r in updated_ratios:
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