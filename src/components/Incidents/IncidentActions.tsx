import { useState } from "react";
import { motion } from "framer-motion";
import { useIncidents } from "../../context/IncidentContext";
import { Incident, IncidentStatus } from "../../types";
import { Button } from "../Shared/Button";
import { Modal } from "../Shared/Modal";
import { CheckCircle, Play, UserCheck, XCircle, RotateCcw } from "lucide-react";

interface IncidentActionsProps {
  incident: Incident;
}

export function IncidentActions({ incident }: IncidentActionsProps) {
  const { updateStatus, assignIncident, escalateIncident, state } =
    useIncidents();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const handleStatusChange = async (status: IncidentStatus) => {
    await updateStatus(incident.id, status);
  };

  const handleAssign = async () => {
    if (selectedUser) {
      await assignIncident(incident.id, selectedUser);
      setShowAssignModal(false);
      setSelectedUser("");
    }
  };

  const handleEscalate = async () => {
    await escalateIncident(incident.id);
  };

  const canAcknowledge = incident.status === "new";
  const canStart = incident.status === "acknowledged";
  const canResolve = incident.status === "in-progress";
  const canClose = incident.status === "resolved";
  const canReopen = incident.status === "closed";

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-3">
        {canAcknowledge && (
          <Button
            onClick={() => handleStatusChange("acknowledged")}
            className="w-full"
            variant="primary"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Acknowledge
          </Button>
        )}
        {canStart && (
          <Button
            onClick={() => handleStatusChange("in-progress")}
            className="w-full"
            variant="primary"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Work
          </Button>
        )}
        {canResolve && (
          <Button
            onClick={() => handleStatusChange("resolved")}
            className="w-full"
            variant="success"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Resolved
          </Button>
        )}
        {canClose && (
          <Button
            onClick={() => handleStatusChange("closed")}
            className="w-full"
            variant="outline"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Close Incident
          </Button>
        )}
        {canReopen && (
          <Button
            onClick={() => handleStatusChange("new")}
            className="w-full"
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reopen
          </Button>
        )}

        <Button
          onClick={() => setShowAssignModal(true)}
          className="w-full"
          variant="outline"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          {incident.assignedTo && incident.assignedTo.name
            ? "Reassign"
            : "Assign"}
        </Button>

        <Button onClick={handleEscalate} className="w-full" variant="danger">
          Escalate
        </Button>
      </div>

      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Incident"
      >
        <div className="space-y-4">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select user</option>
            {state.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              disabled={!selectedUser}
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
