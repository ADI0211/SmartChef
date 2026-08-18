"""Builds recipe prompts and calls OpenAI to generate them."""

import json

from openai import OpenAI

from app.config import settings
from app.models import Ingredient, UserPreference

SYSTEM_PROMPT = """You are a helpful home-cooking assistant for the Smart Chef app.
Given a list of ingredients someone has at home and their dietary preferences,
suggest one recipe they can make. You do not need to use every ingredient
listed - pick only the handful that actually belong in this dish (a typical
recipe uses somewhere around 4-8 ingredients, plus basic pantry staples).
Respect allergies and disliked foods strictly - never include them. Respond
with ONLY a JSON object shaped exactly like this:
{
  "title": "Recipe name",
  "prep_time": "e.g. 25 minutes",
  "difficulty": "easy | medium | hard",
  "ingredients_used": ["ingredient 1", "ingredient 2"],
  "steps": ["step 1", "step 2", "step 3"]
}"""


def _describe_preferences(prefs: UserPreference | None) -> str:
    if prefs is None:
        return "No dietary preferences recorded."

    parts = []
    if prefs.is_vegan:
        parts.append("vegan")
    elif prefs.is_vegetarian:
        parts.append("vegetarian")
    if prefs.allergies:
        parts.append(f"allergic to: {', '.join(prefs.allergies)}")
    if prefs.follows_diet:
        parts.append(f"follows a {prefs.diet_type} diet for {prefs.diet_purpose}")
    if prefs.disliked_foods:
        parts.append(f"dislikes: {', '.join(prefs.disliked_foods)}")
    parts.append(f"prefers {prefs.preferred_difficulty} recipes")
    parts.append(f"prefers prep time around {prefs.preferred_prep_time.replace('_', '-')} minutes")
    return "; ".join(parts) if parts else "No strong preferences."


def _build_user_prompt(
    meal_type: str,
    ingredients: list[Ingredient],
    prefs: UserPreference | None,
    dislike_note: str | None,
    previous_recipe: dict | None,
) -> str:
    ingredient_list = ", ".join(f"{i.name} ({i.quantity} {i.unit})" for i in ingredients) or "none listed"

    prompt = (
        f"Meal type: {meal_type}\n"
        f"Ingredients available at home: {ingredient_list}\n"
        f"Dietary preferences: {_describe_preferences(prefs)}\n"
        "Prefer using ingredients already at home, but you may assume basic "
        "pantry staples (salt, pepper, oil, water) are available too."
    )
    if previous_recipe:
        prompt += (
            f"\n\nThe user was already shown this recipe and disliked it - do not suggest it "
            f"again, and make the new one clearly different (different main ingredients, "
            f"cooking method, or style), not just a small tweak:\n"
            f"Title: {previous_recipe.get('title')}\n"
            f"Ingredients used: {', '.join(previous_recipe.get('ingredients_used', []))}\n"
            f"Reason they disliked it: {dislike_note}"
        )
    return prompt


def generate_recipe(
    meal_type: str,
    ingredients: list[Ingredient],
    prefs: UserPreference | None,
    dislike_note: str | None = None,
    previous_recipe: dict | None = None,
) -> dict:
    if not settings.openai_api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Add a real key to backend/.env to enable recipe generation."
        )

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.openai_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": _build_user_prompt(meal_type, ingredients, prefs, dislike_note, previous_recipe),
            },
        ],
    )
    return json.loads(response.choices[0].message.content)
