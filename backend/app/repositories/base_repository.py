from sqlalchemy.orm import Session


class BaseRepository:

    def __init__(self, model):
        self.model = model

    def get_all(self, db: Session):
        return db.query(self.model).all()

    def get_by_id(self, db: Session, item_id, id_field):
        return (
            db.query(self.model)
            .filter(id_field == item_id)
            .first()
        )

    def delete(self, db: Session, item):
        db.delete(item)
        db.commit()
     