from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base

class RawData(Base):
  __tablename__ = "raw_data"

  idRawData = Column(
    Integer, 
    primary_key=True
  )
  
  idDataset = Column(
    Integer,
    ForeignKey("dataset.idDataset"),
  )
  idLabel = Column(
    Integer,
    ForeignKey("label.idLabel"),
  )
  dataName = Column(String(99))
  dataFilePath = Column(String(999))
  preprocessedFilePath = Column(String(999))
  landmarkFilePath = Column(String(999))
  createdAt = Column(
    DateTime(timezone=True),
    nullable=False,
    server_default=func.now()
  )

  dataset = relationship(
    "Dataset",
    back_populates="raw_data",
  )
  label = relationship(
    "Label",
    back_populates="raw_data",
  )
  