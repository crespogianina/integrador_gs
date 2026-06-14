from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1.router import api_router
from core.config import settings
from core.database import Base, engine
import models  # noqa: F401 — registra los modelos en Base.metadata


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="FoodAlchemy API", version="1.0.0", lifespan=lifespan)

if settings.CORS_ORIGINS == "*":
    origins = ["*"]  # ← cambiá esto
else:
    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "FoodAlchemy API funcionando",
        "model": settings.GEMINI_MODEL,
    }
