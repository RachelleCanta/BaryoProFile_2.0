// src/components/Dashboard.js
import React, { useState } from "react";
import CertificateManager from "./CertificateManager/CertificateManager";
import FamilyForm from "./FamilyForm/FamilyForm";
import ResidentList from "./ResidentList/ResidentList";
import ResidentForm from "./ResidentList/ResidentForm";
import UserManagement from "./UserManagement/UserManagement";
import AnalyticsDashboard from "./VisualReports/AnalyticsDashboard";
import SystemLogs from "./SystemLogs/SystemLogs";
import { checkPermission, PERMISSIONS } from "./Permission/Permissions";
import PermissionErrorModal from "./Permission/PermissionErrorModal";
import "../styles/dashboard.css";
import "../styles/dashboard-media-query.css";
import axios from "axios";
import axiosInstance from "../axios";
import { ACTIONS } from "../utils/auditLogger";
import { toast } from "react-toastify";
import { MAIN_API_LINK } from "../utils/API";
import { useEffect } from "react";

function Dashboard({ currentUser, onLogout }) {
  const [activeView, setActiveView] = useState("welcome");
  const [editingResident, setEditingResident] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [width, setWidth] = useState(window.innerWidth);
  const [showTopBar, setShowTopBar] = useState(true);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    if (window.innerWidth <= 700) {
      setShowTopBar(false);
    } else {
      setShowTopBar(true);
    }

    console.log(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width]);

  const handlePermissionError = () => {
    setShowErrorModal(true);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleEditResident = (resident) => {
    if (!checkPermission(currentUser, PERMISSIONS.MANAGE)) {
      handlePermissionError();
      return;
    }
    setEditingResident(resident);
    setIsEditing(true);
    setActiveView("edit");
  };

  const handleViewChange = (view, requiredPermission) => {
    // ? this condition is buggy and seems to not wokr on all kinds of users: checkPermission(currentUser, PERMISSIONS.VIEW)
    // if (requiredPermission && !checkPermission(currentUser, PERMISSIONS.VIEW)) {
    //   handlePermissionError();
    //   console.log(checkPermission(currentUser, PERMISSIONS.VIEW));
    //   return;
    // }
    setActiveView(view);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditingResident(null);
    setActiveView("list");
    localStorage.removeItem("editingResident");
    localStorage.removeItem("editingIndex");
  };

  // ! SAVE UPDATED RESIDENT
  const handleEditSave = async (updatedData) => {
    if (!checkPermission(currentUser, PERMISSIONS.MANAGE)) {
      handlePermissionError();
      return;
    }

    const editingIndex = parseInt(localStorage.getItem("editingIndex"));
    const editingID = localStorage.getItem("editingID");

    if (!isNaN(editingIndex) && editingIndex >= 0) {
      try {
        let url = "http://localhost:8080/api/residents";

        // ! MODIFIED FOR REGISTERED VOTER
        // const modifiedData = {
        //   ...updatedData,
        //   spouseIsRegisteredVoter:
        //     updatedData.spouseIsRegisteredVoter === "Registered",
        //   familyMembers: updatedData.familyMembers.map((member) => ({
        //     ...member,
        //     isRegisteredVoter: member.isRegisteredVoter === "Registered",
        //   })),
        //   additionalInfos: updatedData.additionalInfos.map((info) => ({
        //     ...info,
        //     isRegisteredVoter: info.isRegisteredVoter === "Registered",
        //   })),
        // };
        // let response = await axios.put(
        //   `${MAIN_API_LINK}/residents/${editingID}`,
        //   modifiedData
        // );

        let response = await axios.put(
          `${MAIN_API_LINK}/residents/${editingID}`,
          updatedData
        );

        if (response.data.success === true) {
          toast.success("Information updated successfully");

          await axiosInstance.post("/system-logs", {
            action: ACTIONS.EDIT,
            module: "Resident List",
            user: currentUser.id,
            details: `User ${currentUser.username} updated resident information: ${updatedData.headFirstName} ${updatedData.headLastName}`,
          });
        }
      } catch (error) {
        toast.warning("PLEASE FILL UP ALL THE REQUIRED FIELDS!");
        // alert(error.response.data.error);
        console.log(error.response.data);
      }
    }

    setIsEditing(false);
    setEditingResident(null);
    setActiveView("list");
  };

  const handleDeleteResident = async (index) => {
    if (!checkPermission(currentUser, PERMISSIONS.DELETE)) {
      handlePermissionError();
      return;
    }
    if (window.confirm("Are you sure you want to delete this record?")) {
      const deletingID = localStorage.getItem("deletingID");
      try {
        let url = "http://localhost:8080/api/residents";
        let response = await axios.delete(
          `${MAIN_API_LINK}/residents/${deletingID}`
        );
        if (response.data.success === true) {
          toast.success("Information deleted successfully");

          await axiosInstance.post("/system-logs", {
            action: ACTIONS.EDIT,
            module: "Resident List",
            user: currentUser.id,
            details: `User ${currentUser.username} deleted a resident information: ${response.data.deletedResident.headFirstName} ${response.data.deletedResident.headLastName}`,
          });

          if (activeView === "list") {
            setActiveView("welcome");
            setTimeout(() => setActiveView("list"), 0);
          }
        }
      } catch (error) {
        toast.error(error.response.data.error);
        console.log(error.response.data);
      }
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "input":
        return (
          <FamilyForm
            onBack={() => setActiveView("welcome")}
            editingResident={editingResident}
          />
        );
      case "list":
        return (
          <ResidentList
            onBack={() => setActiveView("welcome")}
            onEditClick={handleEditResident}
            onDeleteClick={handleDeleteResident}
            currentUser={currentUser}
          />
        );
      case "edit":
        return (
          <ResidentForm onBack={handleEditCancel} onSave={handleEditSave} />
        );
      case "certificates":
        return <CertificateManager onBack={() => setActiveView("welcome")} />;
      case "userManagement":
        return <UserManagement onBack={() => setActiveView("welcome")} />;
      case "reports":
        return <AnalyticsDashboard />;
      case "auditLog":
        return <SystemLogs onBack={() => setActiveView("welcome")} />;
      default:
        return (
          <div className="welcome-section">
            <h1>
              Welcome to BaryoProfile System, <br></br>A Web-Based Profiling
              System with Data Analytics for Barangay Darasa
            </h1>
            <p className="logo-caption">
              "Streamlining Barangay Records for Efficient Data Management"
            </p>
            <p>Select an option from the menu to get started</p>
            <div className="logo-section">
              <div className="logo-row">
                <div className="brgy-logo2-container">
                  <img
                    src="/images/tanauan-logo.png"
                    alt="Tanauan Logo"
                    className="logo-image"
                  />
                </div>
                <div className="brgy-logo-container">
                  <img
                    src="/images/darasa-logo.png"
                    alt="Barangay Darasa Logo"
                    className="logo-image"
                  />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="menu-container">
      <div className="dashboard-navbar">
        {showTopBar && (
          <div className="navbar-brand">
            <img
              src="/images/system-logo.png"
              alt="System Logo"
              className="navbar-logo"
              style={{ height: "80px", marginRight: "20px" }}
            />
            <span>Profiling System</span>
          </div>
        )}
        {showTopBar && (
          <>
            <div className="navbar-actions">
              <div className="user-info">
                <i className="fas fa-user-circle"></i>
                <span>{currentUser.username}</span>
              </div>
              <button onClick={onLogout} className="logout-btn">
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
              <button
                className="top-bar"
                onClick={() => setShowTopBar((prev) => !prev)}
              >
                |||
              </button>
            </div>
          </>
        )}
        {!showTopBar && (
          <button
            className="top-bar"
            onClick={() => setShowTopBar((prev) => !prev)}
          >
            |||
          </button>
        )}
      </div>

      <div className="dashboard-content">
        <button
          className={`sidebar-toggle ${isSidebarCollapsed ? "collapsed" : ""}`}
          onClick={toggleSidebar}
        >
          <i
            className={`fas fa-chevron-${
              isSidebarCollapsed ? "right" : "left"
            }`}
          ></i>
        </button>

        <div
          className={`dashboard-sidebar ${
            isSidebarCollapsed ? "collapsed" : ""
          }`}
        >
          <div className="sidebar-section">
            <img
              src="/images/darasa-logo.png"
              alt="barangay Logo"
              className="sidebar-logo"
            />
            <h3>Main Menu</h3>
            {checkPermission(currentUser, PERMISSIONS.ADD) && (
              <button
                onClick={() => handleViewChange("input", PERMISSIONS.ADD)}
                className={`sidebar-btn ${
                  activeView === "input" ? "active" : ""
                }`}
              >
                <i className="fas fa-user-plus"></i>
                Add Resident
              </button>
            )}
            {(checkPermission(currentUser, PERMISSIONS.MANAGE) ||
              checkPermission(currentUser, PERMISSIONS.VIEW)) && (
              <button
                onClick={() => handleViewChange("list", PERMISSIONS.MANAGE)}
                className={`sidebar-btn ${
                  activeView === "list" ? "active" : ""
                }`}
              >
                <i className="fas fa-list"></i>
                {currentUser.role === "user"
                  ? "Your Information"
                  : "Resident List"}
              </button>
            )}
            {checkPermission(currentUser, PERMISSIONS.REPORTS) && (
              <button
                onClick={() => handleViewChange("reports", PERMISSIONS.REPORTS)}
                className={`sidebar-btn ${
                  activeView === "reports" ? "active" : ""
                }`}
              >
                <i className="fas fa-chart-line"></i>
                Reports
              </button>
            )}
            {checkPermission(currentUser, PERMISSIONS.CERTIFICATES) && (
              <button
                onClick={() =>
                  handleViewChange("certificates", PERMISSIONS.CERTIFICATES)
                }
                className={`sidebar-btn ${
                  activeView === "certificates" ? "active" : ""
                }`}
              >
                <i className="fas fa-file-alt"></i>
                Barangay Certificates
              </button>
            )}

            {currentUser.role === "systemadmin" && (
              <div className="admin-controls">
                <h3>Admin Controls</h3>
                <button
                  onClick={() => handleViewChange("userManagement")}
                  className={`sidebar-btn admin-only ${
                    activeView === "userManagement" ? "active" : ""
                  }`}
                >
                  <i className="fas fa-users-cog"></i>
                  Users
                </button>
                <button
                  onClick={() => handleViewChange("auditLog")}
                  className={`sidebar-btn admin-only ${
                    activeView === "auditLog" ? "active" : ""
                  }`}
                >
                  <i className="fas fa-history"></i>
                  Activity Log
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          className={`dashboard-main ${isSidebarCollapsed ? "expanded" : ""}`}
        >
          {renderContent()}
        </div>
      </div>

      <PermissionErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
}

export default Dashboard;