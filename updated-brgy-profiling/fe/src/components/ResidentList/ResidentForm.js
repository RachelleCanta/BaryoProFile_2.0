// src/components/ResidentList/ResidentForm.js
import React, { useState, useEffect, useContext } from "react";
import "./css/style.css"
import axios from "axios";
import { ResidentContext } from "../../contexts/residentContext";

const yesNoOptions = ["", "Yes", "No"];
const sexOptions = ["", "Male", "Female"];
const maritalOptions = [
  "",
  "Single",
  "Married",
  "Widowed",
  "Separated",
  "Live-in",
];
const waterOptions = ["", "Own", "Shared", "Bottled"];
const houseLotOptions = ["", "Owned", "Rented"];
const comfortRoomOptions = ["", "Owned", "Shared"];
const voterOptions = ["", "Registered", "Not Registered"];
const educationLevels = [
  "",
  "Elementary",
  "High School",
  "Senior High School",
  "College",
  "Vocational",
  "Post Graduate",
];
const relationshipOptions = [
  "",
  "Son",
  "Daughter",
  "Mother",
  "Father",
  "Grandmother",
  "Grandfather",
  "Aunt",
  "Uncle",
  "Cousin",
  "Other",
];
const familyPlanningOptions = [
  "",
  "Pills",
  "DMPA",
  "Implant",
  "IUD",
  "Ligate",
  "Vasectomy",
  "None",
];
const nationalityOptions = [
  "",
  "Afghan",
  "Albanian",
  "Algerian",
  "American",
  "Andorran",
  "Angolan",
  "Antiguan",
  "Argentine",
  "Armenian",
  "Australian",
  "Austrian",
  "Azerbaijani",
  "Bahamian",
  "Bahraini",
  "Bangladeshi",
  "Barbadian",
  "Belarusian",
  "Belgian",
  "Belizean",
  "Beninese",
  "Bhutanese",
  "Bolivian",
  "Bosnian",
  "Botswanan",
  "Brazilian",
  "British",
  "Bruneian",
  "Bulgarian",
  "Burkinabe",
  "Burmese",
  "Burundian",
  "Cabo Verdean",
  "Cambodian",
  "Cameroonian",
  "Canadian",
  "Central African",
  "Chadian",
  "Chilean",
  "Chinese",
  "Colombian",
  "Comorian",
  "Congolese (Congo-Brazzaville)",
  "Congolese (Congo-Kinshasa)",
  "Costa Rican",
  "Croatian",
  "Cuban",
  "Cypriot",
  "Czech",
  "Danish",
  "Djiboutian",
  "Dominican",
  "Ecuadorean",
  "Egyptian",
  "Emirati",
  "Equatorial Guinean",
  "Eritrean",
  "Estonian",
  "Ethiopian",
  "Fijian",
  "Finnish",
  "Filipino",
  "French",
  "Gabonese",
  "Gambian",
  "Georgian",
  "German",
  "Ghanaian",
  "Greek",
  "Grenadian",
  "Guatemalan",
  "Guinean",
  "Guinea-Bissauan",
  "Guyanese",
  "Haitian",
  "Honduran",
  "Hungarian",
  "Icelander",
  "Indian",
  "Indonesian",
  "Iranian",
  "Iraqi",
  "Irish",
  "Israeli",
  "Italian",
  "Ivorian",
  "Jamaican",
  "Japanese",
  "Jordanian",
  "Kazakh",
  "Kenyan",
  "Kiribati",
  "Kuwaiti",
  "Kyrgyz",
  "Laotian",
  "Latvian",
  "Lebanese",
  "Liberian",
  "Libyan",
  "Liechtensteiner",
  "Lithuanian",
  "Luxembourger",
  "Macedonian",
  "Malagasy",
  "Malawian",
  "Malaysian",
  "Maldivian",
  "Malian",
  "Maltese",
  "Marshallese",
  "Mauritanian",
  "Mauritian",
  "Mexican",
  "Micronesian",
  "Moldovan",
  "Monacan",
  "Mongolian",
  "Montenegrin",
  "Moroccan",
  "Mozambican",
  "Namibian",
  "Nauruan",
  "Nepalese",
  "Netherlander",
  "New Zealander",
  "Nicaraguan",
  "Nigerien",
  "Nigerian",
  "North Korean",
  "Norwegian",
  "Omani",
  "Pakistani",
  "Palauan",
  "Palestinian",
  "Panamanian",
  "Papua New Guinean",
  "Paraguayan",
  "Peruvian",
  "Philippine",
  "Polish",
  "Portuguese",
  "Qatari",
  "Romanian",
  "Russian",
  "Rwandan",
  "Saint Lucian",
  "Salvadoran",
  "Samoan",
  "San Marinese",
  "Sao Tomean",
  "Saudi",
  "Senegalese",
  "Serbian",
  "Seychellois",
  "Sierra Leonean",
  "Singaporean",
  "Slovak",
  "Slovenian",
  "Solomon Islander",
  "Somali",
  "South African",
  "South Korean",
  "Spanish",
  "Sri Lankan",
  "Sudanese",
  "Surinamer",
  "Swazi",
  "Swedish",
  "Swiss",
  "Syrian",
  "Taiwanese",
  "Tajik",
  "Tanzanian",
  "Thai",
  "Timorese",
  "Togolese",
  "Tongan",
  "Trinidadian or Tobagonian",
  "Tunisian",
  "Turkish",
  "Turkmen",
  "Tuvaluan",
  "Ugandan",
  "Ukrainian",
  "Uruguayan",
  "Uzbek",
  "Vanuatuan",
  "Venezuelan",
  "Vietnamese",
  "Yemeni",
  "Zambian",
  "Zimbabwean",
  "Others",
];
const religionOptions = [
  "",
  "Christianity",
  "Islam",
  "Hinduism",
  "Buddhism",
  "Judaism",
  "Sikhism",
  "Baha'i Faith",
  "Jainism",
  "Shinto",
  "Zoroastrianism",
  "Taoism",
  "Confucianism",
  "Animism",
  "Agnosticism",
  "Atheism",
  "Rastafarianism",
  "Paganism",
  "Cao Dai",
  "Unitarian Universalism",
  "Scientology",
  "Tenrikyo",
  "Druze",
  "Neo-Paganism",
  "Native American Religions",
  "Vodou (Voodoo)",
  "Santería",
  "Traditional African Religions",
  "Australian Aboriginal Religions",
  "Chinese Traditional Religion",
  "Modern Spirituality",
  "Other",
];
const ethnicityOptions = [
  "",
  "Tagalog",
  "Cebuano",
  "Ilocano",
  "Bisaya",
  "Bicolano",
  "Waray",
  "Kapampangan",
  "Pangasinense",
  "Ilonggo",
  "Maguindanao",
  "Tausug",
  "Maranao",
  "Ivatan",
  "Kalinga",
  "Igorot",
  "Other",
];

function ResidentForm({ onBack, onSave }) {
  const { editingID } = useContext(ResidentContext);

  const [formData, setFormData] = useState({
    cluster: "",
    brgyHealthWorker: "",
    householdNo: "",
    totalMembers: "",
    houseLotBlockNo: "",
    doorInput: "",
    fourPsIdNo: "",
    headFirstName: "",
    headMiddleName: "",
    headLastName: "",
    headAge: "",
    headSex: "",
    headBirthday: "",
    headPlaceOfBirth: "",
    headNationality: "",
    headMaritalStatus: "",
    headReligion: "",
    headEthnicity: "",
    headHighestLevelOfEducation: "",
    headSchoolLevel: "",
    headPlaceOfSchool: "",
    spouseFirstName: "",
    spouseMiddleName: "",
    spouseLastName: "",
    relationshipToHouseHoldHead: "Spouse",
    spouseAge: "",
    spouseSex: "",
    spouseBirthday: "",
    spousePlaceOfBirth: "",
    spouseNationality: "",
    spouseMaritalStatus: "",
    spouseReligion: "",
    spouseEthnicity: "",
    spouseIsRegisteredVoter: "",
    spouseSchoolLevel: "",
    spousePlaceOfSchool: "",
    familyMembers: [],
    additionalInfos: [],
  });

  function formatDateForInput(isoDateString) {
    if (!isoDateString) return "";

    try {
      const date = new Date(isoDateString);

      // Handle invalid dates
      if (isNaN(date.getTime())) {
        console.error("Invalid date string provided");
        return "";
      }

      // Get local date components (this accounts for timezone offset)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  }

  const fetchEditingResident = async () => {
    if (!editingID) return; // If no ID, do nothing

    try {
      const response = await axios.get(
        `http://localhost:8080/api/residents/${editingID}`
      );
      let resident = response.data.data;
      console.log("Fetched editing resident:", resident);

      // Normalize the resident data
      if (resident.additionalInfo && !resident.additionalInfos) {
        resident.additionalInfos = resident.additionalInfo;
        delete resident.additionalInfo;
      }

      if (!resident.additionalInfos) {
        resident.additionalInfos = [];
      }

      resident.additionalInfos = resident.additionalInfos.map((info) => ({
        ...info,
        pwd: info.pwd || "N/A",
      }));

      resident.spouseIsRegisteredVoter = resident.spouseIsRegisteredVoter
        ? "Registered"
        : "Not Registered";

      resident.familyMembers.forEach((member) => {
        member.isRegisteredVoter = member.spouseIsRegisteredVoter
          ? "Registered"
          : "Not Registered";
      });

      setFormData(resident);
    } catch (error) {
      console.error("Error fetching resident by ID:", error);
    }
  };

  // Updated useEffect
  useEffect(() => {
    fetchEditingResident();
    // const savedData = JSON.parse(localStorage.getItem("editingResident"));
    // console.log("Loading saved data in form:", savedData);
    // if (savedData) {
    //   // Check if we're dealing with old data format (using additionalInfo)
    //   // or new format (using additionalInfos)
    //   if (savedData.additionalInfo && !savedData.additionalInfos) {
    //     savedData.additionalInfos = savedData.additionalInfo;
    //     delete savedData.additionalInfo;
    //   }

    //   // Ensure additionalInfos exists
    //   if (!savedData.additionalInfos) {
    //     savedData.additionalInfos = [];
    //   }

    //   // Ensure all additionalInfos entries have a pwd value of 'N/A' if not set
    //   savedData.additionalInfos = savedData.additionalInfos.map((info) => ({
    //     ...info,
    //     pwd: info.pwd || "N/A",
    //   }));

    //   setFormData(savedData);
    // }
  }, []);

  // ! AXIOS HERE!!
  // Updated handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);

    // Ensure additionalInfos exists before saving
    const dataToSave = {
      ...formData,
      additionalInfos: formData.additionalInfos || [],
    };

    console.log("TO SAVE...");
    console.log(dataToSave);

    // Make sure we don't have the old additionalInfo field still hanging around
    if (dataToSave.additionalInfo) {
      delete dataToSave.additionalInfo;
    }

    onSave(dataToSave);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFamilyMemberChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedMembers = [...prevData.familyMembers];
      updatedMembers[index] = {
        ...updatedMembers[index],
        [field]: value,
      };
      return {
        ...prevData,
        familyMembers: updatedMembers,
      };
    });
  };

  const handleAdditionalInfoChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedInfos = [...prevData.additionalInfos];

      // For pregnant field, handle special logic
      if (field === "pregnant") {
        if (value === "No" || value === "") {
          // Clear pregnancy months if pregnant is set to No or empty
          updatedInfos[index] = {
            ...updatedInfos[index],
            pregnantMonths: "",
            [field]: value,
          };
        } else {
          updatedInfos[index] = {
            ...updatedInfos[index],
            [field]: value,
          };
        }
      } else {
        updatedInfos[index] = {
          ...updatedInfos[index],
          [field]: value,
        };
      }

      return {
        ...prevData,
        additionalInfos: updatedInfos,
      };
    });
  };

  const addFamilyMember = () => {
    setFormData((prevData) => ({
      ...prevData,
      familyMembers: [
        ...prevData.familyMembers,
        {
          firstName: "",
          middleName: "",
          lastName: "",
          age: "",
          sex: "",
          relationship: "",
          birthday: "",
          placeOfBirth: "",
          nationality: "",
          maritalStatus: "",
          religion: "",
          ethnicity: "",
          voter: "",
          schoolLevel: "",
          schoolPlace: "",
        },
      ],
    }));
  };

  const addAdditionalInfo = () => {
    setFormData((prevData) => ({
      ...prevData,
      additionalInfos: [
        ...prevData.additionalInfos,
        {
          name: "",
          pregnant: "",
          pregnantMonths: "",
          familyPlanning: "",
          pwd: "N/A",
          soloParent: "",
          seniorCitizen: "",
          maintenance: "",
          philhealth: "",
          houseLot: "",
          waterSupply: "",
          comfortRoom: "",
          ofwCountry: "",
          ofwYears: "",
          dropout: "",
          immigrantNationality: "",
          immigrantStay: "",
          residence: "",
        },
      ],
    }));
  };

  const removeFamilyMember = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      familyMembers: prevData.familyMembers.filter((_, i) => i !== index),
    }));
  };

  const removeAdditionalInfo = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      additionalInfos: prevData.additionalInfos.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="edit-form-container">
      <div className="form-header">
        <h2>Edit Resident Information</h2>
        <div className="resident-edit-actions">
          <button
            type="button"
            onClick={onBack}
            className="resident-edit-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="resident-edit-save"
          >
            Save Changes
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="form-section">
          <h3 className="resident-edit-title">Basic Information</h3>
          <div className="form-grid">
            <div className="form-group" style={styles.formGroup}>
              <label>Cluster:</label>
              <input
                type="text"
                name="cluster"
                value={formData.cluster}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Health Worker:</label>
              <input
                type="text"
                name="brgyHealthWorker"
                value={formData.brgyHealthWorker}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Household Number:</label>
              <input
                type="text"
                name="householdNo"
                value={formData.householdNo}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Total Members:</label>
              <input
                type="number"
                name="totalMembers"
                value={formData.totalMembers}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>House/Lot and Block No.:</label>
              <input
                type="text"
                name="houseLotBlockNo"
                value={formData.houseLotBlockNo}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Door No./Apartment Name:</label>
              <input
                type="text"
                name="doorInput"
                value={formData.doorInput}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>4P's ID No.:</label>
              <input
                type="text"
                name="fourPsIdNo"
                value={formData.fourPsIdNo}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Head of Family Section */}
        <div className="form-section">
          <h3 className="resident-edit-title">Head of Family</h3>
          <div className="form-grid">
            <div className="form-group" style={styles.formGroup}>
              <label>First Name:</label>
              <input
                type="text"
                name="headFirstName"
                value={formData.headFirstName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Middle Name:</label>
              <input
                type="text"
                name="headMiddleName"
                value={formData.headMiddleName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Last Name:</label>
              <input
                type="text"
                name="headLastName"
                value={formData.headLastName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Age:</label>
              <input
                type="number"
                name="headAge"
                value={formData.headAge}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Sex:</label>
              <select
                name="headSex"
                value={formData.headSex}
                onChange={handleChange}
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Birthday:</label>
              <input
                type="date"
                name="headBirthday"
                value={formatDateForInput(formData.headBirthday)}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Place of Birth:</label>
              <input
                type="text"
                name="headPlaceOfBirth"
                value={formData.headPlaceOfBirth}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Nationality:</label>
              <select
                name="headNationality"
                value={formData.headNationality}
                onChange={handleChange}
              >
                {nationalityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Marital Status:</label>
              <select
                name="headMaritalStatus"
                value={formData.headMaritalStatus}
                onChange={handleChange}
              >
                {maritalOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Religion:</label>
              <select
                name="headReligion"
                value={formData.headReligion}
                onChange={handleChange}
              >
                {religionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Ethnicity:</label>
              <select
                name="headEthnicity"
                value={formData.headEthnicity}
                onChange={handleChange}
              >
                {ethnicityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>HIGHEST LEVEL OF EDUCATION:</label>
              <select
                name="headHighestLevelOfEducation"
                value={formData.headHighestLevelOfEducation}
                onChange={handleChange}
              >
                {educationLevels.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>School Level:</label>
              <select
                name="headSchoolLevel"
                value={formData.headSchoolLevel}
                onChange={handleChange}
              >
                {educationLevels.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Place of School:</label>
              <input
                type="text"
                name="headPlaceOfSchool"
                value={formData.headPlaceOfSchool}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Spouse Information Section */}
        <div className="form-section">
          <h3 className="resident-edit-title">Spouse Information</h3>
          <div className="form-grid">
            <div className="form-group" style={styles.formGroup}>
              <label>First Name:</label>
              <input
                type="text"
                name="spouseFirstName"
                value={formData.spouseFirstName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Middle Name:</label>
              <input
                type="text"
                name="spouseMiddleName"
                value={formData.spouseMiddleName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Last Name:</label>
              <input
                type="text"
                name="spouseLastName"
                value={formData.spouseLastName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Age:</label>
              <input
                type="number"
                name="spouseAge"
                value={formData.spouseAge}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Sex:</label>
              <select
                name="spouseSex"
                value={formData.spouseSex}
                onChange={handleChange}
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Birthday:</label>
              <input
                type="date"
                name="spouseBirthday"
                value={formatDateForInput(formData.spouseBirthday)}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Place of Birth:</label>
              <input
                type="text"
                name="spousePlaceOfBirth"
                value={formData.spousePlaceOfBirth}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Nationality:</label>
              <select
                name="spouseNationality"
                value={formData.spouseNationality}
                onChange={handleChange}
              >
                {nationalityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Marital Status:</label>
              <select
                name="spouseMaritalStatus"
                value={formData.spouseMaritalStatus}
                onChange={handleChange}
              >
                {maritalOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Religion:</label>
              <select
                name="spouseReligion"
                value={formData.spouseReligion}
                onChange={handleChange}
              >
                {religionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Ethnicity:</label>
              <select
                name="spouseEthnicity"
                value={formData.spouseEthnicity}
                onChange={handleChange}
              >
                {ethnicityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Voter:</label>
              <select
                name="spouseIsRegisteredVoter"
                value={formData.spouseIsRegisteredVoter}
                onChange={handleChange}
              >
                {voterOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>School Level:</label>
              <select
                name="spouseSchoolLevel"
                value={formData.spouseSchoolLevel}
                onChange={handleChange}
              >
                {educationLevels.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={styles.formGroup}>
              <label>Place of School:</label>
              <input
                type="text"
                name="spousePlaceOfSchool"
                value={formData.spousePlaceOfSchool}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Family Members Section */}
        <div className="form-section">
          <h3 className="resident-edit-title">Family Members</h3>
          {formData.familyMembers.map((member, index) => (
            <div key={index} className="family-member-container">
              <h4>Family Member #{index + 1}</h4>
              <div className="form-grid">
                <div className="form-group" style={styles.formGroup}>
                  <label>First Name:</label>
                  <input
                    type="text"
                    value={member.firstName}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "firstName",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Middle Name:</label>
                  <input
                    type="text"
                    value={member.middleName}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "middleName",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Last Name:</label>
                  <input
                    type="text"
                    value={member.lastName}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "lastName",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Age:</label>
                  <input
                    type="number"
                    value={member.age}
                    onChange={(e) =>
                      handleFamilyMemberChange(index, "age", e.target.value)
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Sex:</label>
                  <select
                    value={member.sex}
                    onChange={(e) =>
                      handleFamilyMemberChange(index, "sex", e.target.value)
                    }
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Relationship:</label>
                  <select
                    value={member.relationship}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "relationship",
                        e.target.value
                      )
                    }
                  >
                    {relationshipOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Birthday:</label>
                  <input
                    type="date"
                    value={formatDateForInput(member.birthday)}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "birthday",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Place of Birth:</label>
                  <input
                    type="text"
                    value={member.placeOfBirth}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "placeOfBirth",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Nationality:</label>
                  <select
                    value={member.nationality}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "nationality",
                        e.target.value
                      )
                    }
                  >
                    {nationalityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Marital Status:</label>
                  <select
                    value={member.maritalStatus}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "maritalStatus",
                        e.target.value
                      )
                    }
                  >
                    {maritalOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Religion:</label>
                  <select
                    value={member.religion}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "religion",
                        e.target.value
                      )
                    }
                  >
                    {religionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Ethnicity:</label>
                  <select
                    value={member.ethnicity}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "ethnicity",
                        e.target.value
                      )
                    }
                  >
                    {ethnicityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Voter:</label>
                  <select
                    value={member.isRegisteredVoter}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "isRegisteredVoter",
                        e.target.value
                      )
                    }
                  >
                    {voterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>School Level:</label>
                  <select
                    value={member.schoolLevel}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "schoolLevel",
                        e.target.value
                      )
                    }
                    disabled={member.age < 3 || member.age > 24}
                  >
                    {educationLevels.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>School Place:</label>
                  <input
                    type="text"
                    value={member.placeOfSchool}
                    onChange={(e) =>
                      handleFamilyMemberChange(
                        index,
                        "placeOfSchool",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFamilyMember(index)}
                className="remove-btn"
              >
                Remove Family Member
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFamilyMember}
            className="resident-add-btn"
          >
            Add Family Member
          </button>
        </div>

        {/* Additional Information Section */}
        <div className="form-section">
          <h3 className="resident-edit-title">Additional Information</h3>
          {formData.additionalInfos.map((info, index) => (
            <div key={index} className="additional-info-container">
              <h4>Additional Info #{index + 1}</h4>
              <div className="form-grid">
                <div className="form-group" style={styles.formGroup}>
                  <label>Name:</label>
                  <input
                    type="text"
                    value={info.name}
                    onChange={(e) =>
                      handleAdditionalInfoChange(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Pregnant:</label>
                  <div className="pregnant-field">
                    <select
                      value={info.pregnant}
                      onChange={(e) =>
                        handleAdditionalInfoChange(
                          index,
                          "pregnant",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="N/A">N/A</option>
                    </select>
                    {info.pregnant === "Yes" && (
                      <input
                        type="number"
                        min="1"
                        max="9"
                        placeholder="Months"
                        value={info.pregnantMonths || ""}
                        onChange={(e) =>
                          handleAdditionalInfoChange(
                            index,
                            "pregnantMonths",
                            e.target.value
                          )
                        }
                        className="months-input"
                      />
                    )}
                  </div>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Family Planning:</label>
                  <select
                    value={info.familyPlanning}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "familyPlanning",
                        e.target.value
                      )
                    }
                    disabled={info.pregnant === "Yes"}
                  >
                    {familyPlanningOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>PWD (Specify disability or N/A):</label>
                  <input
                    type="text"
                    placeholder="Specify disability or N/A"
                    value={info.pwd}
                    onChange={(e) =>
                      handleAdditionalInfoChange(index, "pwd", e.target.value)
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Solo Parent:</label>
                  <select
                    value={info.soloParent}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "soloParent",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Senior Citizen (ID Number):</label>
                  <input
                    type="text"
                    placeholder="ID Number"
                    value={info.seniorCitizen}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "seniorCitizen",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Maintenance (Medicine/Diagnosis):</label>
                  <input
                    type="text"
                    placeholder="Medicine/Diagnosis"
                    value={info.maintenance}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "maintenance",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>PhilHealth (ID Number):</label>
                  <input
                    type="text"
                    placeholder="ID Number"
                    value={info.philhealth}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "philhealth",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>House & Lot:</label>
                  <select
                    value={info.houseLot}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "houseLot",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select</option>
                    <option value="Owned">Owned</option>
                    <option value="Rented">Rented</option>
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Water Supply:</label>
                  <select
                    value={info.waterSupply}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "waterSupply",
                        e.target.value
                      )
                    }
                  >
                    {waterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Comfort Room:</label>
                  <select
                    value={info.comfortRoom}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "comfortRoom",
                        e.target.value
                      )
                    }
                  >
                    {comfortRoomOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>OFW Country:</label>
                  <input
                    type="text"
                    placeholder="Country name"
                    value={info.ofwCountry}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "ofwCountry",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Years as OFW:</label>
                  <input
                    type="number"
                    placeholder="Years"
                    value={info.yearsInService}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "yearsInService",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Out of School (Grade/Level stopped):</label>
                  <input
                    type="text"
                    placeholder="Grade/Level stopped"
                    value={info.outOfSchool}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "outOfSchool",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Immigrant Nationality:</label>
                  <select
                    value={info.immigrantNationality}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "immigrantNationality",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Not an immigrant</option>
                    {nationalityOptions.map((option) =>
                      option ? (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ) : null
                    )}
                  </select>
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Years of Stay:</label>
                  <input
                    type="number"
                    placeholder="Years in Darasa"
                    value={info.yearsOfStay}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "yearsOfStay",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group" style={styles.formGroup}>
                  <label>Residence Years:</label>
                  <input
                    type="number"
                    placeholder="Years in Darasa"
                    value={info.residence}
                    onChange={(e) =>
                      handleAdditionalInfoChange(
                        index,
                        "residence",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeAdditionalInfo(index)}
                className="remove-btn"
              >
                Remove Additional Info
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addAdditionalInfo}
            className="resident-add-btn"
          >
            Add Additional Info
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResidentForm;
const styles = {
  container: {
      maxWidth: "600px",
      margin: "2rem auto",
      padding: "2rem",
      borderRadius: "12px",
      background: "#f9fafb",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
  },
  header: {
      textAlign: "center",
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "1.5rem",
      color: "#1e3a8a",
  },
  form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.2rem",
  },
  formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
  },
  label: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#1e3a8a",
  },
  input: {
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      fontSize: "16px",
      outline: "none",
      transition: "all 0.3s ease",
  },
  button: {
      marginTop: "1.5rem",
      padding: "12px",
      borderRadius: "8px",
      border: "none",
      background: "#2563eb",
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "background 0.3s ease",
  },
};
