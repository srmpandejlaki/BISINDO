from sqlalchemy import Column, Integer, Float, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base

class Model(Base):
  __tablename__ = "model"

  idModel = Column(
    Integer, 
    primary_key=True
  )

  LSTMUnits1 = Column(Integer)
  LSTMUnits2 = Column(Integer)
  dropout1 = Column(Float)
  dropout2 = Column(Float)
  denseUnits = Column(Integer)
  created_at = Column(
    DateTime(timezone=True), 
    server_default=func.now()
  )
  updated_at = Column(
    DateTime(timezone=True), 
    onupdate=func.now()
  )

  training = relationship(
    "Training",
    back_populates="model",
  )