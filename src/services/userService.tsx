import { User } from "../types";

const API_URL = "http://localhost:8080/api/admin/users";

type APIUser = {
  id: number;
  fullName: string;
  role: string;
};

/**
 * Fetch all users from the backend.
 */
export const fetchUsers = async (): Promise<User[]> => {
  const token = sessionStorage.getItem("idToken") || "";

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // 🔴 Handle 401 Unauthorized
  if (response.status === 401) {
    console.error("Unauthorized. Redirecting to login.");
    window.location.href = "/login"; // Update this route if your login page is different
    throw new Error("Unauthorized. Please log in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const apiUsers: APIUser[] = await response.json();

  const users: User[] = apiUsers.map((apiUser) => ({
    id: apiUser.id.toString(),
    name: apiUser.fullName,
    email: "placeholder@example.com",
    role: apiUser.role,
    department: "General",
  }));

  return users;
};

/**
 * Get all users (alias for fetchUsers).
 * This is needed for IncidentContext.tsx compatibility.
 */
export const getAllUsers = async (): Promise<User[]> => {
  return fetchUsers();
};

/**
 * Fetch available user roles.
 */
export const fetchRoles = async (): Promise<string[]> => {
  const token = sessionStorage.getItem("idToken") || "";

  const response = await fetch(`${API_URL}/roles`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 🔴 Handle 401 Unauthorized
  if (response.status === 401) {
    console.error("Unauthorized. Redirecting to login.");
    window.location.href = "/login";
    throw new Error("Unauthorized. Please log in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch roles");
  }

  const roles: string[] = await response.json();
  return roles;
};

/**
 * Edit/update user information.
 */
export const editUser = async (updatedUser: User): Promise<User> => {
  const token = sessionStorage.getItem("idToken") || "";

  const response = await fetch(`${API_URL}/${updatedUser.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedUser),
  });

  // 🔴 Handle 401 Unauthorized
  if (response.status === 401) {
    console.error("Unauthorized. Redirecting to login.");
    window.location.href = "/login";
    throw new Error("Unauthorized. Please log in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  const apiUser: APIUser = await response.json();

  const user: User = {
    id: apiUser.id.toString(),
    name: apiUser.fullName,
    email: "placeholder@example.com",
    role: apiUser.role,
    department: "General",
  };

  return user;
};

/**
 * Delete a user by ID.
 */
export const deleteUser = async (id: string): Promise<void> => {
  const token = sessionStorage.getItem("idToken") || "";

  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 🔴 Handle 401 Unauthorized
  if (response.status === 401) {
    console.error("Unauthorized. Redirecting to login.");
    window.location.href = "/login";
    throw new Error("Unauthorized. Please log in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
};
