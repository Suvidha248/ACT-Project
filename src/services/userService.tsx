export interface User {
  id: number;
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

export const fetchRoles = async (): Promise<string[]> => {
  const token = sessionStorage.getItem("idToken") || "";

  const response = await fetch(`${API_URL}/roles`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch roles");
  }

  const roles: string[] = await response.json();
  return roles;
};

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

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  const user: User = await response.json();
  return user;
};

export const deleteUser = async (id: number): Promise<void> => {
  const token = sessionStorage.getItem("idToken") || "";

  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
};
