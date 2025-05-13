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
import CertificatesIssued from "./CertificatesIssued";
import ExcelJS from "exceljs";
import { MAIN_API_LINK } from "../../utils/API";
import JSZip from "jszip";

const AnalyticsDashboard = ({ onBack }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [summaryData, setSummaryData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [sexGenderData, setSexGenderData] = useState([]);
  const [specialSectorsData, setSpecialSectorsData] = useState([]);
  const [certSumData, setCertSumData] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  // const [timePeriod, setTimePeriod] = useState("Yearly"); // Default period
  // Families are no longer used for processing, since we’re getting API data directly.
  const [openCertificatesIssued, setOpenCertificatesIssued] = useState(false);
  const [openReportsAnalytics, setOpenReportsAnalytics] = useState(true);

  const [timePeriod, setTimePeriod] = useState("Monthly");
  const [selectedValue, setSelectedValue] = useState(new Date().getMonth() + 1);

  const [certificatesIssuedListData, setCertificatesIssuedListData] = useState(
    []
  );

  const [graphFilter, setGraphFilter] = useState("BRGY SUMMARY");

  const certificateTypes = [
    "Barangay Clearance",
    "Certificate of Residency",
    "Certification of Residency",
    "Certificate of Appearance",
    "Certificate of Good Moral",
    "Barangay Certification",
    "Barangay Health Certification",
    "Certification of Mortuary",
    "Permit to Travel",
    "Certification of Business Closure",
    "Certificate of Indigency",
    "Certificate of No Income",
    "Certificate of Income",
    "Libreng Tulong Hatid",
    "Certification of Late Registration",
    "Oath of Undertaking",
    "Sworn Affidavit of the Barangay Council",
    "Certification of Live In Partner",
    "Certification of Relationship",
    "Solo Parent Certification",
  ];

  const today = new Date();

  const formatted = `${
    today.getMonth() + 1
  }/${today.getDate()}/${today.getFullYear()}`;

  const getReports = async () => {
    try {
      const res = await axiosInstance.get(
        `/residents/statistics?filterType=${timePeriod}&filterValue=${selectedValue}`
      );
      if (res.data && res.data.success) {
        const stats = res.data.data;
        console.log("Data from API:", stats);

        const certificateSummary = certificateTypes.map((type) => {
          const cert = stats.certReports.find((item) => item._id === type);
          return {
            Certificate: type,
            Count: cert ? cert.count : 0,
          };
        });

        setSexGenderData([
          {
            name: "Male",
            value: stats.maleCount,
            percent: stats.malePercentage,
          },
          {
            name: "Female",
            value: stats.femaleCount,
            percent: stats.femalePercentage,
          },
          {
            name: "LGBTQ+",
            value: stats.lgbtqPlusCount,
            percent: stats.lgbtqPlusPercentage,
          },
        ]);

        setCertSumData(certificateSummary);

        // Build summaryData based on API stats
        setSummaryData([
          {
            Title: "Total Population",
            Count: stats.totalPopulation,
            Change: "", // You may adjust if you want dynamic text here
            Description: "Total residents",
          },
          {
            Title: "Total Households",
            Count: stats.totalHouseholds,
            Change: "",
            Description: "Registered households",
          },
          {
            Title: "Pregnants",
            Count: stats.pregnantCount,
            Change: `${stats.pregnantPercentage}%`,
            Description: "of population",
          },
          {
            Title: "Senior Citizens",
            Count: stats.seniorCount,
            Change: `${stats.seniorPercentage}%`,
            Description: "of population",
          },
          {
            Title: "PWD Residents",
            Count: stats.pwdCount,
            Change: `${stats.pwdPercentage}%`,
            Description: "of population",
          },
          {
            Title: "Solo Parents",
            Count: stats.soloParentCount,
            Change: `${stats.soloParentPercentage}%`,
            Description: "of population",
          },
          {
            Title: "OFW Members",
            Count: stats.ofwCount,
            Change: `${stats.ofwPercentage}%`,
            Description: "of population",
          },
          {
            Title: "Immigrants",
            Count: stats.immigrantCount,
            Change: `${stats.immigrantPercentage}%`,
            Description: "of population",
          },
          {
            Title: "Out of School Youth",
            Count: stats.osyCount,
            Change: `${stats.osyPercentage}%`,
            Description: "of population",
          },
          {
            Title: "Male",
            Count: stats.maleCount,
            Change: `${stats.malePercentage}%`,
            Description: "of population",
          },
          {
            Title: "Female",
            Count: stats.femaleCount,
            Change: `${stats.femalePercentage}%`,
            Description: "of population",
          },
          {
            Title: "LGBTQ+",
            Count: stats.lgbtqPlusCount,
            Change: `${stats.lgbtqPlusPercentage}%`,
            Description: "of population",
          },
          // ...certificateSummary,
        ]);

        // Build ageData from the API's ageGroups data. Only include groups with count > 0.
        const ageGroups = stats.ageGroups || {};
        const processedAgeData = Object.keys(ageGroups)
          .filter((key) => ageGroups[key].count > 0)
          .map((key) => ({
            name: key,
            value: ageGroups[key].count,
            percentage: ageGroups[key].percentage,
          }));
        setAgeData(processedAgeData);

        // Build special sectors data
        const processedSectorsData = [
          { Category: "Senior Citizens", Count: stats.seniorCount },
          { Category: "PWD", Count: stats.pwdCount },
          { Category: "Solo Parents", Count: stats.soloParentCount },
          { Category: "OFW Members", Count: stats.ofwCount },
          { Category: "Immigrants", Count: stats.immigrantCount },
          { Category: "Out of School Youth", Count: stats.osyCount },
          { Category: "Pregnant", Count: stats.pregnantCount },
        ].filter((item) => item.Count > 0);
        setSpecialSectorsData(processedSectorsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getCertificateIssuedList = async () => {
    try {
      const res = await axiosInstance.get(
        `/certificates?filterType=${timePeriod}&filterValue=${selectedValue}`
      );
      // const res = await axios.get(`http://localhost:8003/api/certificates`);
      if (res.data && res.data.success) {
        const resData = res.data.certRecords;
        console.log("dsada:", resData);

        setCertificatesIssuedListData(resData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getReports();

    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);

    if (!checkPermission(user, PERMISSIONS.REPORTS)) {
      setShowErrorModal(true);
      return;
    }
  }, []);

  useEffect(() => {
    getCertificateIssuedList();
  }, [timePeriod, selectedValue]);

  // The timePeriod and families processing have been removed,
  // because backend API provides aggregated statistics.

  // const handleTimePeriodChange = (e) => {
  //   setTimePeriod(e.target.value);
  //   // If needed, trigger a new API call with period parameter (not shown here)
  // };

  useEffect(() => {
    // alert(timePeriod + " : " + selectedValue);
    getReports();
  }, [timePeriod, selectedValue]);

  const exportReport = async () => {
    if (!checkPermission(currentUser, PERMISSIONS.REPORTS)) {
      setShowErrorModal(true);
      return;
    }

    try {
      await axiosInstance.post("/system-logs", {
        action: "Download",
        module: "Analytics Report Export",
        user: JSON.parse(localStorage.getItem("userId") || '""'),
        details: `User ${
          currentUser?.username || "unknown"
        } exported an analytics report on ${new Date().toLocaleString()}`,
      });
    } catch (error) {
      console.error("Error logging export action:", error);
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(20);
    doc.text("Barangay Darasa Analytics Report", pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      30,
      { align: "center" }
    );

    // Using first summaryData change text or fallback text
    const periodDisplay = summaryData[0]?.change || timePeriod;
    doc.text(`Period: ${periodDisplay}`, pageWidth / 2, 40, {
      align: "center",
    });

    doc.setFontSize(16);
    doc.text("Summary Statistics", 14, 50);

    const summaryTableData = summaryData.map((item) => [
      item.title,
      item.value.toString(),
      item.change,
    ]);

    doc.autoTable({
      startY: 55,
      head: [["Category", "Value", "Change"]],
      body: summaryTableData,
      theme: "grid",
      headStyles: { fillColor: [66, 153, 225] },
      styles: { fontSize: 12 },
    });

    doc.setFontSize(16);
    doc.text("Population by Age Group", 14, doc.lastAutoTable.finalY + 20);

    const ageTableData = ageData.map((item) => [
      item.name,
      item.value.toString(),
      `${item.percentage}%`,
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 25,
      head: [["Age Group", "Count", "Percentage"]],
      body: ageTableData,
      theme: "grid",
      headStyles: { fillColor: [66, 153, 225] },
    });

    doc.setFontSize(16);
    doc.text("Special Sectors Distribution", 14, doc.lastAutoTable.finalY + 20);

    const sectorsTableData = specialSectorsData.map((item) => [
      item.name,
      item.value.toString(),
      `${((item.value / (summaryData[0]?.value || 1)) * 100).toFixed(1)}%`,
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 25,
      head: [["Sector", "Count", "Percentage"]],
      body: sectorsTableData,
      theme: "grid",
      headStyles: { fillColor: [66, 153, 225] },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    const period = timePeriod.toLowerCase();
    doc.save(
      `Barangay_Darasa_Analytics_${period}_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );

    toast.success("Report exported successfully!");
  };

  // const exportReportExcel = async () => {
  //   const worksheet = XLSX.utils.json_to_sheet(summaryData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");

  //   // Define custom header styling
  //   const headerStyle = {
  //     fill: { fgColor: { rgb: "1F53DD" } }, // Blue background
  //     font: { color: { rgb: "FFFFFF" }, bold: true }, // White bold font
  //     alignment: { horizontal: "center", vertical: "center" },
  //   };

  //   const dataStyle = {
  //     fill: {
  //       patternType: "solid",
  //       fgColor: { rgb: "FFF2F2F2" }, // Light gray
  //     },
  //     font: {
  //       color: { rgb: "FF000000" }, // Black
  //     },
  //     alignment: {
  //       horizontal: "left",
  //       vertical: "center",
  //     },
  //   };

  //   // Manually set header row with styling
  //   const headers = Object.keys(summaryData[0]);
  //   headers.forEach((headerText, idx) => {
  //     const cellAddress = XLSX.utils.encode_cell({ r: 0, c: idx });
  //     worksheet[cellAddress] = {
  //       v: headerText,
  //       s: headerStyle,
  //     };
  //   });

  //   // Style data rows
  //   summaryData.forEach((summary, rowIdx) => {
  //     headers.forEach((key, colIdx) => {
  //       const cellAddress = XLSX.utils.encode_cell({
  //         r: rowIdx + 1,
  //         c: colIdx,
  //       }); // +1 to skip header
  //       if (!worksheet[cellAddress]) return; // if cell already set by json_to_sheet

  //       worksheet[cellAddress].s = dataStyle;
  //     });
  //   });

  //   // Apply column widths (optional, adjust as needed)
  //   worksheet["!cols"] = headers.map(() => ({ wch: 25 }));

  //   const excelBuffer = XLSX.write(workbook, {
  //     bookType: "xlsx",
  //     type: "array",
  //   });

  //   const fileData = new Blob([excelBuffer], {
  //     type: "application/octet-stream",
  //   });

  //   const fileName = `Brgy-Summary-${timePeriod}-${
  //     selectedValue ? selectedValue : "0"
  //   }.xlsx`;
  //   saveAs(fileData, fileName);

  //   await axiosInstance.post("/system-logs", {
  //     action: "Download",
  //     module: "Analytics Report Export",
  //     user: JSON.parse(localStorage.getItem("userId") || '""'),
  //     details: `User ${
  //       currentUser?.username || "unknown"
  //     } exported an analytics report on ${new Date().toLocaleString()}`,
  //   });

  //   toast.success("Summary report exported!");
  // };

  async function exportReportExcelAdvanced(fileUrl) {
    try {
      const stats = await axiosInstance.get(
        `${MAIN_API_LINK}/residents/stats-by-age-gender`
      );

      if (stats.data.success) {
        const population = stats.data.overallPopulation;
        const dataByAgeGender = stats.data.ageBrackets;

        // * Fetch the template Excel file
        const response = await fetch(fileUrl);
        if (!response.ok)
          throw new Error("Failed to fetch template file from server.");

        const templateBuffer = await response.arrayBuffer();
        let singleWorkbookBlob = null;
        // let fileName = `${timePeriod} Report for ${selectedValue} - BRGY POPULATION (BY AGE AND GENDER).xlsx`;
        const readableValue =
          timePeriod === "Monthly"
            ? new Date(0, parseInt(selectedValue) - 1).toLocaleString(
                "default",
                {
                  month: "long",
                }
              )
            : timePeriod === "Quarterly"
            ? `Q${selectedValue}`
            : selectedValue || "N/A";

        let fileName = `${timePeriod} Report for ${readableValue} - BRGY POPULATION (BY AGE AND GENDER).xlsx`;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(templateBuffer);

        // Get the two sheets and rename them based on head's last name
        const sheet1 = workbook.getWorksheet(1);

        // * SHEET 1
        sheet1.getCell("I13").value = population.barangay;
        sheet1.getCell("I14").value = population.household;
        sheet1.getCell("I15").value = population.household;

        sheet1.getCell("I21").value = population.male;
        sheet1.getCell("I22").value = population.female;
        sheet1.getCell("I23").value = population.lgbtqPlus;

        // ! 0-6
        sheet1.getCell("I33").value = dataByAgeGender.zeroToSixMonths.male.pwd;
        sheet1.getCell("K33").value =
          dataByAgeGender.zeroToSixMonths.male.nonPwd;
        sheet1.getCell("M33").value =
          dataByAgeGender.zeroToSixMonths.female.pwd;
        sheet1.getCell("O33").value =
          dataByAgeGender.zeroToSixMonths.female.nonPwd;
        sheet1.getCell("Q33").value = dataByAgeGender.zeroToSixMonths.lgbtqPlus;
        sheet1.getCell("V33").value =
          dataByAgeGender.zeroToSixMonths.totalCount;

        // ! 7 - 2
        sheet1.getCell("I34").value =
          dataByAgeGender.sevenMonthsToTwoYears.male.pwd;
        sheet1.getCell("K34").value =
          dataByAgeGender.sevenMonthsToTwoYears.male.nonPwd;
        sheet1.getCell("M34").value =
          dataByAgeGender.sevenMonthsToTwoYears.female.pwd;
        sheet1.getCell("O34").value =
          dataByAgeGender.sevenMonthsToTwoYears.female.nonPwd;
        sheet1.getCell("Q34").value =
          dataByAgeGender.sevenMonthsToTwoYears.lgbtqPlus;
        sheet1.getCell("V34").value =
          dataByAgeGender.sevenMonthsToTwoYears.totalCount;

        // ! 3 - 5
        sheet1.getCell("I35").value = dataByAgeGender.threeToFiveYears.male.pwd;
        sheet1.getCell("K35").value =
          dataByAgeGender.threeToFiveYears.male.nonPwd;
        sheet1.getCell("M35").value =
          dataByAgeGender.threeToFiveYears.female.pwd;
        sheet1.getCell("O35").value =
          dataByAgeGender.threeToFiveYears.female.nonPwd;
        sheet1.getCell("Q35").value =
          dataByAgeGender.threeToFiveYears.lgbtqPlus;
        sheet1.getCell("V35").value =
          dataByAgeGender.threeToFiveYears.totalCount;

        // ! 6 - 12
        sheet1.getCell("I36").value = dataByAgeGender.sixToTwelveYears.male.pwd;
        sheet1.getCell("K36").value =
          dataByAgeGender.sixToTwelveYears.male.nonPwd;
        sheet1.getCell("M36").value =
          dataByAgeGender.sixToTwelveYears.female.pwd;
        sheet1.getCell("O36").value =
          dataByAgeGender.sixToTwelveYears.female.nonPwd;
        sheet1.getCell("Q36").value =
          dataByAgeGender.sixToTwelveYears.lgbtqPlus;
        sheet1.getCell("V36").value =
          dataByAgeGender.sixToTwelveYears.totalCount;

        // ! 13 - 17
        sheet1.getCell("I37").value =
          dataByAgeGender.thirteenToSeventeenYears.male.pwd;
        sheet1.getCell("K37").value =
          dataByAgeGender.thirteenToSeventeenYears.male.nonPwd;
        sheet1.getCell("M37").value =
          dataByAgeGender.thirteenToSeventeenYears.female.pwd;
        sheet1.getCell("O37").value =
          dataByAgeGender.thirteenToSeventeenYears.female.nonPwd;
        sheet1.getCell("Q37").value =
          dataByAgeGender.thirteenToSeventeenYears.lgbtqPlus;
        sheet1.getCell("V37").value =
          dataByAgeGender.thirteenToSeventeenYears.totalCount;

        // ! 18 - 59
        sheet1.getCell("I38").value =
          dataByAgeGender.eighteenToFiftyNineYears.male.pwd;
        sheet1.getCell("K38").value =
          dataByAgeGender.eighteenToFiftyNineYears.male.nonPwd;
        sheet1.getCell("M38").value =
          dataByAgeGender.eighteenToFiftyNineYears.female.pwd;
        sheet1.getCell("O38").value =
          dataByAgeGender.eighteenToFiftyNineYears.female.nonPwd;
        sheet1.getCell("Q38").value =
          dataByAgeGender.eighteenToFiftyNineYears.lgbtqPlus;
        sheet1.getCell("V38").value =
          dataByAgeGender.eighteenToFiftyNineYears.totalCount;

        // ! 60 ABOVE
        sheet1.getCell("I39").value = dataByAgeGender.sixtyAbove.male.pwd;
        sheet1.getCell("K39").value = dataByAgeGender.sixtyAbove.male.nonPwd;
        sheet1.getCell("M39").value = dataByAgeGender.sixtyAbove.female.pwd;
        sheet1.getCell("O39").value = dataByAgeGender.sixtyAbove.female.nonPwd;
        sheet1.getCell("Q39").value = dataByAgeGender.sixtyAbove.lgbtqPlus;
        sheet1.getCell("V39").value = dataByAgeGender.sixtyAbove.totalCount;

        sheet1.getCell("T42").value = currentUser.username;
        sheet1.getCell(
          "T43"
        ).value = `${timePeriod} Report for ${readableValue}`;
        sheet1.getCell("T44").value = formatted;

        const updatedBuffer = await workbook.xlsx.writeBuffer();

        singleWorkbookBlob = new Blob([updatedBuffer]);

        saveAs(singleWorkbookBlob, `${fileName}.xlsx`);

        await axiosInstance.post("/system-logs", {
          action: "Download",
          module: "Analytics Report Export",
          user: JSON.parse(localStorage.getItem("userId") || '""'),
          details: `User ${currentUser.username} exported ${fileName} report on ${formatted}`,
        });

        toast.success("BRGY POPULATION BY AGE AND GENDER REPORT DOWNLOADED!");
      } else {
        toast.error(
          "BRGY POPULATION BY AGE AND GENDER REPORT FAILED TO DOWNLOAD"
        );
      }
    } catch (err) {
      console.error("Error processing resident Excel files:", err);
    }
  }

  const exportReportExcel = async () => {
    const workbook = XLSX.utils.book_new();

    // Define styles
    const headerStyle = {
      fill: { patternType: "solid", fgColor: { rgb: "1F53DD" } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
      alignment: { horizontal: "center", vertical: "center" },
    };

    const dataStyle = {
      fill: { patternType: "solid", fgColor: { rgb: "F2F2F2" } },
      font: { color: { rgb: "000000" } },
      alignment: { horizontal: "left", vertical: "center" },
    };

    // Helper function to convert JSON data to styled AoA
    const buildSection = (data, applyStyle = true) => {
      if (!data || data.length === 0) return [];

      const headers = Object.keys(data[0]);
      const section = [];

      // Header row
      section.push(headers.map((header) => ({ v: header, s: headerStyle })));

      // Data rows
      data.forEach((row) => {
        const styledRow = headers.map((key) => ({
          v: row[key],
          s: applyStyle ? dataStyle : undefined,
        }));
        section.push(styledRow);
      });

      return section;
    };

    // Combine sections with spacing
    // let fullData = [
    //   [{ v: `Printed By: ${currentUser?.username || "Unknown"}` }],
    //   [
    //     {
    //       v: `Report Type: ${timePeriod} Report for ${
    //         timePeriod === "Monthly"
    //           ? new Date(0, parseInt(selectedValue) - 1).toLocaleString(
    //               "default",
    //               {
    //                 month: "long",
    //               }
    //             )
    //           : selectedValue || "N/A"
    //       }`,
    //     },
    //   ],
    //   [{ v: `Date Printed: ${formatted}` }],
    //   [], // Empty row as spacing before actual table content
    // ];

    let fullData = [];

    fullData = fullData.concat(buildSection(summaryData));
    fullData.push([]); // Empty row

    fullData = fullData.concat(buildSection(specialSectorsData));
    fullData.push([]); // Empty row

    fullData = fullData.concat(buildSection(certSumData));

    fullData.push([]); // Empty row before footer

    const formattedDate = new Date().toLocaleString();
    const readableValue =
      timePeriod === "Monthly"
        ? new Date(0, parseInt(selectedValue) - 1).toLocaleString("default", {
            month: "long",
          })
        : timePeriod === "Quarterly"
        ? `Q${selectedValue}`
        : selectedValue || "N/A";

    // Add footer lines
    fullData.push([{ v: `Printed By: ${currentUser?.username || "Unknown"}` }]);
    fullData.push([
      { v: `Report Type: ${timePeriod} Report for ${readableValue}` },
    ]);
    fullData.push([{ v: `Date Printed: ${formattedDate}` }]);

    // Create sheet from AoA
    const worksheet = XLSX.utils.aoa_to_sheet(fullData);

    // Optional: Set column widths
    const widestSection = [summaryData, specialSectorsData, certSumData].reduce(
      (acc, cur) => {
        if (cur && cur.length > 0 && Object.keys(cur[0]).length > acc)
          return Object.keys(cur[0]).length;
        return acc;
      },
      0
    );
    worksheet["!cols"] = Array(widestSection).fill({ wch: 25 });

    // Append and export
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    // * SAVE FIRST FILE
    const fileName = `Brgy-Summary-${timePeriod}-${selectedValue || "0"}.xlsx`;
    saveAs(fileData, fileName);

    // * Log system activity
    await axiosInstance.post("/system-logs", {
      action: "Download",
      module: "Analytics Report Export",
      user: JSON.parse(localStorage.getItem("userId") || '""'),
      details: `User ${
        currentUser?.username || "unknown"
      } exported an analytics report on ${new Date().toLocaleString()}`,
    });

    toast.success("Summary report exported!");

    // * SECOND FILE
    await exportReportExcelAdvanced(
      `${MAIN_API_LINK}/files/data-analytics.xlsx`
    );
  };

  // const COLORS = [
  //   "#4C51BF",
  //   "#48BB78",
  //   "#4299E1",
  //   "#ED8936",
  //   "#9F7AEA",
  //   "#ED64A6",
  // ];

  const COLORS = [
    "#03045E",
    "#023E8A",
    "#0077B6",
    "#0096C7",
    "#00B4D8",
    "#48CAE4",
  ];

  const NoDataMessage = () => (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#666",
        fontStyle: "italic",
      }}
    >
      No data available for the selected time period
    </div>
  );

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
    let value = "";
    switch (e.target.value) {
      case "Monthly":
        value = new Date().getMonth() + 1;
        break;
      case "Yearly":
        value = new Date().getFullYear();
        break;
      case "Quarterly":
        value = 1;
        break;
      default:
        value = new Date().getMonth() + 1;
    }
    setSelectedValue(value);
  };

  const handleGraphFilterChange = (e) => {
    setGraphFilter(e.target.value);
    if (e.target.value === "cert-list") {
      setOpenCertificatesIssued(true);
    } else {
      setOpenCertificatesIssued(false);
    }
  };

  const handleValueChange = (e) => {
    setSelectedValue(e.target.value);
  };

  const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const quarters = [
    { label: "Q1 (Jan - Mar)", value: 1 },
    { label: "Q2 (Apr - Jun)", value: 2 },
    { label: "Q3 (Jul - Sep)", value: 3 },
    { label: "Q4 (Oct - Dec)", value: 4 },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 26 }, (_, i) => ({
    label: `${currentYear - i}`,
    value: currentYear - i,
  }));

  // const COLORSSPEC = ["#4299E1", "#48BB78", "#ED8936", "#F56565", "#9F7AEA"];
  const COLORSSPEC = ["#0077B6", "#0096C7", "#00B4D8", "#48CAE4", "#90E0EF"];

  // const certificateColors = [
  //   "#4299E1", // Barangay Clearance
  //   "#48BB78", // Certificate of Residency
  //   "#38B2AC", // Certification of Residency
  //   "#ED8936", // Certificate of Appearance
  //   "#F56565", // Certificate of Good Moral
  //   "#9F7AEA", // Barangay Certification
  //   "#ECC94B", // Barangay Health Certification
  //   "#A0AEC0", // Certification of Mortuary
  //   "#F6AD55", // Permit to Travel
  //   "#FC8181", // Certification of Business Closure
  //   "#68D391", // Certificate of Indigency
  //   "#63B3ED", // Certificate of No Income
  //   "#B794F4", // Certificate of Income
  //   "#F687B3", // Libreng Tulong Hatid
  //   "#4FD1C5", // Certification of Late Registration
  //   "#FBD38D", // Oath of Undertaking
  //   "#CBD5E0", // Sworn Affidavit of the Barangay Council
  //   "#81E6D9", // Certification of Live In Partner
  //   "#FBB6CE", // Certification of Relationship
  //   "#A3BFFA", // Solo Parent Certification
  // ];


  const certificateColors = [
    "#0077B6", // Barangay Clearance
    "#0096C7", // Certificate of Residency
    "#00B4D8", // Certification of Residency
    "#48CAE4", // Certificate of Appearance
    "#90E0EF", // Certificate of Good Moral
    "#ADE8F4", // Barangay Certification
    "#CAF0F8", // Barangay Health Certification
    "#03045E", // Certification of Mortuary
    "#023E8A", // Permit to Travel
    "#0077B6", // Certification of Business Closure
    "#0096C7", // Certificate of Indigency
    "#00B4D8", // Certificate of No Income
    "#48CAE4", // Certificate of Income
    "#90E0EF", // Libreng Tulong Hatid
    "#ADE8F4", // Certification of Late Registration
    "#CAF0F8", // Oath of Undertaking
    "#03045E", // Sworn Affidavit of the Barangay Council
    "#023E8A", // Certification of Live In Partner
    "#0077B6", // Certification of Relationship
    "#0096C7", // Solo Parent Certification
  ];
  
  return (
    <div className="analytics-container">
      <button onClick={onBack} className="back-btn">
        Back to Menu
      </button>
      <div className="analytics-header">
        {openReportsAnalytics && (
          <>
            <div className="welcome-section">
              {/* <div className="brgy-logo-container">
                <img
                  src="/images/darasa-logo.png"
                  alt="Darasa Logo"
                  className="brgy-logo"
                  onError={(e) => console.error("Error loading image:", e)}
                />
              </div> */}
              <div className="title-section">
                <h1>Barangay Darasa</h1>
                <p>Profiling System Analytics Dashboard</p>
              </div>
              <div className="controls-section">
                <select
                  className="time-select"
                  value={timePeriod}
                  onChange={handleTimePeriodChange}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
                {/* Sub Filter based on timePeriod */}
                {timePeriod === "Monthly" && (
                  <select value={selectedValue} onChange={handleValueChange}>
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                )}
                {timePeriod === "Quarterly" && (
                  <select value={selectedValue} onChange={handleValueChange}>
                    {quarters.map((quarter) => (
                      <option key={quarter.value} value={quarter.value}>
                        {quarter.label}
                      </option>
                    ))}
                  </select>
                )}
                {timePeriod === "Yearly" && (
                  <select value={selectedValue} onChange={handleValueChange}>
                    {years.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                )}
                {!openCertificatesIssued && (
                  <button className="export-button" onClick={exportReportExcel}>
                    Export All Report
                  </button>
                )}
              </div>
              <div className="controls-section">
                <select
                  className="time-select"
                  value={graphFilter}
                  onChange={handleGraphFilterChange}
                >
                  <option value="BRGY SUMMARY">BRGY SUMMARY</option>
                  <option value="all">All Graphs and Summary</option>
                  <option value="age">Population By Age</option>
                  <option value="sex">Population By Gender/Sex</option>
                  <option value="special">Special Distribution Sectors</option>
                  <option value="cert-graph">Certificates Graph</option>
                  <option value="cert-list">Certificates List</option>
                </select>
              </div>
            </div>

            {!openCertificatesIssued && (
              <>
                {(graphFilter === "BRGY SUMMARY" || graphFilter === "all") && (
                  <div className="summary-grid">
                    {summaryData.map((item, index) => (
                      <div key={index} className="summary-card">
                        <div className="card-content">
                          <p className="card-title">{item.Title}</p>
                          <div className="value-section">
                            <h2 className="card-value">{item.Count}</h2>
                            <span className="card-change">
                              <ArrowUpIcon className="h-4 w-4" />
                              {item.Change}
                            </span>
                          </div>
                          <p className="card-subtext">{item.Description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* <div className="chart-container">
                  <h3 className="chart-title">Population by Age Group</h3>
                  <div className="chart-content">
                    {ageData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={ageData}
                            cx="50%"
                            cy="50%"
                            outerRadius={140}
                            innerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value, percent }) =>
                              `${name}: ${value} (${(percent * 100).toFixed(
                                1
                              )}%)`
                            }
                          >
                            {ageData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [value, "Population"]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <NoDataMessage />
                    )}
                  </div>
                </div> */}

                {(graphFilter === "age" || graphFilter === "all") && (
                  <div className="chart-container">
                    <h3 className="chart-title">Population by Age Group</h3>
                    <div className="chart-content">
                      {ageData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={ageData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                              formatter={(value) => [value, "Population"]}
                            />
                            {/* <Legend /> */}
                            <Bar
                              dataKey="value"
                              fill="#8884d8"
                              label={{ position: "top" }}
                            >
                              {ageData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <NoDataMessage />
                      )}
                    </div>
                  </div>
                )}

                {(graphFilter === "special" || graphFilter === "all") && (
                  <div className="chart-container">
                    <h3 className="chart-title">
                      Special Sectors Distribution
                    </h3>
                    <div className="chart-content">
                      {specialSectorsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={specialSectorsData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="Category" />
                            <YAxis />
                            <Tooltip
                              formatter={(value) => [`${value} residents`, ""]}
                            />
                            {/* <Legend /> */}
                            <Bar
                              dataKey="Count"
                              radius={[4, 4, 0, 0]}
                              label={{
                                position: "top",
                                formatter: (value) => value,
                              }}
                            >
                              {specialSectorsData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORSSPEC[index % COLORSSPEC.length]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <NoDataMessage />
                      )}
                    </div>
                  </div>
                )}

                <div className="charts-grid">
                  {/* <div className="chart-container">
                    <h3 className="chart-title">
                      Special Sectors Distribution
                    </h3>
                    <div className="chart-content">
                      {specialSectorsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={specialSectorsData}
                            layout="vertical"
                            margin={{ left: 150 }}
                          >
                            <XAxis type="number" />
                            <YAxis
                              type="category"
                              dataKey="Category"
                              width={140}
                            />
                            <Tooltip
                              formatter={(value) => [`${value} residents`, ""]}
                            />
                            <Legend />
                            <Bar
                              dataKey="Count"
                              radius={[0, 4, 4, 0]}
                              label={{
                                position: "right",
                                formatter: (value) => value,
                              }}
                            >
                              {specialSectorsData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORSSPEC[index % COLORSSPEC.length]} // cycle through COLORS
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <NoDataMessage />
                      )}
                    </div>
                  </div> */}

                  {/* <div className="chart-container">
                    <h3 className="chart-title">Population By Sex</h3>
                    <div className="chart-content">
                      {sexGenderData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <PieChart>
                            <Pie
                              data={sexGenderData}
                              cx="50%"
                              cy="50%"
                              outerRadius={140}
                              innerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, value, percent }) =>
                                `${name}: ${value} (${(percent * 1).toFixed(
                                  1
                                )}%)`
                              }
                            >
                              {sexGenderData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) => [value, "Population"]}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <NoDataMessage />
                      )}
                    </div>
                  </div> */}
                  {(graphFilter === "sex" || graphFilter === "all") && (
                    <div className="chart-container">
                      <h3 className="chart-title">Population By Sex</h3>
                      <div className="chart-content">
                        {sexGenderData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                              data={sexGenderData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip
                                formatter={(value) => [
                                  `${value}`,
                                  "Population",
                                ]}
                              />
                              {/* <Legend /> */}
                              <Bar
                                dataKey="value"
                                radius={[4, 4, 0, 0]}
                                label={{ position: "top" }}
                              >
                                {sexGenderData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <NoDataMessage />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {(graphFilter === "cert-graph" || graphFilter === "all") && (
                  <div className="chart-container">
                    <h3 className="chart-title">Certificates Issued</h3>
                    <div className="chart-content">
                      {certSumData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={certSumData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="Certificate" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="Count" label={{ position: "top" }}>
                              {certSumData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    certificateColors[
                                      index % certificateColors.length
                                    ]
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <NoDataMessage />
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {openCertificatesIssued && (
          <div className="cert-issued-parent-container">
            {/* <button
              className="cert-list-button red"
              onClick={() => setOpenCertificatesIssued(false)}
            >
              CLOSE CERTIFICATES ISSUED LIST
            </button> */}
            <CertificatesIssued
              certificatesIssuedListData={certificatesIssuedListData}
            />
          </div>
        )}

        {/* <div className="certificate-issued-container">
          <p>List of Certificates Issued</p>
          <div className="certificate-issued-inner-container">
            {certificatesIssuedListData.map((certificate, index) => {
              const personData = certificate.data[0]; // first and only data object
              const issuedTo = personData?.requestedBy || "Unknown";
              const timestamp = new Date(
                certificate.timestamp
              ).toLocaleString();

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
        </div> */}
      </div>
      <PermissionErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};

export default AnalyticsDashboard;
