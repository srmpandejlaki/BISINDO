from sqlalchemy.orm import Session

import os

from app.repositories import TrainingRepository, LabelRepository, RatioDataRepository, DatasetRepository, RawDataRepository
from app.database.models import Training, RatioDataSplit, Dataset

from app.schemas.processing_schemas import AddRatio

from app.ml.hand_skeleton.extractor import HandSkeletonExtractor
from app.ml.processing.training_dataset import TrainingDataset

class ProcessingService:
  def __init__(self):
    self.training_repository = TrainingRepository()
    self.label_repository = LabelRepository()
    self.ratio_repository = RatioDataRepository()
    self.dataset_repository = DatasetRepository()
    self.raw_data_repository = RawDataRepository()

# Hand Skeleton
  def get_datasets_preprocess(self, db: Session):
    result = self.dataset_repository.get_datasets_preprocess(db)

    dataset = []
    for d, totalData in result:
        status = self.raw_data_repository.get_processing_status(db, d.idDataset)
        dataset.append({
            "idDataset": d.idDataset,
            "datasetName": d.datasetName,
            "datasetFolderPath": d.datasetFolderPath,
            "preprocessedFolderPath": d.preprocessedFolderPath,
            "totalData": totalData,
            "totalPreprocessed": status.total if status else 0,
            "processedLandmark": status.processed if status else 0,
            "remainingLandmark": (status.total - status.processed) if status else 0
        })

    return dataset
  
  def get_datasets_landmark(self, db: Session):
    return self.dataset_repository.get_datasets_landmark(db)
  
  def get_datasets_landmark_by_id(self, db: Session, idDataset: int):
    dataset = self.dataset_repository.get_by_id(db, idDataset, Dataset.idDataset)
    if not dataset:
        raise ValueError("Dataset tidak ditemukan.")
    
    raw_datas = self.raw_data_repository.get_by_id_dataset(db, idDataset)
    raw_data_list = []
    for rd in raw_datas:
        raw_data_list.append({
            "idRawData": rd.idRawData,
            "dataName": rd.dataName,
            "labelName": rd.label.labelName if rd.label else None,
            "preprocessedFilePath": rd.preprocessedFilePath,
            "landmarkFilePath": rd.landmarkFilePath
        })
        
    return {
        "idDataset": dataset.idDataset,
        "datasetName": dataset.datasetName,
        "landmarkFolderPath": dataset.landmarkFolderPath,
        "rawData": raw_data_list
    }

  def process_dataset(
    self,
    db: Session,
    idDataset: int,
    config: dict
  ):
    dataset = self.dataset_repository.get_by_id(
        db,
        idDataset,
        Dataset.idDataset
    )

    if not dataset:
        raise ValueError(
            "Dataset tidak ditemukan."
        )

    landmark_folder = os.path.join(
        "storage",
        "landmarks",
        dataset.datasetName
    )

    os.makedirs(
        landmark_folder,
        exist_ok=True
    )

    raw_data_list = (
        self.raw_data_repository
        .get_not_processed_by_dataset(
            db,
            idDataset
        )
    )

    if not raw_data_list:
        raise ValueError(
            "Semua data pada dataset ini sudah selesai diekstraksi skeletonnya."
        )
    
    extractor = HandSkeletonExtractor(
        max_num_hands=config.get("max_num_hands", 2),
        min_detection_confidence=config.get("min_detection_confidence", 0.5),
        min_tracking_confidence=config.get("min_tracking_confidence", 0.5),
        min_detection_ratio=config.get("min_detection_ratio", 0.9)
    )
    results = []

    processed = 0

    failed = 0

    for index, raw_data in enumerate(
        raw_data_list
    ):
        input_path = (
            raw_data.preprocessedFilePath
        )

        base_name = os.path.splitext(raw_data.dataName)[0]
        output_path = os.path.join(
            landmark_folder,
            f"{base_name}.npy"
        )

        try:
            result = (
                extractor.process_video(
                    input_path,
                    output_path
                )
            )

            self.raw_data_repository.update_landmark_file(
                db,
                raw_data,
                output_path
            )
            processed += 1

        except Exception as e:
            result = {
                "input_path": input_path,
                "error": str(e),
                "success": False
            }
            failed += 1

        results.append(
            result
        )
    extractor.close()

    dataset.landmarkFolderPath = landmark_folder

    db.commit()
    db.refresh(dataset)
    
    return {
        "dataset": dataset,
        "processed": processed,
        "failed": failed,
        "results": results
    }
  
  def get_processing_status(
    self,
    db,
    idDataset
  ):
    status = self.raw_data_repository.get_processing_status(
        db,
        idDataset
    )
    return {
        "totalVideo": status.total,
        "processed": status.processed,
        "remaining":
            status.total - status.processed
    }
  
# Model
  def get_all_models(self, db: Session):
    models = self.training_repository.get_all(db)
    result = []
    for m in models:
        total_data = self.dataset_repository.count_total_data_by_dataset(db, m.idDataset)

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
            "epoch": m.epoch,
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
            "totalData": total_data,
            # "totalLabel": m.dataset.totalLabel if m.dataset else 0,
            "trainRatio": m.ratio_data_split.trainRatio if m.ratio_data_split else None
        })
    return result
  
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
      epoch,
      batch_size,
      learning_rate
  ):
       bestRatio = self.ratio_repository.get_by_best_ratio(db, True)
       test_size = 0.2
       val_size = 0.2
       if bestRatio and bestRatio.trainRatio:
           try:
               parts = bestRatio.trainRatio.split(":")
               if len(parts) == 3:
                   train_val = float(parts[0])
                   test_val = float(parts[1])
                   val_val = float(parts[2])
                   total = train_val + test_val + val_val
                   test_size = test_val / total
                   val_size = val_val / (train_val + val_val)
               elif len(parts) == 2:
                   train_val = float(parts[0])
                   test_val = float(parts[1])
                   test_size = test_val / (train_val + test_val)
                   val_size = 0.2
           except Exception:
               pass

       trainer = TrainingDataset(
           dataset_path=dataset_path,
           lstm_units1=lstm_units1,
           lstm_units2=lstm_units2,
           dropout1=dropout1,
           dropout2=dropout2,
           dense_units=dense_units,
           epoch=epoch,
           batch_size=batch_size,
           learning_rate=learning_rate,
           test_size=test_size,
           val_size=val_size
       )

       return trainer.train()

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
 
  def delete_ratio(self, db: Session, idRatioDataSplit: int):
      ratio = self.ratio_repository.get_by_id(db, idRatioDataSplit, RatioDataSplit.idRatioDataSplit)
      if not ratio:
          raise ValueError("Ratio not found")
      self.ratio_repository.delete(db, ratio)
      return True

  def test_ratios_generator(self, db: Session, epoch: int, batch_size: int, learning_rate: float):
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
                  
              # 2. Get latest dataset with landmarkFolderPath
              dataset = thread_db.query(Dataset).filter(Dataset.landmarkFolderPath != None).order_by(Dataset.idDataset.desc()).first()
              if not dataset:
                  q.put({"type": "error", "message": "Tidak ada dataset yang siap (belum dipreprocess)"})
                  q.put({"type": "done"})
                  return
                  
              dataset_path = dataset.landmarkFolderPath
              
              best_acc = -1.0
              best_ratio_id = None
              
              for ratio in ratios:
                  # parse test_size from "80:20" or "70:15:15"
                  test_size = 0.2
                  val_size = 0.2
                  try:
                      parts = ratio.trainRatio.split(":")
                      if len(parts) == 3:
                          train_val = float(parts[0])
                          test_val = float(parts[1])
                          val_val = float(parts[2])
                          total = train_val + test_val + val_val
                          test_size = test_val / total
                          val_size = val_val / (train_val + val_val)
                      elif len(parts) == 2:
                          train_val = float(parts[0])
                          test_val = float(parts[1])
                          test_size = test_val / (train_val + test_val)
                          val_size = 0.2
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
                      epoch=epoch,
                      batch_size=batch_size,
                      learning_rate=learning_rate,
                      test_size=test_size,
                      val_size=val_size
                  )
                  
                  model, encoder, results = trainer.train(epoch_callback=epoch_callback)
                  
                  # Update ratio metrics in DB
                  ratio.epoch = str(epoch)
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
                      "epoch": r.epoch,
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
      epoch: int,
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
              # 1. Get latest dataset with landmarkFolderPath
              dataset = thread_db.query(Dataset).filter(Dataset.landmarkFolderPath != None).order_by(Dataset.idDataset.desc()).first()
              if not dataset:
                  q.put({"type": "error", "message": "Tidak ada dataset yang siap (belum dipreprocess)"})
                  q.put({"type": "done"})
                  return
                  
              dataset_path = dataset.landmarkFolderPath
              
              # 2. Get best split ratio
              bestRatio = thread_db.query(RatioDataSplit).filter(RatioDataSplit.bestRatio == True).first()
              test_size = 0.2
              val_size = 0.2
              idRatioDataSplit = None
              if bestRatio:
                  idRatioDataSplit = bestRatio.idRatioDataSplit
                  try:
                      parts = bestRatio.trainRatio.split(":")
                      if len(parts) == 3:
                          train_val = float(parts[0])
                          test_val = float(parts[1])
                          val_val = float(parts[2])
                          total = train_val + test_val + val_val
                          test_size = test_val / total
                          val_size = val_val / (train_val + val_val)
                      elif len(parts) == 2:
                          train_val = float(parts[0])
                          test_val = float(parts[1])
                          test_size = test_val / (train_val + test_val)
                          val_size = 0.2
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
                  epoch=epoch,
                  batch_size=batch_size,
                  learning_rate=learning_rate,
                  test_size=test_size,
                  val_size=val_size
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
                  epoch=epoch,
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
                  "epoch": new_training.epoch,
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