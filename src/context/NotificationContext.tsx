// context/NotificationContext.tsx
import { onChildAdded, onValue, push, ref, update } from 'firebase/database';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { rtdb } from '../firebase';
import type { Notification, NotificationState, NotificationType } from '../types';
import { useAuth } from './AuthContext';

export interface NotificationContextType extends NotificationState {
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

// FIXED: Updated interface to match backend structure
interface PubSubNotificationData {
  title: string;
  message: string;
  type: string;
  severity: string;
  facility: string;
  incidentId?: string;
  action?: string;
  timestamp: number;
  processed: boolean;
  processedAt: number;
}

// FIXED: Updated interface for assignment notifications
interface AssignmentNotificationData {
  incidentId: string;
  title: string;
  message: string;
  facility: string;
  assignedUserId: string;
  priority: string;
  timestamp: number;
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

  // FIXED: Use useCallback to memoize functions and fix dependency issues
  const addNotificationToPersonalFeed = useCallback(async (notification: ParsedNotificationPayload) => {
    if (!user?.uid) return;
    
    try {
      console.log('💾 Adding notification to personal feed:', notification);
      
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
      
      console.log('✅ Notification added to personal feed successfully');
    } catch (error) {
      console.error('❌ Failed to add notification to personal feed:', error);
    }
  }, [user?.uid, profile?.facilityName]);

  // FIXED: Use useCallback to memoize function
  const showLiveNotification = useCallback((notification: ParsedNotificationPayload) => {
    console.log('🔔 Attempting to show browser notification:', notification);
    
    if (window.Notification?.permission === 'granted') {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.incidentId,
        requireInteraction: notification.type === 'emergency_broadcast'
      });
    } else if (window.Notification?.permission === 'default') {
      // Request permission if not granted
      window.Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new window.Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.incidentId
          });
        }
      });
    }
  }, []); // No dependencies needed for this function

  // Subscribe to personal notifications (existing logic)
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

  // FIXED: Subscribe to facility-wide Pub/Sub notifications using onChildAdded
  useEffect(() => {
    if (!profile?.facilityName) return;

    console.log(`🔔 Setting up facility notifications for: ${profile.facilityName}`);
    
    const facilityNotificationsRef = ref(rtdb, `pubsub-notifications/${profile.facilityName.toLowerCase()}`);
    
    // Use onChildAdded to listen for new notifications properly
    const unsubscribeFacility = onChildAdded(facilityNotificationsRef, (snapshot) => {
      const data = snapshot.val() as PubSubNotificationData;
      if (data && data.timestamp > Date.now() - 60000) { // Last 1 minute
        console.log('📡 New facility notification received:', data);
        
        // Add to personal feed automatically
        addNotificationToPersonalFeed({
          title: data.title,
          message: data.message,
          type: data.type as NotificationType,
          severity: data.severity as 'low' | 'medium' | 'high' | 'critical',
          facility: data.facility,
          incidentId: data.incidentId
        });

        // Show browser notification
        showLiveNotification({
          title: data.title,
          message: data.message,
          type: data.type as NotificationType,
          severity: data.severity as 'low' | 'medium' | 'high' | 'critical',
          facility: data.facility,
          incidentId: data.incidentId
        });
      }
    });

    return () => unsubscribeFacility();
  }, [profile?.facilityName, addNotificationToPersonalFeed, showLiveNotification]); // FIXED: Added dependencies

  // FIXED: Subscribe to user-specific assignments
  useEffect(() => {
    if (!user?.uid) return;

    console.log(`👤 Setting up assignment notifications for user: ${user.uid}`);
    
    const assignmentNotificationsRef = ref(rtdb, `user-assignments/${user.uid}`);
    
    const unsubscribeAssignments = onChildAdded(assignmentNotificationsRef, (snapshot) => {
      const data = snapshot.val() as AssignmentNotificationData;
      if (data && data.timestamp > Date.now() - 60000) { // Last 1 minute
        console.log('👤 New assignment notification received:', data);
        
        // Add to personal feed
        addNotificationToPersonalFeed({
          title: data.title,
          message: data.message,
          type: 'incident_assigned',
          severity: data.priority as 'low' | 'medium' | 'high' | 'critical',
          facility: data.facility,
          incidentId: data.incidentId
        });

        // Show browser notification
        showLiveNotification({
          title: data.title,
          message: data.message,
          type: 'incident_assigned',
          severity: data.priority as 'low' | 'medium' | 'high' | 'critical',
          facility: data.facility,
          incidentId: data.incidentId
        });
      }
    });

    return () => unsubscribeAssignments();
  }, [user?.uid, addNotificationToPersonalFeed, showLiveNotification]); // FIXED: Added dependencies

  // FIXED: Subscribe to emergency notifications
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🚨 Setting up emergency notifications');
    
    const emergencyNotificationsRef = ref(rtdb, `emergency-notifications`);
    
    const unsubscribeEmergency = onChildAdded(emergencyNotificationsRef, (snapshot) => {
      const data = snapshot.val() as PubSubNotificationData;
      if (data && data.timestamp > Date.now() - 60000) { // Last 1 minute
        console.log('🚨 New emergency notification received:', data);
        
        // Add to personal feed
        addNotificationToPersonalFeed({
          title: data.title,
          message: data.message,
          type: 'emergency_broadcast',
          severity: 'critical',
          facility: data.facility,
          incidentId: data.incidentId
        });

        // Show browser notification
        showLiveNotification({
          title: data.title,
          message: data.message,
          type: 'emergency_broadcast',
          severity: 'critical',
          facility: data.facility,
          incidentId: data.incidentId
        });
      }
    });

    return () => unsubscribeEmergency();
  }, [user?.uid, addNotificationToPersonalFeed, showLiveNotification]); // FIXED: Added dependencies

  // Add notification programmatically (for incident operations)
  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'recipients'>): Promise<void> => {
    if (!user?.uid) return;
    
    try {
      console.log('📝 Adding notification programmatically:', notification);
      
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

      // Also publish to pub/sub for other users in the same facility
      if (profile?.facilityName) {
        const pubsubRef = ref(rtdb, `pubsub-notifications/${profile.facilityName.toLowerCase()}`);
        await push(pubsubRef, {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          severity: notification.severity || 'medium',
          facility: notification.facility || profile.facilityName,
          incidentId: notification.incidentId,
          action: 'manual_add',
          timestamp: Date.now(),
          processed: true,
          processedAt: Date.now()
        });
      }
      
      console.log('✅ Notification added programmatically successfully');
    } catch (error) {
      console.error('❌ Error adding notification:', error);
    }
  }, [user?.uid, profile?.facilityName]);

  const markAsRead = useCallback(async (id: string): Promise<void> => {
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
  }, [user?.uid]);

  const markAllAsRead = useCallback(async (): Promise<void> => {
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
  }, [user?.uid, notifications]);

  const getUnreadCount = useCallback((): number => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const getNotificationsByType = useCallback((type: string): Notification[] => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  const refreshNotifications = useCallback((): void => {
    setIsLoading(true);
  }, []);

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

// MOVED: Export context separately to fix Fast Refresh warning
export { NotificationContext };

