import React, { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

interface AlertFormData {
  system: string;
  type: string;
  level: string;
  notification: string[];
}

const categories = ["WCS", "IT-Service", "WMS"];
const alertLevels = ["Critical", "High", "Medium", "Low"];
const notifications = ["Email", "SMS"];

const AlertHierarchyTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("WCS");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState<AlertFormData>({
    system: "WCS",
    type: "",
    level: "Critical",
    notification: [],
  });

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

  const handleSave = () => {
    console.log("Saved alert:", formData);
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
          onClick={() => setIsModalOpen(true)}
        >
          + Add
        </button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="mx-auto my-20 w-full max-w-md bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl focus:outline-none"
        overlayClassName="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      >
        <h3 className="text-xl font-bold text-white mb-6">
          Add Alert - {selectedCategory}
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
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AlertHierarchyTab;
