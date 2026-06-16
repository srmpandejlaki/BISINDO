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
@router.get("/")
def get_all_models(db: Session = Depends(get_db)):
    models = processing_service.get_all_models(db)

    return {
        "success": True,
        "data": models
    }