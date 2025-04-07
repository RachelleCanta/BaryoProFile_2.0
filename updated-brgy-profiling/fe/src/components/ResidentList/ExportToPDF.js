import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useContext } from "react";
import { UserContext } from "../../contexts/userContext";
import axiosInstance from "../../axios";
import { toast } from "react-toastify";

const ExportToPDF = ({ data, label, icon, type }) => {
  const { currentUser } = useContext(UserContext);

  const generatePDF = async () => {
    const doc = new jsPDF();
    let residents = data;

    const darasa = "../../public/images/darasa-logo.png";
    const system = "../../public/images/system-logo.png";
    const tanauan = "../../public/images/tanauan-logo.png";

    // ==== ADD HEADER TEXT ====
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Baranggay Darasa Resident Information Report", 105, 20, {
      align: "center",
    });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const today = new Date();
    const formatted = `${
      today.getMonth() + 1
    }/${today.getDate()}/${today.getFullYear()}`;
    doc.text(`Date Printed: ${formatted}`, 105, 28, {
      align: "center",
    });
    doc.text(
      `Prepared By: ${currentUser.username} (${currentUser.role})`,
      105,
      34,
      {
        align: "center",
      }
    );

    if (type) {
      doc.text(`Report Type: ${type} Residents`, 105, 40, {
        align: "center",
      });
    }

    doc.setDrawColor(0);
    doc.line(10, 44, 200, 44); // line after header

    let currentY = 50;

    // Helper to convert object to rows
    const formatObjectToRows = (obj) =>
      Object.entries(obj).map(([key, value]) => ({
        field: key,
        value:
          value === null || value === undefined
            ? "N/A"
            : typeof value === "boolean"
            ? value
              ? "Yes"
              : "No"
            : value.toString(),
      }));

    residents.forEach((resident, i) => {
      if (i > 0) {
        doc.addPage(); // add new page for each household
        currentY = 20;
      }

      // HEADER
      doc.setFontSize(14);
      if (residents.length > 1) {
        doc.text(`Household ${i + 1}: ${resident.householdNo}`, 14, currentY);
      } else {
        doc.text(`Household : ${resident.householdNo}`, 14, currentY);
      }

      // HEAD & SPOUSE
      const headSpouseFields = {
        "Household No": resident.householdNo,
        "Relationship To Head": resident.relationshipToHouseHoldHead,
        "House/Lot/Block No": resident.houseLotBlockNo,

        // Head
        "Head Name": `${resident.headFirstName} ${resident.headMiddleName} ${resident.headLastName}`,
        "Head Age": resident.headAge,
        "Head Birthday": resident.headBirthday,
        "Head Sex": resident.headSex,
        "Head Nationality": resident.headNationality,
        "Head Ethnicity": resident.headEthnicity,
        "Head Religion": resident.headReligion,
        "Head Place of Birth": resident.headPlaceOfBirth,
        "Head Marital Status": resident.headMaritalStatus,
        "Head School Level": resident.headSchoolLevel,
        "Head Place of School": resident.headPlaceOfSchool,
        "Head Education": resident.headHighestLevelOfEducation,

        // Spouse
        "Spouse Name": `${resident.spouseFirstName} ${resident.spouseMiddleName} ${resident.spouseLastName}`,
        "Spouse Age": resident.spouseAge,
        "Spouse Birthday": resident.spouseBirthday,
        "Spouse Sex": resident.spouseSex,
        "Spouse Nationality": resident.spouseNationality,
        "Spouse Ethnicity": resident.spouseEthnicity,
        "Spouse Religion": resident.spouseReligion,
        "Spouse Place of Birth": resident.spousePlaceOfBirth,
        "Spouse Marital Status": resident.spouseMaritalStatus,
        "Spouse School Level": resident.spouseSchoolLevel,
        "Spouse Place of School": resident.spousePlaceOfSchool,
        "Spouse Relationship to Head":
          resident.spouseRelationshipToHouseHoldHead,
        "Spouse Registered Voter": resident.spouseIsRegisteredVoter
          ? "Yes"
          : "No",
      };

      autoTable(doc, {
        head: [["Head & Spouse Info", "Value"]],
        body: formatObjectToRows(headSpouseFields).map((row) => [
          row.field,
          row.value,
        ]),
        startY: currentY + 3,
      });

      // ADDITIONAL INFO
      const additional = resident.additionalInfos?.[0] || {};
      autoTable(doc, {
        head: [["Additional Information", "Value"]],
        body: formatObjectToRows(additional).map((row) => [
          row.field,
          row.value,
        ]),
        startY: doc.lastAutoTable.finalY + 10,
      });

      // FAMILY MEMBERS
      const members = resident.familyMembers || [];
      members.forEach((member, idx) => {
        autoTable(doc, {
          head: [[`Family Member ${idx + 1}`, "Value"]],
          body: formatObjectToRows(member).map((row) => [row.field, row.value]),
          startY: doc.lastAutoTable.finalY + 10,
        });
      });
    });

    let fileName = "Resident-List";
    if (residents.length <= 1) {
      fileName = `Household-${residents[0].householdNo}`;
    }
    doc.save(fileName + `-${formatted}.pdf`);

    await axiosInstance.post("/system-logs", {
      action: "Download",
      module: "Resident Management",
      user: JSON.parse(localStorage.getItem("userId") || '""'), // Ensures proper formatting
      details: `User ${currentUser.username} exported ${fileName}${
        type && type !== "All" ? ` of type ${type}` : ""
      } report on ${formatted}`,
    });

    toast.success("Data exported successfully!")
  };

  return (
    <button className="export-all-indiv-button" onClick={generatePDF}>
      {icon && <i className="fas fa-file"></i>}
      {label}
    </button>
  );
};

export default ExportToPDF;
