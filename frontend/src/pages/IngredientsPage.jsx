import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import HomeButton from "../components/HomeButton.jsx";

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [error, setError] = useState("");

  function load() {
    api.get("/ingredients").then(setIngredients).catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function changeQuantity(ingredient, delta) {
    const newQuantity = Math.round((ingredient.quantity + delta) * 10) / 10;
    setError("");
    try {
      if (newQuantity <= 0) {
        await api.delete(`/ingredients/${ingredient.id}`);
      } else {
        await api.patch(`/ingredients/${ingredient.id}`, { quantity: newQuantity });
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeIngredient(ingredient) {
    setError("");
    try {
      await api.delete(`/ingredients/${ingredient.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <HomeButton />
      <h1 className="page-title">My Ingredients</h1>

      {error && <p className="error-text">{error}</p>}

      {ingredients.length === 0 && (
        <p className="empty-hint">Nothing here yet - add ingredients with the + button below.</p>
      )}

      {ingredients.map((ingredient) => (
        <div className="ingredient-row" key={ingredient.id}>
          <div>
            <strong>{ingredient.name}</strong>
            <div className="empty-hint">{ingredient.unit}</div>
          </div>
          <div className="qty-controls">
            <button onClick={() => changeQuantity(ingredient, -1)} aria-label="Decrease quantity">
              −
            </button>
            <span>{ingredient.quantity}</span>
            <button onClick={() => changeQuantity(ingredient, 1)} aria-label="Increase quantity">
              +
            </button>
            <button onClick={() => removeIngredient(ingredient)} aria-label="Delete ingredient" title="Delete">
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
