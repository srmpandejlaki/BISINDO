from sqlalchemy.orm import Session

from app.database.models import User


class UserRepository:
  def create_user(self, db: Session, user: User):
    db.add(user)
    db.commit()
    db.refresh(user)
    return user