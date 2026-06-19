from sqlalchemy import Column, Integer, String, DateTime

from app.database.connection import Base

class Admin(Base):
    __tablename__ = "admin"

    idAdmin = Column(Integer, primary_key=True)
    usernameAdmin = Column(String(999))
    passwordAdmin = Column(String(10))
    createdAt = Column(DateTime)