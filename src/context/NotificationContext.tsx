// context/NotificationContext.tsx
import { onValue, push, ref, update } from 'firebase/database';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { rtdb } from '../firebase';
import type { Notification, NotificationState, NotificationType } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType extends NotificationState {
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => number;
  refreshNotifications: () => void;
  getNotificationsByType: (type: string) => Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'recipients'>) => Promise<void>;
}

// Create the context
const NotificationContext = createContext<NotificationContextType | null>(null);

interface FirebaseNotificationData {
  title?: string;
  message?: string;
  incidentId?: string;
  read?: boolean;
  type?: NotificationType;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: {
    seconds: number;
    nanos: number;
  };
  facility?: string;
  actionUrl?: string;
}

interface PubSubNotificationData {
  payload: string;
  timestamp: number;
  processed: boolean;
  facility: string;
}

interface ParsedNotificationPayload {
  title: string;
  message: string;
  incidentId?: string;
  type?: NotificationType;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  facility?: string;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState<string | undefined>(undefined);

  // Subscribe to personal notifications
  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);
    const userNotificationsRef = ref(rtdb, `notifications/${user.uid}/items`);
    
    const unsubscribe = onValue(userNotificationsRef, (snapshot) => {
      const data = snapshot.val() as Record<string, FirebaseNotificationData> | null;
      if (data) {
        const notificationsList: Notification[] = Object.entries(data).map(([key, value]) => ({
          id: key,
          title: value.title || '',
          message: value.message || '',
          type: value.type || 'incident',
          facility: value.facility || profile?.facilityName || 'Unknown',
          severity: value.severity || 'medium',
          timestamp: value.timestamp?.seconds ? 
                    new Date(value.timestamp.seconds * 1000) : 
                    new Date(),
          isRead: value.read || false,
          incidentId: value.incidentId,
          recipients: [user.uid],
          actionUrl: value.actionUrl || (value.incidentId ? `/incidents/${value.incidentId}` : undefined)
        }));
        
        setNotifications(notificationsList.sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        ));
      } else {
        setNotifications([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, profile?.facilityName]);

  // Subscribe to Pub/Sub processed notifications
  useEffect(() => {
    if (!profile?.facilityName) return;

    const pubsubNotificationsRef = ref(rtdb, `pubsub-notifications/${profile.facilityName.toLowerCase()}`);
    
    const unsubscribePubSub = onValue(pubsubNotificationsRef, (snapshot) => {
      const data = snapshot.val() as Record<string, PubSubNotificationData> | null;
      if (data) {
        console.log('📡 Pub/Sub notifications received:', data);
        
        // Process new Pub/Sub notifications (last 30 seconds)
        Object.values(data).forEach((pubsubNotif) => {
          if (pubsubNotif.payload && pubsubNotif.timestamp > Date.now() - 30000) {
            try {
              const parsedNotification = JSON.parse(pubsubNotif.payload) as ParsedNotificationPayload;
              showLiveNotification(parsedNotification);
              
              // Add to personal notifications if not already there
              addNotificationToPersonalFeed(parsedNotification);
            } catch (e) {
              console.error('Failed to parse Pub/Sub notification:', e);
            }
          }
        });
      }
    });

    return () => unsubscribePubSub();
  }, [profile?.facilityName, user?.uid]);

  // Add notification to personal feed
  const addNotificationToPersonalFeed = async (notification: ParsedNotificationPayload) => {
    if (!user?.uid) return;
    
    try {
      const userNotificationsRef = ref(rtdb, `notifications/${user.uid}/items`);
      await push(userNotificationsRef, {
        title: notification.title,
        message: notification.message,
        type: notification.type || 'incident',
        severity: notification.severity || 'medium',
        facility: notification.facility || profile?.facilityName,
        incidentId: notification.incidentId,
        read: false,
        timestamp: {
          seconds: Math.floor(Date.now() / 1000),
          nanos: 0
        },
        actionUrl: notification.incidentId ? `/incidents/${notification.incidentId}` : undefined
      });
    } catch (error) {
      console.error('Failed to add notification to personal feed:', error);
    }
  };

  // Show browser notifications for live updates
  const showLiveNotification = (notification: ParsedNotificationPayload) => {
    if (window.Notification?.permission === 'granted') {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.incidentId
      });
    }
  };

  // Add notification programmatically (for incident operations)
  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'recipients'>): Promise<void> => {
    if (!user?.uid) return;
    
    try {
      const userNotificationsRef = ref(rtdb, `notifications/${user.uid}/items`);
      await push(userNotificationsRef, {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        severity: notification.severity || 'medium',
        facility: notification.facility || profile?.facilityName,
        incidentId: notification.incidentId,
        read: false,
        timestamp: {
          seconds: Math.floor(Date.now() / 1000),
          nanos: 0
        },
        actionUrl: notification.actionUrl
      });

      // Also publish to pub/sub for other users
      if (profile?.facilityName) {
        const pubsubRef = ref(rtdb, `pubsub-notifications/${profile.facilityName.toLowerCase()}`);
        await push(pubsubRef, {
          payload: JSON.stringify({
            title: notification.title,
            message: notification.message,
            type: notification.type,
            incidentId: notification.incidentId,
            severity: notification.severity,
            facility: notification.facility
          }),
          timestamp: Date.now(),
          processed: false,
          facility: profile.facilityName
        });
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = async (id: string): Promise<void> => {
    try {
      if (!user?.uid) return;
      
      const notificationRef = ref(rtdb, `notifications/${user.uid}/items/${id}`);
      await update(notificationRef, { read: true });

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      if (!user?.uid) return;
      
      const updates: Record<string, boolean> = {};
      notifications.forEach(notif => {
        if (!notif.isRead) {
          updates[`notifications/${user.uid}/items/${notif.id}/read`] = true;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(ref(rtdb), updates);
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getUnreadCount = (): number => {
    return notifications.filter(n => !n.isRead).length;
  };

  const getNotificationsByType = (type: string): Notification[] => {
    return notifications.filter(n => n.type === type);
  };

  const refreshNotifications = (): void => {
    setIsLoading(true);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount: getUnreadCount(),
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    refreshNotifications,
    getNotificationsByType,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Export the context
export { NotificationContext };
