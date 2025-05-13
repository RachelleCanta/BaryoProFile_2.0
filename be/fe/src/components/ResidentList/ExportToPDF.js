import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useContext } from "react";
import { UserContext } from "../../contexts/userContext";
import axiosInstance from "../../axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { MAIN_API_LINK } from "../../utils/API";
import JSZip from "jszip";

const ExportToExcel = ({
  data,
  label,
  icon,
  type,
  isProcessing,
  setIsProcessing,
  index,
}) => {
  const { currentUser } = useContext(UserContext);

  const today = new Date();

  const formatted = `${
    today.getMonth() + 1
  }/${today.getDate()}/${today.getFullYear()}`;

  // const getResidenceYears = (selectedDate) => {
  //   const today = new Date();
  //   const date = new Date(selectedDate);
  //   let computed = today.getFullYear() - date.getFullYear();
  //   const monthDiff = today.getMonth() - date.getMonth();
  //   const dayDiff = today.getDate() - date.getDate();

  //   // Check if date is valid
  //   if (
  //     isNaN(date.getTime()) ||
  //     selectedDate === "" ||
  //     selectedDate === 0 ||
  //     Number.isInteger(selectedDate)
  //   ) {
  //     return 0;
  //   }

  //   if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
  //     computed--;
  //   }

  //   if (computed <= 0) {
  //     computed = 0;
  //   }

  //   return computed;
  // };

  const getResidenceYears = (selectedDate) => {
    const today = new Date();
    const date = new Date(selectedDate);

    // Validate the date
    if (
      isNaN(date.getTime()) ||
      selectedDate === "" ||
      selectedDate === 0 ||
      Number.isInteger(selectedDate)
    ) {
      return "0 years and 0 months";
    }

    let years = today.getFullYear() - date.getFullYear();
    let months = today.getMonth() - date.getMonth();
    let days = today.getDate() - date.getDate();

    if (days < 0) {
      months -= 1;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years < 0) {
      years = 0;
      months = 0;
    }

    const yearStr = `${years} year${years === 1 ? "" : "s"}`;
    const monthStr = `${months} month${months === 1 ? "" : "s"}`;

    return `${yearStr} and ${monthStr}`;
  };

  async function fetchAndAppendResidentData(fileUrl, residents) {
    try {
      let residentIds = [];
      residents.forEach((resident) => {
        residentIds.push(
          resident.householdId ? resident.householdId : resident._id
        );
      });

      const residentsFromDB = await axiosInstance.post("/residents/excel", {
        residentIds: residentIds,
      });

      console.log("FROM DB", residentsFromDB.data.data);

      // Initialize JSZip
      // const zip = new JSZip();
      const isSingle = residentsFromDB.data.data.length === 1;
      const zip = !isSingle ? new JSZip() : null;

      // Fetch the template Excel file
      const response = await fetch(fileUrl);
      if (!response.ok)
        throw new Error("Failed to fetch template file from server.");

      const templateBuffer = await response.arrayBuffer();
      let singleWorkbookBlob = null;
      let fileName = "Resident-List";

      // Process each resident
      for (const resArg of residentsFromDB.data.data) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(templateBuffer);

        // Get the two sheets and rename them based on head's last name
        const headLastName = resArg.headLastName || "Unknown";
        const sheet1 = workbook.getWorksheet(1);
        const sheet2 = workbook.getWorksheet(2);
        sheet1.name = `${headLastName}_Front`;
        sheet2.name = `${headLastName}_Back`;

        // SHEET 1 FRONT
        // ABOUT
        sheet1.getCell("D9").value = resArg.cluster;
        sheet1.getCell("D10").value = resArg.brgyHealthWorker;
        sheet1.getCell("Q9").value = resArg.householdNo;
        sheet1.getCell("Q10").value = resArg.totalMembers;
        sheet1.getCell("AE9").value = resArg.houseLotBlockNo;
        sheet1.getCell("AE10").value = resArg.doorInput;
        sheet1.getCell("AE11").value = resArg.fourPsIdNo;

        // HEAD
        sheet1.getCell("A16").value = resArg.headFirstName;
        sheet1.getCell("C16").value = resArg.headMiddleName;
        sheet1.getCell("E16").value = resArg.headLastName;
        sheet1.getCell("G16").value = resArg.relationshipToHouseHoldHead;
        sheet1.getCell("I16").value = resArg.headSex;
        sheet1.getCell("J16").value = resArg.headAge;
        sheet1.getCell("K16").value = resArg.headBirthday
          ? new Date(resArg.headBirthday).toLocaleDateString()
          : "";
        sheet1.getCell("M16").value = resArg.headPlaceOfBirth;
        sheet1.getCell("N16").value = resArg.headNationality;
        sheet1.getCell("P16").value = resArg.headMaritalStatus;
        sheet1.getCell("R16").value = resArg.headReligion;
        sheet1.getCell("T16").value = resArg.headEthnicity;
        sheet1.getCell("V16").value = resArg.headIsRegisteredVoter
          ? "Yes"
          : "No";
        sheet1.getCell("X16").value = resArg.headHighestLevelOfEducation;
        sheet1.getCell("Z16").value = resArg.headPlaceOfSchool;
        sheet1.getCell("AB16").value = resArg.headHouseLot;
        sheet1.getCell("AD16").value = resArg.headWaterSupply;
        sheet1.getCell("AF16").value = resArg.headComfortRoom;
        sheet1.getCell("AH16").value =
          getResidenceYears(resArg.headResidence) || 0;

        // SPOUSE
        sheet1.getCell("A22").value = resArg.spouseFirstName;
        sheet1.getCell("C22").value = resArg.spouseMiddleName;
        sheet1.getCell("E22").value = resArg.spouseLastName;
        sheet1.getCell("G22").value = resArg.spouseRelationshipToHouseHoldHead;
        sheet1.getCell("I22").value = resArg.spouseSex;
        sheet1.getCell("J22").value = resArg.spouseAge;
        sheet1.getCell("K22").value = resArg.spouseBirthday
          ? new Date(resArg.spouseBirthday).toLocaleDateString()
          : "";
        sheet1.getCell("M22").value = resArg.spousePlaceOfBirth;
        sheet1.getCell("N22").value = resArg.spouseNationality;
        sheet1.getCell("P22").value = resArg.spouseMaritalStatus;
        sheet1.getCell("R22").value = resArg.spouseReligion;
        sheet1.getCell("T22").value = resArg.spouseEthnicity;
        sheet1.getCell("V22").value = resArg.spouseIsRegisteredVoter
          ? "Yes"
          : "No";
        sheet1.getCell("X22").value = resArg.spouseHighestLevelOfEducation;
        sheet1.getCell("Z22").value = resArg.spousePlaceOfSchool;
        sheet1.getCell("AB22").value = resArg.spouseHouseLot;
        sheet1.getCell("AD22").value = resArg.spouseWaterSupply;
        sheet1.getCell("AF22").value = resArg.spouseComfortRoom;
        sheet1.getCell("AH22").value =
          getResidenceYears(resArg.spouseResidence) || 0;

        sheet1.getCell("AE51").value = currentUser.username;
        sheet1.getCell("AE52").value = formatted;

        // FAMILY MEMBERS
        let famRow = 28;
        if (resArg.familyMembers && resArg.familyMembers.length > 0) {
          for (const member of resArg.familyMembers) {
            sheet1.getCell(`A${famRow}`).value = member.firstName;
            sheet1.getCell(`C${famRow}`).value = member.middleName;
            sheet1.getCell(`E${famRow}`).value = member.lastName;
            sheet1.getCell(`G${famRow}`).value = member.relationship;
            sheet1.getCell(`I${famRow}`).value = member.sex;
            sheet1.getCell(`J${famRow}`).value = member.age;
            sheet1.getCell(`K${famRow}`).value = member.birthday
              ? new Date(member.birthday).toLocaleDateString()
              : "";
            sheet1.getCell(`M${famRow}`).value = member.placeOfBirth;
            sheet1.getCell(`N${famRow}`).value = member.nationality;
            sheet1.getCell(`P${famRow}`).value = member.maritalStatus;
            sheet1.getCell(`R${famRow}`).value = member.religion;
            sheet1.getCell(`T${famRow}`).value = member.ethnicity;
            sheet1.getCell(`V${famRow}`).value = member.isRegisteredVoter
              ? "Yes"
              : "No";
            sheet1.getCell(`X${famRow}`).value = member.schoolLevel;
            sheet1.getCell(`Z${famRow}`).value = member.placeOfSchool;
            sheet1.getCell(`AB${famRow}`).value = member.houseLot;
            sheet1.getCell(`AD${famRow}`).value = member.waterSupply;
            sheet1.getCell(`AF${famRow}`).value = member.comfortRoom;
            sheet1.getCell(`AH${famRow}`).value =
              getResidenceYears(member.residence) || 0;
            famRow++;
          }
        }

        // SHEET 2 BACK
        let infoRow = 14;
        if (resArg.additionalInfos && resArg.additionalInfos.length > 0) {
          for (const info of resArg.additionalInfos) {
            sheet2.getCell(`A${infoRow}`).value = info.name;
            sheet2.getCell(`F${infoRow}`).value = info.pregnant;
            sheet2.getCell(`H${infoRow}`).value = info.familyPlanning;
            sheet2.getCell(`J${infoRow}`).value = info.pwd;
            sheet2.getCell(`L${infoRow}`).value = info.soloParent;
            sheet2.getCell(`M${infoRow}`).value = info.seniorCitizen;
            sheet2.getCell(`O${infoRow}`).value = info.maintenance;
            sheet2.getCell(`Q${infoRow}`).value = info.philhealth;
            sheet2.getCell(`S${infoRow}`).value = info.ofwCountry;
            sheet2.getCell(`U${infoRow}`).value = info.yearsInService;
            sheet2.getCell(`V${infoRow}`).value = info.outOfSchool;
            sheet2.getCell(`X${infoRow}`).value = info.immigrantNationality;
            sheet2.getCell(`Z${infoRow}`).value = info.yearsOfStay;
            infoRow++;
          }
        }

        // Save workbook to ZIP
        // const updatedBuffer = await workbook.xlsx.writeBuffer();
        // zip.file(`${headLastName}_ResidentData.xlsx`, updatedBuffer);
        // Save this workbook
        const updatedBuffer = await workbook.xlsx.writeBuffer();

        if (isSingle) {
          singleWorkbookBlob = new Blob([updatedBuffer]);
          fileName = `${formatted}-Household-${resArg.householdNo}`;
        } else {
          zip.file(`${headLastName}_ResidentData.xlsx`, updatedBuffer);
        }
      }

      // let fileName = "Resident-List";
      if (isSingle) {
        saveAs(singleWorkbookBlob, `${fileName}.xlsx`);
      } else {
        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `${fileName}.zip`);
      }

      await axiosInstance.post("/system-logs", {
        action: "Download",
        module: "Resident Management",
        user: JSON.parse(localStorage.getItem("userId") || '""'), // Ensures proper formatting
        details: `User ${currentUser.username} exported ${fileName}${
          type && type !== "All" ? ` of type ${type}` : ""
        } report on ${formatted}`,
      });

      toast.success("Data exported successfully!");
      if (residentsFromDB.data.data.length > 1) {
        setIsProcessing(false);
      } else {
        setIsProcessing((prev) => ({
          ...prev,
          [index]: false,
        }));
      }
    } catch (err) {
      setIsProcessing(false);
      console.error("Error processing resident Excel files:", err);
    }
  }

  const exportToExcel = async (e) => {
    e.stopPropagation();
    if (data.length > 1) {
      setIsProcessing(true);
    } else {
      console.log("CLICKED!");
      setIsProcessing((prev) => ({
        ...prev,
        [index]: true,
      }));
    }

    // setTimeout(() => {
    //   if (data.length > 1) {
    //     setIsProcessing(false);
    //   } else {
    //     setIsProcessing((prev) => ({
    //       ...prev,
    //       [index]: false,
    //     }));
    //   }
    // }, 2500);

    await fetchAndAppendResidentData(
      `${MAIN_API_LINK}/files/residents.xlsx`,
      data
    );
  };

  return (
    <button
      className="export-all-indiv-button"
      onClick={exportToExcel}
      disabled={isProcessing}
    >
      {icon && <i className="fas fa-file"></i>}
      {isProcessing ? <span className="spinner"></span> : label}
    </button>
  );
};

// const ExportToPDF = ({ data, label, icon, type }) => {
//   const { currentUser } = useContext(UserContext);

//   const generatePDF = async (e) => {
//     e.stopPropagation();
//     const doc = new jsPDF();
//     let residents = data;

//     const darasa = "../../public/images/darasa-logo.png";
//     const system = "../../public/images/system-logo.png";
//     const tanauan = "../../public/images/tanauan-logo.png";

//     // ==== ADD HEADER TEXT ====
//     doc.setFontSize(18);
//     doc.setFont("helvetica", "bold");
//     doc.text("Baranggay Darasa Resident Information Report", 105, 20, {
//       align: "center",
//     });

//     doc.setFontSize(11);
//     doc.setFont("helvetica", "normal");

//     const today = new Date();
//     const formatted = `${
//       today.getMonth() + 1
//     }/${today.getDate()}/${today.getFullYear()}`;
//     doc.text(`Date Printed: ${formatted}`, 105, 28, {
//       align: "center",
//     });
//     doc.text(
//       `Prepared By: ${currentUser.username} (${currentUser.role})`,
//       105,
//       34,
//       {
//         align: "center",
//       }
//     );

//     if (type) {
//       doc.text(`Report Type: ${type} Residents`, 105, 40, {
//         align: "center",
//       });
//     }

//     doc.setDrawColor(0);
//     doc.line(10, 44, 200, 44); // line after header

//     let currentY = 50;

//     // Helper to convert object to rows
//     const formatObjectToRows = (obj) =>
//       Object.entries(obj).map(([key, value]) => ({
//         field: key,
//         value:
//           value === null || value === undefined
//             ? "N/A"
//             : typeof value === "boolean"
//             ? value
//               ? "Yes"
//               : "No"
//             : value.toString(),
//       }));

//     residents.forEach((resident, i) => {
//       if (i > 0) {
//         doc.addPage(); // add new page for each household
//         currentY = 20;
//       }

//       // HEADER
//       doc.setFontSize(14);
//       if (residents.length > 1) {
//         doc.text(`Household ${i + 1}: ${resident.householdNo}`, 14, currentY);
//       } else {
//         doc.text(`Household : ${resident.householdNo}`, 14, currentY);
//       }

//       // HEAD & SPOUSE
//       const headSpouseFields = {
//         "Household No": resident.householdNo,
//         "Relationship To Head": resident.relationshipToHouseHoldHead,
//         "House/Lot/Block No": resident.houseLotBlockNo,

//         // Head
//         "Head Name": `${resident.headFirstName} ${resident.headMiddleName} ${resident.headLastName}`,
//         "Head Age": resident.headAge,
//         "Head Birthday": resident.headBirthday,
//         "Head Sex": resident.headSex,
//         "Head Nationality": resident.headNationality,
//         "Head Ethnicity": resident.headEthnicity,
//         "Head Religion": resident.headReligion,
//         "Head Place of Birth": resident.headPlaceOfBirth,
//         "Head Marital Status": resident.headMaritalStatus,
//         "Head School Level": resident.headSchoolLevel,
//         "Head Place of School": resident.headPlaceOfSchool,
//         "Head Education": resident.headHighestLevelOfEducation,

//         // Spouse
//         "Spouse Name": `${resident.spouseFirstName} ${resident.spouseMiddleName} ${resident.spouseLastName}`,
//         "Spouse Age": resident.spouseAge,
//         "Spouse Birthday": resident.spouseBirthday,
//         "Spouse Sex": resident.spouseSex,
//         "Spouse Nationality": resident.spouseNationality,
//         "Spouse Ethnicity": resident.spouseEthnicity,
//         "Spouse Religion": resident.spouseReligion,
//         "Spouse Place of Birth": resident.spousePlaceOfBirth,
//         "Spouse Marital Status": resident.spouseMaritalStatus,
//         "Spouse School Level": resident.spouseSchoolLevel,
//         "Spouse Place of School": resident.spousePlaceOfSchool,
//         "Spouse Relationship to Head":
//           resident.spouseRelationshipToHouseHoldHead,
//         "Spouse Registered Voter": resident.spouseIsRegisteredVoter
//           ? "Yes"
//           : "No",
//       };

//       autoTable(doc, {
//         head: [["Head & Spouse Info", "Value"]],
//         body: formatObjectToRows(headSpouseFields).map((row) => [
//           row.field,
//           row.value,
//         ]),
//         startY: currentY + 3,
//       });

//       // ADDITIONAL INFO
//       const additional = resident.additionalInfos?.[0] || {};
//       autoTable(doc, {
//         head: [["Additional Information", "Value"]],
//         body: formatObjectToRows(additional).map((row) => [
//           row.field,
//           row.value,
//         ]),
//         startY: doc.lastAutoTable.finalY + 10,
//       });

//       // FAMILY MEMBERS
//       const members = resident.familyMembers || [];
//       members.forEach((member, idx) => {
//         autoTable(doc, {
//           head: [[`Family Member ${idx + 1}`, "Value"]],
//           body: formatObjectToRows(member).map((row) => [row.field, row.value]),
//           startY: doc.lastAutoTable.finalY + 10,
//         });
//       });
//     });

//     let fileName = "Resident-List";
//     if (residents.length <= 1) {
//       fileName = `Household-${residents[0].householdNo}`;
//     }
//     doc.save(fileName + `-${formatted}.pdf`);

//     await axiosInstance.post("/system-logs", {
//       action: "Download",
//       module: "Resident Management",
//       user: JSON.parse(localStorage.getItem("userId") || '""'), // Ensures proper formatting
//       details: `User ${currentUser.username} exported ${fileName}${
//         type && type !== "All" ? ` of type ${type}` : ""
//       } report on ${formatted}`,
//     });

//     toast.success("Data exported successfully!");
//   };

//   return (
//     <button className="export-all-indiv-button" onClick={generatePDF}>
//       {icon && <i className="fas fa-file"></i>}
//       {label}
//     </button>
//   );
// };

// // Prepare data: flatten each resident
// const residents = data.map((res) => ({
//   "Household No": res.householdNo,
//   Cluster: res.cluster,
//   "Brgy Health Worker": res.brgyHealthWorker,
//   "House Lot Block No": res.houseLotBlockNo,
//   "Door Input": res.doorInput,
//   "4Ps ID No": res.fourPsIdNo,

//   // Head of the Household
//   "Head Name": `${res.headFirstName} ${res.headMiddleName || ""} ${
//     res.headLastName
//   }`,
//   "Head Age": res.headAge,
//   "Head Sex": res.headSex,
//   "Head Birthday": new Date(res.headBirthday).toLocaleDateString(),
//   "Head Place of Birth": res.headPlaceOfBirth,
//   "Head Nationality": res.headNationality,
//   "Head Marital Status": res.headMaritalStatus,
//   "Head Religion": res.headReligion,
//   "Head Ethnicity": res.headEthnicity,
//   "Head Highest Level of Education": res.headHighestLevelOfEducation,
//   "Head School Level": res.headSchoolLevel,
//   "Head Place of School": res.headPlaceOfSchool,

//   // Spouse Information
//   "Spouse Name": `${res.spouseFirstName || ""} ${res.spouseLastName || ""}`,
//   "Spouse Age": res.spouseAge || "",
//   "Spouse Sex": res.spouseSex,
//   "Spouse Birthday": res.spouseBirthday
//     ? new Date(res.spouseBirthday).toLocaleDateString()
//     : "",
//   "Spouse Place of Birth": res.spousePlaceOfBirth,
//   "Spouse Nationality": res.spouseNationality,
//   "Spouse Marital Status": res.spouseMaritalStatus,
//   "Spouse Religion": res.spouseReligion,
//   "Spouse Ethnicity": res.spouseEthnicity,
//   "Spouse Registered Voter": res.spouseIsRegisteredVoter ? "Yes" : "No",
//   "Spouse School Level": res.spouseSchoolLevel,
//   "Spouse Place of School": res.spousePlaceOfSchool,

//   ...Object.fromEntries(
//     res.familyMembers?.flatMap((member, index) => [
//       [`Family Member #${index + 1} First Name`, member.firstName || ""],
//       [`Family Member #${index + 1} Middle Name`, member.middleName || ""],
//       [`Family Member #${index + 1} Last Name`, member.lastName || ""],
//       [
//         `Family Member #${index + 1} Relationship`,
//         member.relationship || "",
//       ],
//       [`Family Member #${index + 1} Age`, member.age || ""],
//       [`Family Member #${index + 1} Sex`, member.sex || ""],
//       [`Family Member #${index + 1} Birthday`, member.birthday || ""],
//       [
//         `Family Member #${index + 1} Place of Birth`,
//         member.placeOfBirth || "",
//       ],
//       [`Family Member #${index + 1} Nationality`, member.nationality || ""],
//       [
//         `Family Member #${index + 1} Marital Status`,
//         member.maritalStatus || "",
//       ],
//       [`Family Member #${index + 1} Religion`, member.religion || ""],
//       [`Family Member #${index + 1} Ethnicity`, member.ethnicity || ""],
//       [
//         `Family Member #${index + 1} Registered Voter`,
//         member.isRegisteredVoter ? "Yes" : "No",
//       ],
//       [
//         `Family Member #${index + 1} School Level`,
//         member.schoolLevel || "",
//       ],
//       [
//         `Family Member #${index + 1} Place of School`,
//         member.placeOfSchool || "",
//       ],
//     ])
//   ),

//   ...Object.fromEntries(
//     res.additionalInfos?.flatMap((info, index) => [
//       [`Add. Info #${index + 1} Name`, info.name || ""],
//       [`Add. Info #${index + 1} Pregnant`, info.pregnant || ""],
//       [
//         `Add. Info #${index + 1} Months Pregnant`,
//         info.pregnantMonths || "",
//       ],
//       [
//         `Add. Info #${index + 1} Family Planning`,
//         info.familyPlanning || "",
//       ],
//       [`Add. Info #${index + 1} PWD`, info.pwd || ""],
//       [`Add. Info #${index + 1} Solo Parent`, info.soloParent || ""],
//       [`Add. Info #${index + 1} Senior Citizen`, info.seniorCitizen || ""],
//       [`Add. Info #${index + 1} Maintenance`, info.maintenance || ""],
//       [`Add. Info #${index + 1} PhilHealth`, info.philhealth || ""],
//       [`Add. Info #${index + 1} House Lot`, info.houseLot || ""],
//       [`Add. Info #${index + 1} Water Supply`, info.waterSupply || ""],
//       [`Add. Info #${index + 1} Comfort Room`, info.comfortRoom || ""],
//       [`Add. Info #${index + 1} OFW Country`, info.ofwCountry || ""],
//       [
//         `Add. Info #${index + 1} Years in Service`,
//         info.yearsInService || "",
//       ],
//       [`Add. Info #${index + 1} Out of School`, info.outOfSchool || ""],
//       [
//         `Add. Info #${index + 1} Immigrant Nationality`,
//         info.immigrantNationality || "",
//       ],
//       [`Add. Info #${index + 1} Years of Stay`, info.yearsOfStay || ""],
//       [`Add. Info #${index + 1} Residence`, info.residence || ""],
//     ])
//   ),
// }));

// // Create worksheet and workbook
// const workbook = XLSX.utils.book_new();
// const worksheet = XLSX.utils.json_to_sheet(residents);

// // Add worksheet to workbook
// XLSX.utils.book_append_sheet(workbook, worksheet, "Residents");

// // Define custom header styling
// const headerStyle = {
//   fill: { fgColor: { rgb: "1F53DD" } }, // Blue background
//   font: {
//     name: "Century Gothic", // Set font to Century Gothic
//     sz: 12, // Set font size to 12
//     color: { rgb: "FFFFFF" },
//     bold: true,
//   }, // White bold font
//   alignment: { horizontal: "center", vertical: "center" },
// };

// // Manually set header row with styling
// // const headers = Object.keys(residents[0]);
// const headers = Array.from(
//   new Set(residents.flatMap((resident) => Object.keys(resident)))
// );

// headers.forEach((headerText, idx) => {
//   const cellAddress = XLSX.utils.encode_cell({ r: 0, c: idx });
//   worksheet[cellAddress] = {
//     v: headerText,
//     s: headerStyle,
//   };
// });

// residents.forEach((resident, rowIdx) => {
//   headers.forEach((key, colIdx) => {
//     const cellAddress = XLSX.utils.encode_cell({
//       r: rowIdx + 1, // +1 to skip header
//       c: colIdx,
//     });

//     // Set default empty string if the cell doesn't exist
//     if (!worksheet[cellAddress]) {
//       worksheet[cellAddress] = { v: "", t: "s" }; // set empty string if no value
//     }

//     const cellValue = resident[key];
//     const isNumericOnly =
//       (typeof cellValue === "string" && /^[0-9]+$/.test(cellValue)) ||
//       typeof cellValue === "number" ||
//       (typeof cellValue === "string" &&
//         /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cellValue)) ||
//       (typeof cellValue === "string" &&
//         /^\d{4}-\d{2}-\d{2}T/.test(cellValue));
//     // typeof cellValue === "string" && /^[0-9]+$/.test(cellValue);

//     // Adjust data style dynamically based on whether it contains only numbers
//     const dataStyle = {
//       fill: {
//         patternType: "solid",
//         fgColor: { rgb: "FFF2F2F2" }, // Light gray
//       },
//       font: {
//         name: "Century Gothic", // Set font to Century Gothic
//         sz: 12, // Set font size to 12
//         color: { rgb: "FF000000" }, // Black
//       },
//       alignment: {
//         horizontal: isNumericOnly ? "center" : "left",
//         vertical: "center",
//       },
//     };

//     // Apply the style to the current cell
//     worksheet[cellAddress].s = dataStyle;
//   });
// });

// // Apply column widths (optional, adjust as needed)
// worksheet["!cols"] = headers.map(() => ({ wch: 50 }));

// // Export Excel file
// const excelBuffer = XLSX.write(workbook, {
//   bookType: "xlsx",
//   type: "array",
// });

// const fileData = new Blob([excelBuffer], {
//   type: "application/octet-stream",
// });

// let fileName = "Resident-List";
// if (residents.length <= 1) {
//   fileName = `Household-${residents[0]["Household No"]}`;
// }

// if (type) {
//   // saveAs(fileData, `${type} ${fileName}-${formatted}.xlsx`);
// } else {
//   saveAs(fileData, `${fileName}-${formatted}.xlsx`);
// }

// export async function fetchAndAppendResidentData(fileUrl, residents) {
//   try {
//     // Fetch the template Excel file
//     const response = await fetch(fileUrl);
//     if (!response.ok)
//       throw new Error("Failed to fetch template file from server.");
//     const templateBuffer = await response.arrayBuffer();

//     // Process each resident
//     for (const resArg of residents) {
//       const workbook = new ExcelJS.Workbook();
//       await workbook.xlsx.load(templateBuffer);

//       // Get the two sheets and rename them based on head's last name
//       const headLastName = resArg.headLastName || "Unknown";
//       const sheet1 = workbook.getWorksheet(1);
//       const sheet2 = workbook.getWorksheet(2);
//       sheet1.name = `${headLastName}_Front`;
//       sheet2.name = `${headLastName}_Back`;

//       // SHEET 1 FRONT
//       // ABOUT
//       sheet1.getCell("D9").value = resArg.cluster;
//       sheet1.getCell("D10").value = resArg.brgyHealthWorker;
//       sheet1.getCell("Q9").value = resArg.householdNo;
//       sheet1.getCell("Q10").value = resArg.totalMembers;
//       sheet1.getCell("AE9").value = resArg.houseLotBlockNo;
//       sheet1.getCell("AE10").value = resArg.doorInput;
//       sheet1.getCell("AE11").value = resArg.fourPsIdNo;

//       // HEAD
//       sheet1.getCell("A16").value = resArg.headFirstName;
//       sheet1.getCell("C16").value = resArg.headMiddleName;
//       sheet1.getCell("E16").value = resArg.headLastName;
//       sheet1.getCell("G16").value = resArg.relationshipToHouseHoldHead;
//       sheet1.getCell("I16").value = resArg.headSex;
//       sheet1.getCell("J16").value = resArg.headAge;
//       sheet1.getCell("K16").value = resArg.headBirthday
//         ? new Date(resArg.headBirthday).toLocaleDateString()
//         : "";
//       sheet1.getCell("M16").value = resArg.headPlaceOfBirth;
//       sheet1.getCell("N16").value = resArg.headNationality;
//       sheet1.getCell("P16").value = resArg.headMaritalStatus;
//       sheet1.getCell("R16").value = resArg.headReligion;
//       sheet1.getCell("T16").value = resArg.headEthnicity;
//       sheet1.getCell("V16").value = resArg.headIsRegisteredVoter ? "Yes" : "No";
//       sheet1.getCell("X16").value = resArg.headHighestLevelOfEducation;
//       sheet1.getCell("Z16").value = resArg.headPlaceOfSchool;
//       sheet1.getCell("AB16").value = resArg.headHouseLot;
//       sheet1.getCell("AD16").value = resArg.headWaterSupply;
//       sheet1.getCell("AF16").value = resArg.headComfortRoom;
//       sheet1.getCell("AH16").value = resArg.headResidence;

//       // SPOUSE
//       sheet1.getCell("A22").value = resArg.spouseFirstName;
//       sheet1.getCell("C22").value = resArg.spouseMiddleName;
//       sheet1.getCell("E22").value = resArg.spouseLastName;
//       sheet1.getCell("G22").value = resArg.spouseRelationshipToHouseHoldHead;
//       sheet1.getCell("I22").value = resArg.spouseSex;
//       sheet1.getCell("J22").value = resArg.spouseAge;
//       sheet1.getCell("K22").value = resArg.spouseBirthday
//         ? new Date(resArg.spouseBirthday).toLocaleDateString()
//         : "";
//       sheet1.getCell("M22").value = resArg.spousePlaceOfBirth;
//       sheet1.getCell("N22").value = resArg.spouseNationality;
//       sheet1.getCell("P22").value = resArg.spouseMaritalStatus;
//       sheet1.getCell("R22").value = resArg.spouseReligion;
//       sheet1.getCell("T22").value = resArg.spouseEthnicity;
//       sheet1.getCell("V22").value = resArg.spouseIsRegisteredVoter
//         ? "Yes"
//         : "No";
//       sheet1.getCell("X22").value = resArg.spouseHighestLevelOfEducation;
//       sheet1.getCell("Z22").value = resArg.spousePlaceOfSchool;
//       sheet1.getCell("AB22").value = resArg.spouseHouseLot;
//       sheet1.getCell("AD22").value = resArg.spouseWaterSupply;
//       sheet1.getCell("AF22").value = resArg.spouseComfortRoom;
//       sheet1.getCell("AH22").value = resArg.spouseResidence;

//       // FAMILY MEMBERS (Assuming at least one, extend as needed)
//       if (resArg.familyMembers && resArg.familyMembers.length > 0) {
//         sheet1.getCell("A28").value = resArg.familyMembers[0].firstName;
//         sheet1.getCell("C28").value = resArg.familyMembers[0].middleName;
//         sheet1.getCell("E28").value = resArg.familyMembers[0].lastName;
//         sheet1.getCell("G28").value = resArg.familyMembers[0].relationship;
//         sheet1.getCell("I28").value = resArg.familyMembers[0].sex;
//         sheet1.getCell("J28").value = resArg.familyMembers[0].age;
//         sheet1.getCell("K28").value = resArg.familyMembers[0].birthday
//           ? new Date(resArg.familyMembers[0].birthday).toLocaleDateString()
//           : "";
//         sheet1.getCell("M28").value = resArg.familyMembers[0].placeOfBirth;
//         sheet1.getCell("N28").value = resArg.familyMembers[0].nationality;
//         sheet1.getCell("P28").value = resArg.familyMembers[0].maritalStatus;
//         sheet1.getCell("R28").value = resArg.familyMembers[0].religion;
//         sheet1.getCell("T28").value = resArg.familyMembers[0].ethnicity;
//         sheet1.getCell("V28").value = resArg.familyMembers[0].isRegisteredVoter
//           ? "Yes"
//           : "No";
//         sheet1.getCell("X28").value = resArg.familyMembers[0].schoolLevel;
//         sheet1.getCell("Z28").value = resArg.familyMembers[0].placeOfSchool;
//         sheet1.getCell("AB28").value = resArg.familyMembers[0].houseLot;
//         sheet1.getCell("AD28").value = resArg.familyMembers[0].waterSupply;
//         sheet1.getCell("AF28").value = resArg.familyMembers[0].comfortRoom;
//         sheet1.getCell("AH28").value = resArg.familyMembers[0].residence;
//       }

//       // SHEET 2 BACK
//       if (resArg.additionalInfos && resArg.additionalInfos.length > 0) {
//         sheet2.getCell("A14").value = resArg.additionalInfos[0].name;
//         sheet2.getCell("F14").value = resArg.additionalInfos[0].pregnant;
//         sheet2.getCell("H14").value = resArg.additionalInfos[0].familyPlanning;
//         sheet2.getCell("J14").value = resArg.additionalInfos[0].pwd;
//         sheet2.getCell("L14").value = resArg.additionalInfos[0].soloParent;
//         sheet2.getCell("M14").value = resArg.additionalInfos[0].seniorCitizen;
//         sheet2.getCell("O14").value = resArg.additionalInfos[0].maintenance;
//         sheet2.getCell("Q14").value = resArg.additionalInfos[0].philhealth;
//         sheet2.getCell("S14").value = resArg.additionalInfos[0].ofwCountry;
//         sheet2.getCell("U14").value = resArg.additionalInfos[0].yearsInService;
//         sheet2.getCell("V14").value = resArg.additionalInfos[0].outOfSchool;
//         sheet2.getCell("X14").value =
//           resArg.additionalInfos[0].immigrantNationality;
//         sheet2.getCell("Z14").value = resArg.additionalInfos[0].yearsOfStay;
//       }

//       // Save the workbook for this resident
//       const updatedBuffer = await workbook.xlsx.writeBuffer();
//       const blob = new Blob([updatedBuffer], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });

//       saveAs(blob, `${headLastName}_ResidentData.xlsx`);
//     }
//   } catch (err) {
//     console.error("Error processing resident Excel files:", err);
//   }
// }

// export async function fetchAndAppendResidentData(fileUrl, resArg) {
//   try {
//     const response = await fetch(fileUrl);
//     if (!response.ok) throw new Error("Failed to fetch file from server.");
//     const fileBuffer = await response.arrayBuffer();

//     const workbook = new ExcelJS.Workbook();
//     await workbook.xlsx.load(fileBuffer);

//     resArg = resArg.filter((res) => res.headFirstName === "HEAD");
//     console.log(resArg);
//     // ! SHEET 1 FRONT
//     const sheet1 = workbook.getWorksheet(1);

//     // * ABOUT
//     sheet1.getCell("D9").value = resArg[0].cluster;
//     sheet1.getCell("D10").value = resArg[0].brgyHealthWorker;
//     sheet1.getCell("Q9").value = resArg[0].householdNo;
//     sheet1.getCell("Q10").value = resArg[0].totalMembers;
//     sheet1.getCell("AE9").value = resArg[0].houseLotBlockNo;
//     sheet1.getCell("AE10").value = resArg[0].doorInput;
//     sheet1.getCell("AE11").value = resArg[0].fourPsIdNo;

//     // * HEAD
//     sheet1.getCell("A16").value = resArg[0].headFirstName;
//     sheet1.getCell("C16").value = resArg[0].headMiddleName;
//     sheet1.getCell("E16").value = resArg[0].headLastName;
//     sheet1.getCell("G16").value = resArg[0].relationshipToHouseHoldHead;
//     sheet1.getCell("I16").value = resArg[0].headSex;
//     sheet1.getCell("J16").value = resArg[0].headAge;
//     sheet1.getCell("K16").value = new Date(
//       resArg[0].headBirthday
//     ).toLocaleDateString();
//     sheet1.getCell("M16").value = resArg[0].headPlaceOfBirth;
//     sheet1.getCell("N16").value = resArg[0].headNationality;
//     sheet1.getCell("P16").value = resArg[0].headMaritalStatus;
//     sheet1.getCell("R16").value = resArg[0].headReligion;
//     sheet1.getCell("T16").value = resArg[0].headEthnicity;
//     sheet1.getCell("V16").value = resArg[0].headIsRegisteredVoter
//       ? "Yes"
//       : "No";
//     sheet1.getCell("X16").value = resArg[0].headHighestLevelOfEducation;
//     sheet1.getCell("Z16").value = resArg[0].headPlaceOfSchool;
//     sheet1.getCell("AB16").value = resArg[0].headHouseLot;
//     sheet1.getCell("AD16").value = resArg[0].headWaterSupply;
//     sheet1.getCell("AF16").value = resArg[0].headComfortRoom;
//     sheet1.getCell("AH16").value = resArg[0].headResidence;

//     // * SPOUSE
//     sheet1.getCell("A22").value = resArg[0].spouseFirstName;
//     sheet1.getCell("C22").value = resArg[0].spouseMiddleName;
//     sheet1.getCell("E22").value = resArg[0].spouseLastName;
//     sheet1.getCell("G22").value = resArg[0].spouseRelationshipToHouseHoldHead;
//     sheet1.getCell("I22").value = resArg[0].spouseSex;
//     sheet1.getCell("J22").value = resArg[0].spouseAge;
//     sheet1.getCell("K22").value = new Date(
//       resArg[0].spouseBirthday
//     ).toLocaleDateString();
//     sheet1.getCell("M22").value = resArg[0].spousePlaceOfBirth;
//     sheet1.getCell("N22").value = resArg[0].spouseNationality;
//     sheet1.getCell("P22").value = resArg[0].spouseMaritalStatus;
//     sheet1.getCell("R22").value = resArg[0].spouseReligion;
//     sheet1.getCell("T22").value = resArg[0].spouseEthnicity;
//     sheet1.getCell("V22").value = resArg[0].spouseIsRegisteredVoter
//       ? "Yes"
//       : "No";
//     sheet1.getCell("X22").value = resArg[0].spouseHighestLevelOfEducation;
//     sheet1.getCell("Z22").value = resArg[0].spousePlaceOfSchool;
//     sheet1.getCell("AB22").value = resArg[0].spouseHouseLot;
//     sheet1.getCell("AD22").value = resArg[0].spouseWaterSupply;
//     sheet1.getCell("AF22").value = resArg[0].spouseComfortRoom;
//     sheet1.getCell("AH22").value = resArg[0].spouseResidence;

//     // * FAM MEMBERS
//     sheet1.getCell("A28").value = resArg[0].familyMembers[0].firstName;
//     sheet1.getCell("C28").value = resArg[0].familyMembers[0].middleName;
//     sheet1.getCell("E28").value = resArg[0].familyMembers[0].lastName;
//     sheet1.getCell("G28").value = resArg[0].familyMembers[0].relationship;
//     sheet1.getCell("I28").value = resArg[0].familyMembers[0].sex;
//     sheet1.getCell("J28").value = resArg[0].familyMembers[0].age;
//     sheet1.getCell("K28").value = new Date(
//       resArg[0].familyMembers[0].birthday
//     ).toLocaleDateString();
//     sheet1.getCell("M28").value = resArg[0].familyMembers[0].placeOfBirth;
//     sheet1.getCell("N28").value = resArg[0].familyMembers[0].nationality;
//     sheet1.getCell("P28").value = resArg[0].familyMembers[0].maritalStatus;
//     sheet1.getCell("R28").value = resArg[0].familyMembers[0].religion;
//     sheet1.getCell("T28").value = resArg[0].familyMembers[0].ethnicity;
//     sheet1.getCell("V28").value = resArg[0].familyMembers[0].isRegisteredVoter
//       ? "Yes"
//       : "No";
//     sheet1.getCell("X28").value = resArg[0].familyMembers[0].schoolLevel;
//     sheet1.getCell("Z28").value = resArg[0].familyMembers[0].placeOfSchool;
//     sheet1.getCell("AB28").value = resArg[0].familyMembers[0].houseLot;
//     sheet1.getCell("AD28").value = resArg[0].familyMembers[0].waterSupply;
//     sheet1.getCell("AF28").value = resArg[0].familyMembers[0].comfortRoom;
//     sheet1.getCell("AH28").value = resArg[0].familyMembers[0].residence;

//     // ! SHEET 2 BACK
//     const sheet2 = workbook.getWorksheet(2);
//     sheet2.getCell("A14").value = resArg[0].additionalInfos[0].name;
//     sheet2.getCell("F14").value = resArg[0].additionalInfos[0].pregnant;
//     sheet2.getCell("H14").value = resArg[0].additionalInfos[0].familyPlanning;
//     sheet2.getCell("J14").value = resArg[0].additionalInfos[0].pwd;
//     sheet2.getCell("L14").value = resArg[0].additionalInfos[0].soloParent;
//     sheet2.getCell("M14").value = resArg[0].additionalInfos[0].seniorCitizen;
//     sheet2.getCell("O14").value = resArg[0].additionalInfos[0].maintenance;
//     sheet2.getCell("Q14").value = resArg[0].additionalInfos[0].philhealth;
//     sheet2.getCell("S14").value = resArg[0].additionalInfos[0].ofwCountry;
//     sheet2.getCell("U14").value = resArg[0].additionalInfos[0].yearsInService;
//     sheet2.getCell("V14").value = resArg[0].additionalInfos[0].outOfSchool;
//     sheet2.getCell("X14").value = resArg[0].additionalInfos[0].immigrantNationality;
//     sheet2.getCell("Z14").value = resArg[0].additionalInfos[0].yearsOfStay;

//     const updatedBuffer = await workbook.xlsx.writeBuffer();
//     const blob = new Blob([updatedBuffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });

//     saveAs(blob, "updated_residents_with_logo.xlsx");
//   } catch (err) {
//     console.error("Error updating Excel file:", err);
//   }
// }

// async function fetchAndAppendResidentData(fileUrl, resArg) {
//   try {
//     // Fetch the Excel file from the server
//     const response = await fetch(fileUrl);
//     if (!response.ok) throw new Error("Failed to fetch file from server.");

//     const fileBuffer = await response.arrayBuffer();

//     // Load workbook from buffer
//     const workbook = new ExcelJS.Workbook();
//     await workbook.xlsx.load(fileBuffer);

//     const worksheet = workbook.getWorksheet(1); // Or use sheet name if preferred

//     // * NOTE: D, Q, AE (4-5), ABOUT
//     // * A14 FN, C14, MN, E14 LN

//     console.log(resArg[0]);

//     worksheet.getCell("D4").value = resArg[0].cluster;
//     worksheet.getCell("D5").value = resArg[0].brgyHealthWorker;
//     worksheet.getCell("Q4").value = resArg[0].householdNo;
//     worksheet.getCell("Q5").value = resArg[0].totalMembers;
//     worksheet.getCell("AE4").value = resArg[0].houseLotBlockNo;
//     worksheet.getCell("AE5").value = resArg[0].doorInput;
//     worksheet.getCell("AE6").value = resArg[0].fourPsIdNo;

//     // const residents = resArg.map((res) => {
//     //   return res;
//     // });

//     // Append values to the next available column in rows 4–8
//     // for (let i = 0; i < 5; i++) {
//     //   const rowNumber = 4 + i;
//     //   const row = worksheet.getRow(rowNumber);

//     //   let col = 4; // Start at column D
//     //   while (
//     //     row.getCell(col).value !== null &&
//     //     row.getCell(col).value !== undefined
//     //   ) {
//     //     col++;
//     //   }

//     //   row.getCell(col).value = values[i];
//     //   row.commit();
//     // }

//     // Write and trigger download
//     const updatedBuffer = await workbook.xlsx.writeBuffer();
//     const blob = new Blob([updatedBuffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });

//     saveAs(blob, "updated_residents.xlsx");
//   } catch (err) {
//     console.error("Error updating Excel file:", err);
//   }
// }

export default ExportToExcel;
