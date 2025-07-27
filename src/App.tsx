// src/App.tsx
import { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Layout } from "./components/Layout/Layout";
import Login from "./components/Login";
import { LiveNotificationToast } from "./components/notifications/LiveNotificationToast";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { IncidentProvider } from "./context/IncidentContext";
import { NotificationProvider } from "./context/NotificationContext";
import PrivateRoute from "./routes/PrivateRoute";

import AdminPanel from "./components/AdminPanel/AdminPanel";
import { ChatProvider } from "./context/ChatContext";
import { DashboardPage } from "./pages/DashboardPage";
import { IncidentDetailPage } from "./pages/IncidentDetailPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { IncidentTrackerPage } from "./pages/IncidentTrackerPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import UploadUsers from "./pages/UploadUsers";
import UsersPage from "./pages/UsersPage";

const Unauthorized = () => (
  <div className="p-6">
    <h2 className="text-2xl text-red-500 font-bold">Access Denied</h2>
    <p>You do not have permission to view this page.</p>
  </div>
);

const AppLoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
      <h3 className="text-xl font-medium text-white mb-2">
        Loading ACT Command Center
      </h3>
      <p className="text-slate-400">
        Initializing your workspace...
      </p>
    </div>
  </div>
);

// ✅ FIXED: Move all hooks before any conditional returns
function AppContent() {
  const { loading, initialized, user, profile } = useAuth();

  // ✅ ALL HOOKS MUST BE CALLED FIRST - before any early returns
  useEffect(() => {
    console.log("🔐 Auth state in AppContent:", {
      initialized,
      loading,
      hasUser: !!user,
      hasProfile: !!profile,
      userEmail: user?.email,
      userFacility: profile?.facilityName
    });
  }, [initialized, loading, user, profile]);

  // ✅ NOW conditional returns are safe
  if (!initialized || loading) {
    return <AppLoadingScreen />;
  }

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <LiveNotificationToast />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route
              path="/incidents/:id"
              element={<IncidentDetailPage />}
            />
            <Route path="/tracker" element={<IncidentTrackerPage />} />
            <Route path="/users" element={<UsersPage />} />

            <Route
              path="/upload-users"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <UploadUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "Leader",
                    "Technician",
                    "Supervisor",
                    "User",
                  ]}
                >
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Leader"]}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <div className="p-6">
                  <h2 className="text-2xl font-bold gradient-text">
                    Reports – Coming Soon
                  </h2>
                </div>
              }
            />

            <Route
              path="/team"
              element={
                <div className="p-6">
                  <h2 className="text-2xl font-bold gradient-text">
                    Team Management – Coming Soon
                  </h2>
                </div>
              }
            />

            <Route
              path="/docs"
              element={
                <div className="p-6">
                  <h2 className="text-2xl font-bold gradient-text">
                    Documentation – Coming Soon
                  </h2>
                </div>
              }
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  // ✅ This useEffect is fine because it's at the top level
  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <ChatProvider>
      <AuthProvider>
        <NotificationProvider>
          <IncidentProvider>
            <AppContent />
          </IncidentProvider>
        </NotificationProvider>
      </AuthProvider>
    </ChatProvider>
  );
}

export default App;
