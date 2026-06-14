import uuid

from pydantic import BaseModel, ConfigDict, EmailStr


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    nombre: str
    dieta_preferida: str | None = None


class UserUpdate(BaseModel):
    nombre: str | None = None
    dieta_preferida: str | None = None
