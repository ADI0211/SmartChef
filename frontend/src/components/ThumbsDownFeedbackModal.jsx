import { useState } from "react";

const REASONS = [
  { value: "too_long", label: "The recipe is too long" },
  { value: "too_difficult", label: "The recipe is too difficult" },
  { value: "not_to_taste", label: "Not to my taste" },
  { value: "other", label: "Other" },
];

// Asks why the user disliked a recipe, then hands the reason back so the
// parent can request a new recipe from the backend.
export default function ThumbsDownFeedbackModal({ onSubmit, onCancel, busy }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  return (
    <div className="overlay-backdrop" onClick={onCancel}>
      <div className="overlay-sheet" onClick={(e) => e.stopPropagation()}>
        <h2 className="overlay-title">What didn't you like?</h2>

        {REASONS.map((r) => (
          <button
            key={r.value}
            className={`reason-option ${reason === r.value ? "selected" : ""}`}
            onClick={() => setReason(r.value)}
          >
            {r.label}
          </button>
        ))}

        {reason === "other" && (
          <div className="field">
            <textarea
              rows={3}
              placeholder="Tell us more..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={busy || !reason || (reason === "other" && !details.trim())}
            onClick={() => onSubmit(reason, details.trim())}
          >
            {busy ? "Finding a new recipe…" : "Get a new recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
