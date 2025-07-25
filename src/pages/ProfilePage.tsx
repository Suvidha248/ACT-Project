// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/profileService";
import { toast } from "react-toastify";

const ProfilePage: React.FC = () => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        phoneNumber: "",
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="text-white p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">👤 Profile Settings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-2 mt-1 rounded-lg bg-slate-800 text-white border border-slate-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full p-2 mt-1 rounded-lg bg-slate-800 text-white border border-slate-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Department</label>
          <input
            type="text"
            disabled
            value={profile?.department || "N/A"}
            className="w-full p-2 mt-1 rounded-lg bg-slate-700 text-slate-400 border border-slate-600 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Role</label>
          <input
            type="text"
            disabled
            value={profile?.role || "User"}
            className="w-full p-2 mt-1 rounded-lg bg-slate-700 text-slate-400 border border-slate-600 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          className="bg-teal-600 hover:bg-teal-700 px-6 py-2 rounded-md text-white font-semibold transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
