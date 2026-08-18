"""Signup and login endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, SignupRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Username is already taken")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email is already registered")

    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Brand new account: no preferences row yet, so the frontend knows to
    # send the user to the onboarding questionnaire.
    return TokenResponse(
        access_token=create_access_token(user.id),
        username=user.username,
        has_preferences=False,
    )


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    invalid = HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect username or password")

    user = db.query(User).filter(User.username == data.username).first()
    if user is None or not verify_password(data.password, user.password_hash):
        raise invalid

    return TokenResponse(
        access_token=create_access_token(user.id),
        username=user.username,
        has_preferences=user.preferences is not None,
    )
