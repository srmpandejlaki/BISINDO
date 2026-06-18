from sqlalchemy.orm import Session

import os

from app.repositories import TrainingRepository, LabelRepository, RatioDataRepository
from app.database.models import Training, Label

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