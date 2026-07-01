from sqlalchemy import Column, Integer, Float, JSON, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base

class Testing(Base):
    __tablename__ = "testing"

    idTesting = Column(Integer, primary_key=True)

    idTraining = Column(
        Integer,
        ForeignKey("training.idTraining"),
        nullable=False
    )

    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1score = Column(Float)
    weightedAverage = Column(Float)
    macroAverage = Column(Float)
    mcc = Column(Float)
    confusionMatrix = Column(JSON)

    createdAt = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    training = relationship("Training", back_populates="testings")