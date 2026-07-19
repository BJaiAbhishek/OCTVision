import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/auth-context";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import AboutPage from "./pages/about";
import HomePage from "./pages/_authenticated/home";
import HistoryPage from "./pages/_authenticated/history";
import DiagnosisPage from "./pages/_authenticated/diagnosis.$id";
import ProfilePage from "./pages/_authenticated/profile";
import SupportPage from "./pages/_authenticated/support";
import IndexPage from "./pages/index";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AuthLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route
        element={
          <RequireAuth>
            <AuthLayout />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/diagnosis/:id" element={<DiagnosisPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/support" element={<SupportPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
