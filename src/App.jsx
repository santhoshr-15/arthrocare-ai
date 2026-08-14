// src/App.jsx - CLEAN & FIXED VERSION
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientPage from "./pages/PatientPage";
import AdminPage from "./pages/AdminPage";
import PatientDashboard from "./components/patient/PatientDashboard";

/**
 * Helpers for route protection
 */
const getCurrentUser = () => {
  const sessionUser = sessionStorage.getItem("currentUser");
  const localUser = localStorage.getItem("currentUser");

  if (sessionUser) {
    try {
      return JSON.parse(sessionUser);
    } catch {
      return null;
    }
  }
  if (localUser) {
    try {
      return JSON.parse(localUser);
    } catch {
      return null;
    }
  }
  return null;
};

// Patient Auth Protection
function RequireAuth({ children, role }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

// Admin Authentication Component (replaces deleted AdminRouteGuard)
function AdminAuth({ children }) {
  const user = getCurrentUser();
  const [isAdmin, setIsAdmin] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !user.uid) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("./firebase/config");

        const adminDoc = await getDoc(doc(db, "adminUsers", user.uid));
        setIsAdmin(adminDoc.exists() && adminDoc.data().isAdmin === true);
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Checking admin privileges...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Patient Dashboard */}
          <Route
            path="/patient/dashboard"
            element={
              <RequireAuth role="patient">
                <PatientDashboard />
              </RequireAuth>
            }
          />

          {/* Patient Routes */}
          <Route
            path="/patient/*"
            element={
              <RequireAuth role="patient">
                <PatientPage />
              </RequireAuth>
            }
          />

          {/* Admin Routes (FIXED—using AdminAuth instead of deleted AdminRouteGuard) */}
          <Route
            path="/admin/*"
            element={
              <AdminAuth>
                <AdminPage />
              </AdminAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
