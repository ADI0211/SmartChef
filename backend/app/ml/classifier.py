"""Loads the trained ingredient-recognition model and classifies photos.

The model is a MobileNetV2 transfer-learning model, trained by
backend/training/train_model_mobilenet.py (mirroring the user's own
SmartChef.ipynb). This module only loads the *result* of that training:
`food_classifier_model.keras` + `class_names.json`, expected to sit in
backend/app/model/.
"""

import json
from io import BytesIO

import numpy as np
from PIL import Image

from app.config import MODEL_DIR

MODEL_PATH = MODEL_DIR / "food_classifier_model.keras"
CLASS_NAMES_PATH = MODEL_DIR / "class_names.json"

# Must match IMG_SIZE from the training script, or predictions will be wrong.
IMG_SIZE = (224, 224)

# Cached after the first successful load, so we don't reload the model on
# every request (loading a Keras model from disk is relatively slow).
_model = None
_class_names: list[str] | None = None


def is_model_available() -> bool:
    return MODEL_PATH.exists() and CLASS_NAMES_PATH.exists()


def _load_model():
    global _model, _class_names
    if _model is None:
        # Imported lazily so the rest of the API works even before
        # tensorflow / the model files are set up.
        import builtins

        from tensorflow import keras

        # The model has a Lambda layer (MobileNetV2's preprocess_input) saved
        # as raw bytecode. When Keras reconstructs it here, the function's
        # original module namespace isn't available, so its reference to
        # "keras" would otherwise fail with a NameError at inference time.
        # Making it a builtin covers that lookup. safe_mode=False is needed
        # because Lambda layers are blocked by default (fine here - it's our
        # own locally-trained model file, not one from an untrusted source).
        builtins.keras = keras
        _model = keras.models.load_model(MODEL_PATH, safe_mode=False)
        with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
            _class_names = json.load(f)
    return _model, _class_names


def predict(image_bytes: bytes) -> tuple[str, float]:
    """Classifies one image and returns (predicted_label, confidence 0-1)."""
    model, class_names = _load_model()

    image = Image.open(BytesIO(image_bytes)).convert("RGB").resize(IMG_SIZE)
    batch = np.expand_dims(np.array(image), axis=0)  # model expects a batch dimension

    probabilities = model.predict(batch, verbose=0)[0]
    best_index = int(np.argmax(probabilities))
    return class_names[best_index], float(probabilities[best_index])
