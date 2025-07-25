import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useIncidents } from '../../context/IncidentContext';
import { StatCard } from './StatCard';
export function IncidentOverview() {
  // ✅ Add the missing auth logic
  const { initialized, loading: authLoading } = useAuth();
  const { state } = useIncidents();
  const { incidents, loading: incidentLoading } = state;

  // ✅ Add the missing loading state calculation
  const isLoading = !initialized || authLoading || incidentLoading;
  
  // ✅ Add the missing safeIncidents variable
  const safeIncidents = incidents || [];

  const stats = {
    total: safeIncidents.length,
    new: safeIncidents.filter(i => i.status === 'new').length,
    acknowledged: safeIncidents.filter(i => i.status === 'acknowledged').length,
    inProgress: safeIncidents.filter(i => i.status === 'in-progress').length,
    resolved: safeIncidents.filter(i => i.status === 'resolved').length,
    closed: safeIncidents.filter(i => i.status === 'closed').length,
    // ✅ Now safeIncidents is defined and the null check is proper
    overdue: safeIncidents.filter(i => 
      i.slaDeadline && 
      new Date() > new Date(i.slaDeadline) && 
      !['resolved', 'closed'].includes(i.status)
    ).length,
    critical: safeIncidents.filter(i => i.priority === 'critical').length,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <StatCard
          title="Active Incidents"
          value={stats.new + stats.acknowledged + stats.inProgress}
          icon={AlertTriangle}
          gradient="from-red-500 to-orange-500"
          trend={{ value: 12, isPositive: false }}
          pulse={true}
          loading={isLoading}
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <StatCard
          title="Critical Alerts"
          value={stats.critical}
          icon={AlertCircle}
          gradient="from-orange-500 to-red-500"
          trend={{ value: 8, isPositive: false }}
          glow="red"
          loading={isLoading}
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <StatCard
          title="In Progress"
          value={stats.inProgress + stats.acknowledged}
          icon={Activity}
          gradient="from-teal-500 to-cyan-500"
          trend={{ value: 15, isPositive: true }}
          animated={true}
          loading={isLoading}
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <StatCard
          title="Resolved Today"
          value={stats.resolved}
          icon={CheckCircle}
          gradient="from-emerald-500 to-green-500"
          trend={{ value: 23, isPositive: true }}
          loading={isLoading}
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={TrendingUp}
          gradient="from-red-500 to-pink-500"
          pulse={stats.overdue > 0}
          glow={stats.overdue > 0 ? "red" : undefined}
          loading={isLoading}
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <StatCard
          title="System Shield"
          value={stats.closed}
          icon={Shield}
          gradient="from-slate-500 to-gray-500"
          loading={isLoading}
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <StatCard
          title="Total Incidents"
          value={stats.total}
          icon={XCircle}
          gradient="from-gray-500 to-slate-500"
          loading={isLoading}
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <StatCard
          title="Response Time"
          value="2.3m"
          icon={Clock}
          gradient="from-cyan-500 to-blue-500"
          trend={{ value: 18, isPositive: true }}
          isTime={true}
          loading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}
