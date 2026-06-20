from sqlalchemy.orm import Session

from app.database.models import Admin


class UserRepository:
  def create_user(
        self, 
        db: Session, 
        user: Admin
    ):
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
  
  def get_by_username(
        self,
        db: Session,
        username: str
    ):
        return (
            db.query(Admin)
            .filter(Admin.username == username)
            .first()
        )