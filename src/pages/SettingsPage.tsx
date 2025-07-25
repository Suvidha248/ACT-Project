// src/pages/SettingsPage.tsx
import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/profileService";
import { toast } from "react-toastify";

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    remoteWork: false,
    quietMode: false,
    notificationsEnabled: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        setSettings({
          remoteWork: profile.remoteWork || false,
          quietMode: profile.quietMode || false,
          notificationsEnabled: profile.notificationsEnabled || false,
        });
      } catch {
        toast.error("Failed to load settings.");
      }
    })();
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(settings);
      toast.success("Settings updated.");
    } catch {
      toast.error("Failed to update settings.");
    }
  };

  return (
    <div className="text-white p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">⚙️ User Settings</h2>

      {[
        { key: "remoteWork", label: "Remote Work" },
        { key: "quietMode", label: "Quiet Mode" },
        { key: "notificationsEnabled", label: "Enable Notifications" },
      ].map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between mb-4">
          <span className="text-lg">{label}</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings[key as keyof typeof settings]}
              onChange={() => handleToggle(key as keyof typeof settings)}
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-teal-500 transition-all"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-full transition-transform" />
          </label>
        </div>
      ))}

      <div className="mt-6">
        <button
          onClick={handleSave}
          className="bg-teal-600 hover:bg-teal-700 px-6 py-2 rounded-md text-white font-semibold transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
