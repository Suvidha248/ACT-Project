import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  fetchUsers,
  editUser,
  deleteUser,
  fetchRoles,
} from "../../services/userService";

interface User {
  id: number;
  fullName: string;
  role: string;
}

Modal.setAppElement("#root");

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableUser, setEditableUser] = useState<User | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedUsers, fetchedRoles] = await Promise.all([
          fetchUsers(),
          fetchRoles(),
        ]);
        setUsers(fetchedUsers);
        setRoles(fetchedRoles);
      } catch (error) {
        console.error(error);
        alert("Failed to load users or roles.");
      }
    };
    fetchData();
  }, []);

  const openEditModal = (user: User) => {
    setEditableUser({
      ...user,
      role: user.role || roles[0] || "", // default to first role if role is empty
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (editableUser) {
      setEditableUser({ ...editableUser, [name]: value });
    }
  };

  const handleSave = async () => {
    if (editableUser) {
      try {
        const updated = await editUser(editableUser);
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u))
        );
        setIsModalOpen(false);
      } catch (error) {
        console.error(error);
        alert("Failed to save user changes.");
      }
    }
  };

  const handleDelete = (user: User) => {
    setDeleteUserTarget(user);
  };

  const confirmDelete = async () => {
    if (deleteUserTarget) {
      try {
        await deleteUser(deleteUserTarget.id);
        setUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id));
        setDeleteUserTarget(null);
      } catch (error) {
        console.error(error);
        alert("Failed to delete user.");
      }
    }
  };

  const cancelDelete = () => {
    setDeleteUserTarget(null);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole ? user.role === selectedRole : true;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name"
          className="p-2 bg-slate-700 text-white rounded w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="p-2 bg-slate-700 text-white rounded"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-700 text-teal-400 text-sm uppercase">
              <th className="p-3">#</th>
              <th className="p-3">Full Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-600 hover:bg-slate-700 text-sm"
                >
                  <td className="p-3">
                    {(currentPage - 1) * usersPerPage + index + 1}
                  </td>
                  <td className="p-3">{user.fullName}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3 space-x-2">
                    <button
                      className="text-blue-400 hover:underline"
                      onClick={() => openEditModal(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-400 hover:underline"
                      onClick={() => handleDelete(user)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-4 text-sm">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-slate-700 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="mt-1 text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-slate-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="mx-auto my-20 w-full max-w-md bg-slate-800 p-6 rounded-xl"
        overlayClassName="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      >
        <h3 className="text-xl font-bold text-white mb-4">Edit User</h3>
        <div className="space-y-4">
          <input
            name="fullName"
            value={editableUser?.fullName || ""}
            onChange={handleInputChange}
            placeholder="Full Name"
            className="w-full bg-slate-700 text-white px-3 py-2 rounded"
          />
          <select
            name="role"
            value={editableUser?.role || ""}
            onChange={handleInputChange}
            className="w-full bg-slate-700 text-white px-3 py-2 rounded"
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
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
            Save
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteUserTarget}
        onRequestClose={cancelDelete}
        className="mx-auto my-20 w-full max-w-md bg-slate-800 p-6 rounded-xl text-center"
        overlayClassName="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      >
        <h3 className="text-xl font-bold text-red-500 mb-4">Confirm Delete</h3>
        <p className="mb-6 text-slate-300">
          Are you sure you want to delete user{" "}
          <span className="font-semibold">{deleteUserTarget?.fullName}</span>?
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

export default UsersTab;
