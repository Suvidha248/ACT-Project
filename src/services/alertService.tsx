import { Alert } from "../types";

const API_URL = "http://localhost:8080/api/alerts";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("idToken") || ""}`,
});

export const fetchAlerts = async (): Promise<Alert[]> => {
  const response = await fetch(API_URL, {
    headers: getHeaders(),
  });

  if (!response.ok) throw new Error("Failed to fetch alerts");

  return await response.json();
};

export const createAlert = async (alertData: Alert): Promise<Alert> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
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
    headers: getHeaders(),
    body: JSON.stringify(alertData),
  });

  if (!response.ok) throw new Error("Failed to update alert");

  return await response.json();
};

export const deleteAlert = async (alertId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${alertId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) throw new Error("Failed to delete alert");
};
