import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AddIngredientModal from "./AddIngredientModal.jsx";

// Bottom tab bar shown on every logged-in page. The "+" button doesn't
// navigate anywhere - it opens the add-ingredient modal directly.
export default function BottomNav() {
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  function handleAdded() {
    setShowAddModal(false);
    navigate("/ingredients");
  }

  return (
    <>
      <nav className="bottom-nav">
        <NavLink to="/settings">
          <span className="nav-icon">⚙️</span>
          Settings
        </NavLink>
        <NavLink to="/ingredients">
          <span className="nav-icon">🥕</span>
          Ingredients
        </NavLink>
        <button type="button" onClick={() => setShowAddModal(true)} aria-label="Add ingredient">
          <span className="plus-icon">+</span>
        </button>
        <NavLink to="/recipes">
          <span className="nav-icon">❤️</span>
          Recipes
        </NavLink>
        <NavLink to="/history">
          <span className="nav-icon">🕘</span>
          History
        </NavLink>
      </nav>

      {showAddModal && (
        <AddIngredientModal onClose={() => setShowAddModal(false)} onAdded={handleAdded} />
      )}
    </>
  );
}
