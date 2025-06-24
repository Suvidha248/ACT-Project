// src/services/userService.ts
export interface User {
  fullName: string;
  role: string;
}

const API_URL = "http://localhost:8080/api/admin/users";

export const fetchUsers = async (): Promise<User[]> => {
  const token = sessionStorage.getItem("idToken") || "";

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const users: User[] = await response.json();
  return users;
};
