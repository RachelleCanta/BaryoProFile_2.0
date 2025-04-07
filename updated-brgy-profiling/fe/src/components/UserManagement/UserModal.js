// UserModal.js
import React, { useState, useEffect, useContext } from "react";
import "../../styles/UserModal.css";
import { PERMISSIONS } from "../Permission/Permissions";
import { UserContext } from "../../contexts/userContext";
import axios from "axios";
import { toast } from "react-toastify";

const UserModal = ({
  showModal,
  editingUser,
  onSubmit,
  onClose,
  isAnAdmin,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    permissions: [],
    linkedResident: "",
  });

  const { currentUser } = useContext(UserContext);

  const [residents, setResidents] = useState([]);

  const fetchResidents = async () => {
    try {
      let response = await axios.get(`http://localhost:8080/api/residents`);

      let fetchedResidents = response.data.data;
      console.log(fetchedResidents);

      // * normalize the data
      const normalizedResidents = fetchedResidents.map((resident) => {
        if (resident.additionalInfo && !resident.additionalInfos) {
          resident.additionalInfos = resident.additionalInfo;
          delete resident.additionalInfo;
        }

        if (!resident.additionalInfos) {
          resident.additionalInfos = [];
        }

        return resident;
      });

      setResidents(normalizedResidents);
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        username: editingUser.username || "",
        email: editingUser.email || "",
        password: "",
        role: editingUser.role || "",
        permissions: editingUser.permissions || [], // Make sure this is set correctly
        linkedResident: editingUser.linkedResident, // Make sure this is set correctly
      });
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "",
        editorType: [],
        permissions: [],
        linkedResident: "",
      });
    }
  }, [editingUser, showModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      permissions:
        name === "role"
          ? value === "viewer"
            ? [PERMISSIONS.VIEW]
            : []
          : prev.permissions,
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData((prev) => {
      let newPermissions;
      if (prev.permissions.includes(permission)) {
        newPermissions = prev.permissions.filter((p) => p !== permission);
      } else {
        newPermissions = [...prev.permissions, permission];
      }
      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let submissionData = {};

    if (!isAnAdmin) {
      let editorTypes = [];

      if (formData.role === "user") {
        // For viewers, always use "view_only"
        editorTypes = ["view_only"];
      } else if (formData.role === "staff") {
        // For editors, ensure at least one permission is selected
        if (formData.permissions.length === 0) {
          toast.warning("Please select at least one permission for Editor role");
          return;
        } else {
          // Map each selected permission to a corresponding editor type
          editorTypes = formData.permissions
            .map((permission) => {
              switch (permission) {
                case PERMISSIONS.ADD:
                  return "add_only";
                case PERMISSIONS.MANAGE:
                  return "view_and_manage_records";
                case PERMISSIONS.REPORTS:
                  return "view_reports_and_analytics";
                case PERMISSIONS.CERTIFICATES:
                  return "manage_certificates";
                default:
                  return "";
              }
            })
            .filter(Boolean); // Remove any empty strings if any permission doesn't match
        }
      }

      submissionData = {
        ...formData,
        // Replace permissions with an array of editorType(s)
        status: "pending",
        editorType: editorTypes,
      };
    } else {
      // * IF YOU ARE EDITING AN ADMIN ACCOUNT
      submissionData = {
        ...formData,
      };
    }

    onSubmit(submissionData);
  };

  const renderPermissionsSection = () => {
    if (formData.role === "viewer") {
      return (
        <div className="permissions-section">
          <h3>Role Permissions</h3>
          <div className="permission-item">
            <span className="permission-check">✓</span>
            <span>{PERMISSIONS.VIEW}</span>
          </div>
        </div>
      );
    }

    if (formData.role === "staff") {
      const availablePermissions = [
        PERMISSIONS.ADD, // 'Add Records'
        PERMISSIONS.MANAGE, // 'View & Manage Records'
        PERMISSIONS.CERTIFICATES, // 'Manage Certificates'
        PERMISSIONS.REPORTS, // 'View Reports & Analytics'
      ];

      return (
        <div className="permissions-section">
          <h3>Select Permissions</h3>
          <div className="checkbox-group">
            {availablePermissions.map((permission) => (
              <div key={permission} className="permission-item">
                <input
                  type="checkbox"
                  checked={formData.permissions.includes(permission)}
                  onChange={() => handlePermissionChange(permission)}
                />
                <span>{permission}</span>
              </div>
            ))}
          </div>
          {formData.permissions.length === 0 && (
            <p className="permission-warning">
              Please select at least one permission
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  if (!showModal) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{editingUser ? "Edit User" : "Add New User"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Password {editingUser && "(Leave blank to keep current)"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!editingUser}
            />
          </div>

          {isAnAdmin !== true ? (
            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Role</option>
                <option value="user">Viewer (View Only)</option>
                <option value="staff">Editor</option>
              </select>
            </div>
          ) : (
            ""
          )}

          {formData.role === "user" && (
            <div className="form-group">
              <label>Linked Resident to User</label>
              <select
                name="linkedResident"
                value={formData.linkedResident}
                onChange={handleInputChange}
                required
              >
                <option value="">
                  Resident Head and Household No. linked On This User
                </option>
                {residents.map((resident, key) => (
                  <option
                    value={resident._id}
                    key={key}
                    selected={resident._id === formData.linkedResident}
                  >
                    {resident.headFirstName} {resident.headMiddleName}{" "}
                    {resident.headLastName} ({resident._id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {renderPermissionsSection()}

          <div className="modal-buttons">
            <button type="submit">
              {editingUser ? "Update User" : "Add User"}
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
