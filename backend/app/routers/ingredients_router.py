"""CRUD for the ingredients a user currently has ("what's in my fridge")."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Ingredient, User
from app.schemas import IngredientIn, IngredientOut, IngredientUpdate

router = APIRouter(prefix="/ingredients", tags=["ingredients"])


@router.get("", response_model=list[IngredientOut])
def list_ingredients(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Ingredient)
        .filter(Ingredient.user_id == user.id)
        .order_by(Ingredient.created_at.desc())
        .all()
    )


@router.post("", response_model=IngredientOut, status_code=status.HTTP_201_CREATED)
def add_ingredient(
    data: IngredientIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    # If the ingredient already exists for this user, bump its quantity
    # instead of creating a duplicate row.
    existing = (
        db.query(Ingredient)
        .filter(Ingredient.user_id == user.id, Ingredient.name.ilike(data.name))
        .first()
    )
    if existing:
        existing.quantity += data.quantity
        db.commit()
        db.refresh(existing)
        return existing

    ingredient = Ingredient(user_id=user.id, name=data.name, quantity=data.quantity, unit=data.unit)
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)
    return ingredient


def _get_owned_ingredient(ingredient_id: int, user: User, db: Session) -> Ingredient:
    ingredient = db.get(Ingredient, ingredient_id)
    if ingredient is None or ingredient.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ingredient not found")
    return ingredient


@router.patch("/{ingredient_id}", response_model=IngredientOut)
def update_ingredient(
    ingredient_id: int,
    data: IngredientUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ingredient = _get_owned_ingredient(ingredient_id, user, db)
    ingredient.quantity = data.quantity
    db.commit()
    db.refresh(ingredient)
    return ingredient


@router.delete("/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingredient(
    ingredient_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    ingredient = _get_owned_ingredient(ingredient_id, user, db)
    db.delete(ingredient)
    db.commit()
