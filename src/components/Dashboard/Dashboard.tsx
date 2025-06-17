import React from 'react';
import { motion } from 'framer-motion';
import { IncidentOverview } from './IncidentOverview';
import { RecentAlerts } from './RecentAlerts';
import { AIInsights } from './AIInsights';
import { SystemMetrics } from './SystemMetrics';
import { QuickActions } from './QuickActions';

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold gradient-text mb-2">ACT Command Center</h2>
        <p className="text-slate-400">Automation Control Tower - Intelligent warehouse monitoring across Rochelle, Gateway & Russellville</p>
      </motion.div>
      
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