from sqlalchemy.orm import Session

import os

from app.repositories import TrainingRepository, LabelRepository
from app.database.models import Training, Label

from app.ml.processing.training_dataset import TrainingDataset

class ProcessingService:
  def __init__(self):
    self.training_repository = TrainingRepository()
    self.label_repository = LabelRepository()

  def get_all_models(self, db: Session):
    return self.training_repository.get_all(db)
  
  def start_training(
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

      trainer = TrainingDataset(
          dataset_path=dataset_path,

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