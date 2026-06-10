from app.database.models import RawData
from app.repositories import BaseRepository


class RawDataRepository(BaseRepository):

    def __init__(self):
        super().__init__(RawData)

    def get_by_id_dataset(self, db, idDataset: int):
        return (
            db.query(RawData)
            .filter(RawData.idDataset == idDataset)
            .all()
        )