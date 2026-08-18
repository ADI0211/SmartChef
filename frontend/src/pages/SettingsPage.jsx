import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import HomeButton from "../components/HomeButton.jsx";
import PreferencesForm from "../components/PreferencesForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function SettingsPage() {
  const { username, logout, updateUsername } = useAuth();
  const navigate = useNavigate();

  const [newUsername, setNewUsername] = useState(username || "");
  const [newPassword, setNewPassword] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountSaved, setAccountSaved] = useState(false);

  const [preferences, setPreferences] = useState(null);
  const [prefsError, setPrefsError] = useState("");
  const [prefsSaved, setPrefsSaved] = useState(false);

  const [deleteConfirming, setDeleteConfirming] = useState(false);

  useEffect(() => {
    api.get("/preferences").then(setPreferences).catch((err) => setPrefsError(err.message));
  }, []);

  async function handleAccountSubmit(event) {
    event.preventDefault();
    setAccountError("");
    setAccountSaved(false);
    try {
      const body = { username: newUsername };
      if (newPassword) body.password = newPassword;
      await api.put("/account", body);
      setNewPassword("");
      setAccountSaved(true);
      updateUsername(newUsername);
    } catch (err) {
      setAccountError(err.message);
    }
  }

  async function handlePrefsSubmit(data) {
    setPrefsError("");
    setPrefsSaved(false);
    try {
      await api.put("/preferences", data);
      setPrefsSaved(true);
    } catch (err) {
      setPrefsError(err.message);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  async function handleDeleteAccount() {
    await api.delete("/account");
    logout();
    navigate("/login");
  }

  return (
    <div className="page">
      <HomeButton />
      <h1 className="page-title">Settings</h1>

      <section className="card" style={{ marginBottom: 20 }}>
        <h2 className="overlay-title">Account</h2>
        <form onSubmit={handleAccountSubmit}>
          <div className="field">
            <label>Username</label>
            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
          </div>
          <div className="field">
            <label>New password (leave blank to keep current)</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          {accountError && <p className="error-text">{accountError}</p>}
          {accountSaved && <p className="empty-hint">Saved!</p>}
          <button type="submit" className="btn btn-primary btn-block">
            Save account changes
          </button>
        </form>
      </section>

      <section className="card" style={{ marginBottom: 20 }}>
        <h2 className="overlay-title">Preferences</h2>
        {prefsError && <p className="error-text">{prefsError}</p>}
        {prefsSaved && <p className="empty-hint">Saved!</p>}
        {preferences && (
          <PreferencesForm initialValues={preferences} onSubmit={handlePrefsSubmit} submitLabel="Save preferences" />
        )}
      </section>

      <button className="btn btn-secondary btn-block" style={{ marginBottom: 12 }} onClick={handleLogout}>
        Log Out
      </button>

      {!deleteConfirming ? (
        <button className="btn btn-danger btn-block" onClick={() => setDeleteConfirming(true)}>
          Delete Account
        </button>
      ) : (
        <div className="card">
          <p>Are you sure? This permanently deletes your account and all your data.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirming(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDeleteAccount}>
              Yes, delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
