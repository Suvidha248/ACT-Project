
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import Login from './components/Login';
import { IncidentProvider } from './context/IncidentContext';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentTrackerPage } from './pages/IncidentTrackerPage';
import PrivateRoute from './routes/PrivateRoute';
function App() {
  return (
    <IncidentProvider>
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/incidents/:id" element={<IncidentDetailPage />} />
            <Route path="/tracker" element={<IncidentTrackerPage />} />
            <Route path="/reports" element={
              <div className="p-6">
                <h2 className="text-2xl font-bold gradient-text">Reports - Coming Soon</h2>
              </div>
            } />
            <Route path="/team" element={
              <div className="p-6">
                <h2 className="text-2xl font-bold gradient-text">Team Management - Coming Soon</h2>
              </div>
            } />
            <Route path="/docs" element={
              <div className="p-6">
                <h2 className="text-2xl font-bold gradient-text">Documentation - Coming Soon</h2>
              </div>
            } />
            <Route path="/settings" element={
              <div className="p-6">
                <h2 className="text-2xl font-bold gradient-text">Settings - Coming Soon</h2>
              </div>
            } />
          </Route>
        </Route>

      </Routes>
    </Router>
    </IncidentProvider >
  );
}
export default App;
