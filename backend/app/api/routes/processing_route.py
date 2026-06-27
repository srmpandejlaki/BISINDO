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

from app.schemas.processing_schemas import AddRatio, TestRatiosConfig, TrainModelConfig
from fastapi.responses import StreamingResponse

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

@router.post("/add-ratio/")
def create_ratio(
  ratio_data: AddRatio,
  db: Session = Depends(get_db)
):

  ratio = processing_service.add_ratio(db, ratio_data)

  return (
    {
      "success": True,
      "data": ratio
    }
)

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

@router.delete("/ratio/{idRatioDataSplit}")
def delete_ratio(
  idRatioDataSplit: int,
  db: Session = Depends(get_db)
):
  try:
    processing_service.delete_ratio(db, idRatioDataSplit)
    return {
      "success": True,
      "message": "Ratio deleted successfully"
    }
  except ValueError as e:
    raise HTTPException(status_code=404, detail=str(e))
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-ratios/")
def test_ratios(
  config: TestRatiosConfig,
  db: Session = Depends(get_db)
):
  return StreamingResponse(
    processing_service.test_ratios_generator(
      db, 
      config.epochs, 
      config.batch_size, 
      config.learning_rate
    ),
    media_type="text/event-stream"
  )

@router.post("/train/")
def train_model(
  config: TrainModelConfig,
  db: Session = Depends(get_db)
):
  return StreamingResponse(
    processing_service.train_model_generator(
      db=db,
      modelName=config.modelName,
      lstm_units1=config.lstm_units1,
      lstm_units2=config.lstm_units2,
      dropout1=config.dropout1,
      dropout2=config.dropout2,
      dense_units=config.dense_units,
      epochs=config.epochs,
      batch_size=config.batch_size,
      learning_rate=config.learning_rate
    ),
    media_type="text/event-stream"
  )

@router.get("/models/{idTraining}")
def get_model_by_id(
  idTraining: int,
  db: Session = Depends(get_db)
):
  dataset = processing_service.get_model_by_id(db, idTraining)

  if not dataset:
    raise HTTPException(
      status_code=404, 
      detail="Model not found"
    )
  
  return {
    "success": True,
    "data": dataset
  }

@router.delete("/models/{idTraining}")
def delete_model(
  idTraining: int,
  db: Session = Depends(get_db)
):
  try:
    processing_service.delete_model(db, idTraining)
    return {
      "success": True,
      "message": "Model deleted successfully"
    }
  except ValueError as e:
    raise HTTPException(status_code=404, detail=str(e))
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

# Hand Skeleton
@router.get("/landmarks/")
def get_datasets_landmark(
  db: Session = Depends(get_db)
):
  try:
    datasets = processing_service.get_datasets_landmark(db)
    return {
      "success": True,
      "data": datasets
    }
  except ValueError as e:
    raise HTTPException(status_code=404, detail=str(e))
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

@router.get("/landmarks/{idDataset}")
def get_datasets_landmark_by_id(
  idDataset: int,
  db: Session = Depends(get_db)
):
  try:
    dataset = processing_service.get_datasets_landmark_by_id(db, idDataset)
    return {
      "success": True,
      "data": dataset
    }
  except ValueError as e:
    raise HTTPException(status_code=404, detail=str(e))
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
