import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import BookService from "./pages/BookService";
import UserDashboard from "./pages/UserDashboard";
import ProviderServices from "./pages/ProviderServices";
import ProviderBookings from "./pages/ProviderBookings";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"           element={<Home />} />
      <Route path="/login"               element={<Login />} />
      <Route path="/register"            element={<Register />} />
      <Route path="/forgot-password"     element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/services"   element={<Services />} />

      <Route path="/book/:id"            element={<ProtectedRoute roles={["user","provider"]}><BookService /></ProtectedRoute>} />
      <Route path="/dashboard"           element={<ProtectedRoute roles={["user","provider"]}><UserDashboard /></ProtectedRoute>} />
      <Route path="/provider/services"   element={<ProtectedRoute roles={["provider"]}><ProviderServices /></ProtectedRoute>} />
      <Route path="/provider/bookings"   element={<ProtectedRoute roles={["provider"]}><ProviderBookings /></ProtectedRoute>} />
      <Route path="/admin"               element={<ProtectedRoute roles={["admin"]}><AdminPanel /></ProtectedRoute>} />
      <Route path="/profile"             element={<ProtectedRoute roles={["user","provider","admin"]}><Profile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
