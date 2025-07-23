import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  connectNotificationSocket,
  disconnectWebSocket,
} from "../services/websocketService";
import { NotificationMessage } from "../types";

interface Props {
  userId: string;
}

const NotificationBell = ({ userId }: Props) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectNotificationSocket(userId, (notif: NotificationMessage) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((count) => count + 1);
      console.log("🔔 New notification:", notif);
    });

    return () => {
      disconnectWebSocket();
    };
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setUnreadCount(0); // Mark all as read
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        className="relative p-3 glass-card-hover rounded-xl group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
      >
        <Bell className="w-5 h-5 text-slate-300 group-hover:text-teal-300" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-lg z-50 p-2 max-h-80 overflow-auto">
          <h3 className="text-sm text-slate-300 font-semibold px-2 mb-2">
            Notifications
          </h3>
          {notifications.length === 0 ? (
            <p className="text-slate-400 text-sm px-2">No notifications</p>
          ) : (
            notifications.map((notif, index) => (
              <div
                key={index}
                className="bg-slate-700 p-2 rounded-lg text-sm text-slate-200 mb-1 hover:bg-slate-600 transition"
              >
                {notif.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
