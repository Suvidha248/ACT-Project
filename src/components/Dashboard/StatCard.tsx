// src/components/Dashboard/StatCard.tsx

import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: typeof LucideIcon;
  gradient: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  pulse?: boolean;
  glow?: string;
  animated?: boolean;
  isTime?: boolean;
  loading?: boolean;    // ← add this
}

export function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  trend,
  pulse = false,
  glow,
  animated = false,
  isTime = false,
  loading = false      // ← default to false
}: StatCardProps) {
  return (
    <motion.div
      className={`glass-card p-6 group cursor-pointer relative overflow-hidden ${
        glow
          ? `hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]`
          : 'hover:shadow-[0_0_25px_rgba(20,184,166,0.2)]'
      }`}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* gradient & holo layers */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-3 transition-opacity`} />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -skew-x-12 -translate-x-full transition-transform" />

      <div className="relative z-10">
        {loading
          ? (
            // skeleton state
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="h-4 bg-slate-600/30 rounded w-24 mb-2" />
                  <div className="h-8 bg-slate-600/30 rounded w-16 mb-2" />
                  <div className="h-3 bg-slate-600/30 rounded w-20" />
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} opacity-50`}>
                  <div className="w-8 h-8 bg-white/20 rounded" />
                </div>
              </div>
            </div>
          )
          : (
            // actual content
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
                  <motion.p
                    className="text-3xl font-bold text-white"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {isTime
                      ? value
                      : typeof value === 'number'
                        ? value.toLocaleString()
                        : value}
                  </motion.p>
                  {trend && (
                    <motion.p
                      className={`text-sm mt-2 font-mono ${
                        trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {trend.isPositive ? '↗' : '↘'} {trend.value}% {isTime ? 'faster' : 'vs last week'}
                    </motion.p>
                  )}
                </div>

                <motion.div
                  className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} ${
                    pulse ? 'animate-pulse-glow' : ''
                  }`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="w-8 h-8 text-white" />
                  {animated && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-teal-400/30"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              </div>
              {/* tech pattern */}
              <div className="absolute bottom-0 right-0 w-16 h-16 opacity-5">
                <svg viewBox="0 0 100 100" className="w-full h-full text-teal-400">
                  <defs>
                    <pattern id="tech-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="1" fill="currentColor" />
                      <line x1="10" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="0.5" />
                      <line x1="10" y1="10" x2="10" y2="20" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#tech-pattern)" />
                </svg>
              </div>
            </>
          )
        }
      </div>
    </motion.div>
  );
}