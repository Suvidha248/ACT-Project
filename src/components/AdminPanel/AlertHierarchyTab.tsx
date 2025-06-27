import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { FaPen, FaTrash } from "react-icons/fa";
import Modal from "react-modal";

import { FaTrash, FaPen, FaPlus } from "react-icons/fa";

import { fetchUsers, User } from "../../services/userService";

Modal.setAppElement("#root");

interface Alert {
  id?: string;
  system: string;
  type: string;
  level: string;
  notification: string[];
  role?: string;
  fullNames?: string[];
  fullName?: string;
}

const categories = ["WES", "IT-Service", "WMS"];
const alertLevels = ["Critical", "High", "Medium", "Low"];
const notifications = ["Email", "SMS"];
const API_URL = "http://localhost:8080/api/alerts";

const AlertHierarchyTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("WES");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredNames, setFilteredNames] = useState<string[]>([]);
  const [formData, setFormData] = useState<Alert>({
    system: "WES",
    type: "",
    level: "Critical",
    notification: [],
    role: "",
    fullNames: [],
  });

  useEffect(() => {
    const loadAlerts = async () => {
      let token = sessionStorage.getItem("token");

      if (!token) {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          token = await user.getIdToken(true);
          sessionStorage.setItem("token", token);
        } else {
          alert("Unauthorized: Please log in again.");
          return;
        }
      }

      await fetchAlerts(token);
    };

    loadAlerts();
    fetchUsers().then(setUsers).catch(console.error);
  }, []);

  const fetchAlerts = async (token: string) => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (Array.isArray(data)) setAlerts(data);
    } catch (err) {
      console.error("Failed to load alerts", err);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setFormData((prev) => ({ ...prev, system: category }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "role") {
      const names = users
        .filter((u) => u.role === value)
        .map((u) => u.fullName);
      setFilteredNames(names);
      setFormData((prev) => ({ ...prev, fullNames: [] }));
    }
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      notification: checked
        ? [...prev.notification, value]
        : prev.notification.filter((n) => n !== value),
    }));
  };

  const openAddModal = () => {
    setFormData({
      system: selectedCategory,
      type: "",
      level: "Critical",
      notification: [],
      role: "",
      fullNames: [],
    });
    setFilteredNames([]);
    setIsModalOpen(true);
  };

  const handleEdit = (alert: Alert) => {
    setFormData({
      ...alert,
      fullNames: alert.fullName ? [alert.fullName] : [],
    });
    const names = users
      .filter((u) => u.role === alert.role)
      .map((u) => u.fullName);
    setFilteredNames(names);
    setIsModalOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Unauthorized: Please log in again.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAlerts(token); // 🔥 Refresh alerts after delete
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete alert: " + (err as Error).message);
    }
  };

  const handleSave = async () => {
    if (!formData.type || !formData.role || !formData.fullNames?.length) {
      alert("Please fill all required fields.");
      return;
    }
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Unauthorized: Please log in again.");
      return;
    }
    const isEdit = !!formData.id;
    const url = isEdit ? `${API_URL}/${formData.id}` : API_URL;
    const method = isEdit ? "PUT" : "POST";
    const payload = {
      system: formData.system,
      type: formData.type,
      level: formData.level,
      notification: formData.notification,
      role: formData.role,
      fullName: formData.fullNames[0],
    };
    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save alert.");
      setIsModalOpen(false);
      await fetchAlerts(token); // 🔥 Always refresh from DB after save
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save alert: " + (err as Error).message);
    }
  };

  return (
    <div className="p-6 text-white">
      {/* Category Buttons */}
      <div className="flex space-x-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              selectedCategory === cat
                ? "bg-teal-600 text-white"
                : "bg-slate-700 text-gray-300 hover:bg-slate-600"
            }`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={openAddModal}
          className="ml-auto flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          <FaPlus /> <span>Add Alert</span>
        </button>
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-700 text-teal-400 text-sm uppercase">
              <th className="p-3">Type</th>
              <th className="p-3">Level</th>
              <th className="p-3">Role</th>
              <th className="p-3">User</th>
              <th className="p-3">Notify</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts
              .filter((a) => a.system === selectedCategory)
              .map((alert) => (
                <tr
                  key={alert.id}
                  className="border-b border-slate-600 hover:bg-slate-700 text-sm"
                >
                  <td className="p-3">{alert.type}</td>
                  <td className="p-3">{alert.level}</td>
                  <td className="p-3">{alert.role}</td>
                  <td className="p-3">{alert.fullName}</td>
                  <td className="p-3">{alert.notification.join(", ")}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(alert)}
                      className="text-blue-400 hover:underline"
                    >
                      <FaPen />
                    </button>
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="text-red-400 hover:underline"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="mx-auto my-20 w-full max-w-md bg-slate-800 p-6 rounded-xl"
        overlayClassName="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      >
        <h3 className="text-xl font-bold mb-6">
          {formData.id ? "Edit Alert" : "Add Alert"} - {selectedCategory}
        </h3>
        <div className="space-y-4">
          <input
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            placeholder="Type"
            className="w-full bg-slate-700 text-white px-3 py-2 rounded"
          />
          <select
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            className="w-full bg-slate-700 text-white px-3 py-2 rounded"
          >
            {alertLevels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full bg-slate-700 text-white px-3 py-2 rounded"
          >
            <option value="">Select Role</option>
            {[...new Set(users.map((u) => u.role))].map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {filteredNames.length > 0 && (
            <select
              name="fullName"
              value={formData.fullNames?.[0] || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fullNames: [e.target.value],
                }))
              }
              className="w-full bg-slate-700 text-white px-3 py-2 rounded"
            >
              {filteredNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-4">
            {notifications.map((n) => (
              <label key={n} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={n}
                  checked={formData.notification.includes(n)}
                  onChange={handleNotificationChange}
                />
                <span>{n}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-slate-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-teal-600 text-white px-6 py-2 rounded font-semibold"
          >
            {formData.id ? "Update" : "Save"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AlertHierarchyTab;
