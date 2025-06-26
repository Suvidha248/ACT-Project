import React, { useState } from "react";
import UsersTab from "./UsersTab";
import AlertHierarchyTab from "./AlertHierarchyTab";
import { useAuth } from "../../context/AuthContext";

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"users" | "alerts">("users");
  const { profile } = useAuth();

  return (
    <div className="p-6 text-white">
      <h2 className="text-3xl font-bold gradient-text mb-4">
        User Management
        {profile?.facilityName ? ` - ${profile.facilityName}` : ""}
      </h2>

      <div className="flex mb-6 w-full rounded-lg overflow-hidden border border-slate-600">
        <button
          className={`w-1/2 py-3 text-lg font-medium transition-all duration-300 ${
            activeTab === "users"
              ? "bg-teal-600 text-white"
              : "bg-slate-700 text-gray-300"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`w-1/2 py-3 text-lg font-medium transition-all duration-300 ${
            activeTab === "alerts"
              ? "bg-teal-600 text-white"
              : "bg-slate-700 text-gray-300"
          }`}
          onClick={() => setActiveTab("alerts")}
        >
          Alert Hierarchy
        </button>
      </div>

      <div>{activeTab === "users" ? <UsersTab /> : <AlertHierarchyTab />}</div>
    </div>
  );
};

export default AdminPanel;
