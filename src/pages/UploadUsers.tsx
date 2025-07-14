// src/pages/UploadUsers.tsx
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";

interface FirestoreUser {
  email: string;
  fullName: string;
  department: string;
  group?: string;
  role?: string;
}

const UploadUsers: React.FC = () => {
  const { profile } = useAuth();
  const [usersData, setUsersData] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const users: FirestoreUser[] = snapshot.docs.map((doc) => doc.data() as FirestoreUser);
      setUsersData(users);
    } catch (err) {
      console.error("Error fetching users from Firestore:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Upload back to Firestore (can be used for transformation/batch update)
  const handleUpload = async () => {
    if (usersData.length === 0) {
      alert("No user data available to upload.");
      return;
    }

    setLoading(true);

    try {
      for (const user of usersData) {
        const email = user.email?.toLowerCase();
        if (!email) continue;

        const userWithDefaults = {
          ...user,
          group: user.group || "GRP_Maintenance",
          role: user.role || "Technician",
        };

        await setDoc(doc(db, "users", email), userWithDefaults);
      }

      alert("✅ Users uploaded (or updated) successfully!");
    } catch (err) {
      console.error("Error uploading users:", err);
      alert("❌ Failed to upload some users.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Users</h2>

      {profile?.role === "Admin" ? (
        <>
          <p className="mb-2 text-gray-700">Fetched {usersData.length} users from Firestore.</p>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Re-upload to Firestore"}
          </button>
        </>
      ) : (
        <p className="text-red-500 font-semibold">
          You do not have permission to upload users.
        </p>
      )}
    </div>
  );
};

export default UploadUsers;
