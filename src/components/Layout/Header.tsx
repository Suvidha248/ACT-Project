import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings, User, Activity, Brain, Shield } from 'lucide-react';

export function Header() {
  const unreadCount = 3;

  return (
    <motion.header 
      className="glass-card border-b border-white/10 px-6 py-4 m-4 mb-0 rounded-t-2xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Incident Command</h1>
              <p className="text-sm text-teal-300/80 font-mono">Intelligent Warehouse Operations</p>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-2 ml-8">
            <div className="flex items-center space-x-1 text-emerald-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-mono">OPERATIONAL</span>
            </div>
            <div className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.div 
            className="flex items-center space-x-2 glass-card px-3 py-2 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <Shield className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-mono text-slate-300">AI Monitoring</span>
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
          </motion.div>
          
          <motion.button 
            className="relative p-3 glass-card-hover rounded-xl group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5 text-slate-300 group-hover:text-teal-300" />
            {unreadCount > 0 && (
              <motion.span 
                className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>
          
          <motion.button 
            className="p-3 glass-card-hover rounded-xl group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5 text-slate-300 group-hover:text-teal-300" />
          </motion.button>
          
          <motion.div 
            className="flex items-center space-x-3 pl-4 border-l border-white/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-white">Alex Chen</p>
              <p className="text-xs text-slate-400 font-mono">Operations Lead</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}