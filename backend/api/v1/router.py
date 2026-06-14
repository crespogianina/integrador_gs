from fastapi import APIRouter

from api.v1.endpoints import ai, auth, comunidad, recipes

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(recipes.router)
api_router.include_router(ai.router)
api_router.include_router(comunidad.router)
