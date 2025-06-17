import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Incident } from '../../types';
import { Badge } from '../Shared/Badge';
import { formatDistanceToNow } from 'date-fns';
import { 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle,
  CheckCircle,
  Play,
  UserCheck,
  XCircle,
  TrendingUp,
  Package,
  Shield,
  Thermometer,
  Droplets,
  Eye
} from 'lucide-react';

interface TrackerCardProps {
  incident: Incident;
  index: number;
}

export function TrackerCard({ incident, index }: TrackerCardProps) {
  const getStatusSteps = () => {
    return [
      { 
        key: 'new', 
        label: 'Reported', 
        icon: AlertTriangle, 
        completed: true,
        timestamp: incident.createdAt
      },
      { 
        key: 'acknowledged', 
        label: 'Acknowledged', 
        icon: UserCheck, 
        completed: !!incident.acknowledgedAt,
        timestamp: incident.acknowledgedAt
      },
      { 
        key: 'in-progress', 
        label: 'In Progress', 
        icon: Play, 
        completed: incident.status === 'in-progress' || incident.status === 'resolved',
        timestamp: incident.status === 'in-progress' ? incident.updatedAt : undefined
      },
      { 
        key: 'resolved', 
        label: 'Resolved', 
        icon: CheckCircle, 
        completed: !!incident.resolvedAt,
        timestamp: incident.resolvedAt
      }
    ];
  };

  const getCurrentStep = () => {
    switch (incident.status) {
      case 'new': return 0;
      case 'acknowledged': return 1;
      case 'in-progress': return 2;
      case 'resolved': return 3;
      default: return 0;
    }
  };

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'critical': return 'from-red-500 to-orange-500';
      case 'high': return 'from-orange-500 to-yellow-500';
      case 'medium': return 'from-yellow-500 to-amber-500';
      case 'low': return 'from-emerald-500 to-green-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'equipment': return Package;
      case 'security': return Shield;
      case 'temperature': return Thermometer;
      case 'humidity': return Droplets;
      case 'inventory': return Package;
      case 'safety': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const steps = getStatusSteps();
  const currentStep = getCurrentStep();
  const isOverdue = new Date() > incident.slaDeadline && !['resolved', 'closed'].includes(incident.status);
  const AlertIcon = getAlertTypeIcon(incident.alertType);

  return (
    <motion.div
      className={`glass-card p-6 relative overflow-hidden ${
        isOverdue ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Priority indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getPriorityGradient(incident.priority)} rounded-l-2xl`} />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <motion.div 
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPriorityGradient(incident.priority)} flex items-center justify-center relative`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <AlertIcon className="w-6 h-6 text-white" />
            {incident.priority === 'critical' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
            )}
          </motion.div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="text-lg font-semibold text-white">{incident.title}</h3>
              {incident.escalationLevel > 0 && (
                <Badge variant="red" size="sm">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Escalated ({incident.escalationLevel})
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="red" size="sm" className="animate-pulse">Overdue</Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">ID: {incident.id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant={incident.priority === 'critical' ? 'red' : incident.priority === 'high' ? 'orange' : incident.priority === 'medium' ? 'yellow' : 'green'}>
            {incident.priority}
          </Badge>
          <Link to={`/incidents/${incident.id}`}>
            <motion.button 
              className="p-2 glass-card-hover rounded-lg text-slate-400 hover:text-teal-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white">Progress Tracker</h4>
          <span className="text-xs text-slate-400 font-mono">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-700">
            <motion.div 
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          
          {/* Steps */}
          <div className="flex justify-between relative z-10">
            {steps.map((step, stepIndex) => {
              const StepIcon = step.icon;
              const isCompleted = step.completed;
              const isCurrent = stepIndex === currentStep && !isCompleted;
              
              return (
                <motion.div
                  key={step.key}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: stepIndex * 0.1 }}
                >
                  <motion.div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-400' 
                        : isCurrent
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-teal-400 animate-pulse'
                        : 'bg-slate-700 border-slate-600'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <StepIcon className={`w-5 h-5 ${
                      isCompleted || isCurrent ? 'text-white' : 'text-slate-400'
                    }`} />
                  </motion.div>
                  
                  <div className="mt-2 text-center">
                    <div className={`text-xs font-medium ${
                      isCompleted || isCurrent ? 'text-white' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </div>
                    {step.timestamp && (
                      <div className="text-xs text-slate-500 font-mono mt-1">
                        {formatDistanceToNow(step.timestamp, { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Incident Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-teal-400" />
          <span className="text-slate-300 font-mono text-xs">{incident.location}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-teal-400" />
          <span className="text-slate-300 font-mono text-xs">
            {incident.assignedTo?.name || 'Unassigned'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-teal-400" />
          <span className={`font-mono text-xs ${
            isOverdue ? 'text-red-400 font-semibold' : 'text-slate-300'
          }`}>
            SLA: {formatDistanceToNow(incident.slaDeadline, { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-sm text-slate-300 line-clamp-2">{incident.description}</p>
      </div>

      {/* Time Indicators */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span className="font-mono">
          Created: {formatDistanceToNow(incident.createdAt, { addSuffix: true })}
        </span>
        <span className="font-mono">
          Updated: {formatDistanceToNow(incident.updatedAt, { addSuffix: true })}
        </span>
      </div>
    </motion.div>
  );
}