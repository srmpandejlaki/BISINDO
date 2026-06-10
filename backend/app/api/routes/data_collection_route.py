from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.services.data_collection_service import DataCollectionService

from app.utils.file_storage import save_uploaded_zip


router = APIRouter(
    prefix="/datasets",
    tags=["DataCollection"]
)

dataset_service = DataCollectionService()

# Dataset
@router.get("/")
def get_all_datasets(
    db: Session = Depends(get_db)
):

    datasets = (dataset_service.get_all_datasets(db))

    return {
        "success": True,
        "data": datasets
    }

@router.get("/{dataset_id}")
def get_dataset_by_id(
    idDataset: int,
    db: Session = Depends(get_db)
):

    dataset = (dataset_service.get_dataset_by_id(db, idDataset))

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    return {
        "success": True,
        "data": dataset
    }

@router.post("/")
async def create_dataset_from_zip(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if not file.filename.endswith(".zip"):

        raise HTTPException(
            status_code=400,
            detail="File harus ZIP"
        )

    try:

        zip_path = save_uploaded_zip(file)

        dataset = (
            dataset_service
            .create_dataset_from_zip(
                db,
                zip_path
            )
        )

        return {
            "success": True,
            "message": "Dataset created sucessfully",
            "data": dataset
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@router.delete("/{dataset_id}")
def delete_dataset(
    idDataset: int,
    db: Session = Depends(get_db)
):

    try:

        dataset_service.delete_dataset(db, idDataset)

        return {
            "success": True,
            "message": "Dataset deleted successfully"
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

# Raw Data
@router.get("/{dataset_id}/detail-dataset")
def get_dataset_by_id(
    idDataset: int,
    db: Session = Depends(get_db)
):

    dataset = (dataset_service.get_raw_data_by_id_dataset(db, idDataset))

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    return {
        "success": True,
        "data": dataset
    }
