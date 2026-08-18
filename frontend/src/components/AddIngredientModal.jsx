import { useState } from "react";
import { api } from "../api/client.js";

// Popup opened from the "+" tab. Step 1: manual entry or photo. Step 2 (photo
// only): shows the CNN's prediction and lets the user confirm the quantity.
export default function AddIngredientModal({ onClose, onAdded }) {
  const [step, setStep] = useState("choose"); // choose | manual | confirm-photo
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("pcs");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submitIngredient(ingredientName) {
    setBusy(true);
    setError("");
    try {
      await api.post("/ingredients", { name: ingredientName, quantity: Number(quantity), unit });
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePhotoSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await api.postForm("/classify", formData);
      setName(result.name);
      setStep("confirm-photo");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-sheet" onClick={(e) => e.stopPropagation()}>
        {step === "choose" && (
          <>
            <h2 className="overlay-title">Add an ingredient</h2>
            <button className="btn btn-primary btn-block" style={{ marginBottom: 10 }} onClick={() => setStep("manual")}>
              Enter manually
            </button>
            <label className="btn btn-secondary btn-block" style={{ display: "block", textAlign: "center" }}>
              Take / upload a photo
              <input type="file" accept="image/*" capture="environment" hidden onChange={handlePhotoSelected} />
            </label>
            {busy && <p className="empty-hint">Identifying ingredient…</p>}
            {error && <p className="error-text">{error}</p>}
          </>
        )}

        {(step === "manual" || step === "confirm-photo") && (
          <>
            <h2 className="overlay-title">
              {step === "confirm-photo" ? "Is this right?" : "Ingredient details"}
            </h2>

            <div className="field">
              <label>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>Quantity</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Unit</label>
              <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>

            {error && <p className="error-text">{error}</p>}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={busy || !name.trim()}
                onClick={() => submitIngredient(name.trim())}
              >
                {busy ? "Adding…" : "Add"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
