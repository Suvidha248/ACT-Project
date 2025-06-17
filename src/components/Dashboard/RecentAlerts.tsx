import React from 'react';
import { motion } from 'framer-motion';
import { useIncidents } from '../../context/IncidentContext';
import { Badge } from '../Shared/Badge';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Clock, MapPin, Activity, Brain, User, Bot, Sparkles } from 'lucide-react';

export function RecentAlerts() {
  const { state } = useIncidents();
  const recentIncidents = state.incidents
    .filter(incident => incident.status !== 'closed')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'critical': return 'from-red-500 to-orange-500';
      case 'high': return 'from-orange-500 to-yellow-500';
      case 'medium': return 'from-yellow-500 to-amber-500';
      case 'low': return 'from-emerald-500 to-green-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'new': return 'from-red-500 to-orange-500';
      case 'acknowledged': return 'from-yellow-500 to-amber-500';
      case 'in-progress': return 'from-teal-500 to-cyan-500';
      case 'resolved': return 'from-emerald-500 to-green-500';
      case 'closed': return 'from-slate-500 to-gray-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'temperature': return '🌡️';
      case 'security': return '🛡️';
      case 'equipment': return '⚙️';
      case 'inventory': return '📦';
      case 'safety': return '⚠️';
      case 'humidity': return '💧';
      default: return '🔔';
    }
  };

  const handleFrostyHelp = () => {
    console.log('Frosty/MiraAI Help activated');
    // In a real implementation, this would open an AI chat interface
  };

  return (
    <motion.div 
      className="glass-card p-6 hologram-effect"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Live Alert Stream</h3>
            <p className="text-sm text-slate-400">Real-time incident monitoring</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="cyber" size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500">
            <Brain className="w-3 h-3 mr-1" />
            {recentIncidents.length} Active
          </Badge>
          <motion.button
            onClick={handleFrostyHelp}
            className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-sm font-medium group relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Sparkle effect */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-3 h-3 absolute top-1 right-1 text-yellow-300" />
              <Sparkles className="w-2 h-2 absolute bottom-1 left-2 text-cyan-300" />
            </motion.div>
            
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            >
              <Bot className="w-4 h-4 relative z-10" />
            </motion.div>
            <span className="relative z-10">Frosty/MiraAI</span>
            
            {/* Pulse indicator */}
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse relative z-10" />
          </motion.button>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
        {recentIncidents.map((incident, index) => (
          <motion.div 
            key={incident.id}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 group cursor-pointer relative overflow-hidden hover:bg-white/10 hover:border-teal-400/30 transition-all duration-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01, x: 3 }}
          >
            {/* Priority indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getPriorityGradient(incident.priority)} rounded-l-xl`} />
            
            {/* Subtle hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            
            <div className="flex items-start space-x-4 relative z-10">
              <div className="flex-shrink-0">
                <motion.div 
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPriorityGradient(incident.priority)} flex items-center justify-center text-xl relative`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {getAlertIcon(incident.alertType)}
                  {incident.priority === 'critical' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                  )}
                </motion.div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-teal-300 transition-colors">
                    {incident.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="cyber" 
                      size="sm" 
                      className={`bg-gradient-to-r ${getPriorityGradient(incident.priority)} text-white border-0`}
                    >
                      {incident.priority}
                    </Badge>
                    <Badge 
                      variant="cyber" 
                      size="sm" 
                      className={`bg-gradient-to-r ${getStatusGradient(incident.status)} text-white border-0`}
                    >
                      {incident.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-slate-300 mb-3 line-clamp-2 group-hover:text-slate-200 transition-colors">
                  {incident.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-teal-400" />
                      <span className="font-mono text-slate-300 group-hover:text-slate-200">{incident.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-teal-400" />
                      <span className="font-mono text-slate-300 group-hover:text-slate-200">{formatDistanceToNow(incident.createdAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                  {incident.assignedTo && (
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-cyan-400" />
                      <span className="text-teal-300 font-mono text-xs group-hover:text-teal-200">
                        {incident.assignedTo.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {recentIncidents.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">All Systems Operational</h3>
            <p className="text-slate-400">No active alerts detected</p>
          </motion.div>
        )}
      </div>
      
      {/* Frosty/MiraAI Help Panel */}
      <motion.div 
        className="mt-6 p-4 glass-card rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Bot className="w-5 h-5 text-purple-400" />
            </motion.div>
            <span className="text-sm font-semibold text-white">AI Assistant Ready</span>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
            <span className="text-xs text-purple-300 font-mono">ONLINE</span>
          </div>
        </div>
        <div className="text-xs text-slate-300 font-mono">
          Ask Frosty/MiraAI for incident analysis, troubleshooting steps, or system insights
        </div>
      </motion.div>
    </motion.div>
  );
}