from fastapi import APIRouter

from app.api.routes.data_collection_route import router as data_collection_router
from app.api.routes.preprocessing_route import router as preprocessing_router
from app.api.routes.processing_route import router as processing_router
from app.api.routes.user_route import router as user_router
from app.api.routes.testing_route import router as testing_router
from app.api.routes.bisindo_test_route import router as bisindo_test_router

api_router = APIRouter()

api_router.include_router(
    data_collection_router
)

api_router.include_router(
    preprocessing_router
)

api_router.include_router(
    processing_router
)

api_router.include_router(
    testing_router
)

api_router.include_router(
    user_router
)

api_router.include_router(
    bisindo_test_router
)