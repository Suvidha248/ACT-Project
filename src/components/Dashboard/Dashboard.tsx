import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // ✅ Add auth context
import { AIInsights } from './AIInsights';
import { IncidentOverview } from './IncidentOverview';
import { QuickActions } from './QuickActions';
import { RecentAlerts } from './RecentAlerts';
import { SystemMetrics } from './SystemMetrics';

export function Dashboard() {
  const { user, loading, initialized } = useAuth(); // ✅ Get auth state

  // ✅ Show loading while auth is initializing
  if (!initialized || loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 glass-card rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-white mb-2">
            Loading Dashboard...
          </h3>
          <p className="text-slate-400">
            Preparing your command center...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Handle unauthenticated state
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-12 glass-card rounded-xl">
          <div className="text-slate-400 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Authentication Required
          </h3>
          <p className="text-slate-400 mb-4">
            Please log in to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold gradient-text mb-2">ACT Command Center</h2>
        <p className="text-slate-400">
          Automation Control Tower - Intelligent warehouse monitoring across Atlanta and Novi
          {/* ✅ Show user's facility if available */}
          {/* {profile?.facilityName && (
            <span className="ml-2 text-cyan-400">
              | Your facility: {profile.facilityName}
            </span>
          )} */}
        </p>
      </motion.div>
      
      {/* ✅ Components now render with stable auth context */}
      <IncidentOverview />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <RecentAlerts />
          <SystemMetrics />
        </div>
        
        <div className="space-y-6">
          <AIInsights />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
