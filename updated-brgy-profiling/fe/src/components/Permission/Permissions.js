import { useContext } from "react";

export const PERMISSIONS = {
  VIEW: "View Records",
  MANAGE: "View & Manage Records",
  ADD: "Add Records",
  REPORTS: "View Reports & Analytics",
  CERTIFICATES: "Manage Certificates",
};

export const checkPermission = (user, permission) => {
  if (!user || !user.permissions) return false;

  // System admin has all permissions
  if (user.role === "systemadmin") return true;

  // For viewer role - only allow viewing
  if (user.role === "user") {
    return permission === PERMISSIONS.VIEW;
  }

  // For editor role - check permissions
  if (user.role === "staff") {
      // If they have MANAGE permission, they can also VIEW
    if (user.permissions.includes(PERMISSIONS.MANAGE)) {
      if (
        permission === PERMISSIONS.MANAGE ||
        permission === PERMISSIONS.VIEW ||
        permission === "EDIT" ||
        permission === "DELETE"
      ) {
        return true;
      }
    } else if (user.permissions.includes(PERMISSIONS.ADD)) {
      if (permission === PERMISSIONS.ADD || permission === "Add Records") {
        return true;
      }
    } else if (user.permissions.includes(PERMISSIONS.REPORTS)) {
      if (
        permission === PERMISSIONS.REPORTS ||
        permission === "View Reports & Analytics"
      ) {
        return true;
      }
    } else if (user.permissions.includes(PERMISSIONS.CERTIFICATES)) {
      if (
        permission === PERMISSIONS.CERTIFICATES ||
        permission === "Manage Certificates"
      ) {
        return true;
      }
    }
    // Check for specific permissions
    return user.permissions.includes(permission);
  }

  return false;
};
