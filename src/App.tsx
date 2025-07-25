import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { IncidentProvider } from "./context/IncidentContext";
import { Layout } from "./components/Layout/Layout";
import Login from "./components/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import PrivateRoute from "./routes/PrivateRoute";

import { DashboardPage } from "./pages/DashboardPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { IncidentDetailPage } from "./pages/IncidentDetailPage";
import { IncidentTrackerPage } from "./pages/IncidentTrackerPage";
import UsersPage from "./pages/UsersPage";
import UploadUsers from "./pages/UploadUsers";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import { ChatProvider } from "./context/ChatContext";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

const Unauthorized = () => (
  <div className="p-6">
    <h2 className="text-2xl text-red-500 font-bold">Access Denied</h2>
    <p>You do not have permission to view this page.</p>
  </div>
);

function App() {
  return (
    <ChatProvider>
      <AuthProvider>
        <IncidentProvider>
          <Router>
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
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <AdminPanel />
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
        </IncidentProvider>
      </AuthProvider>
    </ChatProvider>
  );
}

export default App;
