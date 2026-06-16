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
    sequence_length: int = 60
    feature_size: int = 126
    use_augmentation: bool = True
    noise_level: float = 0.01
    scale_range_min: float = 0.9
    scale_range_max: float = 1.1
    use_frame_dropout: bool = False
    frame_dropout_prob: float = 0.1


# Get all datasets
@router.get("/")
def get_all_datasets(db: Session = Depends(get_db)):
    datasets = preprocessing_service.get_all_datasets(db)

    return {
        "success": True,
        "data": datasets
    }


# Get dataset by ID
@router.get("/{idDataset}")
def get_dataset_by_id(
    idDataset: int,
    db: Session = Depends(get_db)
):
    try:
        dataset = preprocessing_service.get_dataset_by_id(db, idDataset)

        return {
            "success": True,
            "data": dataset
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


# Run preprocessing
@router.post("/{idDataset}/run")
def run_preprocessing(
    idDataset: int,
    config: PreprocessingConfig,
    db: Session = Depends(get_db)
):
    try:
        result = preprocessing_service.preprocess_dataset(
            db,
            idDataset,
            config.model_dump()
        )

        return {
            "success": True,
            "message": "Preprocessing berhasil",
            "data": {
                "dataset_name": result["dataset"].datasetName,
                "output_path": result["result"]["output_path"],
                "total_processed": result["result"]["total_processed"],
                "total_augmented": result["result"]["total_augmented"],
                "total_skipped": result["result"]["total_skipped"]
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Preprocessing gagal: {str(e)}"
        )
