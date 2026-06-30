import os
import shutil
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    File,
    UploadFile,
    WebSocket
)
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.services.testing_service import TestingService

router = APIRouter(
    prefix="/testing",
    tags=["Testing"]
)

testing_service = TestingService()

@router.post("/models/{idTraining}/test-dataset")
def test_model_on_dataset(
    idTraining: int,
    db: Session = Depends(get_db)
):
    try:
        result = testing_service.test_model_on_dataset(db, idTraining)
        return {
            "success": True,
            "data": result
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Testing gagal: {str(e)}")

@router.post("/models/{idTraining}/test-upload")
async def test_model_on_upload(
    idTraining: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    temp_dir = os.path.join("storage", "temp")
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, file.filename)
    
    try:
        # Save file to temp path
        with open(temp_file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        result = testing_service.test_model_on_upload(db, idTraining, temp_file_path, file.filename)
        return {
            "success": True,
            "data": result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Inference gagal: {str(e)}")
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass

@router.get("/result/{idTesting}")
def get_result_by_testing_id(
    idTesting: int,
    db: Session = Depends(get_db)
):
    try:
        result = testing_service.get_testing_result(db, idTesting)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models/{idTraining}/evaluation")
def get_evaluation_by_training_id(
    idTraining: int,
    db: Session = Depends(get_db)
):
    try:
        evaluation = testing_service.get_evaluation_by_training_id(db, idTraining)
        if not evaluation:
            # Let's return success with data: null so the client knows it hasn't been tested yet
            return {
                "success": True,
                "data": None
            }
        return {
            "success": True,
            "data": evaluation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
