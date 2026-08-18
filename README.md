# Smart Chef

An AI-based app that helps you decide what to cook using ingredients you
already have at home. Take a photo of an ingredient, a CNN model identifies
it, and OpenAI suggests a recipe based on what's in your fridge and your
dietary preferences.

This repository has three parts:

- `SmartChef (4).ipynb` — the Colab notebook that trains the ingredient
  recognition CNN. Not part of the running app; do not modify it.
- `backend/` — FastAPI + SQLite API (auth, ingredients, preferences, recipe
  generation, photo classification). See `backend/README.md` for setup.
- `frontend/` — React (Vite) web app.

## Running locally

Two servers need to run at the same time.

**Backend** (see `backend/README.md` for full setup):

```bash
cd backend
uvicorn app.main:app --reload
```

**Frontend**:

```bash
cd frontend
npm install
npm run dev
```

Then open the URL Vite prints (typically http://localhost:5173).

## Notes

- Ingredient photo recognition needs the trained model files
  (`food_classifier_model.keras`, `class_names.json`) placed in
  `backend/app/model/` — see `backend/README.md`.
- Recipe generation needs a real `OPENAI_API_KEY` in `backend/.env`.
- Without either of those, the rest of the app still works normally; the
  relevant actions just show a clear "not configured" message.
