from app.database.models import Label
from app.repositories import BaseRepository


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