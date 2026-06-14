from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from api.deps import get_current_user
from core.database import get_db
from core.security import create_access_token, hash_password, verify_password
from models.user import User
from schemas.auth import LoginRequest, RegisterRequest, Token
from schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])


def _authenticate_user(email: str, password: str, db: Session) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El email ya está registrado.")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        nombre=payload.nombre,
        dieta_preferida=payload.dieta_preferida,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Login con JSON (para el frontend). Body: `{ \"email\", \"password\" }`."""
    user = _authenticate_user(payload.email, payload.password, db)
    return Token(access_token=create_access_token(user.id))


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Login con formulario OAuth2 (para el botón Authorize de Swagger). Username = email."""
    user = _authenticate_user(form_data.username, form_data.password, db)
    return Token(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserRead)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.nombre is not None:
        current_user.nombre = payload.nombre
    if payload.dieta_preferida is not None:
        current_user.dieta_preferida = payload.dieta_preferida or None
    db.commit()
    db.refresh(current_user)
    return current_user
