from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from api.deps import get_current_user
from core.database import get_db
from models.community_recipe import CommunityRecipe
from models.user import User
from schemas.recipe import Receta

router = APIRouter(tags=["comunidad"])
MAX_COMUNIDAD = 100


@router.get("/api/comunidad")
def listar_comunidad(db: Session = Depends(get_db)):
    entradas = (
        db.query(CommunityRecipe)
        .join(User)
        .order_by(CommunityRecipe.created_at.desc())
        .limit(MAX_COMUNIDAD)
        .all()
    )
    return {
        "recetas": [
            {
                "id": str(e.id),
                "receta": e.content,
                "autor_nombre": e.user.nombre,
                "timestamp": e.created_at.isoformat(),
            }
            for e in entradas
        ]
    }


@router.post("/api/comunidad", status_code=status.HTTP_201_CREATED)
def compartir_receta(
    receta: Receta,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entrada = CommunityRecipe(
        user_id=current_user.id,
        title=receta.nombre,
        content=receta.model_dump(),
    )
    db.add(entrada)
    db.commit()

    total = db.query(CommunityRecipe).count()
    if total > MAX_COMUNIDAD:
        oldest = db.query(CommunityRecipe).order_by(CommunityRecipe.created_at.asc()).limit(total - MAX_COMUNIDAD).all()
        for old in oldest:
            db.delete(old)
        db.commit()

    return {"ok": True}
