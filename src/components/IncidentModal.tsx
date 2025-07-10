import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { fetchUsers } from "../services/userService";
import { Incident, User } from "../types";

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (incidentData: Incident) => void;
  initialData?: Incident;
}

const IncidentModal: React.FC<IncidentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState<string>(initialData?.title || "");
  const [description, setDescription] = useState<string>(
    initialData?.description || ""
  );
  const [assignedTo, setAssignedTo] = useState<User | undefined>(
    initialData?.assignedTo
  );
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const data = await fetchUsers();
      setUsers(data);
    };
    loadUsers();
  }, []);

  const handleSubmit = () => {
    const newIncident: Incident = {
      ...initialData!,
      title,
      description,
      assignedTo,
    };
    onSave(newIncident);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Incident Modal"
    >
      <h2>{initialData ? "Edit Incident" : "Add Incident"}</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-field"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="textarea-field"
      />

      <select
        value={assignedTo?.id || ""}
        onChange={(e) =>
          setAssignedTo(
            users.find((user) => user.id === e.target.value) || undefined
          )
        }
        className="select-field"
      >
        <option value="">Select User</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      <button onClick={handleSubmit} className="save-button">
        Save
      </button>
      <button onClick={onClose} className="cancel-button">
        Cancel
      </button>
    </Modal>
  );
};

export default IncidentModal;
