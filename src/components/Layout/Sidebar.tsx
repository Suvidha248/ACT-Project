import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  BarChart3,
  Settings,
  FileText,
  Brain,
  Shield,
  Activity,
  Cpu,
  Route,
} from "lucide-react";

const navigation = [
  {
    name: "Command Center",
    href: "/",
    icon: LayoutDashboard,
    color: "from-teal-500 to-cyan-500",
  },
  {
    name: "Active Incidents",
    href: "/incidents",
    icon: AlertTriangle,
    color: "from-red-500 to-orange-500",
  },
  {
    name: "Incident Tracker",
    href: "/tracker",
    icon: Route,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Analytics",
    href: "/reports",
    icon: BarChart3,
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Team",
    href: "/team",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Knowledge Base",
    href: "/docs",
    icon: FileText,
    color: "from-slate-500 to-gray-500",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    color: "from-gray-500 to-slate-500",
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
    color: "from-green-500 to-lime-500",
  },
];

const systemStatus = [
  {
    name: "AI Processing",
    icon: Brain,
    status: "active",
    color: "text-emerald-400",
  },
  {
    name: "Threat Detection",
    icon: Shield,
    status: "monitoring",
    color: "text-teal-400",
  },
  {
    name: "System Health",
    icon: Cpu,
    status: "optimal",
    color: "text-cyan-400",
  },
];

export function Sidebar() {
  return (
    <motion.div
      className="w-80 glass-card border-r border-white/10 flex flex-col m-4 mr-0 rounded-l-2xl"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6">
        <motion.div
          className="flex items-center space-x-3 mb-8"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="pulse-ring" />
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text">WarehouseOps</h2>
            <p className="text-xs text-teal-300/80 font-mono">
              v2.1.0 Professional
            </p>
          </div>
        </motion.div>

        <motion.div
          className="glass-card p-4 mb-6 hologram-effect"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-teal-300">
              System Status
            </h3>
            <div className="flex items-center space-x-1">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-mono">ONLINE</span>
            </div>
          </div>
          <div className="space-y-2">
            {systemStatus.map((item, index) => (
              <motion.div
                key={item.name}
                className="flex items-center justify-between text-xs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className={`w-3 h-3 ${item.color}`} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <div
                  className={`status-indicator ${
                    item.status === "active"
                      ? "bg-emerald-400"
                      : item.status === "monitoring"
                      ? "bg-teal-400"
                      : "bg-cyan-400"
                  }`}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ✅ Scrollable Sidebar Menu */}
      <nav className="flex-1 px-4 pb-4 overflow-y-auto max-h-[calc(100vh-350px)] custom-scroll">
        <ul className="space-y-2">
          {navigation.map((item, index) => (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "glass-card teal-border text-white"
                      : "text-slate-300 hover:text-white hover:glass-card"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-r ${
                        item.color
                      } ${
                        isActive
                          ? "shadow-lg"
                          : "opacity-70 group-hover:opacity-100"
                      }`}
                    >
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-teal-400 rounded-full"
                        layoutId="activeIndicator"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>

      <motion.div
        className="p-4 border-t border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="glass-card p-3 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-teal-300">
              Performance
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400 font-mono">99.2%</span>
            </div>
          </div>
          <div className="space-y-1 text-xs text-slate-400 font-mono">
            <div className="flex justify-between">
              <span>AI Engine</span>
              <span className="text-emerald-400">ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span>Sensors</span>
              <span className="text-teal-400">SYNC</span>
            </div>
            <div className="flex justify-between">
              <span>Last Update</span>
              <span className="text-cyan-400">8s ago</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
