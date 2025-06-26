import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { FaTrash, FaPen } from "react-icons/fa";
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
const hardcodedToken = "your_hardcoded_jwt_token_here";

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
    fetchAlerts();
    fetchUsers().then(setUsers).catch(console.error);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${hardcodedToken}` },
      });
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
        .filter((user) => user.role === value)
        .map((user) => user.fullName);
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
      .filter((user) => user.role === alert.role)
      .map((user) => user.fullName);
    setFilteredNames(names);
    setIsModalOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${hardcodedToken}` },
    });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = async () => {
    if (!formData.type || !formData.role || !formData.fullNames?.length) {
      alert("Please fill all required fields.");
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${hardcodedToken}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const saved = text ? JSON.parse(text) : null;

      if (!res.ok) {
        console.error("Server error:", saved);
        throw new Error(saved?.error || "Unknown server error");
      }

      setAlerts((prev) =>
        isEdit
          ? prev.map((a) => (a.id === saved.id ? saved : a))
          : [...prev, saved]
      );

      setIsModalOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Save failed", error.message);
      alert("Failed to save alert: " + error.message);
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
                : "bg-slate-700 text-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div className="text-right mb-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          onClick={openAddModal}
        >
          + Add
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts
          .filter((a) => a.system === selectedCategory)
          .map((alert) => (
            <div
              key={alert.id}
              className="bg-slate-700 p-4 rounded flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>Type:</strong> {alert.type}
                </p>
                <p>
                  <strong>Level:</strong> {alert.level}
                </p>
                <p>
                  <strong>Role:</strong> {alert.role}
                </p>
                <p>
                  <strong>User:</strong> {alert.fullName}
                </p>
                <p>
                  <strong>Notify:</strong> {alert.notification.join(", ")}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleEdit(alert)}
                  className="text-blue-400"
                >
                  <FaPen />
                </button>
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="text-red-400"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="mx-auto my-20 w-full max-w-md bg-slate-800 p-6 rounded-xl"
        overlayClassName="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      >
        <h3 className="text-xl font-bold text-white mb-6">
          {formData.id ? "Edit" : "Add"} Alert - {selectedCategory}
        </h3>

        <div className="space-y-4">
          <input
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            placeholder={
              selectedCategory === "WES"
                ? "e.g. Crane"
                : selectedCategory === "IT-Service"
                ? "e.g. Server"
                : "e.g. Conveyor"
            }
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

          <div className="flex gap-4 mt-2">
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
