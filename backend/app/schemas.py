"""Pydantic schemas: shapes of the JSON that goes in and out of the API."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Auth / account ----------

class SignupRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    has_preferences: bool


class UpdateAccountRequest(BaseModel):
    username: str | None = None
    password: str | None = None


# ---------- Preferences ----------

class PreferencesIn(BaseModel):
    is_vegetarian: bool = False
    is_vegan: bool = False
    allergies: list[str] = []
    follows_diet: bool = False
    diet_type: str = ""
    diet_purpose: str = ""
    disliked_foods: list[str] = []
    preferred_difficulty: str = "easy"  # easy | medium | hard
    preferred_prep_time: str = "15_30"  # under_15 | 15_30 | 30_60 | 60_plus


class PreferencesOut(PreferencesIn):
    model_config = ConfigDict(from_attributes=True)


# ---------- Ingredients ----------

class IngredientIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    quantity: float = 1
    unit: str = "pcs"


class IngredientUpdate(BaseModel):
    quantity: float = Field(gt=0)


class IngredientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    quantity: float
    unit: str


# ---------- Classification ----------

class ClassifyResponse(BaseModel):
    name: str
    confidence: float


# ---------- Recipes ----------

class GenerateRecipeRequest(BaseModel):
    meal_type: str  # Breakfast | Lunch | Dinner | Appetizers | Desserts | Other
    custom_meal_type: str | None = None  # used when meal_type == "Other"


class RegenerateRecipeRequest(BaseModel):
    reason: str  # too_long | too_difficult | not_to_taste | other
    details: str | None = None  # free text, used when reason == "other"


class RecipeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meal_type: str
    title: str
    content: dict
    is_favorite: bool
    created_at: datetime
