// components/Incidents/IncidentList.tsx
import {
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getFilteredIncidents, IncidentFilters } from "../../services/IncidentService";
import { Incident } from "../../types";
import { Badge } from "../Shared/Badge";
import { Button } from "../Shared/Button";
import { IncidentCard } from "./IncidentCard";
import { IncidentForm } from "./IncidentForm";

const ITEMS_PER_PAGE = 10;

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalItems, pageSize, onChange }: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 glass-card p-4 rounded-xl">
      <div className="text-sm text-slate-400">
        Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{" "}
        {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm"
        >
          Previous
        </Button>
        <span className="flex items-center px-3 py-1 text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent mx-auto" />
    <p className="mt-2 text-slate-400">Loading incidents...</p>
  </div>
);

const ErrorMessage = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
    <div className="flex items-center space-x-2">
      <AlertCircle className="w-5 h-5 text-red-400" />
      <p className="text-red-400">{error}</p>
    </div>
    <button
      onClick={onRetry}
      className="mt-2 flex items-center space-x-2 text-red-300 hover:text-red-200 transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      <span>Try Again</span>
    </button>
  </div>
);

export const IncidentList = () => {
  const { user, profile, loading: authLoading, initialized } = useAuth();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // Initialize with "all" to avoid undefined errors
  const [facility, setFacility] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  // Sync facility with user profile on profile load/change
  useEffect(() => {
    if (profile?.facilityName) {
      const profileFacility = profile.facilityName.trim().toLowerCase();
      setFacility((prev) => (prev !== profileFacility ? profileFacility : prev));
    }
  }, [profile?.facilityName]);

  const loadIncidents = useCallback(async () => {
    if (!initialized || !user || !facility) return;

    setLoading(true);
    setError(null);

    try {
      const filters: IncidentFilters = {
        facility: facility === "all" ? undefined : facility,
        status: status === "all" ? undefined : status,
        priority: priority === "all" ? undefined : priority,
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const res = await getFilteredIncidents(filters);

      setIncidents(res.data);
      setTotalItems(res.total);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load incidents";
      setError(msg);
      setIncidents([]);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [initialized, user, facility, status, priority, currentPage]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const handleChange = (type: string, value: string) => {
    setCurrentPage(1);
    if (type === "facility") setFacility(value);
    else if (type === "status") setStatus(value);
    else if (type === "priority") setPriority(value);
  };

  const clearFilters = () => {
    const defaultFacility = profile?.facilityName?.toLowerCase() || "all";
    setFacility(defaultFacility);
    setStatus("all");
    setPriority("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const defaultFacility = profile?.facilityName?.toLowerCase() || "all";
  const filtersActive =
    facility !== defaultFacility ||
    status !== "all" ||
    priority !== "all" ||
    searchTerm.trim() !== "";

  // Client-side search
  const visibleIncidents = incidents.filter((incident) => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return (
      incident.title.toLowerCase().includes(s) ||
      incident.description.toLowerCase().includes(s) ||
      incident.location.toLowerCase().includes(s) ||
      incident.id.toLowerCase().includes(s)
    );
  });

  // Summary stats with safe slaDeadline check
  const summary = {
    total: incidents.length,
    new: incidents.filter((i) => i.status === "new").length,
    active: incidents.filter((i) =>
      ["acknowledged", "in-progress"].includes(i.status)
    ).length,
    overdue: incidents.filter(
      (i) =>
        i.slaDeadline &&
        new Date() > new Date(i.slaDeadline) &&
        !["resolved", "closed"].includes(i.status)
    ).length,
  };

  if (!initialized || authLoading)
    return (
      <div className="p-6">
        <div className="glass-card rounded-xl py-20 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-white">Loading data...</p>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="p-6">
        <div className="glass-card rounded-xl py-20 text-center text-white">
          <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
          <h2 className="mb-2 text-lg font-semibold">Authentication Required</h2>
          <p>Please log in to see incidents.</p>
        </div>
      </div>
    );

  // Safe facility name for display
  const safeFacility =
    typeof facility === "string" && facility.length > 0 ? facility : "all";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text">
            {safeFacility === "all"
              ? "All Incidents"
              : `${safeFacility.charAt(0).toUpperCase()}${safeFacility.slice(1)} Incidents`}
          </h2>
          <p className="text-slate-400">
            {safeFacility === "all"
              ? "Monitoring all warehouse incidents"
              : `Incidents for facility:`}
            {profile?.facilityName && (
              <span className="ml-2 text-cyan-400">{profile.facilityName}</span>
            )}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          New Incident
        </Button>
      </div>

      {/* Error */}
      {error && <ErrorMessage error={error} onRetry={loadIncidents} />}

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="search"
              placeholder="Search incidents by title, description, location, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          <select
            value={facility}
            onChange={(e) => handleChange("facility", e.target.value)}
            className="bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Facilities</option>
            <option value="atlanta">Atlanta</option>
            <option value="novi">Novi</option>
          </select>

          <select
            value={status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            className="bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Active filters badges */}
        {filtersActive && (
          <div className="flex flex-wrap gap-2 mt-4">
            {facility !== defaultFacility && <Badge variant="blue">Facility: {facility}</Badge>}
            {status !== "all" && <Badge variant="yellow">Status: {status}</Badge>}
            {priority !== "all" && <Badge variant="red">Priority: {priority}</Badge>}
            {searchTerm.trim() !== "" && <Badge variant="green">Search: {searchTerm.trim()}</Badge>}
          </div>
        )}
      </div>

      {/* Summary and clear filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-slate-400">
          <span>
            Showing {visibleIncidents.length} of {summary.total} incidents
            {facility !== "all" && ` in ${facility}`}
          </span>
          {filtersActive && (
            <button
              onClick={clearFilters}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="red" size="sm">
            {summary.new} New
          </Badge>
          <Badge variant="yellow" size="sm">
            {summary.active} Active
          </Badge>
          <Badge variant="red" size="sm">
            {summary.overdue} Overdue
          </Badge>
        </div>
      </div>

      {/* Incident list */}
      {loading ? (
        <LoadingSpinner />
      ) : visibleIncidents.length > 0 ? (
        <>
          {visibleIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={ITEMS_PER_PAGE}
            onChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="glass-card rounded-xl py-20 text-center text-white">
          <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
          <h2 className="mb-2 text-lg font-semibold">No incidents found</h2>
          <p className="text-slate-400">
            {error ? error : filtersActive ? "Try adjusting your filters or search." : "No incidents reported yet."}
          </p>
          {!error && (
            <Button onClick={() => setShowForm(true)} variant="primary" className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Report Incident
            </Button>
          )}
        </div>
      )}

      {/* Incident creation modal */}
      {showForm && <IncidentForm isOpen={showForm} onClose={() => setShowForm(false)} />}
    </div>
  );
};
