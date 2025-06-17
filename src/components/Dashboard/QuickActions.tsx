import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  BarChart3, 
  Settings, 
  Brain, 
  Shield, 
  Activity,
  AlertTriangle,
  FileText
} from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      title: 'Create Incident',
      description: 'Report new warehouse incident',
      icon: Plus,
      color: 'from-blue-500 to-cyan-500',
      action: () => console.log('Create incident')
    },
    {
      title: 'AI Analysis',
      description: 'Run predictive analysis',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      action: () => console.log('AI analysis')
    },
    {
      title: 'Generate Report',
      description: 'KPI & performance report',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-500',
      action: () => console.log('Generate report')
    },
    {
      title: 'Security Scan',
      description: 'Facility security check',
      icon: Shield,
      color: 'from-red-500 to-orange-500',
      action: () => console.log('Security scan')
    }
  ];

  const systemStatus = [
    { name: 'ASRS Systems', facility: 'Rochelle', status: 'operational', uptime: '99.8%' },
    { name: 'Gantry LP North', facility: 'Gateway', status: 'operational', uptime: '99.2%' },
    { name: 'Trolley Loops', facility: 'Russellville', status: 'warning', uptime: '97.1%' },
    { name: 'WES Processing', facility: 'Multi-site', status: 'operational', uptime: '99.9%' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-emerald-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-emerald-400';
      case 'warning': return 'bg-yellow-400';
      case 'critical': return 'bg-red-400';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <motion.div 
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Quick Actions</h3>
            <p className="text-sm text-slate-400">Rapid response tools</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {actions.map((action, index) => (
            <motion.button
              key={action.title}
              className="w-full text-left p-4 glass-card-hover rounded-xl group transition-all duration-300"
              onClick={action.action}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 3 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-400">{action.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div 
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">System Health</h3>
            <p className="text-sm text-slate-400">Real-time status monitoring</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {systemStatus.map((system, index) => (
            <motion.div
              key={system.name}
              className="flex items-center justify-between p-3 glass-card-hover rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusDot(system.status)} animate-pulse`} />
                <div>
                  <p className="text-sm font-medium text-white">{system.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{system.facility}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${getStatusColor(system.status)}`}>
                  {system.status.toUpperCase()}
                </p>
                <p className="text-xs text-slate-400 font-mono">{system.uptime}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-6 p-3 glass-card rounded-lg border border-teal-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-semibold text-white">Overall SLA</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-400 font-mono">98.7%</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono">
            Incident response time: 2.3min avg • Resolution rate: 94.2%
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}