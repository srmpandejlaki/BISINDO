from app.database.models import RatioDataSplit
from app.repositories import BaseRepository

class RatioDataRepository(BaseRepository):
  def __init__(self):
    super().__init__(RatioDataSplit)
  
  def get_by_best_ratio(self, db, bestRatio: bool):
    return (
      db.query(RatioDataSplit)
      .filter(RatioDataSplit.bestRatio == bestRatio)
      .first()
    )