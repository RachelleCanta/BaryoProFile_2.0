import express from "express";

import {
  createResident,
  deleteResident,
  getResident,
  getResidents,
  getResidentStatistics,
  updateResident,
} from "../controllers/residentController.js";

let residentRoutes = express.Router();

residentRoutes.get("/", getResidents);
residentRoutes.get("/statistics", getResidentStatistics);
residentRoutes.get("/:id", getResident);

residentRoutes.post("/", createResident);
residentRoutes.put("/:id", updateResident);
residentRoutes.delete("/:id", deleteResident);

export { residentRoutes };
