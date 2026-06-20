from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base

class Admin(Base):
    __tablename__ = "admin"

    idAdmin = Column(Integer, primary_key=True)
    username = Column(String(999))
    password = Column(String(255))
    
    createdAt = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )
