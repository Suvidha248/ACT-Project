import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Layout } from "./components/Layout/Layout";
import Login from "./components/Login";
import { LiveNotificationToast } from './components/notifications/LiveNotificationToast';
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { IncidentProvider } from "./context/IncidentContext";
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from "./routes/PrivateRoute";

import AdminPanel from "./components/AdminPanel/AdminPanel";
import { DashboardPage } from "./pages/DashboardPage";
import { IncidentDetailPage } from "./pages/IncidentDetailPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { IncidentTrackerPage } from "./pages/IncidentTrackerPage";
import UploadUsers from "./pages/UploadUsers";
import UsersPage from "./pages/UsersPage";

const Unauthorized = () => (
  <div className="p-6">
    <h2 className="text-2xl text-red-500 font-bold">Access Denied</h2>
    <p>You do not have permission to view this page.</p>
  </div>
);

function App() {
    useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  return (
    <AuthProvider>
      <NotificationProvider> {/* Add NotificationProvider here */}
        <IncidentProvider>
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
                  <Route path="/incidents/:id" element={<IncidentDetailPage />} />
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
                    path="/settings"
                    element={
                      <ProtectedRoute allowedRoles={["Admin", "Leader"]}>
                        <div className="p-6">
                          <h2 className="text-2xl font-bold gradient-text">
                            Settings – Coming Soon
                          </h2>
                        </div>
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
      </NotificationProvider> {/* Close NotificationProvider here */}
    </AuthProvider>
  );
}

export default App;
