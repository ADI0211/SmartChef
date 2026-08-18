"""Turns an uploaded ingredient photo into a predicted ingredient name."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.auth import get_current_user
from app.ml import classifier
from app.models import User
from app.schemas import ClassifyResponse

router = APIRouter(prefix="/classify", tags=["classify"])


@router.post("", response_model=ClassifyResponse)
async def classify_image(file: UploadFile, _: User = Depends(get_current_user)):
    if not classifier.is_model_available():
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "The ingredient recognition model isn't set up yet. Add "
            "food_classifier_model.keras and class_names.json to "
            "backend/app/model/ to enable photo recognition.",
        )

    image_bytes = await file.read()
    label, confidence = classifier.predict(image_bytes)
    return ClassifyResponse(name=label, confidence=confidence)
