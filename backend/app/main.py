"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import (
    account_router,
    auth_router,
    classify_router,
    ingredients_router,
    preferences_router,
    recipes_router,
)

# Creates the SQLite tables on first run (no-op if they already exist).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Chef API")

# The frontend (Vite dev server) runs on a different port, so it needs CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(account_router.router)
app.include_router(preferences_router.router)
app.include_router(ingredients_router.router)
app.include_router(classify_router.router)
app.include_router(recipes_router.router)


@app.get("/health")
def health():
    return {"status": "ok"}
