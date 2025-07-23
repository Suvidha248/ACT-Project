import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIncidents } from "../../context/IncidentContext";
import { IncidentActions } from "./IncidentActions";
import { NoteList } from "./Notes/NoteList";
import Modal from "react-modal";
import { NoteForm } from "./Notes/NoteForm";
import { Badge } from "../Shared/Badge";
import { Button } from "../Shared/Button";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { updateIncident, deleteIncident } from "../../services/IncidentService";
import { IncidentPriority, AlertType } from "../../types";

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useIncidents();

  const incident = state.incidents.find((i) => i.id === id);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    priority: "low" as IncidentPriority,
    alertType: "equipment" as AlertType,
    location: "",
  });

  // Initialize edit data when incident loads
  useEffect(() => {
    if (incident) {
      setEditData({
        title: incident.title,
        description: incident.description,
        priority: incident.priority,
        alertType: incident.alertType,
        location: incident.location,
      });
    }
  }, [incident]);

  if (!incident) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Incident not found
          </h3>
          <p className="text-gray-600 mb-4">
            The incident you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/incidents")}>
            Back to Incidents
          </Button>
        </div>
      </div>
    );
  }

  const handleEditSave = async () => {
    try {
      await updateIncident(incident.id, editData);

      setIsEditModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to update incident");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIncident(incident.id);

      navigate("/incidents");
    } catch (error) {
      console.error(error);
      alert("Failed to delete incident");
    }
  };

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

  const priorityOptions: IncidentPriority[] = [
    "critical",
    "high",
    "medium",
    "low",
  ];
  const alertTypeOptions: AlertType[] = [
    "equipment",
    "security",
    "temperature",
    "humidity",
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/incidents")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Incidents
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{incident.title}</h1>
            <p className="text-slate-400 font-mono">
              Incident ID: {incident.id}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={getPriorityColor(incident.priority)}>
            {incident.priority}
          </Badge>
          <Badge variant={getStatusColor(incident.status)}>
            {incident.status.replace("-", " ")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Incident Details</h2>
            <p className="mb-2">{incident.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p>{incident.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Alert Type</p>
                <p>{incident.alertType}</p>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <Button
                variant="primary"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <NoteList notes={incident.notes} />
            <NoteForm incidentId={incident.id} />
          </div>
        </div>

        <div className="space-y-6">
          <IncidentActions incident={incident} />
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Metadata</h3>
            <p className="text-sm text-gray-500">
              Reported {formatDistanceToNow(incident.createdAt)} ago
            </p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        className="mx-auto my-20 w-full max-w-md bg-slate-800 p-6 rounded-xl"
        overlayClassName="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      >
        <h3 className="text-xl font-bold text-white mb-4">Edit Incident</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={editData.title}
            onChange={(e) =>
              setEditData({ ...editData, title: e.target.value })
            }
            placeholder="Title"
            className="w-full bg-slate-700 text-white px-3 py-2 rounded"
          />
          <textarea
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            placeholder="Description"
            className="w-full bg-slate-700 text-white px-3 py-2 rounded"
          />
          <input
            type="text"
            value={editData.location}
            onChange={(e) =>
              setEditData({ ...editData, location: e.target.value })
            }
            placeholder="Location"
            className="w-full bg-slate-700 text-white px-3 py-2 rounded"
          />
          <select
            value={editData.priority}
            onChange={(e) =>
              setEditData({
                ...editData,
                priority: e.target.value as IncidentPriority,
              })
            }
            className="w-full bg-slate-700 text-white px-3 py-2 rounded"
          >
            {priorityOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <select
            value={editData.alertType}
            onChange={(e) =>
              setEditData({
                ...editData,
                alertType: e.target.value as AlertType,
              })
            }
            className="w-full bg-slate-700 text-white px-3 py-2 rounded"
          >
            {alertTypeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="bg-slate-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleEditSave}
            className="bg-teal-600 text-white px-6 py-2 rounded font-semibold"
          >
            Save
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        className="mx-auto my-20 w-full max-w-md bg-slate-800 p-6 rounded-xl text-center"
        overlayClassName="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      >
        <h3 className="text-xl font-bold text-red-500 mb-4">Confirm Delete</h3>
        <p className="mb-6 text-slate-300">
          Are you sure you want to delete this incident? This action cannot be
          undone.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="bg-slate-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-6 py-2 rounded font-semibold"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
