from app.database.models import Label, RawData
from app.repositories import BaseRepository

from sqlalchemy import func

class LabelRepository(BaseRepository):

    def __init__(self):
        super().__init__(Label)
    
    def get_by_name(
        self,
        db,
        label_name
    ):
        return (
            db.query(Label)
            .filter(
                Label.labelName == label_name
            )
            .first()
        )
    
    def get_label_with_total(self, db):
        return (
            db.query(
                Label.labelName,
                func.count(RawData.idRawData).label("total")
            )
            .outerjoin(
                RawData,
                RawData.idLabel == Label.idLabel
            )
            .group_by(
                Label.idLabel,
                Label.labelName
            )
            .order_by(Label.labelName)
            .all()
        )