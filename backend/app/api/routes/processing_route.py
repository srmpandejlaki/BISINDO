from fastapi import (
  APIRouter,
  Depends,
  HTTPException
)
from pydantic import BaseModel
from typing import Optional

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.services.processing_service import ProcessingService

router = APIRouter(
  prefix="/processing",
  tags=["Processing"]
)

processing_service = ProcessingService()

# GET all models
@router.get("/models/")
def get_all_models(
  db: Session = Depends(get_db)
):
    
  models = processing_service.get_all_models(db)

  return {
    "success": True,
    "data": models
  }

# GET all ratio
@router.get("/ratio/")
def get_all_ratio(
  db: Session = Depends(get_db)
):

  ratio = processing_service.get_all_ratio(db)

  return {
    "success": True,
    "data": ratio
  }

# GET best ratio
@router.get("/best-ratio/")
def get_best_ratio(
  db: Session = Depends(get_db)
):

  ratio = processing_service.get_best_ratio(db)

  return {
    "success": True,
    "data": ratio
  }

# POST start training
@router.post("/start-training/")
def start_training(
  db: Session = Depends(get_db),
  dataset_path: str,
  lstm_units1: int,
  lstm_units2: int,
  dropout1: float,
  dropout2: float,
  dense_units: int,
  epochs: int,
  batch_size: int,
  learning_rate: float
):

  processing_service.start_training(
    db, dataset_path, 
    lstm_units1, lstm_units2, dropout1, dropout2, dense_units, 
    epochs, batch_size, learning_rate
  )

  return {
    "success": True
  }
