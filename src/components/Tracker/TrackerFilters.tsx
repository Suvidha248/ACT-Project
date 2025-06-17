import React from 'react';
import { motion } from 'framer-motion';
import { Filter, RotateCcw } from 'lucide-react';

interface TrackerFiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  facilityFilter: string;
  setFacilityFilter: (facility: string) => void;
  totalIncidents: number;
  filteredCount: number;
}

export function TrackerFilters({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  facilityFilter,
  setFacilityFilter,
  totalIncidents,
  filteredCount
}: TrackerFiltersProps) {
  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setFacilityFilter('all');
  };

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || facilityFilter !== 'all';

  return (
    <motion.div 
      className="glass-card p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-white">Filters:</span>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all" className="bg-slate-800">All Status</option>
            <option value="new" className="bg-slate-800">New</option>
            <option value="acknowledged" className="bg-slate-800">Acknowledged</option>
            <option value="in-progress" className="bg-slate-800">In Progress</option>
            <option value="resolved" className="bg-slate-800">Resolved</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all" className="bg-slate-800">All Priority</option>
            <option value="critical" className="bg-slate-800">Critical</option>
            <option value="high" className="bg-slate-800">High</option>
            <option value="medium" className="bg-slate-800">Medium</option>
            <option value="low" className="bg-slate-800">Low</option>
          </select>
          
          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all" className="bg-slate-800">All Facilities</option>
            <option value="Rochelle" className="bg-slate-800">Rochelle</option>
            <option value="Gateway" className="bg-slate-800">Gateway</option>
            <option value="Russellville" className="bg-slate-800">Russellville</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-400">
            Showing {filteredCount} of {totalIncidents} incidents
          </span>
          
          {hasActiveFilters && (
            <motion.button
              onClick={clearFilters}
              className="flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear filters</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}