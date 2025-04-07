import React, { useState, useEffect, useContext } from "react";
import Landing from "./components/Landing";
import NewLanding from "./components/NewLanding";
import Dashboard from "./components/Dashboard";
import ResidentForm from "./components/ResidentList/ResidentForm";
import SystemLogs from "./components/SystemLogs/SystemLogs";
import "./styles/styles.css";
import { logResidentActivity, ACTIONS } from "./utils/auditLogger";
import axiosInstance from "./axios";
import { UserContext } from "./contexts/userContext";
import { toast } from "react-toastify";

function App() {
  const [currentView, setCurrentView] = useState("landing");
  // const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [residents, setResidents] = useState([]);
  const { currentUser, setCurrentUser } = useContext(UserContext);

  useEffect(() => {
    const savedUser = currentUser;
    const savedResidents = localStorage.getItem("familyMembers");

    if (savedUser) {
      console.log(savedUser);
      setCurrentView("dashboard");
    }

    if (savedResidents) {
      setResidents(JSON.parse(savedResidents));
    }
  }, []);

  const handleLogout = async () => {
    if (currentUser) {
      // logResidentActivity(
      //   currentUser.username,
      //   ACTIONS.LOGOUT,
      //   "User logged out",
      //   { module: "Authentication" }
      // );
      await axiosInstance.post("/system-logs", {
        action: "Logout",
        module: "Authentication - Logout",
        user: JSON.parse(localStorage.getItem("userId") || '""'), // Ensures proper formatting
        details: `User ${currentUser.username} has logged out`,
      });
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
      setCurrentView("landing");
      toast.success("Logged Out Successfully!");
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentView("dashboard");
    // // Log the login action
    // logResidentActivity(user.username, ACTIONS.LOGIN, "User logged in", {
    //   module: "Authentication",
    // });
  };

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    localStorage.removeItem("editingResident");
    localStorage.removeItem("editingIndex");
  };

  const handleEditSave = (updatedData) => {
    const updatedResidents = [...residents];
    const editingIndex = parseInt(localStorage.getItem("editingIndex"));

    if (
      !isNaN(editingIndex) &&
      editingIndex >= 0 &&
      editingIndex < updatedResidents.length
    ) {
      updatedResidents[editingIndex] = updatedData;
      localStorage.setItem("familyMembers", JSON.stringify(updatedResidents));
      setResidents(updatedResidents);
      localStorage.removeItem("editingResident");
      localStorage.removeItem("editingIndex");
    }

    setIsEditing(false);
  };

  const renderView = () => {
    switch (currentView) {
      case "landing":
        // return <Landing onLogin={handleLogin} />;
        return <NewLanding onLogin={handleLogin} />;

      case "dashboard":
        return !isEditing ? (
          <Dashboard
            currentUser={currentUser}
            onLogout={handleLogout}
            onEditStart={handleEditStart}
            onNavigate={setCurrentView}
          />
        ) : (
          <ResidentForm onBack={handleEditCancel} onSave={handleEditSave} />
        );

      case "systemLogs":
        return <SystemLogs onBack={() => setCurrentView("dashboard")} />;

      default:
        // return <Landing onLogin={handleLogin} />;
        return <NewLanding onLogin={handleLogin} />;
    }
  };

  return <div className="app">{renderView()}</div>;
}

export default App;
