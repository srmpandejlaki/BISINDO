from sqlalchemy import Column, Integer, Float, String, JSON, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base

class Training(Base):
  __tablename__ = "training_testing"

  idTrainingTesting = Column(
    Integer, 
    primary_key=True
  )

  idDataset = Column(
    Integer, 
    ForeignKey("dataset.idDataset")
  )

  idRatioDataSplit = Column(
    Integer, 
    ForeignKey("ratio_data_split.idRatioDataSplit")
  )

  modelName = Column(String(99))
  
  LSTMUnits1 = Column(Integer)
  LSTMUnits2 = Column(Integer)
  dropout1 = Column(Float)
  dropout2 = Column(Float)
  denseUnits = Column(Integer)

  kFold = Column(Integer)
  epochs = Column(Integer)
  batchSize = Column(Integer)
  learningRate = Column(Float)

  accuracy = Column(Float)
  precision = Column(Float)
  recall = Column(Float)
  f1score = Column(Float)
  confusionMatrix = Column(JSON)

  weightedAverage = Column(Float)
  macroAverage = Column(Float)

  trainLoss = Column(Float)
  valLoss = Column(Float)
  
  mcc = Column(Float)
  rocAuc = Column(Float)

  trainModelPath = Column(String(999))

  createdAt = Column(
    DateTime, 
    server_default=func.now()
  )
  updatedAt = Column(DateTime)

  dataset = relationship(
    "Dataset",
    back_populates="training",
  )

  ratio_data_split = relationship(
    "RatioDataSplit",
    back_populates="training",
  )
