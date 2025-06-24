import { Alert } from "../types";

const API_URL = "http://localhost:8080/api/alerts";
const idToken = sessionStorage.getItem("idToken") || "";

export const fetchAlerts = async (): Promise<Alert[]> => {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch alerts");

  return await response.json();
};

export const createAlert = async (alertData: Alert): Promise<Alert> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(alertData),
  });

  if (!response.ok) throw new Error("Failed to create alert");

  return await response.json();
};

export const updateAlert = async (
  alertId: number,
  alertData: Alert
): Promise<Alert> => {
  const response = await fetch(`${API_URL}/${alertId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(alertData),
  });

  if (!response.ok) throw new Error("Failed to update alert");

  return await response.json();
};

export const deleteAlert = async (alertId: number): Promise<boolean> => {
  const response = await fetch(`${API_URL}/${alertId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) throw new Error("Failed to delete alert");

  return true;
};
