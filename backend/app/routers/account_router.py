"""Settings-page account actions: update profile, delete account."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user, hash_password
from app.database import get_db
from app.models import User
from app.schemas import UpdateAccountRequest

router = APIRouter(prefix="/account", tags=["account"])


@router.put("")
def update_account(
    data: UpdateAccountRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.username and data.username != user.username:
        if db.query(User).filter(User.username == data.username).first():
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Username is already taken")
        user.username = data.username

    if data.password:
        user.password_hash = hash_password(data.password)

    db.commit()
    return {"username": user.username}


@router.delete("")
def delete_account(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(user)  # cascades to preferences/ingredients/recipes
    db.commit()
    return {"ok": True}
