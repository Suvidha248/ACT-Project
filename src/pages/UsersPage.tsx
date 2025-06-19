import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

type User = {
  field: string | number | readonly string[] | undefined;
  fullName: string;
  email: string;
  department: string;
  role: string;
  group: string;
  id: string;
};

const USERS_PER_PAGE = 10;

const UsersPage: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const currentRole = profile?.role;
  // const currenUser = user

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList: User[] = querySnapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Omit<User, "id">),
        id: docSnap.id,
      }));
      setUsers(userList);
    };
    fetchUsers();
  }, []);

  const handleSave = async () => {
    if (editingUser) {
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        fullName: editingUser.fullName,
        email: editingUser.email,
        department: editingUser.department,
        role: editingUser.role,
        group: editingUser.group,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? editingUser : u))
      );
      setEditingUser(null);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold gradient-text mb-6">👥 Users</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedUsers.map((user) => (
          <div
            key={user.id}
            className="glass-card p-5 rounded-xl shadow-md border border-white/10 backdrop-blur-md bg-gradient-to-br from-slate-800/30 to-slate-900/20 hover:scale-[1.01] transition-all"
          >
            <div className="mb-3">
              <p className="text-xl font-semibold text-white">
                {user.fullName}
              </p>
              <p className="text-sm text-slate-300">{user.email}</p>
            </div>
            <div className="text-sm text-slate-400 space-y-1">
              <p>
                <strong>Department:</strong> {user.department}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <p>
                <strong>Group:</strong> {user.group}
              </p>
            </div>

            {currentRole === "Admin" && (
              <div className="flex space-x-3 mt-4">
                <button
                  className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-sm"
                  onClick={() => setEditingUser(user)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded bg-slate-700 text-white disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-white font-medium mt-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded bg-slate-700 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-xl w-full max-w-md bg-slate-800 border border-white/10">
            <h3 className="text-xl font-bold mb-4 text-white">Edit User</h3>
            <div className="space-y-3 text-sm text-slate-300">
              {["fullName", "email", "department", "role", "group"].map(
                (field) => (
                  <input
                    key={field}
                    type="text"
                    className="w-full p-2 rounded bg-slate-700 text-white"
                    placeholder={field}
                    value={editingUser?.field}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        [field]: e.target.value,
                      })
                    }
                  />
                )
              )}
            </div>
            <div className="flex justify-end mt-5 space-x-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
