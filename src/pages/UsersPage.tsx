import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";

// Fixed User type - removed the problematic 'field' property
type User = {
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentRole = profile?.role;

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching users from Firestore...");
        const querySnapshot = await getDocs(collection(db, "users"));
        
        console.log("Query snapshot size:", querySnapshot.size);
        
        const userList: User[] = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          console.log("User document data:", data);
          
          return {
            id: docSnap.id,
            fullName: data.fullName || "",
            email: data.email || "",
            department: data.department || "",
            role: data.role || "",
            group: data.group || "",
          };
        });
        
        console.log("Processed user list:", userList);
        setUsers(userList);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleSave = async () => {
    if (editingUser) {
      try {
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
      } catch (err) {
        console.error("Error updating user:", err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold gradient-text mb-6">👥 Users</h2>
        <div className="text-white text-center">Loading users...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold gradient-text mb-6">👥 Users</h2>
        <div className="text-red-400 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold gradient-text mb-6">👥 Users</h2>
      
      {users.length === 0 ? (
        <div className="text-white text-center">No users found in Firestore.</div>
      ) : (
        <>
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
        </>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 rounded-xl w-full max-w-md bg-slate-800 border border-white/10">
            <h3 className="text-xl font-bold mb-4 text-white">Edit User</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <input
                type="text"
                className="w-full p-2 rounded bg-slate-700 text-white"
                placeholder="Full Name"
                value={editingUser.fullName}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    fullName: e.target.value,
                  })
                }
              />
              <input
                type="email"
                className="w-full p-2 rounded bg-slate-700 text-white"
                placeholder="Email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    email: e.target.value,
                  })
                }
              />
              <input
                type="text"
                className="w-full p-2 rounded bg-slate-700 text-white"
                placeholder="Department"
                value={editingUser.department}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    department: e.target.value,
                  })
                }
              />
              <input
                type="text"
                className="w-full p-2 rounded bg-slate-700 text-white"
                placeholder="Role"
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    role: e.target.value,
                  })
                }
              />
              <input
                type="text"
                className="w-full p-2 rounded bg-slate-700 text-white"
                placeholder="Group"
                value={editingUser.group}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    group: e.target.value,
                  })
                }
              />
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
