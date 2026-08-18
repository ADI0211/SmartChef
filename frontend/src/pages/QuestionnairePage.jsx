import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import PreferencesForm from "../components/PreferencesForm.jsx";

const DEFAULT_VALUES = {
  is_vegetarian: false,
  is_vegan: false,
  allergies: [],
  follows_diet: false,
  diet_type: "",
  diet_purpose: "",
  disliked_foods: [],
  preferred_difficulty: "easy",
  preferred_prep_time: "15_30",
};

// Shown once, right after signup, before the user ever reaches the home page.
export default function QuestionnairePage() {
  const navigate = useNavigate();

  async function handleSubmit(data) {
    await api.put("/preferences", data);
    navigate("/");
  }

  return (
    <div className="page">
      <h1 className="page-title">Tell us about your preferences</h1>
      <p className="empty-hint" style={{ marginBottom: 16 }}>
        This helps Smart Chef recommend recipes you'll actually want to eat. You can change
        these anytime in Settings.
      </p>
      <PreferencesForm initialValues={DEFAULT_VALUES} onSubmit={handleSubmit} submitLabel="Start cooking" />
    </div>
  );
}
