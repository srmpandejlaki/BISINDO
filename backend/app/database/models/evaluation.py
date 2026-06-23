from sqlalchemy import Column, Integer, Float, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base

class Evaluation(Base):
  __tablename__ = "evaluation"

  idEvaluation = Column(
    Integer, 
    primary_key=True
  )

  idTraining = Column(
    Integer, 
    ForeignKey("training.idTraining")
  )

  accuracy = Column(Float)
  precision = Column(Float)
  recall = Column(Float)
  f1score = Column(Float)
  confusionMatrix = Column(JSON)

  
  weightedAverage = Column(Float)
  macroAverage = Column(Float)

  mcc = Column(Float)
  rocAuc = Column(Float)
  
  createdAt = Column(
    DateTime, 
    nullable=False,
    server_default=func.now()
  )

  training = relationship(
    "Training",
    back_populates="evaluation",
  )