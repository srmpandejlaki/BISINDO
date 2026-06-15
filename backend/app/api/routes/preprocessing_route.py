from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.services.preprocessing_service import PreprocessingService

router = APIRouter(
    prefix="/preprocessing",
    tags=["Preprocessing"]
)

preprocessing_service = PreprocessingService()

# Preprocessing

@router.get("/")
async def get_all_datasets(db: Session = Depends(get_db)):
    return preprocessing_service.get_all_datasets(db)

