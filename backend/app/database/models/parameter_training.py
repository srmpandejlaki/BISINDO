from sqlalchemy import Column, Integer, Float
from sqlalchemy.orm import relationship

from app.database.connection import Base

class ParameterTraining:
  __tablename__ = "parameter_training"

  idParameterTraining = Column(
    Integer, 
    primary_key=True
  )

  epochs = Column(Integer)
  batchSize = Column(Integer)
  learningRate = Column(Float)
  
  training = relationship(
    "Training",
    back_populates="parameter_training",
  )