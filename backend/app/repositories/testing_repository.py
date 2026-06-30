from app.database.models import Testing
from app.repositories import BaseRepository

class TestingRepository(BaseRepository):
  
  def __init__(self):
    super().__init__(Testing)