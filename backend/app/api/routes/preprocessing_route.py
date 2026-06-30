from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from pydantic import BaseModel
from typing import Optional

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.services.preprocessing_service import PreprocessingService

router = APIRouter(
    prefix="/preprocessing",
    tags=["Preprocessing"]
)

preprocessing_service = PreprocessingService()


# Pydantic Schema
class PreprocessingConfig(BaseModel):
    target_frame: int = 60


@router.get("/{idDataset}/status")
def get_preprocessing_status(
    idDataset: int,
    db: Session = Depends(get_db)
):
    try:

        result = preprocessing_service.get_preprocessing_status(
            db,
            idDataset
        )

        return {
            "success": True,
            "data": result
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    
# Run preprocessing
@router.post("/{idDataset}/preprocess")
def preprocess_dataset(
    idDataset: int,
    config: PreprocessingConfig,
    db: Session = Depends(get_db)
):
    try:
        result = preprocessing_service.preprocess_dataset(
            db,
            idDataset,
            config.target_frame
        )

        return {
            "success": True,
            "message": "Preprocessing berhasil.",
            "data": result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dataset-preprocess/")
def get_dataset_preprocess(
    db: Session = Depends(get_db)
):
    try:
        result = preprocessing_service.get_datasets_preprocess(db)
        return {
            "success": True,
            "data": result
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))