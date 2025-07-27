// components/Incidents/IncidentList.tsx
import { AlertCircle, Filter, Plus, RefreshCw, Search } from "lucide-react";
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
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalItems, pageSize, onPageChange }: PaginationProps) => {
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
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm"
        >
          Previous
        </Button>
        <span className="flex items-center px-3 py-1 text-sm text-slate-400">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
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

export const IncidentList = () => {
  const { user, profile, loading: authLoading, initialized } = useAuth();

  // Local state for filtered incidents
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // Filter states
  const [facilityFilter, setFacilityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ CRITICAL FIX: Initialize facility filter immediately when profile loads
  useEffect(() => {
    if (profile?.facilityName && facilityFilter === "all") {
      console.log("🏢 Setting default facility filter:", profile.facilityName);
      setFacilityFilter(profile.facilityName.toLowerCase());
    }
  }, [profile?.facilityName]);

  const loadIncidents = useCallback(async () => {
    // ✅ CRITICAL FIX: Don't load until auth is fully initialized
    if (!initialized || !user) {
      console.log("⏳ Waiting for authentication to initialize...");
      return;
    }

    // ✅ CRITICAL FIX: Don't load if we're still waiting for profile and default facility should be set
    if (authLoading && facilityFilter === "all" && !profile) {
      console.log("⏳ Waiting for user profile to load...");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filters: IncidentFilters = {
        facility: facilityFilter === "all" ? undefined : facilityFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
        sortBy: "createdAt",
        sortOrder: "desc"
      };

      console.log("🔍 Loading incidents with filters:", filters);
      console.log("👤 User profile:", { uid: user.uid, facility: profile?.facilityName });

      const result = await getFilteredIncidents(filters);

      console.log("📦 Received incidents:", result.data.length);
      console.log("📊 Notes count debug:", result.data.map(i => ({ 
        id: i.id, 
        notesCount: i.notesCount,
        notes: i.notes?.length 
      })));

      setIncidents(result.data);
      setTotalItems(result.total);

      console.log(`✅ Successfully loaded ${result.data.length} incidents for facility: ${facilityFilter}`);

    } catch (err) {
      console.error('❌ Error loading incidents:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load incidents';
      setError(errorMessage);
      setIncidents([]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    user, 
    profile, 
    initialized, 
    authLoading, 
    facilityFilter, 
    statusFilter, 
    priorityFilter, 
    currentPage
  ]);

  // ✅ CRITICAL FIX: Load incidents when auth state OR filters change
  useEffect(() => {
    console.log("🔄 useEffect triggered - Auth state:", { 
      initialized, 
      authLoading, 
      hasUser: !!user, 
      hasProfile: !!profile,
      facilityFilter 
    });
    
    loadIncidents();
  }, [loadIncidents]);

  const handleRefresh = () => {
    setCurrentPage(1);
    loadIncidents();
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);

    switch (filterType) {
      case 'facility':
        console.log("🏢 Facility filter changed:", value);
        setFacilityFilter(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'priority':
        setPriorityFilter(value);
        break;
    }
  };

  // ✅ FIXED: Better clear filters logic with proper defaults
  const clearFilters = () => {
    const defaultFacility = profile?.facilityName ? profile.facilityName.toLowerCase() : "all";
    
    console.log("🧹 Clearing filters...", {
      currentFilters: { facilityFilter, statusFilter, priorityFilter, searchTerm },
      userFacility: profile?.facilityName,
      defaultFacility,
      willResetTo: {
        facility: defaultFacility,
        status: "all",
        priority: "all",
        search: "",
        page: 1
      }
    });

    setFacilityFilter(defaultFacility);
    setStatusFilter("all");
    setPriorityFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
    
    console.log("✅ Filters cleared successfully");
  };

  // ✅ FIXED: Proper logic for detecting active filters based on user's defaults
  const getDefaultFacility = () => profile?.facilityName?.toLowerCase() || "all";
  const defaultFacility = getDefaultFacility();
  
  const hasActiveFilters = 
    facilityFilter !== defaultFacility || 
    statusFilter !== "all" || 
    priorityFilter !== "all" || 
    searchTerm.trim() !== "";

  // Client-side search filtering
  const filteredIncidents = incidents.filter((incident) => {
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
    total: incidents.length,
    new: incidents.filter((i) => i.status === "new").length,
    active: incidents.filter((i) =>
      ["acknowledged", "in-progress"].includes(i.status)
    ).length,
    overdue: incidents.filter((i) =>
      i.slaDeadline && new Date() > new Date(i.slaDeadline) &&
      !["resolved", "closed"].includes(i.status)
    ).length
  };

  // ✅ ENHANCED: Show loading while auth is initializing
  if (!initialized || authLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 glass-card rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-white mb-2">
            Initializing...
          </h3>
          <p className="text-slate-400">
            Setting up your dashboard...
          </p>
        </div>
      </div>
    );
  }

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
      {/* Header */}
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
            {profile?.facilityName && (
              <span className="ml-2 text-cyan-400">
                (Your facility: {profile.facilityName})
              </span>
            )}
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
      {error && <ErrorMessage error={error} onRetry={handleRefresh} />}

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
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

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={facilityFilter}
              onChange={(e) => handleFilterChange('facility', e.target.value)}
              className="bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">All Facilities</option>
              <option value="atlanta">Atlanta</option>
              <option value="novi">Novi</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
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
            value={priorityFilter}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* ✅ FIXED: Better active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {facilityFilter !== defaultFacility && (
              <Badge variant="blue">Facility: {facilityFilter}</Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="yellow">Status: {statusFilter}</Badge>
            )}
            {priorityFilter !== "all" && (
              <Badge variant="red">Priority: {priorityFilter}</Badge>
            )}
            {searchTerm && (
              <Badge variant="green">Search: {searchTerm}</Badge>
            )}
          </div>
        )}
      </div>

      {/* ✅ FIXED: Summary & Filter Reset with better logic */}
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
              {/* ✅ DEBUG: Show what will be reset to in development */}
              {process.env.NODE_ENV === 'development' && (
                <span className="ml-1 text-xs opacity-75">
                  (→ {defaultFacility === "all" ? "all facilities" : defaultFacility})
                </span>
              )}
            </button>
          )}
        </div>

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
              <IncidentCard
                key={`${incident.id}-${incident.notesCount}-${Date.now()}`}
                incident={incident}
              />
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
          pageSize={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Incident Form Modal */}
      <IncidentForm
        isOpen={showIncidentForm}
        onClose={() => setShowIncidentForm(false)}
      />
    </div>
  );
};
