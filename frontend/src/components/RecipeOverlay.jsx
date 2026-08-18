import { useState } from "react";
import { api } from "../api/client.js";
import ThumbsDownFeedbackModal from "./ThumbsDownFeedbackModal.jsx";

// Full-screen recipe view, opened above the rest of the app with an X to
// close. Lets the user favorite it, or send a thumbs-down for a redo.
export default function RecipeOverlay({ recipe, onClose, onRecipeUpdated }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [likedJustNow, setLikedJustNow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const { title, content } = recipe;
  const steps = content.steps || [];
  const ingredientsUsed = content.ingredients_used || [];

  async function toggleFavorite() {
    setBusy(true);
    setError("");
    try {
      const updated = await api.patch(`/recipes/${recipe.id}/favorite`, {});
      onRecipeUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleFeedbackSubmit(reason, details) {
    setBusy(true);
    setError("");
    try {
      const newRecipe = await api.post(`/recipes/${recipe.id}/regenerate`, { reason, details });
      setShowFeedback(false);
      onRecipeUpdated(newRecipe);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="recipe-overlay">
      <div className="recipe-banner">
        <button className="recipe-close-btn" onClick={onClose} aria-label="Close recipe">
          ✕
        </button>
        <span className="recipe-banner-icon">🍽️</span>
      </div>

      <div className="recipe-header">
        <h2 className="recipe-title">{title}</h2>
        <div className="recipe-badges">
          <span className="badge">⏱ {content.prep_time || "n/a"}</span>
          <span className="badge">📊 {content.difficulty || "n/a"}</span>
        </div>
      </div>

      <div className="recipe-body">
        {ingredientsUsed.length > 0 && (
          <div className="recipe-card">
            <div className="recipe-section-title">🧺 Ingredients</div>
            <ul className="recipe-ingredient-list">
              {ingredientsUsed.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="recipe-card">
          <div className="recipe-section-title">👩‍🍳 Steps</div>
          <ol className="recipe-steps-list">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="recipe-actions">
        <button
          className={`action-btn favorite-btn ${recipe.is_favorite ? "active" : ""}`}
          onClick={toggleFavorite}
          disabled={busy}
          aria-label="Favorite"
        >
          <span className="action-icon">{recipe.is_favorite ? "❤️" : "🤍"}</span>
          Save
        </button>
        <button
          className={`action-btn like-btn ${likedJustNow ? "active" : ""}`}
          onClick={() => setLikedJustNow(true)}
          aria-label="Thumbs up"
        >
          <span className="action-icon">👍</span>
          Like
        </button>
        <button
          className="action-btn"
          onClick={() => setShowFeedback(true)}
          disabled={busy}
          aria-label="Thumbs down"
        >
          <span className="action-icon">👎</span>
          Dislike
        </button>
      </div>
      {likedJustNow && <p className="liked-hint">Glad you liked it!</p>}

      {showFeedback && (
        <ThumbsDownFeedbackModal
          busy={busy}
          onCancel={() => setShowFeedback(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
}
