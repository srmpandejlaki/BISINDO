from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
    Body,
    HTTPException
)

from pathlib import Path
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
import os

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

@router.get("/labels")
def get_label_with_total(
    db: Session = Depends(get_db)
):
    label = dataset_service.get_label_with_total(db)

    return {
        "success": True,
        "data": label
    }

@router.get("/labels/all")
def get_all_label(
    db: Session = Depends(get_db)
):
    label = dataset_service.get_all_label(db)

    return {
        "success": True,
        "data": label
    }

@router.get("/{idDataset}")
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
def create_dataset_from_zip(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if not file.filename.lower().endswith(".zip"):

        raise HTTPException(
            status_code=400,
            detail="File harus ZIP"
        )

    try:

        zip_path = save_uploaded_zip(file)
        datasetName = Path(file.filename).stem

        dataset = (
            dataset_service
            .create_dataset_from_zip(
                db,
                zip_path,
                datasetName
            )
        )

        return {
            "success": True,
            "message": "Dataset created sucessfully",
            "data": dataset
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/{idDataset}/raw-data")
def upload_dataset_data(
    idDataset: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    zip_path = save_uploaded_zip(file)

    return dataset_service.add_data_to_dataset(
        db,
        idDataset,
        zip_path
    )
    
@router.delete("/{idDataset}")
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

@router.put("/{idDataset}")
def update_dataset_name(
    idDataset: int,
    datasetName: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    return dataset_service.update_dataset_name(
        db,
        idDataset,
        datasetName
    )

# Raw Data
@router.get("/{idDataset}/detail-dataset")
def get_detail_dataset_by_id(
    idDataset: int,
    db: Session = Depends(get_db)
):
    try:
        raw_data = dataset_service.get_raw_data_by_id_dataset(
            db,
            idDataset
        )

        return {
            "success": True,
            "data": raw_data
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

@router.get("/raw-data/{idRawData}/preview")
def get_raw_data_preview(
    idRawData: int,
    db: Session = Depends(get_db)
):

    raw_data = dataset_service.get_raw_data_by_id(
        db,
        idRawData
    )

    if not raw_data:
        raise HTTPException(
            status_code=404,
            detail="Raw data not found"
        )

    if not os.path.exists(raw_data.dataFilePath):
        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )

    ext = os.path.splitext(raw_data.dataFilePath)[1].lower()
    media_type = "video/mp4" if ext == ".mp4" else "video/avi"

    return FileResponse(
        raw_data.dataFilePath,
        media_type=media_type,
        filename=os.path.basename(raw_data.dataFilePath)
    )

@router.delete("/raw-data/{idRawData}")
def delete_raw_data(
    idRawData: int,
    db: Session = Depends(get_db)
):
    try:
        dataset_service.delete_raw_data_by_id(db, idRawData)
        return {
            "success": True,
            "message": "Raw data deleted successfully"
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/raw-data/{idRawData}")
def update_raw_data(
    idRawData: int,
    dataName: str = Body(None),
    labelName: str = Body(None),
    db: Session = Depends(get_db)
):
    try:
        raw_data = dataset_service.update_raw_data_by_id(db, idRawData, dataName, labelName)
        return {
            "success": True,
            "message": "Raw data updated successfully",
            "data": {
                "idRawData": raw_data.idRawData,
                "dataName": raw_data.dataName,
                "labelName": raw_data.label.labelName
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{idDataset}/download")
def get_by_dataset(
    idDataset: int,
    db: Session = Depends(get_db)
):
    return dataset_service.download_dataset(
        db,
        idDataset
    )
