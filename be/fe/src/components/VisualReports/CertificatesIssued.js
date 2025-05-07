// src/components/VisualReports/AnalyticsDashboard.js
import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { ArrowUpIcon } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { checkPermission, PERMISSIONS } from "../Permission/Permissions";
import PermissionErrorModal from "../Permission/PermissionErrorModal";
import "./AnalyticsDashboard.css";
import axiosInstance from "../../axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import axios from "axios";

const CertificatesIssued = ({ certificatesIssuedListData }) => {
  const certificateColors = [
    "#4299E1", // Barangay Clearance
    "#48BB78", // Certificate of Residency
    "#38B2AC", // Certification of Residency
    "#ED8936", // Certificate of Appearance
    "#F56565", // Certificate of Good Moral
    "#9F7AEA", // Barangay Certification
    "#ECC94B", // Barangay Health Certification
    "#A0AEC0", // Certification of Mortuary
    "#F6AD55", // Permit to Travel
    "#FC8181", // Certification of Business Closure
    "#68D391", // Certificate of Indigency
    "#63B3ED", // Certificate of No Income
    "#B794F4", // Certificate of Income
    "#F687B3", // Libreng Tulong Hatid
    "#4FD1C5", // Certification of Late Registration
    "#FBD38D", // Oath of Undertaking
    "#CBD5E0", // Sworn Affidavit of the Barangay Council
    "#81E6D9", // Certification of Live In Partner
    "#FBB6CE", // Certification of Relationship
    "#A3BFFA", // Solo Parent Certification
  ];

  useEffect(() => {
    console.log("LIST DATA", certificatesIssuedListData);
  });

  return (
    <div className="certificates-container">
      <div className="certificate-issued-container">
        <p>
          {certificatesIssuedListData.length <= 0 &&
            "No certificates issued yet..."}
        </p>
        <h1 className="blue">
          {certificatesIssuedListData.length >= 1 && "Certificates Issued List"}
        </h1>
        <div className="certificate-issued-inner-container">
          {certificatesIssuedListData.map((certificate, index) => {
            const personData = certificate.data[0]; // first and only data object
            const issuedTo = personData?.requestedBy || "Unknown";
            const timestamp = new Date(certificate.timestamp).toLocaleString();

            return (
              <div className="certificate-issued" key={index}>
                <p>
                  <span
                    style={{
                      color:
                        certificateColors[index % certificateColors.length],
                    }}
                  >
                    {certificate.type}
                  </span>{" "}
                  was issued to
                  <span
                    style={{
                      color:
                        certificateColors[index % certificateColors.length],
                    }}
                  >
                    {" "}
                    {issuedTo}{" "}
                  </span>{" "}
                  by{" "}
                  <span
                    style={{
                      color:
                        certificateColors[index % certificateColors.length],
                    }}
                  >
                    {certificate.printedBy || "N/A"}
                  </span>{" "}
                  on{" "}
                  <span
                    style={{
                      color:
                        certificateColors[index % certificateColors.length],
                    }}
                  >
                    {timestamp}
                  </span>
                </p>
                <p>Details</p>
                <div className="certificate-issued-details">
                  {personData &&
                    Object.entries(personData).map(([key, value], i) => {
                      // Format key: from "dateOfIssuance" → "Date Of Issuance"
                      const formattedKey = key
                        .replace(/([A-Z])/g, " $1") // Add space before capital letters
                        .replace(/^./, (char) => char.toUpperCase()); // Capitalize first letter

                      return (
                        <p key={i}>
                          <strong>
                            <span
                              style={{
                                color:
                                  certificateColors[
                                    index % certificateColors.length
                                  ],
                              }}
                            >
                              {formattedKey}:
                            </span>
                          </strong>{" "}
                          {value}
                        </p>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CertificatesIssued;
