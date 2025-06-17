import React from 'react';
import { motion } from 'framer-motion';
import { useIncidents } from '../../context/IncidentContext';
import { StatCard } from './StatCard';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Shield,
  Activity
} from 'lucide-react';

export function IncidentOverview() {
  const { state } = useIncidents();
  const { incidents } = state;

  const stats = {
    total: incidents.length,
    new: incidents.filter(i => i.status === 'new').length,
    acknowledged: incidents.filter(i => i.status === 'acknowledged').length,
    inProgress: incidents.filter(i => i.status === 'in-progress').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    closed: incidents.filter(i => i.status === 'closed').length,
    overdue: incidents.filter(i => new Date() > i.slaDeadline && !['resolved', 'closed'].includes(i.status)).length,
    critical: incidents.filter(i => i.priority === 'critical').length,
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
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <StatCard
          title="Resolved Today"
          value={stats.resolved}
          icon={CheckCircle}
          gradient="from-emerald-500 to-green-500"
          trend={{ value: 23, isPositive: true }}
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
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <StatCard
          title="System Shield"
          value={stats.closed}
          icon={Shield}
          gradient="from-slate-500 to-gray-500"
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <StatCard
          title="Total Incidents"
          value={stats.total}
          icon={XCircle}
          gradient="from-gray-500 to-slate-500"
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
        />
      </motion.div>
    </motion.div>
  );
}