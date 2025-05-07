import express from "express";

import {
  createSystemLog,
  updateSystemLog,
  deleteSystemLog,
  getSystemLog,
  getSystemLogs,
} from "../controllers/systemLogController.js";

let systemLogRoutes = express.Router();

systemLogRoutes.post("/", createSystemLog);
systemLogRoutes.get("/:id", getSystemLog);
systemLogRoutes.get("/", getSystemLogs);

systemLogRoutes.put("/:id", updateSystemLog);
systemLogRoutes.delete("/:id", deleteSystemLog);

export { systemLogRoutes };
