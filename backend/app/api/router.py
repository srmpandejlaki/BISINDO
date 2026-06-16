from fastapi import APIRouter

from app.api.routes.data_collection_route import router as data_collection_router
from app.api.routes.preprocessing_route import router as preprocessing_router

api_router = APIRouter()

api_router.include_router(
    data_collection_router
)

api_router.include_router(
    preprocessing_router
)