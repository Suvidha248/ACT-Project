// components/notifications/LiveNotificationToast.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { AlertOctagon, AlertTriangle, CheckCircle, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

interface LiveNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: number;
  severity: string;
  facility: string;
  incidentId?: string;
}

export const LiveNotificationToast: React.FC = () => {
  const { notifications } = useNotifications(); // Removed unused profile
  const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([]);

  // Monitor notifications from context and show recent ones as toasts
  useEffect(() => {
    if (!notifications.length) return;

    // Filter notifications from the last 30 seconds that haven't been shown as toast
    const recentNotifications = notifications.filter(notification => {
      const timeDiff = Date.now() - notification.timestamp.getTime();
      return timeDiff < 30000 && timeDiff > 0; // Last 30 seconds
    });

    // Convert to LiveNotification format and show as toasts
    const toastNotifications: LiveNotification[] = recentNotifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      timestamp: notification.timestamp.getTime(),
      severity: notification.severity,
      facility: notification.facility,
      incidentId: notification.incidentId
    }));

    // Only show new notifications that aren't already displayed
    const newToasts = toastNotifications.filter(toast => 
      !liveNotifications.some(existing => existing.id === toast.id)
    );

    if (newToasts.length > 0) {
      setLiveNotifications(prev => [...prev, ...newToasts]);

      // Auto-remove each toast after 8 seconds
      newToasts.forEach(toast => {
        setTimeout(() => {
          setLiveNotifications(prev => prev.filter(n => n.id !== toast.id));
        }, 8000);
      });
    }
  }, [notifications, liveNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'incident_assigned':
        return <User className="w-5 h-5 text-blue-400" />;
      case 'incident_escalated':
        return <AlertOctagon className="w-5 h-5 text-red-400" />;
      case 'incident_resolved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'emergency_broadcast':
        return <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityStyles = (type: string, severity: string) => {
    if (type === 'emergency_broadcast') {
      return 'border-red-500 bg-red-900/30 shadow-red-500/50';
    }
    if (type === 'incident_escalated') {
      return 'border-orange-500 bg-orange-900/20 shadow-orange-500/30';
    }
    if (type === 'incident_assigned') {
      return 'border-blue-500 bg-blue-900/20 shadow-blue-500/30';
    }
    if (type === 'incident_resolved') {
      return 'border-green-500 bg-green-900/20 shadow-green-500/30';
    }
    
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-900/20 shadow-red-500/30';
      case 'high':
        return 'border-orange-500 bg-orange-900/20 shadow-orange-500/30';
      case 'medium':
        return 'border-yellow-500 bg-yellow-900/20 shadow-yellow-500/30';
      default:
        return 'border-blue-500 bg-blue-900/20 shadow-blue-500/30';
    }
  };

  const removeNotification = (id: string) => {
    setLiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {liveNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            className={`border-l-4 rounded-lg p-4 shadow-2xl backdrop-blur-sm ${getSeverityStyles(notification.type, notification.severity)}`}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.4, type: "spring", damping: 20 }}
          >
            <div className="flex items-start space-x-3">
              {getNotificationIcon(notification.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-white">
                    {notification.title}
                  </h4>
                  {notification.type === 'emergency_broadcast' && (
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-bold animate-pulse">
                      🚨 URGENT
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-400">
                    {notification.facility}
                  </span>
                  {notification.incidentId && (
                    <span className="text-xs text-teal-300 font-mono">
                      #{notification.incidentId}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
