from fastapi import (
  APIRouter,
  Depends,
  HTTPException,
  Response
)

from sqlalchemy.orm import Session
import numpy as np
import cv2
import os

from app.database.dependencies import get_db
from app.services.processing_service import ProcessingService

from app.schemas.processing_schemas import AddRatio, TestRatiosConfig, TrainModelConfig, ProcessingConfig
from app.database.models import RawData
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

# HAND SKELETON
@router.get("/dataset-landmarks/")
def get_datasets_preprocess(
  db: Session = Depends(get_db)
):
  try:
    datasets = processing_service.get_datasets_preprocess(db)
    return {
      "success": True,
      "data": datasets
    }
  except ValueError as e:
    raise HTTPException(status_code=404, detail=str(e))
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
  
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
  
@router.post("/{idDataset}/run-landmark")
def run_processing(
  idDataset: int,
  config: ProcessingConfig,
  db: Session = Depends(get_db)
):
  try:
    result = processing_service.process_dataset(
      db,
      idDataset,
      config.model_dump()
    )
    return {
      "success": True,
      "message": "Processing berhasil.",
      "data": {
        "dataset_name":
          result["dataset"].datasetName,
        "processed":
          result["processed"],
        "failed":
          result["failed"],
        "results":
          result["results"]
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
      detail=str(e)
    )
  
@router.get("/{idDataset}/status")
def get_processing_status(
  idDataset: int,
  db: Session = Depends(get_db)
):
  return {
    "success": True,
    "data":
    processing_service.get_processing_status(
      db,
      idDataset
    )
  }

@router.get("/landmarks/raw-data/{idRawData}/preview")
def get_landmark_preview(
  idRawData: int,
  db: Session = Depends(get_db)
):
  raw_data = db.query(RawData).filter(RawData.idRawData == idRawData).first()
  if not raw_data:
    raise HTTPException(
      status_code=404,
      detail="Raw data not found"
    )

  if not raw_data.landmarkFilePath:
    raise HTTPException(
      status_code=400,
      detail="Landmark file not found. Please run hand skeleton extraction first."
    )

  try:
    path = raw_data.landmarkFilePath
    # Handle missing .npy extension
    if not path.endswith(".npy"):
        if os.path.exists(path + ".npy"):
            path = path + ".npy"
        elif os.path.exists(os.path.join("backend", path + ".npy")):
            path = os.path.join("backend", path + ".npy")
            
    # Handle running directory fallback
    if not os.path.exists(path):
        if os.path.exists(os.path.join("backend", path)):
            path = os.path.join("backend", path)
            
    if not os.path.exists(path):
        raise HTTPException(
            status_code=404,
            detail=f"Landmark file not found on disk at: {path}"
        )
        
    data = np.load(path)
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

    # Collect valid points (points that are not zero)
    valid_points = []
    for hand_idx in range(2):
        for lm in frame[hand_idx]:
            if np.any(lm):
                valid_points.append((lm[0], lm[1]))

    if not valid_points:
        cv2.putText(canvas, "No Hand", (70, 105), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
    else:
        xs = [pt[0] for pt in valid_points]
        ys = [pt[1] for pt in valid_points]
        
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        
        range_x = max_x - min_x
        range_y = max_y - min_y
        
        scale_x = 150.0 / range_x if range_x > 0 else 1.0
        scale_y = 150.0 / range_y if range_y > 0 else 1.0
        scale = min(scale_x, scale_y)
        
        center_x = (min_x + max_x) / 2.0
        center_y = (min_y + max_y) / 2.0
        
        points = {}
        for hand_idx in range(2):
            points[hand_idx] = []
            for lm in frame[hand_idx]:
                if not np.any(lm):
                    points[hand_idx].append(None)
                else:
                    x = int(100 + (lm[0] - center_x) * scale)
                    y = int(100 + (lm[1] - center_y) * scale)
                    points[hand_idx].append((x, y))
                    cv2.circle(canvas, (x, y), 3, colors[hand_idx], -1)

        for hand_idx in range(2):
            for connection in HAND_CONNECTIONS:
                start, end = connection
                p_start = points[hand_idx][start]
                p_end = points[hand_idx][end]
                if p_start is not None and p_end is not None:
                    cv2.line(canvas, p_start, p_end, colors[hand_idx], 1)

    _, buffer = cv2.imencode(".png", canvas)
    return Response(content=buffer.tobytes(), media_type="image/png")

  except Exception as e:
    raise HTTPException(
        status_code=500,
        detail=f"Failed to generate preview: {str(e)}"
    )


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
