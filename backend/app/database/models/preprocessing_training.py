from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class PreprocessingTraining(Base):
  __tablename__ = "preprocessing_training"
  
  idPreprocessingTraining = Column(
    Integer, 
    primary_key=True
  )

  idPreprocessingResult = Column(
    Integer, 
    ForeignKey("preprocessing_result.idPreprocessingResult")
    )
  
  idTraining = Column(
    Integer, 
    ForeignKey("training.idTraining")
    )

  createdAt = Column(
    DateTime,
    server_default=func.now()
  )
  
  preprocessing_result = relationship(
    "PreprocessingResult",
    back_populates="preprocessing_training",
  )