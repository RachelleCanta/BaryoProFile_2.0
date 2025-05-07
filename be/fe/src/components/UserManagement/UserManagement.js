// UserManagement.js
import React, { useState, useEffect, useContext } from "react";
import UserModal from "./UserModal";
import { PERMISSIONS } from "../Permission/Permissions";
import "./UserManagement.css";
import axiosInstance from "../../axios";
import { UserContext } from "../../contexts/userContext.js";
import { toast } from "react-toastify";

const UserManagement = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isAnAdmin, setIsAnAdmin] = useState(false);

  const { currentUser, setCurrentUser } = useContext(UserContext);

  const getUsers = async () => {
    try {
      const getUserRes = await axiosInstance.get("/users");
      if (getUserRes.data.success) {
        const users = getUserRes.data.users
          // .filter(user => user.role !== 'systemadmin') // Exclude systemadmin users
          .map((user) => ({
            ...user,
            permissions: Array.isArray(user.permissions)
              ? user.permissions
              : [], // Ensure permissions are always an array
          }));
        setUsers(users);
        console.log(users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getUsers();
    // try {
    //     const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
    //     // Remove any duplicate usernames
    //     const uniqueUsers = savedUsers.reduce((acc, current) => {
    //         const x = acc.find(item => item.username === current.username);
    //         if (!x) {
    //             return acc.concat([current]);
    //         }
    //         return acc;
    //     }, []);

    //     setUsers(uniqueUsers);
    //     // Update storage with clean data
    //     localStorage.setItem('users', JSON.stringify(uniqueUsers));
    // } catch (error) {
    //     console.error('Error loading users:', error);
    //     setUsers([]);
    // }
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = async (user) => {
    // Prevent editing system admin if current user isn't admin
    console.log("USER EDIT", user);
    if (user.role === "systemadmin") {
      if (
        currentUser.role === "systemadmin" &&
        currentUser.role === user.role &&
        currentUser.id === user._id
      ) {
        setIsAnAdmin(true);
        setEditingUser(user);
        setShowModal(true);
      } else {
        toast.error(
          "System administrator account can only be edited by the same administrator account"
        );
        return;
      }
    } else {
      await axiosInstance.post("/system-logs", {
        action: "View",
        module: "User Management",
        user: JSON.parse(localStorage.getItem("userId") || '""'), // Ensures proper formatting
        details: `User ${currentUser.username} opened ${user.username} information for editing.`,
      });
      setEditingUser(user);
      setShowModal(true);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      // Get the user we're trying to delete
      console.log("Deleting user with ID:", userId); // Debugging log

      if (!userId) {
        toast.error("Invalid user ID. Cannot delete user.");
        return;
      }
      const userToDelete = users.find((user) => user._id === userId);
      if (!userToDelete) return; // If user not found, do nothing

      // Make sure we're not deleting system admin
      if (userToDelete.role === "systemadmin") {
        toast.error("Cannot delete system administrator account");
        return;
      }

      const deletedUser = await axiosInstance.delete("/users/" + userId);
      if (deletedUser.data.success) {
        await axiosInstance.post("/system-logs", {
          action: "Delete",
          module: "User Management",
          user: JSON.parse(localStorage.getItem("userId") || '""'), // Ensures proper formatting
          details: `User with ID of ${userId} has been deleted!`,
        });

        toast.success("User deleted successfully");
      }

      const updatedUsers = users.filter((user) => user._id !== userId);
      setUsers(updatedUsers);
    }
  };

  const formatPermissions = (permissions) => {
    if (!permissions || permissions.length === 0) return "None";
    return permissions.join(", "); // Remove the sort since we want to keep the order as selected
  };

  const handleApproveUser = async (userId) => {
    try {
      const updatedUser = await axiosInstance.put(`/users/status/${userId}`, {
        status: "active",
      });
      if (updatedUser.data.success) {
        await axiosInstance.post("/system-logs", {
          action: "Edit",
          module: "User Management",
          user: JSON.parse(localStorage.getItem("userId") || '""'), // Ensures proper formatting
          details: `User with ID of ${userId} status' has been approved!`,
        });
        await getUsers();
        toast.success("User has been successfully approved");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("An error occured. Please try again later...");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      // Check for duplicate username (excluding the editing user)
      const isDuplicateUsername = users.some(
        (user) =>
          user.username === formData.username &&
          user._id !== (editingUser?._id || "")
      );

      if (isDuplicateUsername) {
        toast.warning("Username already exists. Please choose a different username.");
        return;
      }

      let response;
      let updatedUsers;

      // Ensure editorType is an array based on selected permissions
      const editorTypes = formData.permissions
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
        .filter(Boolean); // Remove empty strings

      const submissionData = {
        ...formData,
        status: isAnAdmin ? "active" : "pending", // Set default status
      };

      if (!isAnAdmin) {
        submissionData.editorType = editorTypes; // Assign mapped editorType
      }

      if (editingUser) {
        // Update existing user
        response = await axiosInstance.put(
          `/users/${editingUser._id}`,
          submissionData
        );
        await axiosInstance.post("/system-logs", {
          action: "Edit",
          module: "User Management",
          user: JSON.parse(localStorage.getItem("userId") || '""'), // Ensures proper formatting
          details: `User ${formData.username} profile has updated`,
        });
        toast.success(`User ${formData.username} profile has updated`);
      } else {
        // Create a new user
        response = await axiosInstance.post("/users", submissionData);
        await axiosInstance.post("/system-logs", {
          action: "Create",
          module: "User Management",
          user: JSON.parse(localStorage.getItem("userId") || '""'), // Ensures proper formatting
          details: `User ${formData.username} was created`,
        });
        toast.success(`User ${formData.username} was created`);
        
      }

      if (!response || !response.data.success) {
        toast.error("Error saving user. Please try again.");
        return;
      }

      // Fetch the updated user list after saving
      // const getUserRes = await axiosInstance.get("/users");
      // if (getUserRes.data.success) {
      //   updatedUsers = getUserRes.data.users
      //     .filter((user) => user.role !== "systemadmin") // Exclude systemadmin users
      //     .map((user) => ({
      //       ...user,
      //       permissions: Array.isArray(user.permissions)
      //         ? user.permissions
      //         : [], // Ensure permissions is always an array
      //     }));

      //   setUsers(updatedUsers);
      //   if (isAnAdmin) {
      //     setCurrentUser();
      //   }
      //   // localStorage.setItem("users", JSON.stringify(updatedUsers));
      // }

      await getUsers();

      console.log(submissionData);
      if (isAnAdmin) {
        setCurrentUser({
          ...submissionData,
          editorType: currentUser.editorType,
          role: currentUser.role,
          id: currentUser.id,
        });
      }

      setShowModal(false);
      setEditingUser(null);
      setIsAnAdmin(false);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="user-management-container">
      <h1>User Management</h1>

      <button onClick={onBack} className="back-btn">
        Back to Menu
      </button>

      <button onClick={handleAddUser} className="add-user-btn">
        Add New User
      </button>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <div className="permission-badges">
                    {formatPermissions(user.permissions)}
                  </div>
                </td>
                <td>
                  <div className="actions">
                    {user.status === "pending" && (
                      <button
                        onClick={() => handleApproveUser(user._id)}
                        className="approve-btn"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleEditUser(user)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    {user.role !== "systemadmin" && (
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal
        showModal={showModal}
        editingUser={editingUser}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
        }}
        isAnAdmin={isAnAdmin}
      />
    </div>
  );
};

export default UserManagement;
