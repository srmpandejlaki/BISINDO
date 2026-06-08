from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base

class Training(Base):
  __tablename__ = "training"

  idTraining = Column(
    Integer, 
    primary_key=True
  )

  idModel = Column(
    Integer, 
    ForeignKey("model.idModel")
  )

  idRatioDataSplit = Column(
    Integer, 
    ForeignKey("ratio_data_split.idRatioDataSplit")
  )

  idParameterTraining = Column(
    Integer, 
    ForeignKey("parameter_training.idParameterTraining")
  )

  accuracy = Column(Float)
  precision = Column(Float)
  recall = Column(Float)
  f1score = Column(Float)
  trainModelPath = Column(String(999))
  createdAt = Column(
    DateTime, 
    server_default=func.now()
  )

  model = relationship(
    "Model",
    back_populates="training",
  )

  ratio_data_split = relationship(
    "RatioDataSplit",
    back_populates="training",
  )

  parameter_training = relationship(
    "ParameterTraining",
    back_populates="training",
  )

  evaluation = relationship(
    "Evaluation",
    back_populates="training",
  )
