from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base

class Dataset(Base):
  __tablename__ = "dataset"
  
  idDataset = Column(
    Integer, 
    primary_key=True
  )
  
  datasetName = Column(String(99))
  totalLabel = Column(Integer)
  totalData = Column(Integer)
  folderPath = Column(String(999))
  preprocessingResultPath = Column(String(999))
  createdAt = Column(
    DateTime,
    server_default=func.now()
  )

  raw_data = relationship(
    "RawData",
    back_populates="dataset",
  )
  
  training = relationship(
    "Training",
    back_populates="dataset",
  )

  evaluation = relationship(
    "Evaluation",
    back_populates="dataset",
  )
