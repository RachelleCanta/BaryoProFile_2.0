import React, { useState, useEffect } from "react";
import {
  checkPermission,
  handlePermissionError,
  PERMISSIONS,
} from "../Permission/Permissions";
import "./SystemLogs.css";
import PermissionErrorModal from "../Permission/PermissionErrorModal";
import axiosInstance from "../../axios";
import { toast } from "react-toastify";
import { CustomToast } from "../../utils/CustomToast";
import * as XLSX from "xlsx-js-style";

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("All Activities");
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  // const [selectedDate, setSelectedDate] = useState(() => {
  //   const today = new Date();
  //   const tomorrow = new Date(today);
  //   tomorrow.setDate(tomorrow.getDate() + 1);
  //   return tomorrow.toISOString().split("T")[0];
  // });
  const [selectedDate, setSelectedDate] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const activities = [
    "All Activities",
    "View",
    "Create",
    "Edit",
    "Delete",
    "View",
    "Login",
    "Logout",
    "Download",
  ];

  const getLogs = async () => {
    try {
      const res = await axiosInstance.get("/system-logs");
      console.log(res.data);
      if (res.data) {
        // Transform each log so that log.user is replaced by its username.
        // const transformedLogs = res.data.map((log) => ({
        //   ...log,
        //   user:
        //     typeof log.user === "object" && log.user !== null
        //       ? log.user.username
        //       : log.user,
        // }));
        // console.log("Fetched logs:", transformedLogs);
        // setLogs(transformedLogs);
        setLogs(res.data);
        // localStorage.setItem('systemLogs', JSON.stringify(transformedLogs));
      }
    } catch (error) {
      console.error("Error fetching logs via axios:", error);
      // const storedLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
      // setLogs(storedLogs);
    }
  };

  let filteredLogs = logs.filter((log) => {
    // const user = typeof log.user === "string" ? log.user : "";
    // const action = typeof log.action === "string" ? log.action : "";
    // const module = typeof log.module === "string" ? log.module : "";

    const user = log.user.username;
    const action = log.action;
    const module = log.module;

    const matchesSearch =
      user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesActivity =
      selectedActivity === "All Activities" ||
      action.toUpperCase() === selectedActivity.toUpperCase();

    return matchesSearch && matchesActivity;
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);

    if (user?.role !== "systemadmin") {
      setShowErrorModal(true);
      return;
    }

    getLogs();
  }, []);

  useEffect(() => {
    const fetchFilteredLogs = async () => {
      const res = await axiosInstance.get("/system-logs");
      const allLogs = res.data;

      if (selectedDate) {
        // const filtered = allLogs.filter(
        //   (log) =>
        //     new Date(log.timestamp).toISOString().split("T")[0] === selectedDate
        // );
        const filtered = allLogs.filter(
          (log) =>
            new Date(log.timestamp).toLocaleDateString("en-CA") === selectedDate
        );
        setLogs(filtered);
      } else {
        setLogs(allLogs);
      }
    };

    fetchFilteredLogs();
  }, [selectedDate]);

  const handleDateChange = async (e) => {
    // const date = e.target.value;
    setSelectedDate(e.target.value);
    // // const storedLogs = JSON.parse(localStorage.getItem("systemLogs") || "[]");
    // const returnedLogsFromDB = await axiosInstance.get("/system-logs");

    // let storedLogs = [];

    // storedLogs = returnedLogsFromDB.data;

    // if (date && storedLogs) {
    //   filteredLogs = storedLogs.filter(
    //     (log) => new Date(log.timestamp).toISOString().split("T")[0] === date
    //   );
    //   setLogs(filteredLogs);
    // } else {
    //   setLogs(storedLogs);
    // }
  };

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
    setShowActivityDropdown(false);
  };

  const handleExport = () => {
    if (currentUser?.role !== "systemadmin") {
      setShowErrorModal(true);
      return;
    }

    const logs = filteredLogs.map((log) => ({
      Timestamp: new Date(log.timestamp).toLocaleString(),
      User: log.user.username,
      Action: log.details,
      Module: log.module,
    }));

    // Create worksheet without header
    const worksheet = XLSX.utils.json_to_sheet(logs, { skipHeader: true });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "System Logs");

    const headers = ["Timestamp", "User", "Action", "Module"];

    // Header style
    const headerStyle = {
      fill: { fgColor: { rgb: "1F53DD" } }, // Blue background
      font: { color: { rgb: "FFFFFF" }, bold: true }, // White bold font
      alignment: { horizontal: "center", vertical: "center" },
    };

    const dataStyle = {
      fill: {
        patternType: "solid",
        fgColor: { rgb: "FFF2F2F2" }, // Light gray
      },
      font: {
        color: { rgb: "FF000000" }, // Black
      },
      alignment: {
        horizontal: "left",
        vertical: "center",
      },
    };

    // Manually set headers with styles
    headers.forEach((headerText, colIdx) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      worksheet[cellAddress] = {
        v: headerText,
        t: "s",
        s: headerStyle,
      };
    });

    // Apply styles to data rows
    logs.forEach((row, rowIdx) => {
      headers.forEach((key, colIdx) => {
        const cellAddress = XLSX.utils.encode_cell({
          r: rowIdx + 1,
          c: colIdx,
        });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = dataStyle;
        }
      });
    });

    // Adjust column widths
    const columnWidths = [
      { wch: 30 },
      { wch: 30 },
      { wch: 100 },
      { wch: 30 },
    ];

    // Apply column widths
    worksheet["!cols"] = columnWidths;

    // Export to Excel file
    const wbout = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `system_logs_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("System Activity Logs exported successfully!");
  };

  // const handleExport = () => {
  //   if (currentUser?.role !== "systemadmin") {
  //     setShowErrorModal(true);
  //     return;
  //   }
  //   const csvRows = [];
  //   const headers = ["Timestamp", "User", "Action", "Module"];
  //   csvRows.push(headers.join(","));

  //   filteredLogs.forEach((log) => {
  //     const row = [
  //       new Date(log.timestamp).toLocaleString(),
  //       log.user.username,
  //       log.details,
  //       log.module,
  //     ].map((field) => `"${(field?.toString() || "").replace(/"/g, '""')}"`);
  //     csvRows.push(row.join(","));
  //   });

  //   const csvContent = csvRows.join("\n");
  //   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //   const link = document.createElement("a");
  //   const url = URL.createObjectURL(blob);
  //   link.setAttribute("href", url);
  //   link.setAttribute(
  //     "download",
  //     `system_logs_${new Date().toISOString().split("T")[0]}.csv`
  //   );
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);

  //   toast.success("System Activiy Logs exported successfully!");
  // };

  const handleClearHistory = async () => {
    if (currentUser?.role !== "systemadmin") {
      setShowErrorModal(true);
      return;
    }
    if (
      window.confirm(
        "Are you sure you want to clear all logs? This action cannot be undone."
      )
    ) {
      await axiosInstance.delete("/system-logs/all");
      // localStorage.setItem('systemLogs', '[]');
      setLogs([]);

      toast.success("All System Activiy Logs Were Deleted Successfully!");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showActivityDropdown &&
        !event.target.closest(".activity-dropdown-container")
      ) {
        setShowActivityDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showActivityDropdown]);

  // const showCustomToast = () => {
  //   toast(
  //     <CustomToast
  //       text={"Are You Sure?"}
  //       confirmFunc={() => console.log("WALA LANG")}
  //     />
  //   );
  // };

  return (
    <div className="system-logs-container">
      <div className="system-logs-header">
        <h1>System Activity Logs</h1>
        <div className="header-controls">
          <div className="date-input-container">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="date-picker"
            />
          </div>
          <button onClick={handleExport} className="export-btn">
            Export Logs
          </button>
          <button onClick={handleClearHistory} className="clear-btn">
            Clear History
          </button>
          {/* <button onClick={showCustomToast}>Show Alert Toast</button> */}
        </div>
      </div>

      <div className="search-filter-bar">
        <div className="search-section">
          <span>Activity History</span>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="activity-dropdown-container">
          <button
            className="activity-dropdown-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowActivityDropdown(!showActivityDropdown);
            }}
          >
            {selectedActivity}
            <i className="fas fa-chevron-down"></i>
          </button>
          {showActivityDropdown && (
            <div className="activity-dropdown-menu">
              {activities.map((activity) => (
                <div
                  key={activity}
                  className="activity-dropdown-item"
                  onClick={() => handleActivitySelect(activity)}
                >
                  {activity}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <tr key={index}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.user.username}</td>
                  <td>{log.details}</td>
                  <td>{log.module}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PermissionErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};

export default SystemLogs;
