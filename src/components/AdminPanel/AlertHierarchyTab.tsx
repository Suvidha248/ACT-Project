<<<<<<< HEAD
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";

import { FaPen, FaPlus, FaTrash } from "react-icons/fa";

import { fetchUsers, User } from "../../services/userService";
=======
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { FaTrash, FaPen, FaPlus } from "react-icons/fa";
import { fetchUsers, User } from "../../services/userService";
import {
  fetchAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
} from "../../services/alertService";
>>>>>>> 70895f6 (all fix)

Modal.setAppElement("#root");

interface Alert {
  id?: number;
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
  const [deleteAlertTarget, setDeleteAlertTarget] = useState<Alert | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsData, usersData] = await Promise.all([
          fetchAlerts(),
          fetchUsers(),
        ]);
        setAlerts(alertsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    fetchData();
  }, []);

  const refreshAlerts = async () => {
    try {
      const updatedAlerts = await fetchAlerts();
      setAlerts(updatedAlerts);
    } catch (err) {
      console.error("Failed to refresh alerts", err);
    }
  };

  const openAddModal = () => {
    const defaultRole = users.length > 0 ? users[0].role : "";
    const defaultNames = users
      .filter((u) => u.role === defaultRole)
      .map((u) => u.fullName);

    setFormData({
      system: selectedCategory,
      type: "",
      level: "Critical",
      notification: [],
      role: defaultRole,
      fullNames: defaultNames.length > 0 ? [defaultNames[0]] : [],
    });

    setFilteredNames(defaultNames);
    setIsModalOpen(true);
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
      setFormData((prev) => ({
        ...prev,
        fullNames: names.length > 0 ? [names[0]] : [],
      }));
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

  const handleEdit = (alert: Alert) => {
    const names = users
      .filter((u) => u.role === alert.role)
      .map((u) => u.fullName);

    setFormData({
      ...alert,
      fullNames: alert.fullName ? [alert.fullName] : [],
    });

    setFilteredNames(names);
    setIsModalOpen(true);
  };

  const handleDelete = (alert: Alert) => {
    setDeleteAlertTarget(alert);
  };

  const confirmDelete = async () => {
    if (!deleteAlertTarget?.id) return;
    try {
      await deleteAlert(deleteAlertTarget.id);
      await refreshAlerts();
      setDeleteAlertTarget(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete alert: " + (err as Error).message);
    }
  };

  const cancelDelete = () => {
    setDeleteAlertTarget(null);
  };

  const handleSave = async () => {
    if (!formData.type || !formData.role || !formData.fullNames?.length) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      ...formData,
      fullName: formData.fullNames[0],
    };

    try {
      if (formData.id) {
        await updateAlert(formData.id, payload);
      } else {
        await createAlert(payload);
      }
      setIsModalOpen(false);
      await refreshAlerts();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save alert: " + (err as Error).message);
    }
  };

  return (
    <div className="p-6 text-white">
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
                      onClick={() => handleDelete(alert)}
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

      {/* Edit/Add Modal */}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteAlertTarget}
        onRequestClose={cancelDelete}
        className="mx-auto my-20 w-full max-w-md bg-slate-800 p-6 rounded-xl text-center"
        overlayClassName="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      >
        <h3 className="text-xl font-bold text-red-500 mb-4">Confirm Delete</h3>
        <p className="mb-6 text-slate-300">
          Are you sure you want to delete alert{" "}
          <span className="font-semibold">{deleteAlertTarget?.type}</span>?
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={cancelDelete}
            className="bg-slate-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="bg-red-600 text-white px-6 py-2 rounded font-semibold"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AlertHierarchyTab;
