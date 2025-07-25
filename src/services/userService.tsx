import { User } from "../types";

// Base URL configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Enhanced auth headers function
const getAuthHeaders = (): Record<string, string> => {
  const token = sessionStorage.getItem("idToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    console.log("🔄 Fetching users...");
    console.log("🔗 API URL:", `${API_BASE_URL}/admin/users`);

    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });

    console.log("📊 Response status:", response.status);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "Access denied. You do not have permission to view users."
        );
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const users: User[] = await response.json();
    console.log("✅ Users fetched successfully:", users.length);
    return users;
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    throw error;
  }
};

// Edit user with authentication and verification
export const editUser = async (user: User): Promise<User> => {
  try {
    console.log("🔄 Updating user:", user.id);
    console.log("🔗 API URL:", `${API_BASE_URL}/admin/users/${user.id}`);

    const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });

    console.log("📊 Response status:", response.status);
    console.log("🌐 Response URL:", response.url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Update failed:", response.status, errorText);

      if (response.status === 403) {
        throw new Error(
          "Access denied. You do not have permission to edit this user."
        );
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const updatedUser = await response.json();
    console.log("✅ User updated successfully:", updatedUser);
    return updatedUser;
  } catch (error) {
    console.error("❌ Error updating user:", error);
    throw error;
  }
};

// Delete user with authentication
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    console.log("🔄 Deleting user:", userId);

    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "Access denied. You do not have permission to delete this user."
        );
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log("✅ User deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    throw error;
  }
};

// Fetch roles with authentication
export const fetchRoles = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/roles`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("❌ Error fetching roles:", error);
    throw error;
  }
};
