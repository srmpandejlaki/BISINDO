from app.database.models import Evaluation
from app.repositories.base_repository import BaseRepository

class EvaluationRepository(BaseRepository):
  def __init__(self):
    super().__init__(Evaluation)
