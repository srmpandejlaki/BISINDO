from sqlalchemy import Column, Integer, String, DateTime

from app.database.connection import Base

class User(Base):
    __tablename__ = "user"

    idUser = Column(Integer, primary_key=True)
    nameUser = Column(String(100))
    emailUser = Column(String(30))
    passwordUser = Column(String(10))
    createdAt = Column(DateTime)