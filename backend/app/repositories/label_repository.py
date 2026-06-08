from app.database.models.label import Label
from app.repositories.base_repository import BaseRepository


class LabelRepository(BaseRepository):

    def __init__(self):
        super().__init__(Label)