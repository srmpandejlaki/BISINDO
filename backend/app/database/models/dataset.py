from sqlalchemy import Column, Integer, String, Boolean, DateTime
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
  datasetFolderPath = Column(String(999))
  preprocessedFolderPath = Column(String(999))
  landmarkFolderPath = Column(String(999))
  createdAt = Column(
    DateTime,
    nullable=False,
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
