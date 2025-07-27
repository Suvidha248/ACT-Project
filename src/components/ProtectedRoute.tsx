import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, profile, loading, initialized } = useAuth();

  // ✅ Show loading while auth is initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Show loading if user exists but profile is still loading
  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading user profile...</p>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Add explicit null check before accessing profile properties
  if (!profile) {
    console.warn("Profile is null after auth checks");
    return <Navigate to="/login" replace />;
  }

  // ✅ Check role authorization - now TypeScript knows profile is not null
  if (!allowedRoles.includes(profile.role)) {
    console.warn(`Access denied: User role "${profile.role}" not in allowed roles:`, allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ All checks passed - render the protected component
  console.log(`✅ Access granted: User "${profile.fullName}" with role "${profile.role}"`);
  return children;
};
