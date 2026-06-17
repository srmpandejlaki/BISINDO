from app.database.models import Training
from app.repositories import BaseRepository

class TrainingRepository(BaseRepository):
  
  def __init__(self):
    super().__init__(Training)