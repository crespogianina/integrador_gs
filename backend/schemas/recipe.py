import uuid
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class Filtros(BaseModel):
    dieta: str = "ninguna"
    porciones: int = 2
    complejidad: str = "cualquiera"
    tiempo_max: int = 60
    momento: str = "cualquiera"
    sabor: str = "cualquiera"


class RecetaRequest(BaseModel):
    ingredientes: list[str]
    filtros: Filtros = Field(default_factory=Filtros)


class Receta(BaseModel):
    nombre: str
    busqueda_imagen: str = ""
    emoji: str
    descripcion: str
    tiempo_minutos: int
    porciones: int
    dificultad: str
    calorias_aprox: int
    ingredientes_usados: list[str]
    ingredientes_extra: list[str]
    pasos: list[str]
    tip_chef: str


class RecipeCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: dict[str, Any]


class RecipeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    content: dict[str, Any]
