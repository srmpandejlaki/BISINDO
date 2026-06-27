from app.database.models import Dataset
from app.repositories import BaseRepository

class DatasetRepository(BaseRepository):

  def __init__(self):
    super().__init__(Dataset)

  def get_datasets_preprocess(self, db):
    return db.query(Dataset).filter(Dataset.isPreprocessed == True).all()
  
  def get_datasets_landmark(self, db):
    return db.query(Dataset).filter(Dataset.landmarkFolderPath != None).all()

  def get_datasets_landmark_by_id(self, db, idDataset: int):
    return db.query(Dataset).filter(Dataset.idDataset == idDataset).filter(Dataset.landmarkFolderPath != None).first()
