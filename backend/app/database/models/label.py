from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database.connection import Base

class Label(Base):
  __tablename__ = "label"

  idLabel = Column(
    Integer, 
    primary_key=True
  )

  labelName = Column(String(1))

  raw_data = relationship(
    "RawData",
    back_populates="label",
  )
