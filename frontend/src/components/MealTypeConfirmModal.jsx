import { useState } from "react";

// Confirms the meal type the user tapped before generating a recipe for it.
// For "Other" it first asks the user to type what they want.
export default function MealTypeConfirmModal({ mealType, onConfirm, onCancel }) {
  const [customType, setCustomType] = useState("");
  const isOther = mealType === "Other";

  return (
    <div className="overlay-backdrop" onClick={onCancel}>
      <div className="overlay-sheet" onClick={(e) => e.stopPropagation()}>
        {isOther ? (
          <>
            <h2 className="overlay-title">What would you like a recipe for?</h2>
            <div className="field">
              <input
                type="text"
                placeholder="e.g. a smoothie"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                autoFocus
              />
            </div>
          </>
        ) : (
          <h2 className="overlay-title">Get a recipe for {mealType}?</h2>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>
            No
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={isOther && !customType.trim()}
            onClick={() => onConfirm(isOther ? customType.trim() : mealType)}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
