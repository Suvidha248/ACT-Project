import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useIncidents } from '../../context/IncidentContext';
import { TrackerCard } from './TrackerCard';
import { TrackerFilters } from './TrackerFilters';
import { Badge } from '../Shared/Badge';
import { Route, Activity, Clock, TrendingUp } from 'lucide-react';

export function IncidentTracker() {
  const { state } = useIncidents();
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');

  const filteredIncidents = state.incidents.filter(incident => {
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || incident.priority === priorityFilter;
    const matchesFacility = facilityFilter === 'all' || incident.location.includes(facilityFilter);
    
    return matchesStatus && matchesPriority && matchesFacility && incident.status !== 'closed';
  });

  const activeIncidents = filteredIncidents.filter(i => !['resolved', 'closed'].includes(i.status));
  const overdueIncidents = filteredIncidents.filter(i => new Date() > i.slaDeadline && !['resolved', 'closed'].includes(i.status));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <Route className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold gradient-text">Incident Tracker</h2>
              <p className="text-slate-400">Visual progress tracking for all warehouse incidents</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="cyber" className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Activity className="w-3 h-3 mr-1" />
              {activeIncidents.length} Active
            </Badge>
            {overdueIncidents.length > 0 && (
              <Badge variant="red" className="animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                {overdueIncidents.length} Overdue
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-2xl font-bold text-white mb-1">
              {filteredIncidents.filter(i => i.status === 'new').length}
            </div>
            <div className="text-sm text-red-400">New Incidents</div>
          </motion.div>
          
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-2xl font-bold text-white mb-1">
              {filteredIncidents.filter(i => i.status === 'acknowledged').length}
            </div>
            <div className="text-sm text-yellow-400">Acknowledged</div>
          </motion.div>
          
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-2xl font-bold text-white mb-1">
              {filteredIncidents.filter(i => i.status === 'in-progress').length}
            </div>
            <div className="text-sm text-blue-400">In Progress</div>
          </motion.div>
          
          <motion.div 
            className="glass-card p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-2xl font-bold text-white mb-1">
              {filteredIncidents.filter(i => i.status === 'resolved').length}
            </div>
            <div className="text-sm text-green-400">Resolved</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters */}
      <TrackerFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        facilityFilter={facilityFilter}
        setFacilityFilter={setFacilityFilter}
        totalIncidents={state.incidents.length}
        filteredCount={filteredIncidents.length}
      />

      {/* Incident Tracker Cards */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <motion.div 
            className="text-center py-12 glass-card rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Route className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No incidents to track</h3>
            <p className="text-slate-400">All incidents matching your filters have been resolved or closed.</p>
          </motion.div>
        ) : (
          filteredIncidents.map((incident, index) => (
            <TrackerCard 
              key={incident.id} 
              incident={incident} 
              index={index}
            />
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredIncidents.length > 0 && (
        <motion.div 
          className="glass-card p-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h3 className="text-lg font-bold text-white">Tracking Summary</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-slate-400 mb-1">Average Resolution Time</div>
              <div className="text-xl font-bold text-white">4.2 hours</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">SLA Compliance</div>
              <div className="text-xl font-bold text-emerald-400">94.7%</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Critical Incidents</div>
              <div className="text-xl font-bold text-red-400">
                {filteredIncidents.filter(i => i.priority === 'critical').length}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}