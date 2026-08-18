"""The onboarding questionnaire, and later edits to it from Settings."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User, UserPreference
from app.schemas import PreferencesIn, PreferencesOut

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get("", response_model=PreferencesOut)
def get_preferences(user: User = Depends(get_current_user)):
    if user.preferences is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Preferences not set yet")
    return user.preferences


@router.put("", response_model=PreferencesOut)
def set_preferences(
    data: PreferencesIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Creates the preferences row on first submit (questionnaire), or
    overwrites it on later edits (Settings) — same endpoint does both.
    """
    prefs = user.preferences or UserPreference(user_id=user.id)
    for field, value in data.model_dump().items():
        setattr(prefs, field, value)

    db.add(prefs)
    db.commit()
    db.refresh(prefs)
    return prefs
