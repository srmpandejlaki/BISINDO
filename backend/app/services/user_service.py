from sqlalchemy.orm import Session
from pathlib import Path

from app.database.models import Admin
from app.repositories import UserRepository


class UserService:
  def __init__(self):
    self.user_repository = UserRepository()

  def create_user(self, db: Session, user: Admin):
    try :


    return self.user_repository.create_user(db, user)