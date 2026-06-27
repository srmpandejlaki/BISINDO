from app.database.models import Dataset
from app.repositories import BaseRepository

class DatasetRepository(BaseRepository):

  def __init__(self):
    super().__init__(Dataset)

  def get_datasets_preprocess(self, db):
    return db.query(Dataset).filter(Dataset.preprocessingResultPath != None).all()
