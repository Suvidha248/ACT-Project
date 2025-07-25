import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Modal from "react-modal";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useIncidents } from "../../context/IncidentContext";
import {
  deleteIncident,
  getFilteredIncidents,
  getIncidentById,
  updateIncident,
} from "../../services/IncidentService";
import { AlertType, Incident, IncidentPriority } from "../../types";
import { Badge } from "../Shared/Badge";
import { Button } from "../Shared/Button";
import { AIInsights } from "./AIInsights";
import { IncidentActions } from "./IncidentActions";
import { NoteForm } from "./Notes/NoteForm";
import { NoteList } from "./Notes/NoteList";

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useIncidents();

  // Local state for incident data
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    priority: "low" as IncidentPriority,
    alertType: "equipment" as AlertType,
    location: "",
  });

  // ✅ FIXED: Enhanced incident data fetching using service layer
  const fetchIncidentData = useCallback(async () => {
    if (!id) {
      setError("No incident ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching incident details for ID:", id);

      // Use the service layer function which handles auth and errors
      const incidentData = await getIncidentById(id);
      setIncident(incidentData);

      console.log("✅ Incident loaded:", incidentData);

      // Fetch facility-based incidents to populate context
      if (incidentData.location) {
        console.log(
          "🏢 Fetching facility incidents for:",
          incidentData.location
        );
        const facilityIncidents = await getFilteredIncidents({
          facility: incidentData.location,
        });
        dispatch({ type: "SET_INCIDENTS", payload: facilityIncidents.data });
      }
    } catch (error) {
      console.error("❌ Error fetching incident:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load incident data";
      setError(errorMessage);
      toast.error("Failed to load incident details");
    } finally {
      setLoading(false);
    }
  }, [id, dispatch]);

  // Fetch incident data on component mount
  useEffect(() => {
    fetchIncidentData();
  }, [fetchIncidentData]);

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

  // Enhanced edit save using service layer
  const handleEditSave = async () => {
    try {
      await updateIncident(incident!.id, editData);
      setIsEditModalOpen(false);

      // Refresh incident data
      await fetchIncidentData();

      toast.success("Incident updated successfully");
    } catch (error) {
      console.error("Error updating incident:", error);
      toast.error("Failed to update incident");
    }
  };

  // Enhanced delete using service layer
  const handleDelete = async () => {
    try {
      await deleteIncident(incident!.id);
      toast.success("Incident deleted successfully");
      navigate("/incidents");
    } catch (error) {
      console.error("Error deleting incident:", error);
      toast.error("Failed to delete incident");
    }
  };

  // Refresh incident data function
  const refreshIncidentData = async () => {
    await fetchIncidentData();
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading incident details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Error Loading Incident
          </h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => fetchIncidentData()}>Retry</Button>
            <Button onClick={() => navigate("/incidents")} variant="outline">
              Back to Incidents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Incident not found
  if (!incident) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Incident not found
          </h3>
          <p className="text-gray-600 mb-4">
            The incident you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button onClick={() => navigate("/incidents")}>
            Back to Incidents
          </Button>
        </div>
      </div>
    );
  }

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

  // Check if incident is overdue
  const isOverdue =
    incident.slaDeadline &&
    new Date() > incident.slaDeadline &&
    !["resolved", "closed"].includes(incident.status);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/incidents")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Incidents
          </Button>
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              {incident.title}
            </h1>
            <p className="text-slate-400 font-mono">
              Incident ID: {incident.id}
            </p>
            <p className="text-slate-500 text-sm">
              Facility: {incident.location}
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
          {incident.escalationLevel && incident.escalationLevel > 0 && (
            <Badge variant="red">
              <TrendingUp className="w-3 h-3 mr-1" />
              Escalated ({incident.escalationLevel})
            </Badge>
          )}
          {isOverdue && <Badge variant="red">Overdue</Badge>}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshIncidentData}
            title="Refresh incident data"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Incident Details */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Incident Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400">
                  Description
                </label>
                <p className="mt-1 text-white">{incident.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-400">
                    Alert Type
                  </label>
                  <p className="mt-1 text-white capitalize">
                    {incident.alertType}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">
                    Location
                  </label>
                  <p className="mt-1 text-white">{incident.location}</p>
                </div>
              </div>
            </div>

            {/* Edit/Delete Buttons */}
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

          {/* Timeline */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Incident Created
                  </p>
                  <p className="text-xs text-slate-400">
                    {format(incident.createdAt, "PPpp")} (
                    {formatDistanceToNow(incident.createdAt, {
                      addSuffix: true,
                    })}
                    )
                  </p>
                </div>
              </div>

              {incident.acknowledgedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Acknowledged
                    </p>
                    <p className="text-xs text-slate-400">
                      {format(incident.acknowledgedAt, "PPpp")} (
                      {formatDistanceToNow(incident.acknowledgedAt, {
                        addSuffix: true,
                      })}
                      )
                    </p>
                  </div>
                </div>
              )}

              {incident.resolvedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-white">Resolved</p>
                    <p className="text-xs text-slate-400">
                      {format(incident.resolvedAt, "PPpp")} (
                      {formatDistanceToNow(incident.resolvedAt, {
                        addSuffix: true,
                      })}
                      )
                    </p>
                  </div>
                </div>
              )}

              {incident.closedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-white">Closed</p>
                    <p className="text-xs text-slate-400">
                      {format(incident.closedAt, "PPpp")} (
                      {formatDistanceToNow(incident.closedAt, {
                        addSuffix: true,
                      })}
                      )
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes & AI Insights Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notes */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Notes & Comments
              </h2>
              <NoteList notes={incident.notes || []} incidentId={incident.id} />
              <div className="mt-6">
                <NoteForm incidentId={incident.id} />
              </div>
            </div>

            {/* AI Insights */}
            <AIInsights />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <IncidentActions incident={incident} />

          {/* Incident Information */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Incident Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-teal-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Assigned To
                  </p>
                  <p className="text-sm text-white">
                    {incident.assignedTo?.fullName || "Unassigned"}
                  </p>
                  {incident.assignedTo?.role && (
                    <p className="text-xs text-slate-500">
                      {incident.assignedTo.role}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-teal-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Reported By
                  </p>
                  <p className="text-sm text-white">
                    {incident.reportedBy?.fullName || "Unknown"}
                  </p>
                  {incident.reportedBy?.role && (
                    <p className="text-xs text-slate-500">
                      {incident.reportedBy.role}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-teal-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">Location</p>
                  <p className="text-sm text-white">{incident.location}</p>
                </div>
              </div>

              {incident.slaDeadline && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      SLA Deadline
                    </p>
                    <p
                      className={`text-sm ${
                        isOverdue ? "text-red-400 font-medium" : "text-white"
                      }`}
                    >
                      {format(incident.slaDeadline, "PPpp")}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-teal-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Last Updated
                  </p>
                  <p className="text-sm text-white">
                    {formatDistanceToNow(
                      incident.updatedAt || incident.createdAt,
                      { addSuffix: true }
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
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
            rows={3}
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
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
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
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleEditSave}
            className="bg-teal-600 text-white px-6 py-2 rounded font-semibold hover:bg-teal-500 transition-colors"
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
            className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
