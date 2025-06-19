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
  const { profile } = useAuth();

  if (!profile) return null;

  return allowedRoles.includes(profile.role) ? (
    children
  ) : (
    <Navigate to="/unauthorized" />
  );
};
