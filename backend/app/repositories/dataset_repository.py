from app.database.models.dataset import Dataset
from app.repositories.base_repository import BaseRepository


class DatasetRepository(BaseRepository):

    def __init__(self):
        super().__init__(Dataset)