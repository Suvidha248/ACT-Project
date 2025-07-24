import { format, formatDistanceToNow } from "date-fns";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  Droplets,
  MapPin,
  MessageSquare,
  Package,
  Shield,
  Thermometer,
  TrendingUp,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Incident } from "../../types";
import { Badge } from "../Shared/Badge";

interface IncidentCardProps {
  incident: Incident;
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "red";
      case "high":
        return "orange";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "red";
      case "acknowledged":
        return "yellow";
      case "in-progress":
        return "blue";
      case "resolved":
        return "green";
      case "closed":
        return "gray";
      default:
        return "gray";
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "equipment":
        return Package;
      case "security":
        return Shield;
      case "temperature":
        return Thermometer;
      case "humidity":
        return Droplets;
      case "inventory":
        return Package;
      case "safety":
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "temperature":
        return "blue";
      case "security":
        return "red";
      case "equipment":
        return "orange";
      case "inventory":
        return "purple";
      case "safety":
        return "red";
      case "humidity":
        return "cyan";
      default:
        return "gray";
    }
  };

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case "critical":
        return "from-red-500 to-orange-500";
      case "high":
        return "from-orange-500 to-yellow-500";
      case "medium":
        return "from-yellow-500 to-amber-500";
      case "low":
        return "from-emerald-500 to-green-500";
      default:
        return "from-slate-500 to-gray-500";
    }
  };

 const isOverdue = incident.slaDeadline && new Date() > incident.slaDeadline && !['resolved', 'closed'].includes(incident.status);
  const AlertIcon = getAlertTypeIcon(incident.alertType);

  return (
    <Link to={`/incidents/${incident.id}`}>
      <motion.div
        className={`glass-card p-6 hover:glass-card-hover transition-all duration-300 cursor-pointer relative overflow-hidden ${
          isOverdue
            ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            : ""
        }`}
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Priority indicator */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getPriorityGradient(
            incident.priority
          )} rounded-l-2xl`}
        />

        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <motion.div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPriorityGradient(
                  incident.priority
                )} flex items-center justify-center relative`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <AlertIcon className="w-6 h-6 text-white" />
                {incident.priority === "critical" && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                )}
              </motion.div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white group-hover:text-teal-300 transition-colors">
                  {incident.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {incident.id}
                </p>
              </div>

              {incident.escalationLevel > 0 && (
                <div className="flex items-center space-x-1 text-red-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    Escalated ({incident.escalationLevel})
                  </span>
                </div>
              )}
              {isOverdue && (
                <Badge variant="red" size="sm" className="animate-pulse">
                  Overdue
                </Badge>
              )}
            </div>

            <p className="text-slate-300 mb-4 line-clamp-2 group-hover:text-slate-200 transition-colors">
              {incident.description}
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center space-x-2 mb-4">
          <Badge
            variant={getPriorityColor(incident.priority)}
            size="sm"
            className={`bg-gradient-to-r ${getPriorityGradient(
              incident.priority
            )} text-white border-0`}
          >
            {incident.priority}
          </Badge>
          <Badge variant={getStatusColor(incident.status)} size="sm">
            {incident.status.replace("-", " ")}
          </Badge>
          <Badge variant={getAlertTypeColor(incident.alertType)} size="sm">
            {incident.alertType}
          </Badge>
        </div>

        {/* Incident details grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-400 mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span className="font-mono text-xs">{incident.location}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <span className="font-mono text-xs">
              {formatDistanceToNow(incident.createdAt, { addSuffix: true })}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-teal-400" />
            <span className="font-mono text-xs">
              {incident.assignedTo?.fullName || 'Unassigned'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <span className="font-mono text-xs">
              {incident.notes.length} notes
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            {incident.assignedTo && (
              <span className="font-mono">
                Assigned to: {incident.reportedBy?.fullName || 'Unknown'}
              </span>
            )}
          </div>

          <div
            className={`text-xs font-mono ${
              isOverdue ? "text-red-400 font-semibold" : "text-slate-500"
            }`}
          >
            SLA:{" "}
            {incident.slaDeadline ? format(incident.slaDeadline, 'MMM d, HH:mm') : 'No deadline'}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
