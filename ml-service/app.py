import io
import os
from pathlib import Path

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from dotenv import load_dotenv
from huggingface_hub import hf_hub_download

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# -------------------------------
# Hugging Face Model Configuration
# -------------------------------
HF_REPO_ID = os.getenv("HF_REPO_ID", "chandra19404/octvision-model")
HF_FILENAME = os.getenv("HF_FILENAME", "vggres_best.h5")
HF_TOKEN = os.getenv("HF_TOKEN")  # Leave empty for public repositories

INPUT_SIZE = tuple(
    int(value.strip())
    for value in os.getenv("MODEL_INPUT_SIZE", "224,224").split(",")
)

COLOR_MODE = os.getenv("MODEL_COLOR_MODE", "rgb").lower()

PREPROCESS = os.getenv("MODEL_PREPROCESS", "scale_0_1").lower()

CLASS_NAMES = [
    label.strip()
    for label in os.getenv(
        "CLASS_NAMES",
        "CNV,DME,DRUSEN,NORMAL"
    ).split(",")
    if label.strip()
]

CONDITION_DETAILS = {
    "CNV": {
        "display_name": "Choroidal Neovascularization (CNV)",
        "severity": "moderate",
        "description": "Retinal OCT classification associated with abnormal blood-vessel growth beneath the retina.",
    },
    "DME": {
        "display_name": "Diabetic Macular Edema (DME)",
        "severity": "moderate",
        "description": "Retinal OCT classification associated with fluid-related swelling in the macula.",
    },
    "DRUSEN": {
        "display_name": "Drusen",
        "severity": "low",
        "description": "Retinal OCT classification associated with deposits beneath the retina.",
    },
    "NORMAL": {
        "display_name": "Normal retinal OCT pattern",
        "severity": "normal",
        "description": "No CNV, DME, or drusen pattern was the highest-scoring class in this model.",
    },
}

if len(INPUT_SIZE) != 2 or COLOR_MODE not in {"rgb", "grayscale"}:
    raise RuntimeError(
        "MODEL_INPUT_SIZE must be width,height and MODEL_COLOR_MODE must be rgb or grayscale"
    )


def load_model_from_hf():
    print("Downloading model from Hugging Face...")

    model_path = hf_hub_download(
        repo_id=HF_REPO_ID,
        filename=HF_FILENAME,
        token=HF_TOKEN,
    )

    print(f"Model downloaded to: {model_path}")

    model = tf.keras.models.load_model(model_path, compile=False)

    print("Model loaded successfully!")

    return model, Path(model_path)


app = FastAPI(title="LumenX ML Service")

model, MODEL_PATH = load_model_from_hf()


def preprocess_image(contents: bytes) -> np.ndarray:
    try:
        image = Image.open(io.BytesIO(contents)).convert(
            "RGB" if COLOR_MODE == "rgb" else "L"
        )
    except UnidentifiedImageError as error:
        raise HTTPException(
            status_code=400,
            detail="The upload is not a valid image",
        ) from error

    image = image.resize(INPUT_SIZE)

    array = np.asarray(image, dtype=np.float32)

    if COLOR_MODE == "grayscale":
        array = np.expand_dims(array, axis=-1)

    if PREPROCESS == "scale_0_1":
        array /= 255.0

    elif PREPROCESS == "keras_vgg16":
        array = tf.keras.applications.vgg16.preprocess_input(array)

    elif PREPROCESS == "keras_resnet50":
        array = tf.keras.applications.resnet50.preprocess_input(array)

    elif PREPROCESS != "none":
        raise HTTPException(
            status_code=500,
            detail=f"Unsupported MODEL_PREPROCESS: {PREPROCESS}",
        )

    return np.expand_dims(array, axis=0)


def prediction_scores(raw_prediction: np.ndarray) -> np.ndarray:
    values = np.asarray(raw_prediction).squeeze()

    if values.ndim == 0 or values.size == 1:
        probability = float(np.ravel(values)[0])

        if not 0 <= probability <= 1:
            probability = 1 / (1 + np.exp(-probability))

        return np.array([1 - probability, probability])

    values = np.ravel(values).astype(float)

    if not np.isclose(values.sum(), 1.0, atol=1e-3) or np.any(values < 0):
        values = np.exp(values - np.max(values))
        values /= values.sum()

    return values


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": MODEL_PATH.name,
        "input_size": INPUT_SIZE,
    }


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    if image.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(
            status_code=400,
            detail="Only JPG and PNG images are supported",
        )

    contents = await image.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty",
        )

    scores = prediction_scores(
        model.predict(preprocess_image(contents), verbose=0)
    )

    if len(CLASS_NAMES) != len(scores):
        raise HTTPException(
            status_code=500,
            detail=f"CLASS_NAMES has {len(CLASS_NAMES)} labels but the model returns {len(scores)} scores",
        )

    index = int(np.argmax(scores))
    confidence = float(scores[index])
    label = CLASS_NAMES[index]

    detail = CONDITION_DETAILS.get(
        label.upper(),
        {
            "display_name": label,
            "severity": "moderate",
            "description": "Retinal OCT model classification.",
        },
    )

    return {
        "result": detail["display_name"],
        "confidence": confidence,
        "findings": [
            {
                "label": detail["display_name"],
                "severity": detail["severity"],
                "confidence": confidence,
                "description": detail["description"],
            }
        ],
        "scores": [
            {
                "label": CONDITION_DETAILS.get(
                    name.upper(),
                    {"display_name": name},
                )["display_name"],
                "confidence": float(score),
            }
            for name, score in zip(CLASS_NAMES, scores)
        ],
    }