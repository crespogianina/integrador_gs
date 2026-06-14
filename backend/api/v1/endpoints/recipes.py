import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_current_user
from core.database import get_db
from models.recipe import Recipe
from models.user import User
from schemas.recipe import RecipeCreate, RecipeRead

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("", response_model=list[RecipeRead])
def list_favorites(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Recipe).filter(Recipe.user_id == current_user.id).order_by(Recipe.title).all()


@router.post("", response_model=RecipeRead, status_code=status.HTTP_201_CREATED)
def save_favorite(
    payload: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recipe = Recipe(user_id=current_user.id, title=payload.title, content=payload.content)
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favorite(
    recipe_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recipe = db.get(Recipe, recipe_id)
    if not recipe or recipe.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receta no encontrada.")
    db.delete(recipe)
    db.commit()
