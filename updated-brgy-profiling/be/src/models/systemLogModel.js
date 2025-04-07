import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ["View", "Create", "Edit", "Delete", "View", "Login", "Logout", "Download", "LOGIN_FAILED"], // Add more as needed
    required: true,
  },
  module: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  details: {
    type: String,
    default: "",
  },
});

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);