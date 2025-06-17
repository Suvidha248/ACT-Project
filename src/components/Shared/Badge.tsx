import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'red' | 'yellow' | 'green' | 'gray' | 'orange' | 'purple' | 'cyan' | 'cyber';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  green: 'bg-green-500/20 text-green-300 border-green-500/30',
  gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  cyber: 'bg-white/10 text-cyan-300 border-cyan-500/50 backdrop-blur-sm',
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({ children, variant = 'gray', size = 'md', className = '' }: BadgeProps) {
  return (
    <motion.span 
      className={`inline-flex items-center font-medium rounded-full border backdrop-blur-sm ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.span>
  );
}