// src/components/ResidentList/ResidentList.js
import React, { useState, useEffect, useContext } from "react";
import { logResidentActivity, ACTIONS } from "../../utils/auditLogger";
import { checkPermission, PERMISSIONS } from "../Permission/Permissions";
import PermissionErrorModal from "../Permission/PermissionErrorModal";
import "../../styles/ResidentList.css";
import axios from "axios";
import { ResidentContext } from "../../contexts/residentContext";
import axiosInstance from "../../axios";
import { UserContext } from "../../contexts/userContext.js";
import ExportToPDF from "./ExportToPDF.js";
import { toast } from "react-toastify";

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

function ResidentList({ onBack, onEditClick }) {
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedResident, setSelectedResident] = useState(null);
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [expandedFamilies, setExpandedFamilies] = useState({});

  const { editingID, setEditingID, deletingID, setDeletingID } =
    useContext(ResidentContext);

  // useEffect(() => {
  //     const savedResidents = JSON.parse(localStorage.getItem('familyMembers')) || [];

  //     // Ensure additionalInfos exists for all residents
  //     const normalizedResidents = savedResidents.map(resident => {
  //         // Check if we're dealing with old data format (using additionalInfo)
  //         // or new format (using additionalInfos)
  //         if (resident.additionalInfo && !resident.additionalInfos) {
  //             resident.additionalInfos = resident.additionalInfo;
  //             delete resident.additionalInfo;
  //         }

  //         // Ensure additionalInfos exists
  //         if (!resident.additionalInfos) {
  //             resident.additionalInfos = [];
  //         }

  //         return resident;
  //     });

  //     setResidents(normalizedResidents);

  //     // If the data was normalized, update localStorage
  //     if (JSON.stringify(normalizedResidents) !== JSON.stringify(savedResidents)) {
  //         localStorage.setItem('familyMembers', JSON.stringify(normalizedResidents));
  //     }

  //     const user = JSON.parse(localStorage.getItem('currentUser'));
  //     setCurrentUser(user);
  // }, []);

  const fetchResidents = async () => {
    try {
      let response = null;
      let fetchedResidents = [];

      if (currentUser.role === "user") {
        response = await axios.get(
          `http://localhost:8080/api/residents/${currentUser.linkedResident}`
        );
        fetchedResidents = [response.data.data];
      } else {
        response = await axios.get(`http://localhost:8080/api/residents`);
        fetchedResidents = response.data.data;
      }

      console.log(fetchedResidents);

      // * normalize the data
      const normalizedResidents = fetchedResidents.map((resident) => {
        if (resident.additionalInfo && !resident.additionalInfos) {
          resident.additionalInfos = resident.additionalInfo;
          delete resident.additionalInfo;
        }

        if (!resident.additionalInfos) {
          resident.additionalInfos = [];
        }

        return resident;
      });

      setResidents(normalizedResidents);
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
  };

  useEffect(() => {
    fetchResidents();
    // Retrieve current user from localStorage
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);
  }, []);

  const handleNameClick = (resident, index) => {
    // Check if user has MANAGE permission for editing
    if (checkPermission(currentUser, PERMISSIONS.MANAGE)) {
      handleEdit(index);
    } else {
      // If no MANAGE permission, just toggle the view
      toggleFamily(index);
    }
  };

  const toggleFamily = async (index, resident = null) => {
    setExpandedFamilies((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
    await axiosInstance.post("/system-logs", {
      action: ACTIONS.VIEW,
      module: "Resident List",
      user: currentUser.id,
      details: `User ${currentUser.username} Viewed resident information: ${resident.headFirstName} ${resident.headLastName}`,
    });
  };

  const handleEdit = async (index, id = null) => {
    // Debug logs to check permissions
    console.log("Current user:", currentUser);
    console.log("User permissions:", currentUser?.permissions);
    console.log(
      "Has MANAGE permission:",
      checkPermission(currentUser, PERMISSIONS.MANAGE)
    );

    // Check for MANAGE permission first
    if (!checkPermission(currentUser, PERMISSIONS.MANAGE)) {
      setShowErrorModal(true);
      return;
    }

    const selectedResident = residents[index];
    // ! LOG EDIT ACT HERE
    // logResidentActivity(
    //   currentUser?.username || "systemadmin",
    //   "EDIT",
    //   `Edited resident information for ${selectedResident.headFirstName} ${selectedResident.headLastName}`,
    //   {
    //     residentId: index,
    //     cluster: selectedResident.cluster,
    //     household: selectedResident.household,
    //     module: "Resident Management",
    //   }
    // );
    await axiosInstance.post("/system-logs", {
      action: ACTIONS.VIEW,
      module: "Resident List",
      user: currentUser.id,
      details: `User ${currentUser.username} opened resident information: ${selectedResident.headFirstName} ${selectedResident.headLastName} for editing`,
    });

    // Ensure we're passing additionalInfos, not additionalInfo
    const editingData = {
      cluster: selectedResident.cluster || "",
      brgyHealthWorker: selectedResident.brgyHealthWorker || "",
      householdNo: selectedResident.householdNo || "",
      totalMembers: selectedResident.totalMembers || "",
      houseLotBlockNo: selectedResident.houseLotBlockNo || "",
      doorInput: selectedResident.doorInput || "",
      fourPsIdNo: selectedResident.fourPsIdNo || "",
      headFirstName: selectedResident.headFirstName || "",
      headMiddleName: selectedResident.headMiddleName || "",
      headLastName: selectedResident.headLastName || "",
      headAge: selectedResident.headAge || "",
      headSex: selectedResident.headSex || "",
      headBirthday: selectedResident.headBirthday || "",
      headPlaceOfBirth: selectedResident.headPlaceOfBirth || "",
      headNationality: selectedResident.headNationality || "",
      headMaritalStatus: selectedResident.headMaritalStatus || "",
      headReligion: selectedResident.headReligion || "",
      headEthnicity: selectedResident.headEthnicity || "",
      headHighestLevelOfEducation:
        selectedResident.headHighestLevelOfEducation || "",
      headSchoolLevel: selectedResident.headSchoolLevel || "",
      headPlaceOfSchool: selectedResident.headPlaceOfSchool || "",
      spouseFirstName: selectedResident.spouseFirstName || "",
      spouseMiddleName: selectedResident.spouseMiddleName || "",
      spouseLastName: selectedResident.spouseLastName || "",
      relationshipToHouseHoldHead: "Spouse",
      spouseAge: selectedResident.spouseAge || "",
      spouseSex: selectedResident.spouseSex || "",
      spouseBirthday: selectedResident.spouseBirthday || "",
      spousePlaceOfBirth: selectedResident.spousePlaceOfBirth || "",
      spouseNationality: selectedResident.spouseNationality || "",
      spouseMaritalStatus: selectedResident.spouseMaritalStatus || "",
      spouseReligion: selectedResident.spouseReligion || "",
      spouseEthnicity: selectedResident.spouseEthnicity || "",
      spouseIsRegisteredVoter: selectedResident.spouseIsRegisteredVoter
        ? "Registered"
        : "Not Registered" || "",
      spouseSchoolLevel: selectedResident.spouseSchoolLevel || "",
      spousePlaceOfSchool: selectedResident.spousePlaceOfSchool || "",
      familyMembers: (selectedResident.familyMembers || []).map((member) => ({
        firstName: member.firstName || "",
        middleName: member.middleName || "",
        lastName: member.lastName || "",
        age: member.age || "",
        sex: member.sex || "",
        relationship: member.relationship || "",
        birthday: member.birthday || "",
        placeOfBirth: member.placeOfBirth || "",
        nationality: member.nationality || "",
        maritalStatus: member.maritalStatus || "",
        religion: member.religion || "",
        ethnicity: member.ethnicity || "",
        isRegisteredVoter: member.IsRegisteredVoter
          ? "Registered"
          : "Not Registered" || "",
        schoolLevel: member.schoolLevel || "",
        placeOfSchool: member.placeOfSchool || "",
      })),
      additionalInfos: (selectedResident.additionalInfos || []).map((info) => ({
        name: info.name || "",
        pregnant: info.pregnant || "",
        pregnantMonths: info.pregnantMonths || "",
        familyPlanning: info.familyPlanning || "",
        pwd: info.pwd || "N/A",
        soloParent: info.soloParent || "",
        seniorCitizen: info.seniorCitizen || "",
        maintenance: info.maintenance || "",
        philhealth: info.philhealth || "",
        houseLot: info.houseLot || "",
        waterSupply: info.waterSupply || "",
        comfortRoom: info.comfortRoom || "",
        ofwCountry: info.ofwCountry || "",
        yearsInService: info.yearsInService || "",
        outOfSchool: info.outOfSchool || "",
        immigrantNationality: info.immigrantNationality || "",
        yearsOfStay: info.yearsOfStay || "",
        residence: info.residence || "",
      })),
    };

    // ! WONT BE OMITTED BC THIS IS HELPFUL FOR PASSING DATA
    localStorage.setItem("editingResident", JSON.stringify(editingData));
    localStorage.setItem("editingIndex", index.toString());
    localStorage.setItem("editingID", String(id));
    setEditingID(id);
    onEditClick();
  };

  const handleDelete = async (index, id = null) => {
    if (!checkPermission(currentUser, PERMISSIONS.MANAGE)) {
      // Changed from DELETE to MANAGE
      setShowErrorModal(true);
      return;
    }
    if (window.confirm("Are you sure you want to delete this record?")) {
      // ! LOG ACT HERE
      // logResidentActivity(
      //   currentUser?.username || "systemadmin",
      //   "DELETE",
      //   `Deleted resident record for ${deletedResident.headFirstName} ${deletedResident.headLastName}`,
      //   {
      //     residentId: index,
      //     cluster: deletedResident.cluster,
      //     household: deletedResident.household,
      //     module: "Resident Management",
      //   }
      // );

      try {
        let url = "http://localhost:8080/api/residents";
        let response = await axios.delete(`${url}/${id}`);
        if (response.data.success === true) {
          toast.success("Information deleted successfully");
          await axiosInstance.post("/system-logs", {
            action: ACTIONS.DELETE,
            module: "Resident List",
            user: currentUser.id,
            details: `User ${currentUser.username} deleted a resident information: ${response.data.deletedResident.headFirstName} ${response.data.deletedResident.headLastName}`,
          });
          await fetchResidents();
        }
      } catch (error) {
        toast.error(error.response.data.error);
        console.log(error.response.data);
      }
    }
  };

  const handleSave = (editedResident) => {
    console.log("Saving edited resident:", editedResident);
    const updatedResidents = [...residents];
    const editingIndex = parseInt(localStorage.getItem("editingIndex"));

    if (
      !isNaN(editingIndex) &&
      editingIndex >= 0 &&
      editingIndex < residents.length
    ) {
      // Ensure additionalInfos exists
      if (!editedResident.additionalInfos) {
        editedResident.additionalInfos = [];
      }

      // Remove any old additionalInfo field if it exists
      if (editedResident.additionalInfo) {
        delete editedResident.additionalInfo;
      }

      updatedResidents[editingIndex] = editedResident;
      setResidents(updatedResidents);
      localStorage.setItem("familyMembers", JSON.stringify(updatedResidents));
      localStorage.removeItem("editingResident");
      localStorage.removeItem("editingIndex");
    }
  };

  const filteredResidents = residents.filter((resident) => {
    const searchMatch =
      !searchTerm ||
      [
        resident.headFirstName,
        resident.headLastName,
        resident.spouseFirstName,
        resident.spouseLastName,
        ...(resident.familyMembers?.map(
          (member) => `${member.firstName} ${member.lastName}`
        ) || []),
      ].some((name) => name?.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterCategory === "all") return searchMatch;

    switch (filterCategory) {
      case "senior-citizen":
        return (
          searchMatch &&
          (parseInt(resident.headAge) >= 60 ||
            parseInt(resident.spouseAge) >= 60 ||
            resident.familyMembers?.some(
              (member) => parseInt(member.age) >= 60
            ))
        );
      case "pwd":
        return (
          searchMatch &&
          resident.additionalInfos?.some(
            (info) =>
              info.pwd &&
              info.pwd.toLowerCase() !== "n/a" &&
              info.pwd.toLowerCase() !== "no"
          )
        );
      case "ofw":
        return (
          searchMatch &&
          resident.additionalInfos?.some(
            (info) =>
              info.ofwCountry &&
              info.ofwCountry.toLowerCase() !== "n/a" &&
              info.ofwCountry.trim() !== ""
          )
        );
      case "solo-parent":
        return (
          searchMatch &&
          resident.additionalInfos?.some(
            (info) => info.soloParent?.toLowerCase() === "yes"
          )
        );
      case "pregnant":
        return (
          searchMatch &&
          resident.additionalInfos?.some(
            (info) => info.pregnant?.toLowerCase() === "yes"
          )
        );
      case "out-of-school-youth":
        return (
          searchMatch &&
          resident.additionalInfos?.some(
            (info) => info.dropout?.toLowerCase() === "yes"
          )
        );
      case "immigrant":
        return (
          searchMatch &&
          resident.additionalInfos?.some(
            (info) =>
              info.immigrantNationality?.toLowerCase() !== "n/a" &&
              info.immigrantNationality.trim() !== ""
          )
        );
      default:
        return searchMatch;
    }
  });

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>
          {currentUser.role !== "user" ? "Resident's List" : "Your Information"}
        </h2>
        {currentUser.role !== "user" && (
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Search residents by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Residents</option>
              <option value="senior-citizen">Senior Citizens</option>
              <option value="pwd">PWD</option>
              <option value="ofw">OFW</option>
              <option value="solo-parent">Solo Parent</option>
              <option value="pregnant">Pregnant</option>
              <option value="out-of-school-youth">Out of School Youth</option>
              <option value="immigrant">Immigrant</option>
            </select>
            <ExportToPDF
              type={
                filterCategory.charAt(0).toUpperCase() +
                filterCategory.slice(1).toLowerCase()
              }
              data={filteredResidents ? filteredResidents : residents}
              label={"EXPORT LIST TO PDF"}
            ></ExportToPDF>
          </div>
        )}
      </div>

      {searchTerm ? (
        // Search Results View
        <div className="search-results">
          {filteredResidents.map((resident, index) => {
            const allFamilyMembers = [
              // Head
              {
                name: `${resident.headFirstName} ${resident.headMiddleName} ${resident.headLastName}`,
                role: "Head of Family",
              },
              // Spouse (if exists)
              ...(resident.spouseFirstName
                ? [
                    {
                      name: `${resident.spouseFirstName} ${resident.spouseMiddleName} ${resident.spouseLastName}`,
                      role: "Spouse",
                    },
                  ]
                : []),
              // Other family members
              ...(resident.familyMembers?.map((member) => ({
                name: `${member.firstName} ${member.middleName} ${member.lastName}`,
                role: member.relationship,
              })) || []),
            ];

            return (
              <div key={index} className="search-result-card">
                {allFamilyMembers
                  .filter((member) =>
                    member.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((member, mIndex) => (
                    <div
                      key={mIndex}
                      className="member-result"
                      onClick={() => handleNameClick(resident, index)}
                    >
                      <div className="member-name">{member.name}</div>
                      <div className="member-details">
                        <span>{member.role}</span>
                        <span>•</span>
                        <span>Cluster: {resident.cluster}</span>
                        <span>•</span>
                        <span>Household: {resident.householdNo}</span>
                      </div>
                      <div className="member-actions">
                        {checkPermission(currentUser, PERMISSIONS.MANAGE) && ( // Changed from EDIT to MANAGE
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(index, resident._id);
                            }}
                            className="edit-btn"
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                        )}
                        {checkPermission(currentUser, PERMISSIONS.MANAGE) && ( // Changed from DELETE to MANAGE
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(index, resident._id);
                            }}
                            className="delete-btn"
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      ) : (
        // Regular List View
        <div className="residents-list">
          {filteredResidents.map((resident, index) => {
            switch (filterCategory) {
              case "senior-citizen":
                return (
                  <div key={index} className="filtered-members">
                    {parseInt(resident.headAge) >= 60 && (
                      <div className="filtered-member-card">
                        <div className="member-info">
                          <h4>{`${resident.headFirstName} ${resident.headLastName}`}</h4>
                          <p>Role: Head of Family</p>
                          <p>Age: {resident.headAge}</p>
                          <p>
                            From: {resident.headFirstName}{" "}
                            {resident.headLastName}'s Family
                          </p>
                          <p>
                            Cluster: {resident.cluster} • Household:{" "}
                            {resident.household}
                          </p>
                        </div>
                        <div className="member-actions">
                          {checkPermission(currentUser, PERMISSIONS.MANAGE) && ( // Changed from EDIT to MANAGE
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(index, resident._id);
                              }}
                              className="edit-btn"
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                          )}
                          {checkPermission(currentUser, PERMISSIONS.MANAGE) && ( // Changed from DELETE to MANAGE
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(index, resident._id);
                              }}
                              className="delete-btn"
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          )}
                          <ExportToPDF
                            data={[resident]}
                            label={"EXPORT DATA TO PDF"}
                            icon={true}
                          ></ExportToPDF>
                        </div>
                      </div>
                    )}
                    {/* For spouse */}
                    {parseInt(resident.spouseAge) >= 60 && (
                      <div className="filtered-member-card">
                        <div className="member-info">
                          <h4>{`${resident.spouseFirstName} ${resident.spouseLastName}`}</h4>
                          <p>Role: Spouse</p>
                          <p>Age: {resident.spouseAge}</p>
                          <p>
                            From: {resident.headFirstName}{" "}
                            {resident.headLastName}'s Family
                          </p>
                          <p>
                            Cluster: {resident.cluster} • Household:{" "}
                            {resident.household}
                          </p>
                        </div>
                        <div className="member-actions">
                          {checkPermission(currentUser, PERMISSIONS.MANAGE) && ( // Changed from EDIT to MANAGE
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(index, resident._id);
                              }}
                              className="edit-btn"
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                          )}
                          {checkPermission(currentUser, PERMISSIONS.MANAGE) && ( // Changed from DELETE to MANAGE
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(index, resident._id);
                              }}
                              className="delete-btn"
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {/* For family members */}
                    {resident.familyMembers?.map(
                      (member, memberIdx) =>
                        parseInt(member.age) >= 60 && (
                          <div key={memberIdx} className="filtered-member-card">
                            <div className="member-info">
                              <h4>{`${member.firstName} ${member.lastName}`}</h4>
                              <p>Role: {member.relationship}</p>
                              <p>Age: {member.age}</p>
                              <p>
                                From: {resident.headFirstName}{" "}
                                {resident.headLastName}'s Family
                              </p>
                              <p>
                                Cluster: {resident.cluster} • Household:{" "}
                                {resident.household}
                              </p>
                            </div>
                            <div className="member-actions">
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from EDIT to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(index, resident._id);
                                  }}
                                  className="edit-btn"
                                >
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                              )}
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from DELETE to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(index, resident._id);
                                  }}
                                  className="delete-btn"
                                >
                                  <i className="fas fa-trash"></i> Delete
                                </button>
                              )}
                            </div>
                          </div>
                        )
                    )}
                  </div>
                );

              case "pwd":
                return (
                  <div key={index} className="filtered-members">
                    {resident.additionalInfos?.map(
                      (info, infoIdx) =>
                        info.pwd?.toLowerCase() === "yes" && (
                          <div key={infoIdx} className="filtered-member-card">
                            <div className="member-info">
                              <h4>{info.name}</h4>
                              <p>Status: PWD</p>
                              <p>
                                From: {resident.headFirstName}{" "}
                                {resident.headLastName}'s Family
                              </p>
                              <p>
                                Cluster: {resident.cluster} • Household:{" "}
                                {resident.household}
                              </p>
                            </div>
                            <div className="member-actions">
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from EDIT to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(index, resident._id);
                                  }}
                                  className="edit-btn"
                                >
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                              )}
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from DELETE to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(index, resident._id);
                                  }}
                                  className="delete-btn"
                                >
                                  <i className="fas fa-trash"></i> Delete
                                </button>
                              )}
                              <ExportToPDF
                                data={[resident]}
                                label={"EXPORT DATA TO PDF"}
                                icon={true}
                              ></ExportToPDF>
                            </div>
                          </div>
                        )
                    )}
                  </div>
                );

              case "ofw":
                return (
                  <div key={index} className="filtered-members">
                    {resident.additionalInfos?.map(
                      (info, infoIdx) =>
                        info.ofwCountry?.trim() && (
                          <div key={infoIdx} className="filtered-member-card">
                            <div className="member-info">
                              <h4>{info.name}</h4>
                              <p>Status: OFW</p>
                              <p>Country: {info.ofwCountry}</p>
                              <p>Years as OFW: {info.ofwYears}</p>
                              <p>
                                From: {resident.headFirstName}{" "}
                                {resident.headLastName}'s Family
                              </p>
                              <p>
                                Cluster: {resident.cluster} • Household:{" "}
                                {resident.household}
                              </p>
                            </div>
                            <div className="member-actions">
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from EDIT to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(index, resident._id);
                                  }}
                                  className="edit-btn"
                                >
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                              )}
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from DELETE to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(index, resident._id);
                                  }}
                                  className="delete-btn"
                                >
                                  <i className="fas fa-trash"></i> Delete
                                </button>
                              )}
                              <ExportToPDF
                                data={[resident]}
                                label={"EXPORT DATA TO PDF"}
                                icon={true}
                              ></ExportToPDF>
                            </div>
                          </div>
                        )
                    )}
                  </div>
                );

              case "solo-parent":
                return (
                  <div key={index} className="filtered-members">
                    {resident.additionalInfos?.map(
                      (info, infoIdx) =>
                        info.soloParent?.toLowerCase() === "yes" && (
                          <div key={infoIdx} className="filtered-member-card">
                            <div className="member-info">
                              <h4>{info.name}</h4>
                              <p>Status: Solo Parent</p>
                              <p>
                                From: {resident.headFirstName}{" "}
                                {resident.headLastName}'s Family
                              </p>
                              <p>
                                Cluster: {resident.cluster} • Household:{" "}
                                {resident.household}
                              </p>
                            </div>
                            <div className="member-actions">
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from EDIT to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(index, resident._id);
                                  }}
                                  className="edit-btn"
                                >
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                              )}
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from DELETE to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(index, resident._id);
                                  }}
                                  className="delete-btn"
                                >
                                  <i className="fas fa-trash"></i> Delete
                                </button>
                              )}
                            </div>
                          </div>
                        )
                    )}
                  </div>
                );

              case "pregnant":
                return (
                  <div key={index} className="filtered-members">
                    {resident.additionalInfos?.map(
                      (info, infoIdx) =>
                        info.pregnant?.toLowerCase() === "yes" && (
                          <div key={infoIdx} className="filtered-member-card">
                            <div className="member-info">
                              <h4>{info.name}</h4>
                              <p>
                                Status: Pregnant{" "}
                                {info.pregnantMonths
                                  ? `(${info.pregnantMonths} months)`
                                  : ""}
                              </p>
                              <p>
                                From: {resident.headFirstName}{" "}
                                {resident.headLastName}'s Family
                              </p>
                              <p>
                                Cluster: {resident.cluster} • Household:{" "}
                                {resident.household}
                              </p>
                            </div>
                            <div className="member-actions">
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from EDIT to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(index, resident._id);
                                  }}
                                  className="edit-btn"
                                >
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                              )}
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from DELETE to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(index, resident._id);
                                  }}
                                  className="delete-btn"
                                >
                                  <i className="fas fa-trash"></i> Delete
                                </button>
                              )}
                              <ExportToPDF
                                data={[resident]}
                                label={"EXPORT DATA TO PDF"}
                                icon={true}
                              ></ExportToPDF>
                            </div>
                          </div>
                        )
                    )}
                  </div>
                );

              case "out-of-school-youth":
                return (
                  <div key={index} className="filtered-members">
                    {resident.additionalInfos?.map(
                      (info, infoIdx) =>
                        info.dropout?.toLowerCase() === "yes" && (
                          <div key={infoIdx} className="filtered-member-card">
                            <div className="member-info">
                              <h4>{info.name}</h4>
                              <p>Status: Out of School Youth</p>
                              <p>
                                From: {resident.headFirstName}{" "}
                                {resident.headLastName}'s Family
                              </p>
                              <p>
                                Cluster: {resident.cluster} • Household:{" "}
                                {resident.household}
                              </p>
                            </div>
                            <div className="member-actions">
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from EDIT to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(index, resident._id);
                                  }}
                                  className="edit-btn"
                                >
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                              )}
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from DELETE to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(index, resident._id);
                                  }}
                                  className="delete-btn"
                                >
                                  <i className="fas fa-trash"></i> Delete
                                </button>
                              )}
                              <ExportToPDF
                                data={[resident]}
                                label={"EXPORT DATA TO PDF"}
                                icon={true}
                              ></ExportToPDF>
                            </div>
                          </div>
                        )
                    )}
                  </div>
                );

              case "immigrant":
                return (
                  <div key={index} className="filtered-members">
                    {resident.additionalInfos?.map(
                      (info, infoIdx) =>
                        info.immigrantNationality?.trim() && (
                          <div key={infoIdx} className="filtered-member-card">
                            <div className="member-info">
                              <h4>{info.name}</h4>
                              <p>Status: Immigrant</p>
                              <p>Nationality: {info.immigrantNationality}</p>
                              <p>Years of Stay: {info.immigrantStay}</p>
                              <p>
                                From: {resident.headFirstName}{" "}
                                {resident.headLastName}'s Family
                              </p>
                              <p>
                                Cluster: {resident.cluster} • Household:{" "}
                                {resident.household}
                              </p>
                            </div>
                            <div className="member-actions">
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from EDIT to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(index, resident._id);
                                  }}
                                  className="edit-btn"
                                >
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                              )}
                              {checkPermission(
                                currentUser,
                                PERMISSIONS.MANAGE
                              ) && ( // Changed from DELETE to MANAGE
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(index, resident._id);
                                  }}
                                  className="delete-btn"
                                >
                                  <i className="fas fa-trash"></i> Delete
                                </button>
                              )}
                              <ExportToPDF
                                data={[resident]}
                                label={"EXPORT DATA TO PDF"}
                                icon={true}
                              ></ExportToPDF>
                            </div>
                          </div>
                        )
                    )}
                  </div>
                );

              default:
                return (
                  <div key={index} className="family-card">
                    <div
                      className="family-header"
                      onClick={() => toggleFamily(index, resident)}
                    >
                      <div className="header-content">
                        <div className="family-basic-info">
                          <h3>{`${resident.headFirstName} ${resident.headLastName}'s Family`}</h3>
                          <div className="family-meta">
                            <span>Cluster: {resident.cluster}</span>
                            <span>•</span>
                            <span>Household: {resident.householdNo}</span>
                          </div>
                        </div>
                        <div className="header-badges">
                          {parseInt(resident.headAge) >= 60 && (
                            <span className="badge senior">
                              Senior Citizen (Head)
                            </span>
                          )}
                          {parseInt(resident.spouseAge) >= 60 && (
                            <span className="badge senior">
                              Senior Citizen (Spouse)
                            </span>
                          )}
                          {resident.additionalInfos?.some(
                            (info) => info.pwd?.toLowerCase() === "yes"
                          ) && <span className="badge pwd">PWD</span>}
                          {resident.additionalInfos?.some((info) =>
                            info.ofwCountry?.trim()
                          ) && <span className="badge ofw">OFW</span>}
                          {resident.additionalInfos?.some(
                            (info) => info.soloParent?.toLowerCase() === "yes"
                          ) && (
                            <span className="badge solo-parent">
                              Solo Parent
                            </span>
                          )}
                          {resident.additionalInfos?.some(
                            (info) => info.pregnant?.toLowerCase() === "yes"
                          ) && <span className="badge pregnant">Pregnant</span>}
                          {resident.additionalInfos?.some(
                            (info) => info.dropout?.toLowerCase() === "yes"
                          ) && (
                            <span className="badge out-of-school">
                              Out of School Youth
                            </span>
                          )}
                          {resident.additionalInfos?.some(
                            (info) =>
                              info.immigrantNationality?.trim() &&
                              info.immigrantNationality !== "Not an immigrant"
                          ) && (
                            <span className="badge immigrant">Immigrant</span>
                          )}
                        </div>
                        <div className="action-buttons">
                          {checkPermission(currentUser, PERMISSIONS.MANAGE) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(index, resident._id);
                              }}
                              className="edit-btn"
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                          )}
                          {checkPermission(currentUser, PERMISSIONS.MANAGE) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(index, resident._id);
                              }}
                              className="delete-btn"
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          )}
                          <ExportToPDF
                            data={[resident]}
                            label={"EXPORT DATA TO PDF"}
                            icon={true}
                          ></ExportToPDF>
                        </div>
                      </div>
                      <div className="dropdown-arrow">
                        {expandedFamilies[index] ? "▼" : "▶"}
                      </div>
                    </div>

                    {expandedFamilies[index] && (
                      <div className="family-content">
                        <div className="basic-info">
                          <div className="info-grid">
                            <div className="info-item">
                              <label>Cluster</label>
                              <span>{resident.cluster}</span>
                            </div>
                            <div className="info-item">
                              <label>Barangay Health Worker</label>
                              <span>{resident.brgyHealthWorker}</span>
                            </div>
                            <div className="info-item">
                              <label>Household Number</label>
                              <span>{resident.householdNo}</span>
                            </div>
                            <div className="info-item">
                              <label>Total Members</label>
                              <span>{resident.totalMembers}</span>
                            </div>
                            <div className="info-item">
                              <label>House/Lot and Block No.</label>
                              <span>{resident.houseLotBlockNo}</span>
                            </div>
                            <div className="info-item">
                              <label>Door No./Apartment Name</label>
                              <span>{resident.doorInput}</span>
                            </div>
                            <div className="info-item">
                              <label>4P's ID No.</label>
                              <span>{resident.fourPsIdNo || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="family-details">
                          <div className="section-title">Head of Family</div>
                          <div className="family-table-container">
                            <table className="family-table">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Age</th>
                                  <th>Sex</th>
                                  <th>Birthday</th>
                                  <th>Place of Birth</th>
                                  <th>Nationality</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>{`${resident.headFirstName || ""} ${
                                    resident.headMiddleName || ""
                                  } ${resident.headLastName || ""}`}</td>
                                  <td>{resident.headAge || ""}</td>
                                  <td>{resident.headSex || ""}</td>
                                  <td>{formatDate(resident.headBirthday)}</td>
                                  <td>{resident.headPlaceOfBirth || ""}</td>
                                  <td>{resident.headNationality || ""}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div className="family-table-container">
                            <table className="family-table">
                              <thead>
                                <tr>
                                  <th>Marital Status</th>
                                  <th>Religion</th>
                                  <th>Ethnicity</th>
                                  <th>HLEC</th>
                                  <th>School Level</th>
                                  <th>Place of School</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>{resident.headMaritalStatus || ""}</td>
                                  <td>{resident.headReligion || ""}</td>
                                  <td>{resident.headEthnicity || ""}</td>
                                  <td>
                                    {resident.headHighestLevelOfEducation || ""}
                                  </td>
                                  <td>{resident.headSchoolLevel || ""}</td>
                                  <td>{resident.headPlaceOfSchool || ""}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {(resident.spouseFirstName ||
                            resident.spouseLastName) && (
                            <>
                              <div className="section-title">
                                Spouse Information
                              </div>
                              <div className="family-table-container">
                                <table className="family-table">
                                  <thead>
                                    <tr>
                                      <th>Name</th>
                                      <th>Age</th>
                                      <th>Sex</th>
                                      <th>Birthday</th>
                                      <th>Place of Birth</th>
                                      <th>Nationality</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>{`${resident.spouseFirstName || ""} ${
                                        resident.spouseMiddleName || ""
                                      } ${resident.spouseLastName || ""}`}</td>
                                      <td>{resident.spouseAge || ""}</td>
                                      <td>{resident.spouseSex || ""}</td>
                                      <td>
                                        {formatDate(resident.spouseBirthday)}
                                      </td>
                                      <td>
                                        {resident.spousePlaceOfBirth || ""}
                                      </td>
                                      <td>
                                        {resident.spouseNationality || ""}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <div className="family-table-container">
                                <table className="family-table">
                                  <thead>
                                    <tr>
                                      <th>Marital Status</th>
                                      <th>Religion</th>
                                      <th>Ethnicity</th>
                                      <th>Voter</th>
                                      <th>School Level</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>
                                        {resident.spouseMaritalStatus || ""}
                                      </td>
                                      <td>{resident.spouseReligion || ""}</td>
                                      <td>{resident.spouseEthnicity || ""}</td>
                                      <td>
                                        {resident.spouseIsRegisteredVoter
                                          ? "Registered"
                                          : "Not Registered" || ""}
                                      </td>
                                      <td>
                                        {resident.spouseSchoolLevel || ""}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </>
                          )}

                          {resident.familyMembers?.length > 0 && (
                            <>
                              <div className="section-title">
                                Family Members
                              </div>
                              <div className="family-table-container">
                                <table className="family-table">
                                  <thead>
                                    <tr>
                                      <th>Name</th>
                                      <th>Age</th>
                                      <th>Sex</th>
                                      <th>Relationship</th>
                                      <th>Birthday</th>
                                      <th>Place of Birth</th>
                                      <th>Nationality</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {resident.familyMembers?.map(
                                      (member, idx) => (
                                        <tr key={idx}>
                                          <td>{`${member.firstName || ""} ${
                                            member.middleName || ""
                                          } ${member.lastName || ""}`}</td>
                                          <td>{member.age || ""}</td>
                                          <td>{member.sex || ""}</td>
                                          <td>{member.relationship || ""}</td>
                                          <td>{formatDate(member.birthday)}</td>
                                          <td>{member.placeOfBirth || ""}</td>
                                          <td>{member.nationality || ""}</td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              <div className="family-table-container">
                                <table className="family-table">
                                  <thead>
                                    <tr>
                                      <th>Marital Status</th>
                                      <th>Religion</th>
                                      <th>Ethnicity</th>
                                      <th>Voter</th>
                                      <th>School Level</th>
                                      <th>School Place</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {resident.familyMembers?.map(
                                      (member, idx) => (
                                        <tr key={idx}>
                                          <td>{member.maritalStatus || ""}</td>
                                          <td>{member.religion || ""}</td>
                                          <td>{member.ethnicity || ""}</td>
                                          <td>
                                            {member.spouseIsRegisteredVoter
                                              ? "Registered"
                                              : "Not Registered" || ""}
                                          </td>
                                          <td>{member.schoolLevel || ""}</td>
                                          <td>{member.placeOfSchool || ""}</td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          )}

                          {resident.additionalInfos?.length > 0 && (
                            <>
                              <div className="section-title">
                                Additional Information
                              </div>
                              <div className="family-table-container">
                                <table className="family-table">
                                  <thead>
                                    <tr>
                                      <th>Name</th>
                                      <th>Pregnant</th>
                                      <th>Family Planning</th>
                                      <th>PWD</th>
                                      <th>Solo Parent</th>
                                      <th>Senior Citizen</th>
                                      <th>Maintenance</th>
                                      <th>PhilHealth</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {resident.additionalInfos?.map(
                                      (info, idx) => (
                                        <tr key={idx}>
                                          <td>{info.name || ""}</td>
                                          <td>{`${info.pregnant || ""}${
                                            info.pregnant === "Yes" &&
                                            info.pregnantMonths
                                              ? ` (${info.pregnantMonths} months)`
                                              : ""
                                          }`}</td>
                                          <td>{info.familyPlanning || ""}</td>
                                          <td>{info.pwd || ""}</td>
                                          <td>{info.soloParent || ""}</td>
                                          <td>{info.seniorCitizen || ""}</td>
                                          <td>{info.maintenance || ""}</td>
                                          <td>{info.philhealth || ""}</td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              <div className="family-table-container">
                                <table className="family-table">
                                  <thead>
                                    <tr>
                                      <th>House & Lot</th>
                                      <th>Water Supply</th>
                                      <th>Comfort Room</th>
                                      <th>OFW Country</th>
                                      <th>Years in Service</th>
                                      <th>Out of School</th>
                                      <th>Immigrant</th>
                                      <th>Years of Stay</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {resident.additionalInfos?.map(
                                      (info, idx) => (
                                        <tr key={idx}>
                                          <td>{info.houseLot || ""}</td>
                                          <td>{info.waterSupply || ""}</td>
                                          <td>{info.comfortRoom || ""}</td>
                                          <td>{info.ofwCountry || ""}</td>
                                          <td>{info.yearsInService || ""}</td>
                                          <td>{info.outOfSchool || ""}</td>
                                          <td>
                                            {info.immigrantNationality || ""}
                                          </td>
                                          <td>{info.yearsOfStay || ""}</td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
            }
          })}
        </div>
      )}
      <PermissionErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
}

export default ResidentList;
