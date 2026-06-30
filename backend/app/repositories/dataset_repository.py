from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.models import Dataset, RawData
from app.repositories import BaseRepository

class DatasetRepository(BaseRepository):

  def __init__(self):
    super().__init__(Dataset)

  def get_all_with_total_data(self, db: Session):
    return (
        db.query(
            Dataset,
            func.count(RawData.idRawData).label("totalData")
        )
        .outerjoin(
            RawData,
            Dataset.idDataset == RawData.idDataset
        )
        .group_by(Dataset.idDataset)
        .all()
    )
  
  def get_by_name(self, db, datasetName: str):
    return db.query(Dataset).filter(Dataset.datasetName == datasetName).first()

  def get_datasets_preprocess(self, db):
    return (
      db.query(
        Dataset, func.count(RawData.idRawData).label("totalData")
      )
      .outerjoin(
        RawData,
        Dataset.idDataset == RawData.idDataset
      )
      .filter(Dataset.preprocessedFolderPath.isnot(None))
      .group_by(Dataset.idDataset)
      .all()
    )
  
  def get_datasets_landmark(self, db):
    return db.query(Dataset).filter(Dataset.landmarkFolderPath != None).all()

  def get_datasets_landmark_by_id(self, db, idDataset: int):
    return db.query(Dataset).filter(Dataset.idDataset == idDataset).filter(Dataset.landmarkFolderPath != None).first()

  def update_dataset_name(self, db, idDataset: int, datasetName: str):
    dataset = self.get_by_id(db, idDataset, Dataset.idDataset)

    if not dataset:
        return None

    dataset.datasetName = datasetName

    db.commit()
    db.refresh(dataset)

    return dataset
  
  def update_preprocessing_result(
      self,
      db: Session,
      dataset,
      folder_path: str
  ):
      dataset.preprocessedFolderPath = folder_path

      db.commit()
      db.refresh(dataset)

      return dataset
  
  def count_total_data_by_dataset(self, db: Session, idDataset: int):
    return (
        db.query(func.count(RawData.idRawData))
        .filter(RawData.idDataset == idDataset)
        .scalar()
    )