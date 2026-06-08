from sqlalchemy import Column, Integer, Float, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class RatioDataSplit(Base):
  __tablename__ = "ratio_data_split"

  idRatioDataSplit = Column(
    Integer, 
    primary_key=True
  )

  trainRatio = Column(Float)
  testRatio = Column(Float)
  valRatio = Column(Float)
  createdAt = Column(
    DateTime, 
    server_default=func.now()
  )

  training = relationship(
    "Training",
    back_populates="ratio_data_split",
  )