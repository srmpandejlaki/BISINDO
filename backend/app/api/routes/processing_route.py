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

from app.schemas.processing_schemas import AddRatio, TestRatiosConfig
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
