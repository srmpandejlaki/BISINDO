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
from app.services.bisindo_test_service import BisindoTestService

router = APIRouter(
    prefix="/bisindo_test",
    tags=["BisindoTest"]
)

bisindo_service = BisindoTestService()

@router.websocket("/realtime/{idTraining}")
async def realtime_inference(
    websocket: WebSocket,
    idTraining: int
):
    db = next(get_db())
    try:
        await bisindo_service.realtime_inference_websocket(websocket, idTraining, db)
    finally:
        db.close()
