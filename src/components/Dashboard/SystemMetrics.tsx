import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Database, Network, Thermometer, Zap, Truck, Package } from 'lucide-react';

export function SystemMetrics() {
  const facilities = [
    {
      name: 'Rochelle',
      metrics: [
        { name: 'ASRS Utilization', value: 87, unit: '%', icon: Package, color: 'from-blue-500 to-cyan-500' },
        { name: 'Crane Efficiency', value: 94, unit: '%', icon: Activity, color: 'from-green-500 to-emerald-500' },
        { name: 'Inbound Turn Time', value: 23, unit: 'min', icon: Truck, color: 'from-purple-500 to-pink-500' },
      ]
    },
    {
      name: 'Gateway',
      metrics: [
        { name: 'Gantry Performance', value: 91, unit: '%', icon: Activity, color: 'from-teal-500 to-cyan-500' },
        { name: 'LP North Status', value: 98, unit: '%', icon: Database, color: 'from-green-500 to-emerald-500' },
        { name: 'Cold Storage Temp', value: 2, unit: '°C', icon: Thermometer, color: 'from-blue-500 to-cyan-500' },
      ]
    },
    {
      name: 'Russellville',
      metrics: [
        { name: 'Trolley Loops', value: 89, unit: '%', icon: Activity, color: 'from-orange-500 to-red-500' },
        { name: 'Handoff Efficiency', value: 76, unit: '%', icon: Package, color: 'from-yellow-500 to-orange-500' },
        { name: 'Outbound Turn Time', value: 18, unit: 'min', icon: Truck, color: 'from-purple-500 to-pink-500' },
      ]
    }
  ];

  const systemMetrics = [
    { name: 'CPU Usage', value: 67, unit: '%', icon: Cpu, color: 'from-blue-500 to-cyan-500' },
    { name: 'Memory', value: 84, unit: '%', icon: Database, color: 'from-purple-500 to-pink-500' },
    { name: 'Network', value: 92, unit: '%', icon: Network, color: 'from-green-500 to-emerald-500' },
    { name: 'Power Consumption', value: 78, unit: 'kW', icon: Zap, color: 'from-yellow-500 to-orange-500' },
  ];

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      {/* Facility Metrics */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Facility Performance</h3>
            <p className="text-sm text-green-300/80">Real-time operational metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {facilities.map((facility, facilityIndex) => (
            <motion.div
              key={facility.name}
              className="glass-card-hover p-4 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: facilityIndex * 0.1 }}
            >
              <h4 className="text-lg font-semibold text-white mb-4 text-center">{facility.name}</h4>
              <div className="space-y-3">
                {facility.metrics.map((metric, index) => (
                  <div key={metric.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <metric.icon className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-slate-300">{metric.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{metric.value}</span>
                      <span className="text-xs text-gray-400 font-mono">{metric.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* System Infrastructure */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Infrastructure Health</h3>
            <p className="text-sm text-cyan-300/80">ACT system performance</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {systemMetrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              className="glass-card-hover p-4 rounded-xl group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center justify-between mb-3">
                <metric.icon className="w-5 h-5 text-cyan-400" />
                <span className="text-xs text-gray-400 font-mono">{metric.unit}</span>
              </div>
              
              <div className="mb-2">
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                <div className="text-xs text-gray-400">{metric.name}</div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div 
                    className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(metric.value, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
                <motion.div 
                  className={`absolute top-0 h-2 w-2 rounded-full bg-white shadow-lg`}
                  initial={{ left: 0 }}
                  animate={{ left: `${Math.min(metric.value, 100)}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  style={{ transform: 'translateX(-50%)' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}