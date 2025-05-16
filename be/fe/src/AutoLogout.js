import { useEffect, useRef } from "react";
import axios from "axios";
import { MAIN_API_LINK } from "./utils/API";

const TIMEOUT_MINUTES = 10;

// const AutoLogout = () => {
//   useEffect(() => {
//     const currentUser = JSON.parse(localStorage.getItem("currentUser"));

//     if (currentUser) {
//       const logoutTimer = setTimeout(() => {
//         localStorage.removeItem("currentUser");
//         window.location.href = "/login";
//         alert("Session expired. You have been logged out.");
//       }, TIMEOUT_MINUTES * 60 * 1000); // * 10 minutes

//       return () => clearTimeout(logoutTimer); // * Clear timer on unmount
//     }
//   }, []);

//   return null;
// };

// const AutoLogout = () => {
//   useEffect(() => {
//     const currentUser = JSON.parse(localStorage.getItem("currentUser"));
//     if (!currentUser) return;

//     const checkInactivity = async () => {
//       try {
//         console.log("CHECKING!");
//         const res = await axios.get(
//           `${MAIN_API_LINK}/system-logs?username=${currentUser.username}`
//         );
//         const logs = res.data;

//         if (!logs || logs.length === 0) return;

//         const latestActivity = new Date(logs[0].timestamp);
//         const now = new Date();

//         const diffInMs = now - latestActivity;
//         const diffInMinutes = diffInMs / (1000 * 60);

//         if (diffInMinutes >= TIMEOUT_MINUTES) {
//           localStorage.removeItem("currentUser");
//           alert("Session expired due to inactivity. You have been logged out.");
//           window.location.href = "/login";
//         }
//       } catch (error) {
//         console.error("AutoLogout error:", error);
//       }
//     };

//     // * run check immediately and then every minute or 30 seconds
//     checkInactivity();
//     const interval = setInterval(checkInactivity, /*60*/ 30 * 1000);

//     return () => clearInterval(interval);
//   }, []);

//   return null;
// };

// export default AutoLogout;

const AutoLogout = ({ onLogout, timeout = 10 * 60 * 1000 }) => {
// 10 minutes
// const AutoLogout = ({ onLogout, timeout = 10 * 1000 }) => {
  // 10 seconds
  const timer = useRef(null);

  const resetTimer = () => {
    console.log("ACTIVITY DETECTED!");
    console.log("RESETTING AUTO LOGOUT!");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onLogout(); // Your logout function
    }, timeout);
  };

  useEffect(() => {
    const events = ["click", "mousemove", "keydown", "scroll", "touchstart"];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); // start the timer initially

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timer.current);
    };
  }, []);

  return null; // this component only handles logic, no UI
};

export default AutoLogout;
