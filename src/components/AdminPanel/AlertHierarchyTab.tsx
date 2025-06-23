import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { FaTrash, FaPen } from "react-icons/fa";

Modal.setAppElement("#root");

interface Alert {
  id?: number;
  system: string;
  type: string;
  level: string;
  notification: string[];
}

const categories = ["WCS", "IT-Service", "WMS"];
const alertLevels = ["Critical", "High", "Medium", "Low"];
const notifications = ["Email", "SMS"];

const API_URL = "http://localhost:8080/api/alerts";
const idToken = "your-auth-token-here"; // Replace this with dynamic token if needed

const AlertHierarchyTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("WCS");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [formData, setFormData] = useState<Alert>({
    system: "WCS",
    type: "",
    level: "Critical",
    notification: [],
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .catch((err) => console.error("Error loading alerts", err));
  }, []);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setFormData((prev) => ({ ...prev, system: category }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    });
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (alert: Alert) => {
    setFormData(alert);
    setEditId(alert.id || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = async () => {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API_URL}/${editId}` : API_URL;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(formData),
    });

    const saved = await res.json();

    if (editId) {
      setAlerts((prev) => prev.map((a) => (a.id === editId ? saved : a)));
    } else {
      setAlerts((prev) => [...prev, saved]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 text-white">
      {/* Category buttons */}
      <div className="flex space-x-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`flex-1 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 ${
              selectedCategory === cat
                ? "bg-teal-600 text-white"
                : "bg-slate-700 text-gray-300 hover:bg-slate-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div className="text-right mb-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
          onClick={openAddModal}
        >
          + Add
        </button>
      </div>

      {/* Alerts list for selected category */}
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
                  <strong>Notification:</strong> {alert.notification.join(", ")}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  className="text-blue-400 hover:text-blue-600"
                  onClick={() => handleEdit(alert)}
                >
                  <FaPen />
                </button>
                <button
                  className="text-red-400 hover:text-red-600"
                  onClick={() => handleDelete(alert.id)}
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
        className="mx-auto my-20 w-full max-w-md bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl focus:outline-none"
        overlayClassName="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      >
        <h3 className="text-xl font-bold text-white mb-6">
          {editId ? "Edit" : "Add"} Alert - {selectedCategory}
        </h3>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block mb-1 text-gray-300">System</label>
            <input
              name="system"
              value={formData.system}
              readOnly
              className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Type</label>
            <input
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              placeholder="e.g., Crane"
              className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Alert Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
            >
              {alertLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Notification</label>
            <div className="flex gap-4">
              {notifications.map((n) => (
                <label key={n} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={n}
                    checked={formData.notification.includes(n)}
                    onChange={handleNotificationChange}
                    className="accent-teal-500"
                  />
                  <span>{n}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded font-semibold"
          >
            {editId ? "Update" : "Save"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AlertHierarchyTab;
