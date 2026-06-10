from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router

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
@app.get("/bisindo")
async def root():
    return {
        "success": True,
        "message": "BISINDO Recognition API Running"
    }

# Health Check
@app.get("/bisindo/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "bisindo-api",
        "version": "1.0.0"
    }

# Register Routes
app.include_router(
    api_router,
    prefix="/bisindo/api"
)
