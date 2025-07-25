// components/notifications/LiveNotificationToast.tsx
import { onValue, ref } from 'firebase/database';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { rtdb } from '../../firebase';

interface LiveNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: number;
}

interface PubSubNotificationData {
  payload: string;
  timestamp: number;
  processed: boolean;
  facility: string;
}

export const LiveNotificationToast: React.FC = () => {
  const { profile } = useAuth();
  const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([]);

  useEffect(() => {
    if (!profile?.facilityName) return;

    const liveFeedRef = ref(rtdb, `pubsub-notifications/${profile.facilityName.toLowerCase()}`);
    
    const unsubscribe = onValue(liveFeedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Process only recent notifications
        const recentNotifications: LiveNotification[] = [];
        Object.entries(data as Record<string, PubSubNotificationData>).forEach(([key, value]) => {
          if (value.timestamp > Date.now() - 10000) { // Last 10 seconds
            try {
              const parsedPayload = JSON.parse(value.payload);
              recentNotifications.push({
                id: key,
                title: parsedPayload.title,
                message: parsedPayload.message,
                type: parsedPayload.type,
                timestamp: value.timestamp
              });
            } catch (e) {
              console.error('Failed to parse live notification:', e);
            }
          }
        });
        
        setLiveNotifications(recentNotifications);
        
        // Auto-remove after 5 seconds
        setTimeout(() => setLiveNotifications([]), 5000);
      }
    });

    return () => unsubscribe();
  }, [profile?.facilityName]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'incident_assigned':
        return <User className="w-5 h-5 text-blue-400" />;
      case 'incident_escalated':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'incident_resolved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-400" />;
    }
  };

  const removeNotification = (id: string) => {
    setLiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {liveNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-lg max-w-sm"
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start space-x-3">
              {getNotificationIcon(notification.type)}
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">
                  {notification.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-slate-400 hover:text-white"
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
