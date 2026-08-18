"""Recipe generation, favorites, and history.

Every recipe OpenAI generates is saved as a Recipe row, which is how
"opening a recipe automatically adds it to history" works: History just
lists every row, and the Recipes tab filters to is_favorite=True.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Ingredient, Recipe, User
from app.schemas import GenerateRecipeRequest, RecipeOut, RegenerateRecipeRequest
from app.services import openai_service

router = APIRouter(prefix="/recipes", tags=["recipes"])

DISLIKE_REASON_TEXT = {
    "too_long": "the recipe took too long to prepare",
    "too_difficult": "the recipe was too difficult",
    "not_to_taste": "the recipe wasn't to their taste",
}


def _generate_and_save(
    meal_type: str,
    dislike_note: str | None,
    previous_recipe: dict | None,
    user: User,
    db: Session,
) -> Recipe:
    ingredients = db.query(Ingredient).filter(Ingredient.user_id == user.id).all()
    try:
        content = openai_service.generate_recipe(
            meal_type, ingredients, user.preferences, dislike_note, previous_recipe
        )
    except RuntimeError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc))
    except Exception:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Recipe generation failed. Please try again.")

    recipe = Recipe(
        user_id=user.id,
        meal_type=meal_type,
        title=content.get("title", "Untitled recipe"),
        content=content,
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.post("/generate", response_model=RecipeOut)
def generate(
    data: GenerateRecipeRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    meal_type = data.custom_meal_type if data.meal_type == "Other" and data.custom_meal_type else data.meal_type
    return _generate_and_save(meal_type, None, None, user, db)


def _get_owned_recipe(recipe_id: int, user: User, db: Session) -> Recipe:
    recipe = db.get(Recipe, recipe_id)
    if recipe is None or recipe.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Recipe not found")
    return recipe


@router.post("/{recipe_id}/regenerate", response_model=RecipeOut)
def regenerate(
    recipe_id: int,
    data: RegenerateRecipeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    original = _get_owned_recipe(recipe_id, user, db)
    dislike_note = data.details if data.reason == "other" else DISLIKE_REASON_TEXT.get(data.reason, data.reason)
    return _generate_and_save(original.meal_type, dislike_note, original.content, user, db)


@router.patch("/{recipe_id}/favorite", response_model=RecipeOut)
def toggle_favorite(
    recipe_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    recipe = _get_owned_recipe(recipe_id, user, db)
    recipe.is_favorite = not recipe.is_favorite
    db.commit()
    db.refresh(recipe)
    return recipe


@router.get("/favorites", response_model=list[RecipeOut])
def list_favorites(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Recipe)
        .filter(Recipe.user_id == user.id, Recipe.is_favorite.is_(True))
        .order_by(Recipe.created_at.desc())
        .all()
    )


@router.get("/history", response_model=list[RecipeOut])
def list_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Recipe)
        .filter(Recipe.user_id == user.id)
        .order_by(Recipe.created_at.desc())
        .all()
    )


@router.get("/{recipe_id}", response_model=RecipeOut)
def get_recipe(recipe_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_owned_recipe(recipe_id, user, db)
