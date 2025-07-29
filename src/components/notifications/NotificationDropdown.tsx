// components/notifications/NotificationDropdown.tsx
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertOctagon, AlertTriangle, Bell, Check, CheckCheck, CheckCircle, Clock, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../types';

type TabType = 'all' | 'assignments' | 'escalations' | 'resolutions';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, getNotificationsByType } = useNotifications();

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'incident_assigned':
        return <User className="w-4 h-4 text-blue-400" />;
      case 'incident_escalated':
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
      case 'incident_resolved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'emergency_broadcast':
        return <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (type: string, severity: string) => {
    if (type === 'emergency_broadcast') return 'border-l-red-500 bg-red-900/20';
    if (type === 'incident_escalated') return 'border-l-orange-500 bg-orange-900/20';
    if (type === 'incident_assigned') return 'border-l-blue-500 bg-blue-900/20';
    if (type === 'incident_resolved') return 'border-l-green-500 bg-green-900/20';
    
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-900/15';
      case 'high': return 'border-l-orange-500 bg-orange-900/15';
      case 'medium': return 'border-l-yellow-500 bg-yellow-900/15';
      default: return 'border-l-blue-500 bg-blue-900/15';
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'assignments':
        return getNotificationsByType('incident_assigned');
      case 'escalations':
        return getNotificationsByType('incident_escalated');
      case 'resolutions':
        return getNotificationsByType('incident_resolved');
      default:
        return notifications;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    setIsOpen(false);
  };

  const filteredNotifications = getFilteredNotifications();

  interface TabInfo {
    key: TabType;
    label: string;
    count: number;
  }

  const tabs: TabInfo[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'assignments', label: 'Assigned', count: getNotificationsByType('incident_assigned').length },
    { key: 'escalations', label: 'Escalated', count: getNotificationsByType('incident_escalated').length },
    { key: 'resolutions', label: 'Resolved', count: getNotificationsByType('incident_resolved').length }
  ];

  return (
    <div className="relative overflow-visible" ref={dropdownRef} style={{ zIndex: 9999 }}>
      <motion.button
        className="relative p-3 glass-card-hover rounded-xl group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{ zIndex: 9999 }}
      >
        <Bell className="w-5 h-5 text-slate-300 group-hover:text-teal-300" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg"
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              boxShadow: [
                "0 0 0 0 rgba(239, 68, 68, 0.7)",
                "0 0 0 6px rgba(239, 68, 68, 0)",
                "0 0 0 0 rgba(239, 68, 68, 0)"
              ]
            }}
            transition={{ 
              scale: { type: "spring", stiffness: 500, damping: 30 },
              boxShadow: { duration: 2, repeat: Infinity }
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-96 bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-600 max-h-[32rem] overflow-hidden"
            style={{ zIndex: 10000 }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* Enhanced Header */}
            <div className="p-4 border-b border-slate-600 bg-slate-800/90">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-teal-400" />
                  <span>Notifications</span>
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center space-x-1 bg-slate-700/80 px-3 py-1.5 rounded-lg transition-all hover:bg-slate-700"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
              
              {unreadCount > 0 && (
                <p className="text-sm text-slate-300 mb-3">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
              
              {/* Enhanced Filter Tabs */}
              <div className="flex space-x-1">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 ${
                      activeTab === tab.key 
                        ? 'bg-teal-600 text-white shadow-md' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {tab.label} {tab.count > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                        activeTab === tab.key ? 'bg-teal-700' : 'bg-slate-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-300 bg-slate-800">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm">No {activeTab === 'all' ? '' : activeTab} notifications</p>
                  <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getSeverityColor(notification.type, notification.severity)} ${
                      !notification.isRead ? 'bg-slate-800/80 border border-slate-600' : 'bg-slate-800/60'
                    } hover:bg-slate-700 cursor-pointer transition-all duration-200 border-b border-slate-600 last:border-b-0`}
                    onClick={() => handleNotificationClick(notification)}
                    whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.8)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getNotificationIcon(notification.type)}
                          <span className="text-sm font-semibold text-white">
                            {notification.title}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                          )}
                          {notification.type === 'emergency_broadcast' && (
                            <span className="text-xs bg-gradient-to-r from-red-600 to-red-500 text-white px-2 py-1 rounded-full font-semibold shadow-lg animate-pulse">
                              🚨 EMERGENCY
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-200 mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span className="font-medium">
                            Facility: <span className="text-teal-300">{notification.facility}</span>
                          </span>
                          <span className="text-slate-400">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="ml-2 p-1.5 hover:bg-slate-600 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3 text-slate-400 hover:text-white" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};