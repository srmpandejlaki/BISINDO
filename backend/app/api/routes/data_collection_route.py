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

# Raw Data
@router.get("/{idDataset}/detail-dataset")
def get_detail_dataset_by_id(
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

@router.get("/raw-data/{idRawData}/preview")
def get_raw_data_preview(
    idRawData: int,
    db: Session = Depends(get_db)
):
    from fastapi import Response
    import numpy as np
    import cv2

    raw_data = dataset_service.get_raw_data_by_id(db, idRawData)
    if not raw_data:
        raise HTTPException(
            status_code=404,
            detail="Raw data not found"
        )

    try:
        data = np.load(raw_data.dataFilePath)
        data = data.reshape(-1, 2, 21, 3)
        
        canvas = np.zeros((200, 200, 3), dtype=np.uint8)
        frame = data[0]
        colors = [(255, 0, 0), (0, 140, 255)] # Blue and orange
        HAND_CONNECTIONS = [
            (0,1),(1,2),(2,3),(3,4),
            (0,5),(5,6),(6,7),(7,8),
            (0,9),(9,10),(10,11),(11,12),
            (0,13),(13,14),(14,15),(15,16),
            (0,17),(17,18),(18,19),(19,20)
        ]

        for hand_idx in range(2):
            landmarks = frame[hand_idx]
            points = []
            for lm in landmarks:
                x = int(lm[0] * 200)
                y = int(lm[1] * 200)
                x = 200 - x
                points.append((x, y))
                cv2.circle(canvas, (x, y), 2, colors[hand_idx], -1)
            for connection in HAND_CONNECTIONS:
                start, end = connection
                cv2.line(canvas, points[start], points[end], colors[hand_idx], 1)

        _, buffer = cv2.imencode(".png", canvas)
        return Response(content=buffer.tobytes(), media_type="image/png")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate preview: {str(e)}"
        )
