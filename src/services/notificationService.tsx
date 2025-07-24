// services/notificationService.tsx
import { onValue, push, ref } from 'firebase/database';
import { collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db, rtdb } from '../firebase';
import type { Notification } from '../types';

interface RealtimeNotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: string;
  timestamp: number;
}

class NotificationService {
  // Subscribe to Firestore notifications (for history)
  subscribeToNotifications(
    facility: string, 
    userId: string, 
    callback: (notifications: Notification[]) => void
  ) {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('facility', '==', facility),
      where('recipients', 'array-contains', userId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications: Notification[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        notifications.push({
          id: docSnapshot.id,
          title: data.title,
          message: data.message,
          type: data.type,
          facility: data.facility,
          severity: data.severity,
          timestamp: data.timestamp?.toDate() || new Date(),
          isRead: data.isRead || false,
          incidentId: data.incidentId,
          alertId: data.alertId,
          actionUrl: data.actionUrl,
          recipients: data.recipients || [],
          createdBy: data.createdBy,
          metadata: data.metadata
        } as Notification);
      });
      callback(notifications);
    });
  }

  // Subscribe to real-time triggers (for instant updates)
  subscribeToLiveUpdates(facility: string, callback: (update: RealtimeNotificationData) => void) {
    const triggerRef = ref(rtdb, `notifications/${facility}`);
    
    return onValue(triggerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data as RealtimeNotificationData);
      }
    });
  }

  // Trigger real-time update
  async triggerLiveUpdate(facility: string, notificationData: RealtimeNotificationData) {
    const triggerRef = ref(rtdb, `notifications/${facility}`);
    await push(triggerRef, {
      ...notificationData,
      timestamp: Date.now()
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: new Date()
    });
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string, facility: string): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('facility', '==', facility),
        where('recipients', 'array-contains', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      
      snapshot.docs.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, {
          isRead: true,
          readAt: new Date()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
