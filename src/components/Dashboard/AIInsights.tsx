import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Shield, Activity, AlertCircle, Cpu, Thermometer, Zap } from 'lucide-react';

export function AIInsights() {
  const insights = [
    {
      title: 'ASRS Predictive Maintenance',
      description: 'Crane #3 in Rochelle ASRS showing early fault indicators. 73% probability of drive failure within 4 hours based on vibration patterns.',
      confidence: 87,
      type: 'warning',
      icon: Brain,
      action: 'Schedule maintenance',
      facility: 'Rochelle'
    },
    {
      title: 'Security Pattern Analysis',
      description: 'Gateway facility breach patterns match historical data. AI recommends enhanced monitoring for LP North and LP South sections.',
      confidence: 94,
      type: 'critical',
      icon: Shield,
      action: 'Deploy countermeasures',
      facility: 'Gateway'
    },
    {
      title: 'Trolley System Optimization',
      description: 'Russellville trolley loop efficiency can improve by 23% with AI-driven routing adjustments. Reducing handoff delays.',
      confidence: 76,
      type: 'info',
      icon: TrendingUp,
      action: 'Apply optimization',
      facility: 'Russellville'
    },
    {
      title: 'WES Logic Anomaly',
      description: 'Unusual container processing patterns detected. Potential WES configuration issue affecting order data retrieval.',
      confidence: 82,
      type: 'warning',
      icon: AlertCircle,
      action: 'Investigate logs',
      facility: 'Multi-site'
    },
    {
      title: 'Temperature Trend Analysis',
      description: 'Cold storage zones showing gradual temperature drift. Predictive model suggests cooling system maintenance needed.',
      confidence: 89,
      type: 'info',
      icon: Thermometer,
      action: 'Schedule inspection',
      facility: 'Gateway'
    },
    {
      title: 'Power Consumption Alert',
      description: 'Abnormal power usage patterns detected in ASRS systems. Potential energy optimization opportunity identified.',
      confidence: 71,
      type: 'info',
      icon: Zap,
      action: 'Analyze consumption',
      facility: 'All Facilities'
    }
  ];

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'critical': return 'from-red-500 to-orange-500';
      case 'warning': return 'from-yellow-500 to-amber-500';
      case 'info': return 'from-teal-500 to-cyan-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-teal-400';
      default: return 'text-slate-400';
    }
  };

  const getFacilityColor = (facility: string) => {
    switch (facility) {
      case 'Rochelle': return 'text-blue-400';
      case 'Gateway': return 'text-green-400';
      case 'Russellville': return 'text-purple-400';
      default: return 'text-cyan-400';
    }
  };

  return (
    <motion.div 
      className="glass-card p-6 hologram-effect"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">ACT Intelligence</h3>
          <p className="text-sm text-slate-400">AI-powered warehouse insights</p>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            className="glass-card-hover p-4 border border-white/10 rounded-xl group cursor-pointer relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-start space-x-3">
              <motion.div 
                className={`p-2 rounded-lg bg-gradient-to-br ${getTypeGradient(insight.type)} flex-shrink-0`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <insight.icon className="w-4 h-4 text-white" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getTypeColor(insight.type)} animate-pulse`} />
                    <span className="text-xs font-mono text-teal-300">{insight.confidence}%</span>
                  </div>
                </div>
                
                <p className="text-xs text-slate-300 mb-3 line-clamp-3">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-3 h-3 text-teal-400" />
                    <span className="text-xs text-teal-300 font-mono">ANALYZING</span>
                  </div>
                  
                  <span className={`text-xs font-mono ${getFacilityColor(insight.facility)}`}>
                    {insight.facility}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <motion.button 
                    className={`text-xs px-2 py-1 rounded-lg bg-gradient-to-r ${getTypeGradient(insight.type)} text-white font-medium`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {insight.action}
                  </motion.button>
                </div>
                
                {/* Confidence bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">AI Confidence</span>
                    <span className="text-teal-300 font-mono">{insight.confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1">
                    <motion.div 
                      className={`h-1 rounded-full bg-gradient-to-r ${getTypeGradient(insight.type)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${insight.confidence}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className="mt-6 p-4 glass-card rounded-xl border border-teal-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="text-sm font-semibold text-white">ACT AI Engine</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-mono">OPTIMAL</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-400 font-mono">
          Processing 2.4M sensor events/sec • Learning rate: 97.8% • Prediction accuracy: 94.2%
        </div>
      </motion.div>
    </motion.div>
  );
}