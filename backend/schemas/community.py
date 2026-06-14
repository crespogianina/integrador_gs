import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CommunityShareRequest(BaseModel):
    receta: dict


class CommunityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    receta: dict
    autor_nombre: str
    timestamp: datetime
