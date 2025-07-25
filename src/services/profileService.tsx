// src/services/profileService.tsx
import axios from "axios";
import { UserData } from "../types";

// Get token from sessionStorage
const getToken = () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    throw new Error("Firebase token not found in sessionStorage.");
  }
  return token;
};

// Axios instance
const api = axios.create({
  baseURL: "http://localhost:8080/api/admin", // Adjust if needed
  headers: {
    "Content-Type": "application/json",
  },
});

// Fetch profile
export const getProfile = async (): Promise<UserData> => {
  const token = getToken();
  try {
    const response = await api.get<UserData>("/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Corrected
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    throw error;
  }
};

// Update profile
export const updateProfile = async (
  updates: Partial<UserData>
): Promise<UserData> => {
  const token = getToken();
  try {
    const response = await api.put<UserData>("/users/profile", updates, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Corrected
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    throw error;
  }
};
