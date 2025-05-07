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
import { MAIN_API_LINK } from "../../utils/API.js";
import { CustomToast } from "../../utils/CustomToast.js";
import { BaseComponent } from "./FilterObjects.js";

// function formatDate(dateString) {
//   if (!dateString) return "";
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return dateString; // Return original if invalid

//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     });
//   } catch (error) {
//     console.error("Error formatting date:", error);
//     return dateString;
//   }
// }

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
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

  const [showDeletionRequest, setShowDeletionRequest] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionReasonID, setDeletionReasonID] = useState("");

  const { editingID, setEditingID, deletingID, setDeletingID } =
    useContext(ResidentContext);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processing, setProcessing] = useState({});

  const fetchResidents = async () => {
    try {
      let response = null;
      let fetchedResidents = [];

      if (currentUser.role === "user") {
        response = await axios.get(
          `${MAIN_API_LINK}/residents/${currentUser.linkedResident}`
        );
        fetchedResidents = [response.data.data];
      } else {
        response = await axios.get(`${MAIN_API_LINK}/residents?all=true`);
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

  const handleClickedSearchFilter = async (e) => {
    setFilterCategory(e.target.value);
    setSearchTerm("");
    try {
      let response = null,
        residents = [],
        url = `${MAIN_API_LINK}/residents?${e.target.value}=true`;

      if (["0-14", "15-29", "30-59", "60+"].includes(e.target.value)) {
        url = `${MAIN_API_LINK}/residents?ageGroup=${e.target.value}`;
      }

      if (["Male", "Female", "LGBTQ%2B"].includes(e.target.value)) {
        url = `${MAIN_API_LINK}/residents?sex=${e.target.value}`;
      }

      response = await axios.get(url);
      residents = response.data.data;
      console.log(residents);
      setResidents(residents);
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
  };

  const handleInputSearch = async (e) => {
    setFilterCategory("all");
    setSearchTerm(e.target.value);
    setResidents([]);
    try {
      let response = null,
        url = `${MAIN_API_LINK}/residents?name=${e.target.value}`;

      response = await axios.get(url);
      console.log(residents);

      if (e.target.value === "") {
        await fetchResidents();
      } else {
        setResidents(response.data.data);
        console.log(response.data.data);
      }
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

  const handleNameClick = (resident, index, id = null) => {
    // Check if user has MANAGE permission for editing
    if (checkPermission(currentUser, PERMISSIONS.MANAGE)) {
      handleEdit(index, id);
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
      headIsRegisteredVoter:
        selectedResident.headIsRegisteredVoter === true
          ? "Registered"
          : "Not Registered" || "",

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
      spouseIsRegisteredVoter:
        selectedResident.spouseIsRegisteredVoter === true
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
        isRegisteredVoter:
          member.IsRegisteredVoter === true
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

  const handleDelete = async (resident, id = null) => {
    console.log(resident);
    // alert(resident);
    // alert(id);
    if (!checkPermission(currentUser, PERMISSIONS.MANAGE)) {
      // Changed from DELETE to MANAGE
      setShowErrorModal(true);
      return;
    }
    if (currentUser.role !== "systemadmin") {
      if (resident.deletion?.reason) {
        setDeletionReason(resident.deletion?.reason);
      }
      setShowDeletionRequest(true);
      setDeletionReasonID(id);
    } else {
      if (resident.deletion?.reason) {
        setDeletionReason(resident.deletion?.reason);
        setShowDeletionRequest(true);
        setDeletionReasonID(id);
      } else {
        showCustomToast(
          () => confirmFunc(id),
          "Are you sure you want to delete this record?"
        );
      }
    }
  };

  const confirmFunc = async (id) => {
    try {
      let response = await axios.delete(`${MAIN_API_LINK}/residents/${id}`);
      if (response.data.success === true) {
        toast.success("Information deleted successfully");
        await axiosInstance.post("/system-logs", {
          action: ACTIONS.DELETE,
          module: "Resident List",
          user: currentUser.id,
          details: `User ${currentUser.username} deleted a resident information: ${response.data.deletedResident.headFirstName} ${response.data.deletedResident.headLastName}`,
        });
        setFilterCategory("all");
        setSearchTerm("");
        await fetchResidents();
      }
    } catch (error) {
      toast.error(error.response.data.error);
      console.log(error.response.data);
    }
  };

  const submitDeleteRequest = async (e) => {
    e.preventDefault();
    if (!checkPermission(currentUser, PERMISSIONS.MANAGE)) {
      // Changed from DELETE to MANAGE
      setShowErrorModal(true);
      return;
    }

    const reset = () => {
      setShowDeletionRequest(false);
      setDeletionReason("");
      setDeletionReasonID("");
    };

    if (currentUser.role !== "systemadmin") {
      showCustomToast(
        async () => {
          try {
            let response = await axios.put(
              `${MAIN_API_LINK}/residents/${deletionReasonID}`,
              {
                deletion: {
                  requestedBy: currentUser.id,
                  reason: deletionReason,
                },
              }
            );
            console.log(response.data);
            if (response.data.success === true) {
              toast.success("Request for deletion sent!");
              await axiosInstance.post("/system-logs", {
                action: ACTIONS.EDIT,
                module: "Resident List",
                user: currentUser.id,
                details: `User ${currentUser.username} request deletion for resident: ${response.data.data.headFirstName} ${response.data.data.headLastName}`,
              });
              setFilterCategory("all");
              setSearchTerm("");
              await fetchResidents();
              setShowDeletionRequest(false);
              setDeletionReason("");
              setDeletionReasonID("");
            }
          } catch (error) {
            toast.error(error.response.data.error);
            console.log(error.response.data);
            setShowDeletionRequest(false);
            setDeletionReason("");
            setDeletionReasonID("");
          }
        },
        "Are you sure you want to request for deletion?",
        () => reset()
      );
    } else {
      showCustomToast(
        async () => {
          try {
            let response = await axios.delete(
              `${MAIN_API_LINK}/residents/${deletionReasonID}`
            );
            if (response.data.success === true) {
              toast.success("Information deleted successfully");
              await axiosInstance.post("/system-logs", {
                action: ACTIONS.DELETE,
                module: "Resident List",
                user: currentUser.id,
                details: `User ${currentUser.username} deleted a resident information: ${response.data.deletedResident.headFirstName} ${response.data.deletedResident.headLastName}`,
              });
              setFilterCategory("all");
              setSearchTerm("");
              await fetchResidents();
              setShowDeletionRequest(false);
              setDeletionReason("");
              setDeletionReasonID("");
            }
          } catch (error) {
            toast.error(error.response.data.error);
            console.log(error.response.data);
            setShowDeletionRequest(false);
            setDeletionReason("");
            setDeletionReasonID("");
          }
        },
        "Are you sure you want to delete this record?",
        () => reset()
      );
    }
  };

  const submitDeleteRejection = async (e) => {
    e.preventDefault();
    if (!checkPermission(currentUser, PERMISSIONS.MANAGE)) {
      // Changed from DELETE to MANAGE
      setShowErrorModal(true);
      return;
    }

    const reset = () => {
      setShowDeletionRequest(false);
      setDeletionReason("");
      setDeletionReasonID("");
    };

    showCustomToast(
      async () => {
        try {
          let response = await axios.put(
            `${MAIN_API_LINK}/residents/${deletionReasonID}`,
            {
              deletion: { requestedBy: null, reason: "" },
            }
          );
          if (response.data.success === true) {
            toast.success("Information updated successfully");
            await axiosInstance.post("/system-logs", {
              action: ACTIONS.EDIT,
              module: "Resident List",
              user: currentUser.id,
              details: `User ${currentUser.username} rejected information deletion of : ${response.data.data.headFirstName} ${response.data.data.headLastName}`,
            });
            await fetchResidents();
            setFilterCategory("all");
            setSearchTerm("");
            setShowDeletionRequest(false);
            setDeletionReason("");
            setDeletionReasonID("");
          }
        } catch (error) {
          toast.error(error.response.data.error);
          console.log(error.response.data);
          setShowDeletionRequest(false);
          setDeletionReason("");
          setDeletionReasonID("");
        }
      },
      "Are you sure you want to reject deletion?",
      () => reset()
    );
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

  const handleFiltering = async (e) => {
    try {
      let response = null;
      let fetchedResidents = [];

      // response = await axios.get(
      //   `http://localhost:8080/api/residents?category=${e.target.value}`
      // );
      response = await axios.get(
        `${MAIN_API_LINK}/residents?category=${e.target.value}`
      );
      fetchedResidents = response.data.data;

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

  const showCustomToast = (cf, text, cancelF) => {
    if (cancelF) {
      toast(<CustomToast text={text} confirmFunc={cf} cancelFunc={cancelF} />);
    } else {
      toast(<CustomToast text={text} confirmFunc={cf} />);
    }
  };

  return (
    <>
      {showDeletionRequest && (
        <form className="deletion-req-div">
          <label>Deletion Request Reason</label>
          <input
            type="text"
            value={deletionReason}
            placeholder="Input Reason Here..."
            onChange={(e) => setDeletionReason(e.target.value)}
          />
          <div>
            <button onClick={submitDeleteRequest}>
              {currentUser.role === "systemadmin" ? "Approve" : "Submit"}
            </button>
            {currentUser.role === "systemadmin" && (
              <button onClick={submitDeleteRejection}>Reject</button>
            )}
            <button
              onClick={() => {
                setDeletionReason("");
                setDeletionReasonID("");
                setShowDeletionRequest(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="list-container">
        <div className="list-header">
          <h2>
            {currentUser.role !== "user"
              ? "Resident's List"
              : "Your Information"}
          </h2>
          {currentUser.role !== "user" && (
            <div className="search-filter-container">
              <input
                type="text"
                placeholder="Search residents by name..."
                value={searchTerm}
                onChange={handleInputSearch}
                className="search-input"
              />
              <select
                value={filterCategory}
                onChange={handleClickedSearchFilter}
                className="filter-select"
              >
                <option value="all">All Residents</option>
                <option value="senior">Senior Citizens</option>
                <option value="pwd">PWD</option>
                <option value="ofw">OFW</option>
                <option value="soloParent">Solo Parent</option>
                <option value="pregnant">Pregnant</option>
                <option value="outOfSchool">Out of School Youth</option>
                <option value="immigrant">Immigrant</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="LGBTQ%2B">LGBTQ+</option>
                <option value="0-14">Ages 0-14</option>
                <option value="15-29">Ages 15-29</option>
                <option value="30-59">Ages 30-59</option>
                <option value="60+">Ages 60+</option>
              </select>
              <ExportToPDF
                type={
                  filterCategory.charAt(0).toUpperCase() +
                  filterCategory.slice(1).toLowerCase()
                }
                data={residents}
                label={"Export List"}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              ></ExportToPDF>
            </div>
          )}
        </div>

        {searchTerm ? (
          // * Search Results View
          <div className="search-results">
            {residents.length >= 1 && (
              <>
                {residents.map((resident, index) => {
                  const allFamilyMembers = [
                    {
                      name: `${resident.headFirstName} ${resident.headMiddleName} ${resident.headLastName}`,
                      role: "Head of Family",
                      _id: resident._id,
                      deletion: resident.deletion,
                    },
                    // Spouse (if exists)
                    ...(resident.spouseFirstName
                      ? [
                          {
                            name: `${resident.spouseFirstName} ${resident.spouseMiddleName} ${resident.spouseLastName}`,
                            role: "Spouse",
                            deletion: resident.deletion,
                          },
                        ]
                      : []),
                    // Other family members
                    ...(resident.familyMembers?.map((member) => ({
                      name: `${member.firstName} ${member.middleName} ${member.lastName}`,
                      role: member.relationship,
                      deletion: resident.deletion,
                    })) || []),
                  ];

                  return (
                    <div key={index} className="search-result-card">
                      {allFamilyMembers
                        .filter((member) =>
                          member.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map((member, mIndex) => (
                          <div
                            key={mIndex}
                            className="member-result"
                            onClick={() =>
                              // handleNameClick(resident, index, member._id)
                              handleNameClick(resident, index, member._id)
                            }
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
                                    handleDelete(resident, resident._id);
                                  }}
                                  className="delete-btn"
                                >
                                  <i className="fas fa-trash"></i>{" "}
                                  {resident.deletion?.reason
                                    ? "Pending Deletion"
                                    : "Delete"}
                                </button>
                              )}
                              <ExportToPDF
                                data={[resident]}
                                label={"Export List"}
                                icon={true}
                                isProcessing={processing[resident._id]}
                                setIsProcessing={setProcessing}
                                index={resident._id}
                              ></ExportToPDF>
                            </div>
                          </div>
                        ))}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        ) : (
          // * Regular List View
          <div className="residents-list">
            {residents.map((resident, index) => {
              return (
                <BaseComponent
                  index={index}
                  type={filterCategory}
                  resident={resident}
                  currentUser={currentUser}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  ExportToPDF={ExportToPDF}
                  processing={processing}
                  setProcessing={setProcessing}
                  toggleFamily={toggleFamily}
                  formatDate={formatDate}
                  expandedFamilies={expandedFamilies}
                />
              );
            })}
          </div>
        )}
        <PermissionErrorModal
          show={showErrorModal}
          onClose={() => setShowErrorModal(false)}
        />
      </div>
    </>
  );
}

export default ResidentList;
