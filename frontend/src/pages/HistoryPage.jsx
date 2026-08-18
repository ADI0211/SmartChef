import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import HomeButton from "../components/HomeButton.jsx";
import RecipeOverlay from "../components/RecipeOverlay.jsx";

// Every recipe ever generated, newest first - opening one lets the user
// "prepare it again".
export default function HistoryPage() {
  const [recipes, setRecipes] = useState([]);
  const [openRecipe, setOpenRecipe] = useState(null);
  const [error, setError] = useState("");

  function load() {
    api.get("/recipes/history").then(setRecipes).catch((err) => setError(err.message));
  }

  useEffect(load, []);

  function handleRecipeUpdated(updated) {
    setOpenRecipe(updated);
    load();
  }

  return (
    <div className="page">
      <HomeButton />
      <h1 className="page-title">Recipe History</h1>

      {error && <p className="error-text">{error}</p>}
      {recipes.length === 0 && <p className="empty-hint">You haven't made any recipes yet.</p>}

      {recipes.map((recipe) => (
        <div className="recipe-list-item" key={recipe.id} onClick={() => setOpenRecipe(recipe)}>
          <div className="title">
            {recipe.is_favorite ? "❤️ " : ""}
            {recipe.title}
          </div>
          <div className="subtitle">
            {recipe.meal_type} · {new Date(recipe.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}

      {openRecipe && (
        <RecipeOverlay recipe={openRecipe} onClose={() => setOpenRecipe(null)} onRecipeUpdated={handleRecipeUpdated} />
      )}
    </div>
  );
}
