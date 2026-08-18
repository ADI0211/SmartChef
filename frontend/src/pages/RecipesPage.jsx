import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import HomeButton from "../components/HomeButton.jsx";
import RecipeOverlay from "../components/RecipeOverlay.jsx";

// Recipes the user has saved by tapping the heart icon.
export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [openRecipe, setOpenRecipe] = useState(null);
  const [error, setError] = useState("");

  function load() {
    api.get("/recipes/favorites").then(setRecipes).catch((err) => setError(err.message));
  }

  useEffect(load, []);

  function handleRecipeUpdated(updated) {
    setOpenRecipe(updated);
    load(); // an unfavorite here should drop it from this list once closed
  }

  return (
    <div className="page">
      <HomeButton />
      <h1 className="page-title">Saved Recipes</h1>

      {error && <p className="error-text">{error}</p>}
      {recipes.length === 0 && <p className="empty-hint">No favorites yet - tap the heart on a recipe to save it here.</p>}

      {recipes.map((recipe) => (
        <div className="recipe-list-item" key={recipe.id} onClick={() => setOpenRecipe(recipe)}>
          <div className="title">{recipe.title}</div>
          <div className="subtitle">
            {recipe.meal_type} · {recipe.content.prep_time || "n/a"}
          </div>
        </div>
      ))}

      {openRecipe && (
        <RecipeOverlay recipe={openRecipe} onClose={() => setOpenRecipe(null)} onRecipeUpdated={handleRecipeUpdated} />
      )}
    </div>
  );
}
