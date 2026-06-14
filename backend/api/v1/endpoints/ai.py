from fastapi import APIRouter, Depends, HTTPException

from api.deps import get_current_user
from models.user import User
from schemas.recipe import RecetaRequest
from services.gemini_service import generate_recipes

router = APIRouter(tags=["ai"])


@router.post("/api/recetas")
def generar_recetas(req: RecetaRequest, current_user: User = Depends(get_current_user)):
    if not req.ingredientes:
        raise HTTPException(status_code=400, detail="Ingresá al menos un ingrediente.")
    if len(req.ingredientes) > 20:
        raise HTTPException(status_code=400, detail="Máximo 20 ingredientes por consulta.")

    return generate_recipes(req.ingredientes, req.filtros, current_user.dieta_preferida)
