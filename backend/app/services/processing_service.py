from sqlalchemy.orm import Session

import os

from app.repositories import TrainingRepository, LabelRepository
from app.database.models import Training, Label

class ProcessingService:
  def __init__(self):
    self.training_repository = TrainingRepository()
    self.label_repository = LabelRepository()

  def get_all_models(self, db: Session):
    return self.training_repository.get_all(db)