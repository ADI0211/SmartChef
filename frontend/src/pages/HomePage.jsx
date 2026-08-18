import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import logo from "../assets/logo.png";
import FridgeScroller from "../components/FridgeScroller.jsx";
import MealTypeConfirmModal from "../components/MealTypeConfirmModal.jsx";
import RecipeOverlay from "../components/RecipeOverlay.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Appetizers", "Desserts", "Other"];

export default function HomePage() {
  const { username } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [pendingMealType, setPendingMealType] = useState(null); // meal button awaiting confirmation
  const [recipe, setRecipe] = useState(null); // currently open RecipeOverlay
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/ingredients").then(setIngredients).catch(() => {});
  }, []);

  async function handleConfirmMealType(finalMealType) {
    setPendingMealType(null);
    setGenerating(true);
    setError("");
    try {
      const payload =
        pendingMealType === "Other"
          ? { meal_type: "Other", custom_meal_type: finalMealType }
          : { meal_type: finalMealType };
      const newRecipe = await api.post("/recipes/generate", payload);
      setRecipe(newRecipe);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="page">
      <div className="top-bar">
        <img src={logo} alt="Smart Chef" className="home-logo" />
        <span className="greeting">Hi, {username}</span>
      </div>

      <h2 className="page-title">What's in my fridge?</h2>
      <FridgeScroller ingredients={ingredients} />

      <h2 className="page-title">What are you cooking?</h2>
      <div className="meal-grid">
        {MEAL_TYPES.map((meal) => (
          <button key={meal} className="meal-btn" onClick={() => setPendingMealType(meal)}>
            {meal}
          </button>
        ))}
      </div>

      {generating && <p className="empty-hint">Cooking up a recipe…</p>}
      {error && <p className="error-text">{error}</p>}

      {pendingMealType && (
        <MealTypeConfirmModal
          mealType={pendingMealType}
          onConfirm={handleConfirmMealType}
          onCancel={() => setPendingMealType(null)}
        />
      )}

      {recipe && <RecipeOverlay recipe={recipe} onClose={() => setRecipe(null)} onRecipeUpdated={setRecipe} />}
    </div>
  );
}
