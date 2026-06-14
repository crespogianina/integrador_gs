import uuid
from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.community_recipe import CommunityRecipe
    from models.recipe import Recipe


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    dieta_preferida: Mapped[str | None] = mapped_column(String(50), nullable=True)

    recipes: Mapped[list["Recipe"]] = relationship("Recipe", back_populates="user", cascade="all, delete-orphan")
    community_recipes: Mapped[list["CommunityRecipe"]] = relationship(
        "CommunityRecipe", back_populates="user", cascade="all, delete-orphan"
    )
