# OCTVision ML service

This service runs `vggres_best.h5` with TensorFlow and exposes `POST /predict` for the Express backend.

1. Create and activate a Python virtual environment.
2. Install dependencies: `pip install -r requirements.txt`.
3. Copy `vggres_best.h5` to `models/vggres_best.h5`, or set `MODEL_PATH` to its location.
4. Copy `.env.example` to `.env` and set the values to match the training pipeline, especially class order and preprocessing.
5. Start the service: `uvicorn app:app --host 127.0.0.1 --port 8000`.

The app intentionally fails to start if the model cannot be found. Check `GET /health` before starting the Node backend.
