"""Standalone training script mirroring SmartChef.ipynb (the MobileNetV2
transfer-learning version), so it can be run locally instead of in Colab.

This is a separate script from train_model.py (which mirrors the original
from-scratch CNN in SmartChef (4).ipynb). It does not modify either notebook
- it reproduces the newer notebook's approach and saves its output straight
into backend/app/model/, overwriting the previous model.

Reuses the already-merged dataset at training/merged_dataset/ (built by
train_model.py's first run) instead of re-merging from the raw zips.
"""

import json
from pathlib import Path

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

TRAINING_DIR = Path(__file__).resolve().parent
MERGED_PATH = TRAINING_DIR / "merged_dataset"

MODEL_OUTPUT_DIR = TRAINING_DIR.parent / "app" / "model"
MODEL_OUTPUT_PATH = MODEL_OUTPUT_DIR / "food_classifier_model.keras"
CLASS_NAMES_OUTPUT_PATH = MODEL_OUTPUT_DIR / "class_names.json"

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10
RANDOM_SEED = 42


def build_model(num_classes: int) -> keras.Model:
    base_model = keras.applications.MobileNetV2(
        input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False

    return keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
        layers.Lambda(lambda x: keras.applications.mobilenet_v2.preprocess_input(x)),
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation="softmax"),
    ])


def main():
    print("TensorFlow version:", tf.__version__)
    print("GPU available:", tf.config.list_physical_devices("GPU"))

    if not MERGED_PATH.exists():
        raise SystemExit(f"Expected merged dataset at {MERGED_PATH} - run train_model.py first.")

    full_dataset = keras.utils.image_dataset_from_directory(
        str(MERGED_PATH),
        image_size=IMG_SIZE,
        batch_size=None,
        shuffle=True,
        seed=RANDOM_SEED,
        label_mode="int",
    )
    class_names = full_dataset.class_names
    num_classes = len(class_names)
    print("Total categories loaded:", num_classes)

    total_images = len(full_dataset)
    train_size = int(total_images * 0.70)
    val_size = int(total_images * 0.15)
    test_size = total_images - train_size - val_size
    print(f"Train: {train_size} | Validation: {val_size} | Test: {test_size}")

    train_ds = full_dataset.take(train_size)
    val_ds = full_dataset.skip(train_size).take(val_size)
    test_ds = full_dataset.skip(train_size + val_size)

    train_ds = train_ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
    test_ds = test_ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)

    model = build_model(num_classes)
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(train_ds, epochs=EPOCHS, validation_data=val_ds)

    test_loss, test_accuracy = model.evaluate(test_ds)
    print(f"Test Loss: {round(test_loss, 4)}")
    print(f"Test Accuracy: {round(test_accuracy * 100, 2)}%")

    MODEL_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    model.save(MODEL_OUTPUT_PATH)
    with open(CLASS_NAMES_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(class_names, f)
    print("Saved model to", MODEL_OUTPUT_PATH)
    print("Saved class names to", CLASS_NAMES_OUTPUT_PATH)


if __name__ == "__main__":
    main()
