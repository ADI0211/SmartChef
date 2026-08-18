import { useState } from "react";

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const PREP_TIME_OPTIONS = [
  { value: "under_15", label: "Under 15 minutes" },
  { value: "15_30", label: "15-30 minutes" },
  { value: "30_60", label: "30-60 minutes" },
  { value: "60_plus", label: "Over an hour" },
];

// dietType is a small convenience the form uses instead of juggling two
// booleans (is_vegetarian / is_vegan) directly - "vegan" implies vegetarian.
function toDietType(values) {
  if (values.is_vegan) return "vegan";
  if (values.is_vegetarian) return "vegetarian";
  return "none";
}

// Used both by the onboarding Questionnaire and by Settings (to edit later).
export default function PreferencesForm({ initialValues, onSubmit, submitLabel = "Continue" }) {
  const [dietType, setDietType] = useState(toDietType(initialValues));
  const [allergies, setAllergies] = useState((initialValues.allergies || []).join(", "));
  const [followsDiet, setFollowsDiet] = useState(initialValues.follows_diet || false);
  const [dietName, setDietName] = useState(initialValues.diet_type || "");
  const [dietPurpose, setDietPurpose] = useState(initialValues.diet_purpose || "");
  const [dislikedFoods, setDislikedFoods] = useState((initialValues.disliked_foods || []).join(", "));
  const [difficulty, setDifficulty] = useState(initialValues.preferred_difficulty || "easy");
  const [prepTime, setPrepTime] = useState(initialValues.preferred_prep_time || "15_30");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function splitList(text) {
    return text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit({
        is_vegetarian: dietType === "vegetarian" || dietType === "vegan",
        is_vegan: dietType === "vegan",
        allergies: splitList(allergies),
        follows_diet: followsDiet,
        diet_type: followsDiet ? dietName : "",
        diet_purpose: followsDiet ? dietPurpose : "",
        disliked_foods: splitList(dislikedFoods),
        preferred_difficulty: difficulty,
        preferred_prep_time: prepTime,
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Are you vegetarian or vegan?</label>
        <select value={dietType} onChange={(e) => setDietType(e.target.value)}>
          <option value="none">Neither</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
        </select>
      </div>

      <div className="field">
        <label>Any specific allergies? (comma separated)</label>
        <input type="text" placeholder="e.g. peanuts, shellfish" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={followsDiet} onChange={(e) => setFollowsDiet(e.target.checked)} /> I follow a
          specific diet
        </label>
      </div>

      {followsDiet && (
        <>
          <div className="field">
            <label>What type of diet?</label>
            <input type="text" placeholder="e.g. Keto" value={dietName} onChange={(e) => setDietName(e.target.value)} />
          </div>
          <div className="field">
            <label>What's the purpose of this diet?</label>
            <input
              type="text"
              placeholder="e.g. weight loss, a health condition"
              value={dietPurpose}
              onChange={(e) => setDietPurpose(e.target.value)}
            />
          </div>
        </>
      )}

      <div className="field">
        <label>Foods you don't like (comma separated)</label>
        <input
          type="text"
          placeholder="e.g. mushrooms, olives"
          value={dislikedFoods}
          onChange={(e) => setDislikedFoods(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Preferred recipe difficulty</label>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          {DIFFICULTY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Preferred preparation time</label>
        <select value={prepTime} onChange={(e) => setPrepTime(e.target.value)}>
          {PREP_TIME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
