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
from app.utils.hand_skeleton import draw_hand_skeleton

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

    raw_data = (
        db.query(RawData)
        .filter(
            RawData.idRawData == idRawData
        )
        .first()
    )

    if not raw_data:
        raise HTTPException(
            status_code=404,
            detail="Raw data not found"
        )

    if not raw_data.landmarkFilePath:
        raise HTTPException(
            status_code=400,
            detail="Landmark file not found."
        )

    try:

        path = raw_data.landmarkFilePath

        # jika tidak ada extension
        if not path.endswith(".npy"):

            if os.path.exists(path + ".npy"):
                path += ".npy"

            elif os.path.exists(
                os.path.join(
                    "backend",
                    path + ".npy"
                )
            ):
                path = os.path.join(
                    "backend",
                    path + ".npy"
                )

        # fallback
        if not os.path.exists(path):

            backend_path = os.path.join(
                "backend",
                path
            )

            if os.path.exists(backend_path):
                path = backend_path

        if not os.path.exists(path):

            raise HTTPException(
                status_code=404,
                detail=f"File tidak ditemukan: {path}"
            )

        data = np.load(path)

        if data.shape[1] != 126:

            raise HTTPException(
                status_code=500,
                detail=f"Dataset harus memiliki 126 fitur. Shape saat ini: {data.shape}"
            )

        data = data.reshape( -1, 2, 21, 3 )

        frame = data[2]

        canvas = draw_hand_skeleton(
            frame=frame,
            frame_index=0,
            total_frames=len(data),
            mirror=False
        )

        _, buffer = cv2.imencode(
            ".png",
            canvas
        )

        return Response(
            content=buffer.tobytes(),
            media_type="image/png"
        )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
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

@router.get("/models/{idTrainTest}")
def get_model_by_id(
  idTrainTest: int,
  db: Session = Depends(get_db)
):
  dataset = processing_service.get_model_by_id(db, idTrainTest)

  if not dataset:
    raise HTTPException(
      status_code=404, 
      detail="Model not found"
    )
  
  return {
    "success": True,
    "data": dataset
  }

@router.delete("/models/{idTrainTest}")
def delete_model(
  idTrainTest: int,
  db: Session = Depends(get_db)
):
  try:
    processing_service.delete_model(db, idTrainTest)
    return {
      "success": True,
      "message": "Model deleted successfully"
    }
  except ValueError as e:
    raise HTTPException(status_code=404, detail=str(e))
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
