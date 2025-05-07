import express from "express";

import {
  createCertificateRecord,
  updateCertificateRecord,
  deleteCertificateRecord,
  getCertRecords,
  getCertRecord,
} from "../controllers/certificateController.js";

let certificateRecordRoutes = express.Router();

certificateRecordRoutes.post("/", createCertificateRecord);
certificateRecordRoutes.get("/:id", getCertRecord);
certificateRecordRoutes.get("/", getCertRecords);

certificateRecordRoutes.put("/:id", updateCertificateRecord);
certificateRecordRoutes.delete("/:id", deleteCertificateRecord);

export { certificateRecordRoutes };
