from app.database.models import RawData
from app.repositories import BaseRepository

from sqlalchemy.orm import joinedload, Session

class RawDataRepository(BaseRepository):

    def __init__(self):
        super().__init__(RawData)

    def get_by_id_dataset(self, db, idDataset: int):
        return (
        db.query(RawData)
        .options(joinedload(RawData.label))
        .filter(RawData.idDataset == idDataset)
        .all()
    )

    def add_data_to_dataset(self, db, raw_data: RawData):
        db.add(raw_data)
        db.flush()
        db.refresh(raw_data)
        return raw_data
    
    def get_by_name_and_dataset(
        self,
        db: Session,
        id_dataset: int,
        data_name: str
    ):
        return (
            db.query(RawData)
            .filter(
                RawData.idDataset == id_dataset,
                RawData.dataName == data_name
            )
            .first()
        )