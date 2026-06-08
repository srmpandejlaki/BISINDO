from app.database.models.raw_data import RawData
from app.repositories.base_repository import BaseRepository


class RawDataRepository(BaseRepository):

    def __init__(self):
        super().__init__(RawData)