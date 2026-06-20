from fastapi import (
  APIRouter,
  Depends,
  HTTPException
)
from pydantic import BaseModel
from typing import Optional

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.services.user_service import UserService

from app.schemas.user_schemas import AdminCreate, LoginRequest

router = APIRouter(
  prefix="/admin",
  tags=["User"]
)

user_service = UserService()

# Create admin
@router.post("/create-admin/")
def create_user(
    user: AdminCreate,
    db: Session = Depends(get_db)
):

    try:

        result = user_service.create_user(db, user)

        return result

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

# Login for admin
@router.post("/login/")
def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):

    try:
        return user_service.login(
            db, 
            login_data.username, 
            login_data.password
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
