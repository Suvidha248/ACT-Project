import { AlertCircle, Filter, Plus, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useIncidents } from "../../context/IncidentContext";
import { getFilteredIncidents, IncidentFilters } from "../../services/IncidentService";
import { Badge } from "../Shared/Badge";
import { Button } from "../Shared/Button";
import { IncidentCard } from "./IncidentCard";
import { IncidentForm } from "./IncidentForm";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalItems, pageSize, onPageChange }: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / pageSize);
 
  if (totalPages <= 1) return null;
 
  return (
    <div className="flex items-center justify-between mt-6 glass-card p-4 rounded-xl">
      <div className="text-sm text-slate-400">
        Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems} incidents
      </div>
      <div className="flex space-x-2">
        <Button
          variant="secondary"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 text-sm"
        >
          Previous
        </Button>
        <span className="flex items-center px-3 py-1 text-sm text-slate-400">
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button
          variant="secondary"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
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
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
    <p className="text-slate-400 mt-2">Loading incidents...</p>
  </div>
);

const ErrorMessage = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
    <div className="flex items-center space-x-2">
      <AlertCircle className="w-5 h-5 text-red-400" />
      <p className="text-red-400">{error}</p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center space-x-2 text-red-300 hover:text-red-200 text-sm mt-2 transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      <span>Try again</span>
    </button>
  </div>
);

export function IncidentList() {
  const { state, dispatch } = useIncidents();
  const { user, profile } = useAuth();
 
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [facilityFilter, setFacilityFilter] = useState("all");
 
  // UI states
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const loading = state.loading;
  const error = state.error;
 
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  // Set facility filter when profile loads
  useEffect(() => {
    if (profile?.facilityName && facilityFilter === "all") {
      const normalizedFacility = profile.facilityName.toLowerCase();
      setFacilityFilter(normalizedFacility);
    }
  }, [profile, facilityFilter]);

  // Enhanced fetchIncidents using the service with proper token management
  const fetchIncidents = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
 
    try {
      if (!user) {
        throw new Error('Authentication required. Please log in.');
      }

      const idToken = await user.getIdToken();
      sessionStorage.setItem("idToken", idToken);
   
      const filters: IncidentFilters = {
        page: currentPage,
        size: pageSize,
      };

      if (facilityFilter !== "all") {
        filters.facility = facilityFilter;
      }
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      if (priorityFilter !== "all") {
        filters.priority = priorityFilter;
      }
   
      const response = await getFilteredIncidents(filters);
   
      dispatch({ type: 'SET_INCIDENTS', payload: response.data });
      setTotalItems(response.total);
   
    } catch (err) {
      let errorMessage = 'Failed to load incidents.';
   
      if (err instanceof Error) {
        errorMessage = err.message;
      }
   
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_INCIDENTS', payload: [] });
    }
  }, [facilityFilter, statusFilter, priorityFilter, currentPage, pageSize, dispatch, user]);

  // Only fetch incidents when user is authenticated
  useEffect(() => {
    if (user) {
      fetchIncidents();
    }
  }, [fetchIncidents, user]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [facilityFilter, statusFilter, priorityFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setFacilityFilter("all");
    setCurrentPage(0);
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const retryFetch = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
    if (user) {
      fetchIncidents();
    }
  };

  // Client-side search filtering (applied after server-side filtering)
  const filteredIncidents = state.incidents.filter((incident) => {
    if (!searchTerm) return true;
   
    const searchLower = searchTerm.toLowerCase();
    return (
      incident.title.toLowerCase().includes(searchLower) ||
      incident.description.toLowerCase().includes(searchLower) ||
      incident.location.toLowerCase().includes(searchLower) ||
      incident.id.toLowerCase().includes(searchLower)
    );
  });

  // Calculate summary statistics
  const summaryStats = {
    total: state.incidents.length,
    new: state.incidents.filter((i) => i.status === "new").length,
    active: state.incidents.filter((i) =>
      ["acknowledged", "in-progress"].includes(i.status)
    ).length,
    overdue: state.incidents.filter((i) =>
      new Date() > new Date(i.slaDeadline) &&
      !["resolved", "closed"].includes(i.status)
    ).length
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" ||
                          priorityFilter !== "all" || facilityFilter !== "all";

  // Show authentication message if user is not logged in
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-12 glass-card rounded-xl">
          <div className="text-slate-400 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Authentication Required
          </h3>
          <p className="text-slate-400 mb-4">
            Please log in to view incidents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text">
            {facilityFilter === "all"
              ? "All Incidents"
              : `${facilityFilter.charAt(0).toUpperCase() + facilityFilter.slice(1)} Incidents`}
          </h2>
          <p className="text-slate-400">
            {facilityFilter === "all"
              ? "Monitor and manage warehouse incidents across all facilities"
              : `Monitor and manage incidents for ${facilityFilter} facility`}
          </p>
        </div>
        <Button
          onClick={() => setShowIncidentForm(true)}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Report Incident</span>
        </Button>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} onRetry={retryFetch} />}

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search incidents by title, description, location, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Facility Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">All Facilities</option>
              <option value="atlanta">Atlanta</option>
              <option value="novi">Novi</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Summary & Filter Reset */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-400">
            Showing {filteredIncidents.length} of {summaryStats.total} incidents
            {facilityFilter !== "all" && ` in ${facilityFilter}`}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Summary Badges */}
        <div className="flex items-center space-x-2">
          <Badge variant="red" size="sm">
            {summaryStats.new} New
          </Badge>
          <Badge variant="yellow" size="sm">
            {summaryStats.active} Active
          </Badge>
          <Badge variant="red" size="sm">
            {summaryStats.overdue} Overdue
          </Badge>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Incident List */}
      {!loading && (
        <div className="space-y-4">
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))
          ) : (
            <div className="text-center py-12 glass-card rounded-xl">
              <div className="text-slate-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No incidents found
              </h3>
              <p className="text-slate-400 mb-4">
                {error
                  ? "Unable to load incidents. Please check your connection and try again."
                  : hasActiveFilters
                    ? "Try adjusting your search or filter criteria"
                    : "No incidents have been reported yet"
                }
              </p>
              {!error && (
                <Button
                  onClick={() => setShowIncidentForm(true)}
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Report New Incident</span>
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && filteredIncidents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}

      {/* Incident Form Modal */}
      <IncidentForm
        isOpen={showIncidentForm}
        onClose={() => setShowIncidentForm(false)}
      />
    </div>
  );
}
