from fastapi import (
  APIRouter,
  Depends,
  HTTPException,
  Response
)

from sqlalchemy.orm import Session
import numpy as np
import cv2

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

# HAND SKELETON
# def get_raw_data_preview(
#     idRawData: int,
#     db: Session = Depends(get_db)
# ):
#     raw_data = dataset_service.get_raw_data_by_id(db, idRawData)
#     if not raw_data:
#         raise HTTPException(
#             status_code=404,
#             detail="Raw data not found"
#         )

#     try:
#         data = np.load(raw_data.dataFilePath)
#         data = data.reshape(-1, 2, 21, 3)
        
#         canvas = np.zeros((200, 200, 3), dtype=np.uint8)
#         frame = data[0]
#         colors = [(255, 0, 0), (0, 140, 255)] # Blue and orange
#         HAND_CONNECTIONS = [
#             (0,1),(1,2),(2,3),(3,4),
#             (0,5),(5,6),(6,7),(7,8),
#             (0,9),(9,10),(10,11),(11,12),
#             (0,13),(13,14),(14,15),(15,16),
#             (0,17),(17,18),(18,19),(19,20)
#         ]

#         for hand_idx in range(2):
#             landmarks = frame[hand_idx]
#             points = []
#             for lm in landmarks:
#                 x = int(lm[0] * 200)
#                 y = int(lm[1] * 200)
#                 x = 200 - x
#                 points.append((x, y))
#                 cv2.circle(canvas, (x, y), 2, colors[hand_idx], -1)
#             for connection in HAND_CONNECTIONS:
#                 start, end = connection
#                 cv2.line(canvas, points[start], points[end], colors[hand_idx], 1)

#         _, buffer = cv2.imencode(".png", canvas)
#         return Response(content=buffer.tobytes(), media_type="image/png")

#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Failed to generate preview: {str(e)}"
#         )


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
