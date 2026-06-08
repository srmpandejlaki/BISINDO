from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base

class PreprocessingResult(Base):
  __tablename__ = "preprocessing_result"

  idPreprocessingResult = Column(
    Integer, 
    primary_key=True
  )

  idDataset = Column(
    Integer, 
    ForeignKey("dataset.idDataset")
  )

  preprocessingFilePath = Column(String(999))
  createdAt = Column(
    DateTime, 
    server_default=func.now()
  )

  dataset = relationship(
    "Dataset",
    back_populates="preprocessing_result",
  )