# Smart Chef — Backend

FastAPI + SQLite backend: authentication, ingredients, preferences, recipe
generation (OpenAI), and ingredient photo recognition (the CNN trained in
`SmartChef (4).ipynb`).

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` and set:
- `JWT_SECRET` — any long random string.
- `OPENAI_API_KEY` — your key from platform.openai.com. Without it, recipe
  generation returns a clear "not configured" error instead of crashing.

## Adding the trained ingredient-recognition model

Export from the notebook (`SmartChef (4).ipynb`) and place these two files in
`backend/app/model/`:

- `food_classifier_model.keras`
- `class_names.json`

Without them, `POST /classify` returns a clear 503 error; the rest of the app
works normally (ingredients can still be added manually).

## Run

```bash
uvicorn app.main:app --reload
```

API docs (interactive): http://127.0.0.1:8000/docs
