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

    def create(self, db: Session, item):
        db.add(item)
        db.commit()
        db.refresh(item)

        return item

    def delete(self, db: Session, item):
        db.delete(item)
        db.commit()