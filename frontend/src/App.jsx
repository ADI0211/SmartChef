import { Navigate, Route, Routes } from "react-router-dom";
import BottomNav from "./components/BottomNav.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import IngredientsPage from "./pages/IngredientsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import QuestionnairePage from "./pages/QuestionnairePage.jsx";
import RecipesPage from "./pages/RecipesPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";

// Wraps pages that require a logged-in user; sends anyone else to /login.
function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// Shared shell for logged-in pages: the page content plus the bottom nav.
function AppLayout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/questionnaire"
          element={
            <RequireAuth>
              <QuestionnairePage />
            </RequireAuth>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout>
                <HomePage />
              </AppLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/ingredients"
          element={
            <RequireAuth>
              <AppLayout>
                <IngredientsPage />
              </AppLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/recipes"
          element={
            <RequireAuth>
              <AppLayout>
                <RecipesPage />
              </AppLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/history"
          element={
            <RequireAuth>
              <AppLayout>
                <HistoryPage />
              </AppLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
