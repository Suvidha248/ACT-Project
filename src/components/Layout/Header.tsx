import { signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { Activity, Brain, LogOut, Settings, Shield, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase";
import NotificationBell from "../NotificationBell";

interface HeaderProps {
  isAuthPage?: boolean;
}

export function Header({ isAuthPage }: HeaderProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
  };

  return (
    <motion.header
      className={`glass-card border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 m-2 sm:m-4 mb-0 rounded-t-2xl ${
        isAuthPage ? "justify-center" : ""
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        {/* Logo and Status */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold gradient-text">
                Incident Command
              </h1>
              <p className="text-xs sm:text-sm text-teal-300/80 font-mono">
                Warehouse Operations
              </p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <div className="flex items-center space-x-1 text-emerald-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-mono">OPERATIONAL</span>
            </div>
            <div className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <motion.div
              className="hidden sm:flex items-center space-x-2 glass-card px-3 py-2 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <Shield className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-mono text-slate-300">
                AI Monitoring
              </span>
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            </motion.div>

            {/* ✅ Real-time Notification Bell */}
            {profile?.id && <NotificationBell userId={profile.id} />}

            <motion.button
              className="p-3 glass-card-hover rounded-xl group hidden sm:block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5 text-slate-300 group-hover:text-teal-300" />
            </motion.button>
          </div>

          {/* Profile & Logout */}
          <motion.div
            className="flex flex-col sm:flex-row items-center sm:space-x-3 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-white/20 w-full sm:w-auto"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex flex-col items-center sm:items-end mb-2 sm:mb-0">
              <p className="text-sm font-semibold text-white truncate max-w-[150px]">
                {profile?.fullName ||
                  user?.displayName ||
                  user?.email ||
                  "User"}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                {profile?.role || "Role"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>
              <button
                className="px-2 sm:px-3 py-2 bg-gray-700 hover:bg-red-600 rounded-lg text-white flex items-center transition"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="text-sm font-semibold hidden sm:inline">
                  Logout
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
