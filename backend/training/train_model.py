"""Standalone training script for the ingredient-recognition CNN.

This reproduces the training steps from `SmartChef (4).ipynb` (merge the two
datasets, build the same CNN, train for the same number of epochs) so it can
be run locally against the raw dataset zips instead of in Colab. It does not
modify the notebook - it's a separate script that produces the same kind of
output: food_classifier_model.keras + class_names.json, saved straight into
backend/app/model/ so the running app can load them.

Expects the datasets already unzipped under training/raw/, matching the
notebook's folder layout:
  training/raw/Fruit_Images_Dataset/Fruit_Images_Dataset/Images/<category>/...
  training/raw/freiburg_groceries_dataset/freiburg_groceries_dataset/images/<category>/...
"""

import json
import os
import shutil
from pathlib import Path

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

TRAINING_DIR = Path(__file__).resolve().parent
DATASET_1_PATH = TRAINING_DIR / "raw" / "Fruit_Images_Dataset" / "Fruit_Images_Dataset" / "Images"
DATASET_2_PATH = TRAINING_DIR / "raw" / "freiburg_groceries_dataset" / "freiburg_groceries_dataset" / "images"
MERGED_PATH = TRAINING_DIR / "merged_dataset"

MODEL_OUTPUT_DIR = TRAINING_DIR.parent / "app" / "model"
MODEL_OUTPUT_PATH = MODEL_OUTPUT_DIR / "food_classifier_model.keras"
CLASS_NAMES_OUTPUT_PATH = MODEL_OUTPUT_DIR / "class_names.json"

IMG_SIZE = (128, 128)
BATCH_SIZE = 32
EPOCHS = 10
RANDOM_SEED = 42


def merge_datasets(source_paths, destination):
    """Copies every category folder from both datasets into one combined folder."""
    os.makedirs(destination, exist_ok=True)

    for source in source_paths:
        for category in os.listdir(source):
            src_category_path = os.path.join(source, category)
            if not os.path.isdir(src_category_path):
                continue

            dst_category_path = os.path.join(destination, category)
            os.makedirs(dst_category_path, exist_ok=True)

            for image_file in os.listdir(src_category_path):
                src_file = os.path.join(src_category_path, image_file)
                dst_file = os.path.join(dst_category_path, image_file)
                # Avoid overwriting a same-named file that came from the other dataset.
                if os.path.exists(dst_file):
                    base, ext = os.path.splitext(image_file)
                    dst_file = os.path.join(dst_category_path, f"ds2_{base}{ext}")
                shutil.copy2(src_file, dst_file)

        print(f"Done copying: {source}")

    categories = sorted(os.listdir(destination))
    print(f"\nTotal categories: {len(categories)}")
    print("Categories:", categories)


def build_model(num_classes: int) -> keras.Model:
    return keras.Sequential([
        layers.Rescaling(1.0 / 255, input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)),
        layers.Conv2D(32, kernel_size=3, activation="relu", padding="same"),
        layers.MaxPooling2D(),
        layers.Conv2D(64, kernel_size=3, activation="relu", padding="same"),
        layers.MaxPooling2D(),
        layers.Conv2D(128, kernel_size=3, activation="relu", padding="same"),
        layers.MaxPooling2D(),
        layers.Flatten(),
        layers.Dense(256, activation="relu"),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation="softmax"),
    ])


def main():
    print("TensorFlow version:", tf.__version__)
    print("GPU available:", tf.config.list_physical_devices("GPU"))

    if not MERGED_PATH.exists():
        merge_datasets([str(DATASET_1_PATH), str(DATASET_2_PATH)], str(MERGED_PATH))
    else:
        print("Merged dataset already exists at", MERGED_PATH, "- skipping merge.")

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
    print("Categories:", class_names)

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
    model.summary()

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
