from app.database.models import Dataset
from app.repositories import BaseRepository


class DatasetRepository(BaseRepository):

    def __init__(self):
        super().__init__(Dataset)

    def get_by_name(self, db, databaseName):
        return db.query(Dataset).filter(Dataset.datasetName == databaseName).first()