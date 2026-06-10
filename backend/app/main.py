from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.data_collection_route import router as data_collection_router

app = FastAPI(
    title="BISINDO Alphabet Recognition API",
    description="API untuk deteksi alfabet BISINDO menggunakan MediaPipe dan LSTM",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/bisindo/api")
async def root():
    return {
        "success": True,
        "message": "BISINDO Recognition API Running"
    }

# Health Check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }

# Register Routes
app.include_router(
    data_collection_router,
    prefix="/api/data-collection",
    tags=["Predictions"]
)
