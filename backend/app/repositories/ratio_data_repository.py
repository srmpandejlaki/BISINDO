from app.database.models import RatioDataSplit
from app.repositories import BaseRepository

class RatioDataRepository(BaseRepository):
  def __init__(self):
    super().__init__(RatioDataSplit)

  def create(self, db, ratioDataSplit: RatioDataSplit):
    db.add(ratioDataSplit)
    db.commit()
    db.refresh(ratioDataSplit)
    return ratioDataSplit
  
  def get_by_best_ratio(self, db):
    return (
        db.query(RatioDataSplit)
        .filter(RatioDataSplit.accuracy != None)
        .order_by(
            RatioDataSplit.accuracy.desc(),
            RatioDataSplit.f1score.desc()
        )
        .first()
    )