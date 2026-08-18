// Holds the logged-in user's token and username in memory + localStorage,
// so a page refresh doesn't log the user out.

import { createContext, useContext, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("smartchef_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("smartchef_username"));

  function saveSession({ access_token, username }) {
    localStorage.setItem("smartchef_token", access_token);
    localStorage.setItem("smartchef_username", username);
    setToken(access_token);
    setUsername(username);
  }

  async function login(usernameInput, password) {
    const data = await api.post("/auth/login", { username: usernameInput, password });
    saveSession(data);
    return data; // includes has_preferences, used to decide where to route next
  }

  async function signup(usernameInput, email, password) {
    const data = await api.post("/auth/signup", { username: usernameInput, email, password });
    saveSession(data);
    return data;
  }

  function logout() {
    localStorage.removeItem("smartchef_token");
    localStorage.removeItem("smartchef_username");
    setToken(null);
    setUsername(null);
  }

  // Called after a successful profile edit in Settings, so the greeting on
  // Home reflects a renamed account without requiring a fresh login.
  function updateUsername(newUsername) {
    localStorage.setItem("smartchef_username", newUsername);
    setUsername(newUsername);
  }

  const value = { token, username, isLoggedIn: Boolean(token), login, signup, logout, updateUsername };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
