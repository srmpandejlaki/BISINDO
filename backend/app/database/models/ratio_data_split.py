from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class RatioDataSplit(Base):
  __tablename__ = "ratio_data_split"

  idRatioDataSplit = Column(
    Integer, 
    primary_key=True
  )

  trainRatio = Column(String(99))
  epoch = Column(Integer)
  batchSize = Column(Integer)
  learningRate = Column(String)

  accuracy = Column(Float)
  precision = Column(Float)
  recall = Column(Float)
  f1score = Column(Float)

  createdAt = Column(
    DateTime(timezone=True),
    nullable=False,
    server_default=func.now()
  )
  updatedAt = Column(
    DateTime(timezone=True),
    nullable=False,
    server_default=func.now(),
    onupdate=func.now()
  )

  training = relationship(
    "Training",
    back_populates="ratio_data_split",
  )