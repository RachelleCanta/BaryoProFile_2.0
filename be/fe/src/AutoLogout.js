import { useEffect } from "react";

const TIMEOUT_MINUTES = 10;

const AutoLogout = () => {
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
      const logoutTimer = setTimeout(() => {
        localStorage.removeItem("currentUser");
        window.location.href = "/login"; 
        alert("Session expired. You have been logged out.");
      }, TIMEOUT_MINUTES * 60 * 1000); // * 10 minutes

      return () => clearTimeout(logoutTimer); // * Clear timer on unmount
    }
  }, []);

  return null;
};

export default AutoLogout;
