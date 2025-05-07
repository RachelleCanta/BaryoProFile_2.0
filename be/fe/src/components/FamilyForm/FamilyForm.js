import React, { useContext, useEffect, useState } from "react";
import { logResidentActivity, ACTIONS } from "../../utils/auditLogger";
import "./FamilyForm.css";
import axios from "axios";
import axiosInstance from "../../axios";
import { UserContext } from "../../contexts/userContext.js";
import { toast } from "react-toastify";
import { MAIN_API_LINK } from "../../utils/API.js";
import { FamilyContext } from "../../contexts/familyContext.js";

function FamilyForm({ onBack }) {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const {
    formData,
    setFormData,
    familyMember,
    familyMembers,
    setFamilyMembers,
    additionalInfo,
    additionalInfos,
    setAdditionalInfos,
  } = useContext(FamilyContext);

  const [isProcessing, setIsProcessing] = useState(false);

  const [otherReligion, setOtherReligion] = useState({
    head: "",
    spouse: "",
  });

  const [otherReligionFamMember, setOtherReligionFamMember] = useState([]);
  const [otherRelationshipFamMember, setOtherRelationshipFamMember] = useState(
    []
  );

  const [otherHouseAndLot, setOtherHouseAndLot] = useState({
    head: "",
    spouse: "",
  });
  const [otherHouseAndLotFamMember, setOtherHouseAndLotFamMember] = useState(
    []
  );

  const [otherWaterSupply, setOtherWaterSupply] = useState({
    head: "",
    spouse: "",
  });
  const [otherWaterSupplyFamMember, setOtherWaterSupplyFamMember] = useState(
    []
  );

  const [otherComfortRoom, setOtherComfortRoom] = useState({
    head: "",
    spouse: "",
  });
  const [otherComfortRoomFamMember, setOtherComfortRoomFamMember] = useState(
    []
  );

  const yesNoOptions = ["", "Yes", "No"];
  const sexOptions = ["", "Male", "Female", "LGBTQ+"];
  const maritalOptions = [
    "",
    "Single",
    "Married",
    "Widowed",
    "Separated",
    "Live-in",
  ];
  const waterOptions = ["", "Own", "Shared", "Bottled", "Other"];
  const houseLotOptions = ["", "Owned", "Rented", "Other"];
  const comfortRoomOptions = ["", "Owned", "Shared", "Other"];
  const voterOptions = ["", "Registered", "Not Registered"];
  const availableClusters = Array.from({ length: 25 }, (_, i) =>
    (i + 1).toString()
  );
  const educationLevels = [
    "",
    "Daycare/Nursery",
    "Kindergarten/Preparatory",
    "Elementary Level",
    "Elementary Graduate",
    "Highschool Level",
    "Highschool Graduate",
    "Vocational/Technical Course",
    "College Level",
    "College Graduate",
    // "Elementary",
    // "High School",
    // "Senior High School",
    // "College",
    // "Vocational",
    // "Post Graduate",
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
    "Daughter-in-law",
    "son-in-law",
    "Granddaughter",
    "Grandson",
    "Niece",
    "Nephew",
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
    "Filipino",
    "Finnish",
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
    "Roman Catholic",
    "Christianity",
    "Islam",
    "INC",
    "Philippine Independent Church",
    "Born Again",
    "Seventh-day Adventist",
    "Bible Baptist Church",
    "United Church of Christ in the Philippines",
    "Jehovah",
    "Mystica",
    "Church of Christ",
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

  const [showFamilyMembers, setShowFamilyMembers] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  // Regular expression for numeric validation
  const numericRegex = /^[0-9]*$/;

  // // * ORIG
  // const [formData, setFormData] = useState({
  //   cluster: "",
  //   healthWorker: "",
  //   household: "N/A",
  //   totalMembers: 2,
  //   houseInput: "N/A",
  //   doorInput: "N/A",
  //   fourPs: "No",
  //   headFirstName: "",
  //   headMiddleName: "",
  //   headLastName: "",
  //   headRelationship: "Head",
  //   headSex: "Male",
  //   headAge: "",
  //   headBirthday: "",
  //   headPlaceOfBirth: "N/A",
  //   headNationality: "Filipino",
  //   headMaritalStatus: "Married",
  //   headReligion: "Roman Catholic",
  //   headEthnicity: "Tagalog",
  //   headHLEC: "College",
  //   schoolLevel: "N/A",
  //   POS: "N/A",
  //   spouseFirstName: "",
  //   spouseMiddleName: "",
  //   spouseLastName: "",
  //   spouseRelationship: "Spouse",
  //   spouseSex: "Female",
  //   spouseAge: "",
  //   spouseBirthday: "",
  //   spousePlaceOfBirth: "N/A",
  //   spouseNationality: "Filipino",
  //   spouseMaritalStatus: "Married",
  //   spouseReligion: "Roman Catholic",
  //   spouseEthnicity: "Tagalog",
  //   spouseVoter: "Registered",
  //   spouseSchoolLevel: "N/A",
  //   spousePOS: "N/A",
  // });
  // const familyMember = {
  //   firstName: "",
  //   middleName: "",
  //   lastName: "",
  //   relationship: "Son",
  //   sex: "Male",
  //   age: "",
  //   birthday: "",
  //   placeOfBirth: "N/A",
  //   nationality: "Filipino",
  //   maritalStatus: "Single",
  //   religion: "Roman Catholic",
  //   ethnicity: "Tagalog",
  //   voter: "Not Registered",
  //   schoolLevel: "N/A",
  //   schoolPlace: "N/A",
  // };

  // const additionalInfo = {
  //   name: "",
  //   pregnant: "No",
  //   pregnantMonths: 0,
  //   familyPlanning: "None",
  //   pwd: "N/A",
  //   soloParent: "No",
  //   seniorCitizen: "N/A",
  //   maintenance: "N/A",
  //   philhealth: "N/A",
  //   houseLot: "Owned",
  //   waterSupply: "Own",
  //   comfortRoom: "Owned",
  //   ofwCountry: "N/A",
  //   ofwYears: 0,
  //   dropout: "N/A",
  //   immigrantNationality: "Not an immigrant",
  //   immigrantStay: 0,
  //   residence: 0,
  // };

  // const [familyMembers, setFamilyMembers] = useState([]);

  // const [additionalInfos, setAdditionalInfos] = useState([]);

  // ! FOR TESTING PURPOSED ONLY
  // const [formData, setFormData] = useState({
  //   cluster: "1",
  //   healthWorker: "John Doe",
  //   household: "Doe Family",
  //   totalMembers: "2",
  //   houseInput: "123 Main St",
  //   doorInput: "4B",
  //   fourPs: "yes",
  //   headFirstName: "Michael",
  //   headMiddleName: "Smith",
  //   headLastName: "Doe",
  //   headRelationship: "Head",
  //   headSex: "Male",
  //   headAge: "45",
  //   headBirthday: "1979-03-15",
  //   headPlaceOfBirth: "Manila",
  //   headNationality: "Filipino",
  //   headMaritalStatus: "Married",
  //   headReligion: "Christianity",
  //   headEthnicity: "Tagalog",
  //   headHLEC: "High School",
  //   schoolLevel: "College",
  //   POS: "Employed",
  //   spouseFirstName: "Sarah",
  //   spouseMiddleName: "Anne",
  //   spouseLastName: "Doe",
  //   spouseRelationship: "Spouse",
  //   spouseSex: "Female",
  //   spouseAge: "42",
  //   spouseBirthday: "1982-06-20",
  //   spousePlaceOfBirth: "Cebu",
  //   spouseNationality: "Filipino",
  //   spouseMaritalStatus: "Married",
  //   spouseReligion: "Christianity",
  //   spouseEthnicity: "Bisaya",
  //   spouseVoter: "Registered",
  //   spouseSchoolLevel: "College",
  //   spousePOS: "Self-Employed",
  // });

  // ! FOR TESTING PURPOSED ONLY
  // const familyMember = {
  //   firstName: "Emily",
  //   middleName: "Grace",
  //   lastName: "Doe",
  //   relationship: "Daughter",
  //   sex: "Female",
  //   age: "18",
  //   birthday: "2006-01-10",
  //   placeOfBirth: "Manila",
  //   nationality: "Filipino",
  //   maritalStatus: "Single",
  //   religion: "Christianity",
  //   ethnicity: "Tagalog",
  //   voter: "Not Registered",
  //   schoolLevel: "Senior High School",
  //   schoolPlace: "Quezon City",
  // };

  // const additionalInfo = {
  //   name: "Michael Doe",
  //   pregnant: "No",
  //   pregnantMonths: 0,
  //   familyPlanning: "Pills",
  //   pwd: "N/A",
  //   soloParent: "No",
  //   seniorCitizen: "N/A",
  //   maintenance: "N/A",
  //   philhealth: "N/A",
  //   houseLot: "Owned",
  //   waterSupply: "Own",
  //   comfortRoom: "Owned",
  //   ofwCountry: "N/A",
  //   ofwYears: 0,
  //   dropout: "No",
  //   immigrantNationality: "Not an immigrant",
  //   immigrantStay: "N/A",
  //   residence: 0,
  // };

  // const [familyMembers, setFamilyMembers] = useState([
  //   {
  //     firstName: "Emily",
  //     middleName: "Grace",
  //     lastName: "Doe",
  //     relationship: "Daughter",
  //     sex: "Female",
  //     age: "18",
  //     birthday: "2006-01-10",
  //     placeOfBirth: "Manila",
  //     nationality: "Filipino",
  //     maritalStatus: "Single",
  //     religion: "Christianity",
  //     ethnicity: "Tagalog",
  //     voter: "Registered",
  //     schoolLevel: "Senior High School",
  //     schoolPlace: "Quezon City",
  //   },
  //   {
  //     firstName: "Jacob",
  //     middleName: "Andrew",
  //     lastName: "Doe",
  //     relationship: "Son",
  //     sex: "Male",
  //     age: "15",
  //     birthday: "2009-07-05",
  //     placeOfBirth: "Manila",
  //     nationality: "Filipino",
  //     maritalStatus: "Single",
  //     religion: "Christianity",
  //     ethnicity: "Tagalog",
  //     voter: "Registered",
  //     schoolLevel: "High School",
  //     schoolPlace: "Quezon City",
  //   },
  // ]);

  // const [additionalInfos, setAdditionalInfos] = useState([
  //   {
  //     name: "Michael Doe",
  //     pregnant: "No",
  //     pregnantMonths: 0,
  //     familyPlanning: "Pills",
  //     pwd: "No",
  //     soloParent: "No",
  //     seniorCitizen: "N/A",
  //     maintenance: "None",
  //     philhealth: "Yes",
  //     houseLot: "Owned",
  //     waterSupply: "Own",
  //     comfortRoom: "Owned",
  //     ofwCountry: "N/A",
  //     ofwYears: 0,
  //     dropout: "N/A",
  //     immigrantNationality: "N/A",
  //     immigrantStay: 0,
  //     residence: 0,
  //   },
  // ]);

  // Handle numeric input validation for ID numbers

  // useEffect(() => {
  //   setShowFamilyMembers(formData.totalMembers > 0);
  //   let membersWithOutParents = formData.totalMembers - 2;
  //   if (formData.totalMembers && formData.totalMembers > 2) {
  //     let currentFamMemsLength = familyMembers.length;
  //     if (membersWithOutParents > 0) {
  //       setFamilyMembers((prev) => {
  //         if (currentFamMemsLength < membersWithOutParents) {
  //           let diff = membersWithOutParents - currentFamMemsLength;
  //           let holder = [];
  //           for (let i = 0; i < diff; i++) {
  //             holder.push(familyMember);
  //           }
  //           return [...familyMembers, ...holder];
  //         } else if (currentFamMemsLength > membersWithOutParents) {
  //           let holder = [];
  //           for (let i = 0; i < membersWithOutParents; i++) {
  //             holder.push(familyMember);
  //           }
  //           return [...holder];
  //         } else {
  //           return [...familyMembers];
  //         }
  //       });
  //     }
  //   } else if (formData.totalMembers && formData.totalMembers < 2) {
  //     toast.error("Total Members Cannot Be Lower Than Two (2) (Parents)");
  //   } else {
  //     setFamilyMembers([]);
  //   }
  // }, [formData.totalMembers]);

  useEffect(() => {
    setShowFamilyMembers(formData.totalMembers > 0);
    let membersWithOutParents = formData.totalMembers - 2;

    if (formData.totalMembers && formData.totalMembers > 2) {
      let currentFamMemsLength = familyMembers.length;
      if (membersWithOutParents > 0) {
        setFamilyMembers((prev) => {
          if (currentFamMemsLength < membersWithOutParents) {
            let diff = membersWithOutParents - currentFamMemsLength;
            let holder = [];
            for (let i = 0; i < diff; i++) {
              // Create a new object for each new member
              holder.push({ ...familyMember }); // Using spread to create a new object
            }
            return [...familyMembers, ...holder];
          } else if (currentFamMemsLength > membersWithOutParents) {
            let holder = [];
            for (let i = 0; i < membersWithOutParents; i++) {
              // Create a new object for each new member
              holder.push({ ...familyMember }); // Using spread to create a new object
            }
            return [...holder];
          } else {
            return [...familyMembers];
          }
        });
      }
    } else if (formData.totalMembers && formData.totalMembers < 2) {
      toast.error("Total Members Cannot Be Lower Than Two (2) (Parents)");
    } else {
      setFamilyMembers([]);
    }
  }, [formData.totalMembers]);

  const handleNumericInput = (event, setter, field, value) => {
    // If the value is empty or matches numeric pattern, update the state
    if (value === "" || numericRegex.test(value)) {
      setter(field, value);
    }
  };

  // To remove a family member
  const removeFamilyMember = (index) => {
    setFormData({ ...formData, totalMembers: 2 + familyMembers.length - 1 });
    setFamilyMembers((prevData) => prevData.filter((_, i) => i !== index));
    setOtherReligionFamMember((prevData) =>
      prevData.filter((_, i) => i !== index)
    );
    setOtherRelationshipFamMember((prevData) =>
      prevData.filter((_, i) => i !== index)
    );
    // setOtherHouseAndLot;
    setOtherHouseAndLotFamMember((prevData) =>
      prevData.filter((_, i) => i !== index)
    );
    // setOtherWaterSupply;
    setOtherWaterSupplyFamMember((prevData) =>
      prevData.filter((_, i) => i !== index)
    );
    // setOtherComfortRoom;
    setOtherComfortRoomFamMember((prevData) =>
      prevData.filter((_, i) => i !== index)
    );
  };

  useEffect(() => {
    if (familyMembers.length <= 0) {
      setShowFamilyMembers(false);
    }
    if (additionalInfos.length <= 0) {
      setShowAdditionalInfo(false);
    }
  }, [familyMembers, additionalInfos]);

  // To remove an additional info
  const removeAdditionalInfo = (index) => {
    setAdditionalInfos((prevData) => prevData.filter((_, i) => i !== index));
  };

  // Validation function for the form before submission
  const validateForm = () => {
    let isValid = true;
    let message = "";

    // Check that each additional info entry has a name
    additionalInfos.forEach((info, index) => {
      // alert(info.name);
      if (!info.name.trim()) {
        isValid = false;
        message = `Additional Info #${index + 1} is missing a name.`;
      }

      // Validate pregnant months (between 1-9) if pregnant is Yes
      if (
        info.pregnant === "Yes" &&
        (!info.pregnantMonths ||
          info.pregnantMonths < 1 ||
          info.pregnantMonths > 9 ||
          info.pregnantMonths === "")
      ) {
        isValid = false;
        message = `Additional Info for ${
          info.name || `#${index + 1}`
        }: Pregnant months must be between 1 and 9.`;
      }

      // Ensure Family Planning is not selected when Pregnant is Yes
      if (
        info.pregnant === "Yes" &&
        info.familyPlanning &&
        info.familyPlanning !== "None" &&
        info.familyPlanning !== ""
      ) {
        isValid = false;
        message = `Additional Info for ${
          info.name || `#${index + 1}`
        }: Family Planning should not be selected when Pregnant is Yes.`;
      }

      // Validate that ID fields contain only numbers
      // if (info.seniorCitizen && !numericRegex.test(info.seniorCitizen)) {
      //   isValid = false;
      //   message = `Additional Info for ${
      //     info.name || `#${index + 1}`
      //   }: Senior Citizen ID must contain only numbers.`;
      // }

      // if (info.philhealth && !numericRegex.test(info.philhealth)) {
      //   isValid = false;
      //   message = `Additional Info for ${
      //     info.name || `#${index + 1}`
      //   }: PhilHealth ID must contain only numbers.`;
      // }

      // Ensure numeric years are valid
      if (
        info.ofwYears &&
        (!numericRegex.test(info.ofwYears) || parseInt(info.ofwYears) < 0)
      ) {
        isValid = false;
        message = `Additional Info for ${
          info.name || `#${index + 1}`
        }: OFW Years must be a positive number.`;
      }

      if (
        info.immigrantStay &&
        (!numericRegex.test(info.immigrantStay) ||
          parseInt(info.immigrantStay) < 0)
      ) {
        isValid = false;
        message = `Additional Info for ${
          info.name || `#${index + 1}`
        }: Immigrant Years of Stay must be a positive number.`;
      }

      if (
        info.residence &&
        (!numericRegex.test(info.residence) || parseInt(info.residence) < 0)
      ) {
        isValid = false;
        message = `Additional Info for ${
          info.name || `#${index + 1}`
        }: Residence Years must be a positive number.`;
      }
    });

    // Validate 4P's ID (if provided)
    // if (formData.fourPs && !numericRegex.test(formData.fourPs)) {
    //   isValid = false;
    //   message = "4P's ID Number must contain only numbers.";
    // }

    // if (!isValid) {
    //   alert(message);
    // }

    if (!isValid) {
      toast.error(message);
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const completeData = {
      ...formData,
      familyMembers,
      additionalInfos, // Using additionalInfos consistently (not additionalInfo)
      dateAdded: new Date().toISOString(),
    };

    const data = {
      cluster: completeData.cluster,
      brgyHealthWorker: completeData.healthWorker,
      householdNo: completeData.household,
      totalMembers: completeData.totalMembers,
      houseLotBlockNo: completeData.houseInput,
      doorInput: completeData.doorInput,
      fourPsIdNo: completeData.fourPs,

      headFirstName: completeData.headFirstName,
      headMiddleName: completeData.headMiddleName,
      headLastName: completeData.headLastName,
      relationshipToHouseHoldHead: completeData.headRelationship,
      headAge: completeData.headAge,
      headSex: completeData.headSex,
      headBirthday: completeData.headBirthday,
      headPlaceOfBirth: completeData.headPlaceOfBirth,
      headNationality: completeData.headNationality,
      headMaritalStatus: completeData.headMaritalStatus,
      headReligion:
        completeData.headReligion === "Other"
          ? otherReligion.head
          : completeData.headReligion,
      headEthnicity: completeData.headEthnicity,
      headIsRegisteredVoter:
        completeData.headVoter === "Registered" ? true : false,
      headHighestLevelOfEducation: completeData.headHLEC,
      headSchoolLevel: completeData.schoolLevel,
      headPlaceOfSchool: completeData.POS,

      headHouseLot:
        completeData.headHouseLot === "Other"
          ? otherHouseAndLot.head
          : completeData.headHouseLot,
      headWaterSupply: completeData.headWaterSupply === "Other"
          ? otherWaterSupply.head
          : completeData.headWaterSupply,
      headComfortRoom: completeData.headComfortRoom === "Other"
          ? otherComfortRoom.head
          : completeData.headComfortRoom,
      headResidence: completeData.headResidence,

      spouseFirstName: completeData.spouseFirstName,
      spouseMiddleName: completeData.spouseMiddleName,
      spouseLastName: completeData.spouseLastName,
      spouseRelationshipToHouseHoldHead: completeData.spouseRelationship,
      spouseAge: completeData.spouseAge,
      spouseSex: completeData.spouseSex,
      spouseBirthday: completeData.spouseBirthday,
      spousePlaceOfBirth: completeData.spousePlaceOfBirth,
      spouseNationality: completeData.spouseNationality,
      spouseMaritalStatus: completeData.spouseMaritalStatus,
      spouseReligion:
        completeData.spouseReligion === "Other"
          ? otherReligion.spouse
          : completeData.spouseReligion,
      spouseEthnicity: completeData.spouseEthnicity,
      spouseIsRegisteredVoter:
        completeData.spouseVoter === "Registered" ? true : false,
      spouseHighestLevelOfEducation: completeData.spouseHLEC,
      spouseSchoolLevel: completeData.spouseSchoolLevel,
      spousePlaceOfSchool: completeData.spousePOS,

      spouseHouseLot:
        completeData.spouseHouseLot === "Other"
          ? otherHouseAndLot.spouse
          : completeData.spouseHouseLot,
      spouseWaterSupply: completeData.spouseWaterSupply === "Other"
          ? otherWaterSupply.spouse
          : completeData.spouseWaterSupply,
      spouseComfortRoom: completeData.spouseComfortRoom === "Other"
          ? otherComfortRoom.spouse
          : completeData.spouseComfortRoom,
      spouseResidence: completeData.spouseResidence,

      familyMembers: completeData.familyMembers.map((member, index) => ({
        firstName: member.firstName,
        middleName: member.middleName,
        lastName: member.lastName,
        relationship:
          member.relationship === "Other"
            ? otherRelationshipFamMember[index]?.relationship
            : member.relationship,
        age: member.age,
        sex: member.sex,
        birthday: member.birthday,
        placeOfBirth: member.placeOfBirth,
        nationality: member.nationality,
        maritalStatus: member.maritalStatus,
        religion:
          member.religion === "Other"
            ? otherReligionFamMember[index]?.religion
            : member.religion,
        ethnicity: member.ethnicity,
        isRegisteredVoter: member.voter === "Registered" ? true : false,
        hlec: member.hlec,
        schoolLevel: member.schoolLevel,
        placeOfSchool: member.schoolPlace,

        houseLot: member.houseLot === "Other"
            ? otherHouseAndLotFamMember[index]?.houseAndLot
            : member.houseLot,
        waterSupply: member.waterSupply === "Other"
            ? otherWaterSupplyFamMember[index]?.waterSupply
            : member.waterSupply,
        comfortRoom: member.comfortRoom === "Other"
            ? otherComfortRoomFamMember[index]?.comfortRoom
            : member.comfortRoom,
        residence: member.residence,
      })),

      additionalInfos: completeData.additionalInfos.map((info) => ({
        name: info.name,
        pregnant: info.pregnant,
        pregnantMonths: info.pregnantMonths,
        familyPlanning: info.familyPlanning,
        pwd: info.pwd,
        soloParent: info.soloParent,
        seniorCitizen: info.seniorCitizen,
        maintenance: info.maintenance,
        philhealth: info.philhealth,
        // houseLot: info.houseLot,
        // waterSupply: info.waterSupply,
        // comfortRoom: info.comfortRoom,
        ofwCountry: info.ofwCountry,
        yearsInService: info.ofwYears,
        outOfSchool: info.dropout,
        immigrantNationality: info.immigrantNationality,
        yearsOfStay: info.immigrantStay,
        // residence: info.residence,
      })),
    };

    // console.log(completeData.familyMembers[0].age);

    try {
      let url = "http://localhost:8080/api/residents";

      // let response = await axios.post(`${MAIN_API_LINK}/residents`, data);
      setIsProcessing((prev) => true);
      let response = await axiosInstance.post(`/residents`, data);

      if (response.data.success === true) {
        toast.success("Information saved successfully");

        await axiosInstance.post("/system-logs", {
          action: ACTIONS.CREATE,
          module: "Resident Management",
          user: currentUser.id,
          details: `User ${currentUser.username} Added new resident: ${formData.headFirstName} ${formData.headLastName}`,
        });
      }

      clearForm();
      setIsProcessing((prev) => false);
    } catch (error) {
      setIsProcessing((prev) => false);
      toast.error(error.response.data.error);
      console.log(error.response.data);
      toast.error(error.response.data.message);
      return;
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date();
    const birthDate = new Date(selectedDate);
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      computedAge--;
    }

    if (computedAge <= 0) {
      computedAge = 0;
    }

    return computedAge;
  };

  const clearForm = () => {
    // setFormData({
    //   cluster: "",
    //   healthWorker: "",
    //   household: "",
    //   totalMembers: 2,
    //   houseInput: "",
    //   doorInput: "",
    //   fourPs: "",
    //   ...Object.fromEntries(Object.keys(formData).map((key) => [key, ""])),
    // });
    setFormData({
      cluster: "",
      healthWorker: "N/A",
      household: "N/A",
      totalMembers: 2,
      houseInput: "N/A",
      doorInput: "N/A",
      fourPs: "No",
      headFirstName: "",
      headMiddleName: "",
      headLastName: "",
      headRelationship: "Head",
      headSex: "Male",
      headAge: "",
      headBirthday: "",
      headPlaceOfBirth: "N/A",
      headNationality: "Filipino",
      headMaritalStatus: "Married",
      headReligion: "Roman Catholic",
      headEthnicity: "Tagalog",
      headHLEC: "College Level",
      schoolLevel: "N/A",
      POS: "N/A",
      spouseFirstName: "",
      spouseMiddleName: "",
      spouseLastName: "",
      spouseRelationship: "Spouse",
      spouseSex: "Female",
      spouseAge: "",
      spouseBirthday: "",
      spousePlaceOfBirth: "N/A",
      spouseNationality: "Filipino",
      spouseMaritalStatus: "Married",
      spouseReligion: "Roman Catholic",
      spouseEthnicity: "Tagalog",
      spouseHLEC: "College Level",
      spouseVoter: "Registered",
      spouseSchoolLevel: "N/A",
      spousePOS: "N/A",

      headHouseLot: "Owned",
      headWaterSupply: "Own",
      headComfortRoom: "Owned",
      headResidence: 0,

      spouseHouseLot: "Owned",
      spouseWaterSupply: "Own",
      spouseComfortRoom: "Owned",
      spouseResidence: 0,
    });
    setFamilyMembers([
      // {
      //   firstName: "",
      //   middleName: "",
      //   lastName: "",
      //   relationship: "",
      //   sex: "",
      //   age: "",
      //   birthday: "",
      //   placeOfBirth: "",
      //   nationality: "",
      //   maritalStatus: "",
      //   religion: "",
      //   ethnicity: "",
      //   voter: "",
      //   schoolLevel: "",
      //   schoolPlace: "",
      // },
    ]);
    setAdditionalInfos([
      // {
      //   name: "",
      //   pregnant: "",
      //   pregnantMonths: "",
      //   familyPlanning: "",
      //   pwd: "N/A",
      //   soloParent: "",
      //   seniorCitizen: "",
      //   maintenance: "",
      //   philhealth: "",
      //   houseLot: "",
      //   waterSupply: "",
      //   comfortRoom: "",
      //   ofwCountry: "",
      //   ofwYears: "",
      //   dropout: "",
      //   immigrantNationality: "",
      //   immigrantStay: "",
      //   residence: "",
      // },
    ]);
  };

  const addFamilyMember = () => {
    setShowFamilyMembers(true);
    setFamilyMembers([...familyMembers, familyMember]);
    setFormData({ ...formData, totalMembers: 2 + familyMembers.length + 1 });
    setOtherReligionFamMember([
      ...otherReligionFamMember,
      {
        religion: "", // so you don't get undefined errors
      },
    ]);
    setOtherRelationshipFamMember([
      ...otherReligionFamMember,
      {
        relationship: "", // so you don't get undefined errors
      },
    ]);
    setOtherHouseAndLotFamMember([
      ...otherHouseAndLotFamMember,
      {
        houseAndLot: "", // so you don't get undefined errors
      },
    ]);
    setOtherWaterSupplyFamMember([
      ...otherWaterSupplyFamMember,
      {
        waterSupply: "", // so you don't get undefined errors
      },
    ]);
    setOtherComfortRoomFamMember([
      ...otherComfortRoomFamMember,
      {
        comfortRoom: "", // so you don't get undefined errors
      },
    ]);
  };

  const handleFamilyMemberChange = (index, field, value) => {
    const newMembers = [...familyMembers];

    // Apply specific validations for numeric fields
    if (field === "age" && value !== "" && !numericRegex.test(value)) {
      return; // Don't update if not numeric
    }

    newMembers[index][field] = value;
    setFamilyMembers(newMembers);
  };

  const addAdditionalInfo = () => {
    setShowAdditionalInfo(true);
    setAdditionalInfos([...additionalInfos, additionalInfo]);
  };

  // const handleAdditionalInfoChange = (index, field, value) => {
  //   const newInfo = [...additionalInfos];

  //   // Apply specific validations and formatting based on the field
  //   if (field === "pregnant" && value === "No") {
  //     // Clear pregnancy months if pregnant is set to No
  //     newInfo[index].pregnantMonths = "";
  //     newInfo[index].familyPlanning = "";
  //   } else if (field === "pregnant" && value === "") {
  //     // Clear both pregnancy months and family planning if field is reset
  //     newInfo[index].pregnantMonths = "";
  //     newInfo[index].familyPlanning = "";
  //   }

  //   // If changing from pregnant Yes to No, ensure family planning can be selected
  //   if (
  //     field === "pregnant" &&
  //     newInfo[index].pregnant === "Yes" &&
  //     value === "No"
  //   ) {
  //     newInfo[index].familyPlanning = "";
  //   }

  //   if (
  //     field === "pregnant" &&
  //     newInfo[index].pregnant === "Yes" &&
  //     value === "Yes"
  //   ) {
  //     newInfo[index].familyPlanning = "";
  //   }

  //   // Apply numeric validation for specific fields
  //   // if (["seniorCitizen", "philhealth"].includes(field)) {
  //   //   if (value !== "" && !numericRegex.test(value)) {
  //   //     return; // Don't update if not numeric
  //   //   }
  //   // }

  //   // Apply numeric validation for year fields
  //   if (["ofwYears", "immigrantStay", "residence"].includes(field)) {
  //     if (value !== "" && !numericRegex.test(value)) {
  //       return; // Don't update if not numeric
  //     }
  //   }

  //   // Set the field value
  //   newInfo[index][field] = value;

  //   setAdditionalInfos(newInfo);
  // };

  const handleAdditionalInfoChange = (index, field, value) => {
    const newInfo = [...additionalInfos];

    if (field === "pregnant") {
      if (value === "No" || value === "") {
        newInfo[index].pregnantMonths = "";
        newInfo[index].familyPlanning = "";
      } else if (value === "Yes") {
        newInfo[index].familyPlanning = "None"; // or "" if you prefer
      }
    }

    if (["ofwYears", "immigrantStay", "residence"].includes(field)) {
      if (value !== "" && !numericRegex.test(value)) {
        return;
      }
    }

    newInfo[index][field] = value;
    setAdditionalInfos(newInfo);
  };

  // Handle formData changes with numeric validation for specific fields
  const handleFormDataChange = (field, value) => {
    // Check for numeric fields
    if (["totalMembers", "headAge", "spouseAge"].includes(field)) {
      if (value !== "" && !numericRegex.test(value)) {
        return; // Don't update if not numeric
      }
    }

    setFormData({ ...formData, [field]: value });
  };

  const handleOtherReligionChange = (field, value) => {
    setOtherReligion({ ...otherReligion, [field]: value });
  };

  const handleOtherHouseAndLotChange = (field, value) => {
    setOtherHouseAndLot({ ...otherHouseAndLot, [field]: value });
  };

  const handleOtherWaterSupplyChange = (field, value) => {
    setOtherWaterSupply({ ...otherWaterSupply, [field]: value });
  };

  const handleOtherComfortRoomChange = (field, value) => {
    setOtherComfortRoom({ ...otherComfortRoom, [field]: value });
  };

  const handleOtherHouseAndLotFamMemberChange = (index, field, value) => {
    const updated = [...otherHouseAndLotFamMember];

    if (!updated[index]) {
      updated[index] = {}; // Initialize if undefined
    }

    updated[index][field] = value;
    setOtherHouseAndLotFamMember(updated);
  };

  const handleOtherWaterSupplyFamMemberChange = (index, field, value) => {
    const updated = [...otherWaterSupplyFamMember];

    if (!updated[index]) {
      updated[index] = {}; // Initialize if undefined
    }

    updated[index][field] = value;
    setOtherWaterSupplyFamMember(updated);
  };
  
  const handleOtherComfortRoomFamMemberChange = (index, field, value) => {
    const updated = [...otherComfortRoomFamMember];

    if (!updated[index]) {
      updated[index] = {}; // Initialize if undefined
    }

    updated[index][field] = value;
    setOtherComfortRoomFamMember(updated);
  };

  const handleOtherReligionFamilyMemberChange = (index, field, value) => {
    const updated = [...otherReligionFamMember];

    if (!updated[index]) {
      updated[index] = {}; // Initialize if undefined
    }

    updated[index][field] = value;
    setOtherReligionFamMember(updated);
  };

  const handleOtherRelationshipFamilyMemberChange = (index, field, value) => {
    const updated = [...otherRelationshipFamMember];

    if (!updated[index]) {
      updated[index] = {}; // Initialize if undefined
    }

    updated[index][field] = value;
    setOtherRelationshipFamMember(updated);
  };

  return (
    <div className="family-member-container" style={{ padding: 10 }}>
      <div className="logo-part">
        <div className="logo-spacer"></div>
        <div className="darasa">
          <img
            src="/images/darasa-logo.png"
            alt="darasa-logo"
            className="darasa-logo"
          />
        </div>
        <div className="title">
          <p>
            BARANGAY DARASA
            <br />
            Family Profile
          </p>
        </div>
        <div className="tanauan-logo">
          <img
            src="/images/tanauan-logo.png"
            alt="tanauan-logo"
            className="tanauan-logo"
          />
        </div>
        <div className="logo-spacer"></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="upperpart">
          <div className="holder">
            <div className="upper1">
              <div className="cluster">
                <label>CLUSTER:</label>
                <select
                  value={formData.cluster}
                  onChange={(e) =>
                    setFormData({ ...formData, cluster: e.target.value })
                  }
                  required
                >
                  <option key="0" value=""></option>
                  {availableClusters.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {/* <input
                  type="text"
                  value={formData.cluster}
                  onChange={(e) =>
                    setFormData({ ...formData, cluster: e.target.value })
                  }
                  required
                /> */}
              </div>
              <div className="worker">
                <label>BARANGAY HEALTH WORKER:</label>
                <input
                  type="text"
                  value={formData.healthWorker}
                  onChange={(e) =>
                    setFormData({ ...formData, healthWorker: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="upper2">
              <div className="household">
                <label>HOUSEHOLD NUMBER:</label>
                <input
                  type="text"
                  value={formData.household}
                  onChange={(e) =>
                    setFormData({ ...formData, household: e.target.value })
                  }
                  required
                />
              </div>
              <div className="members">
                <label>TOTAL MEMBERS OF FAMILY:</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.totalMembers}
                  onChange={(e) =>
                    handleFormDataChange("totalMembers", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="upper3">
              <div className="house">
                <label>HOUSE/LOT AND BLOCK NO.:</label>
                <input
                  type="text"
                  value={formData.houseInput}
                  onChange={(e) =>
                    setFormData({ ...formData, houseInput: e.target.value })
                  }
                  required
                />
              </div>
              <div className="door">
                <label>DOOR NO./APARTMENT NAME:</label>
                <input
                  type="text"
                  value={formData.doorInput}
                  onChange={(e) =>
                    setFormData({ ...formData, doorInput: e.target.value })
                  }
                  required
                />
              </div>
              <div className="fourps">
                <label>4P's Member</label>
                <select
                  value={formData.fourPs}
                  onChange={(e) =>
                    handleFormDataChange("fourPs", e.target.value)
                  }
                  required
                >
                  <option key="0" value="no">
                    No
                  </option>
                  <option key="1" value="yes">
                    Yes
                  </option>
                </select>
                {/* <input
                  type="text"
                  // inputMode="numeric"
                  // pattern="[0-9]*"
                  value={formData.fourPs}
                  onChange={(e) =>
                    handleFormDataChange("fourPs", e.target.value)
                  }
                /> */}
              </div>
            </div>
          </div>
        </div>

        {/* Head of Family Table */}
        <div className="responsive-table-container">
          <div className="section-title">HEAD OF THE FAMILY</div>
          <table className="responsive-table">
            <thead>
              <tr>
                <th>FIRST NAME</th>
                <th>MIDDLE NAME</th>
                <th>LAST NAME</th>
                <th>RELATIONSHIP TO HOUSEHOLD HEAD</th>
                <th>SEX</th>
                <th>BIRTHDAY DD/MM/YYYY</th>
                <th>AGE</th>
                <th>
                  PLACE OF BIRTH
                  <br />
                  <span className="pob-hint">(Ex. Talisay, Batangas)</span>
                </th>
                <th>NATIONALITY</th>
                <th>MARITAL STATUS</th>
                <th>RELIGION</th>
                <th>ETHNICITY</th>
                <th>REGISTERED VOTER</th>
                <th>HIGHEST LEVEL OF EDUCATION</th>
                <th className="education-col">
                  SCHOOL LEVEL
                  <br />
                  <span className="note-text">(For ages 3-24 only)</span>
                </th>
                <th className="education-col">
                  PLACE OF SCHOOL
                  <br />
                  <span className="note-text">(For ages 3-24 only)</span>
                </th>
                <th>HOUSE & LOT</th>
                <th>WATER SUPPLY</th>
                <th>COMFORT ROOM</th>
                <th>
                  RESIDENCE YEARS
                  <br />
                  <span className="note-text">(In Darasa)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    type="text"
                    value={formData.headFirstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        headFirstName: e.target.value,
                      })
                    }
                    required
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={formData.headMiddleName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        headMiddleName: e.target.value,
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={formData.headLastName}
                    onChange={(e) =>
                      setFormData({ ...formData, headLastName: e.target.value })
                    }
                    required
                  />
                </td>
                <td>
                  <input type="text" value="Head" readOnly />
                </td>
                <td>
                  <select
                    value={formData.headSex}
                    onChange={(e) =>
                      setFormData({ ...formData, headSex: e.target.value })
                    }
                    required
                  >
                    {sexOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="date"
                    value={formData.headBirthday}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        headBirthday: e.target.value,
                        headAge: handleDateChange(e),
                      });
                    }}
                    required
                  />
                </td>
                <td>
                  <input
                    disabled
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.headAge}
                    onChange={(e) =>
                      handleFormDataChange("headAge", e.target.value)
                    }
                    required
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={formData.headPlaceOfBirth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        headPlaceOfBirth: e.target.value,
                      })
                    }
                    required
                  />
                </td>
                <td>
                  <select
                    value={formData.headNationality}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        headNationality: e.target.value,
                      })
                    }
                    required
                  >
                    {nationalityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={formData.headMaritalStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        headMaritalStatus: e.target.value,
                      })
                    }
                    required
                  >
                    {maritalOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={formData.headReligion}
                    onChange={(e) =>
                      setFormData({ ...formData, headReligion: e.target.value })
                    }
                    required
                  >
                    {religionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  {formData.headReligion === "Other" && (
                    <input
                      type="text"
                      placeholder="Religion"
                      value={otherReligion.head || ""}
                      onChange={(e) =>
                        handleOtherReligionChange("head", e.target.value)
                      }
                      className="months-input"
                    />
                  )}
                </td>

                <td>
                  <select
                    value={formData.headEthnicity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        headEthnicity: e.target.value,
                      })
                    }
                    required
                  >
                    {ethnicityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={formData.headVoter}
                    onChange={(e) =>
                      setFormData({ ...formData, headVoter: e.target.value })
                    }
                  >
                    {voterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={formData.headHLEC}
                    onChange={(e) =>
                      setFormData({ ...formData, headHLEC: e.target.value })
                    }
                    required
                  >
                    {educationLevels.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={formData.schoolLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, schoolLevel: e.target.value })
                    }
                    disabled={formData.headAge < 3 || formData.headAge > 24}
                  >
                    {educationLevels.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={formData.POS}
                    onChange={(e) =>
                      setFormData({ ...formData, POS: e.target.value })
                    }
                    disabled={formData.headAge < 3 || formData.headAge > 24}
                  />
                </td>

                <td>
                  <select
                    value={formData.headHouseLot}
                    onChange={(e) =>
                      handleFormDataChange("headHouseLot", e.target.value)
                    }
                    required
                  >
                    {houseLotOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {formData.headHouseLot === "Other" && (
                    <input
                      type="text"
                      placeholder="House and Lot"
                      value={otherHouseAndLot.head || ""}
                      onChange={(e) =>
                        handleOtherHouseAndLotChange("head", e.target.value)
                      }
                      className="months-input"
                    />
                  )}
                </td>
                <td>
                  <select
                    value={formData.headWaterSupply}
                    onChange={(e) =>
                      handleFormDataChange("headWaterSupply", e.target.value)
                    }
                    required
                  >
                    {waterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {formData.headWaterSupply === "Other" && (
                    <input
                      type="text"
                      placeholder="Water Supply"
                      value={otherWaterSupply.head || ""}
                      onChange={(e) =>
                        handleOtherWaterSupplyChange("head", e.target.value)
                      }
                      className="months-input"
                    />
                  )}
                </td>
                <td>
                  <select
                    value={formData.headComfortRoom}
                    onChange={(e) =>
                      handleFormDataChange("headComfortRoom", e.target.value)
                    }
                    required
                  >
                    {comfortRoomOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {formData.headComfortRoom === "Other" && (
                    <input
                      type="text"
                      placeholder="Comfort Room"
                      value={otherComfortRoom.head || ""}
                      onChange={(e) =>
                        handleOtherComfortRoomChange("head", e.target.value)
                      }
                      className="months-input"
                    />
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Years in Darasa"
                    value={formData.headResidence}
                    onChange={(e) =>
                      handleFormDataChange("headResidence", e.target.value)
                    }
                    required
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Spouse Table */}
        <div className="responsive-table-container">
          <div className="section-title">SPOUSE</div>
          <table className="responsive-table">
            <thead>
              <tr>
                <th>FIRST NAME</th>
                <th>MIDDLE NAME</th>
                <th>LAST NAME</th>
                <th>RELATIONSHIP TO HOUSEHOLD HEAD</th>
                <th>SEX</th>
                <th>BIRTHDAY DD/MM/YYYY</th>
                <th>AGE</th>
                <th>
                  PLACE OF BIRTH
                  <br />
                  <span className="pob-hint">(Ex. Talisay, Batangas)</span>
                </th>
                <th>NATIONALITY</th>
                <th>MARITAL STATUS</th>
                <th>RELIGION</th>
                <th>ETHNICITY</th>
                <th>REGISTERED VOTER</th>
                <th>HIGHEST LEVEL OF EDUCATION</th>
                <th className="education-col">
                  SCHOOL LEVEL
                  <br />
                  <span className="note-text">(For ages 3-24 only)</span>
                </th>
                <th className="education-col">
                  PLACE OF SCHOOL
                  <br />
                  <span className="note-text">(For ages 3-24 only)</span>
                </th>
                <th>HOUSE & LOT</th>
                <th>WATER SUPPLY</th>
                <th>COMFORT ROOM</th>
                <th>
                  RESIDENCE YEARS
                  <br />
                  <span className="note-text">(In Darasa)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    type="text"
                    value={formData.spouseFirstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        spouseFirstName: e.target.value,
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={formData.spouseMiddleName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        spouseMiddleName: e.target.value,
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={formData.spouseLastName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        spouseLastName: e.target.value,
                      })
                    }
                  />
                </td>
                <td>
                  <input type="text" value="Spouse" readOnly />
                </td>
                <td>
                  <select
                    value={formData.spouseSex}
                    onChange={(e) =>
                      setFormData({ ...formData, spouseSex: e.target.value })
                    }
                  >
                    {sexOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="date"
                    value={formData.spouseBirthday}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        spouseBirthday: e.target.value,
                        spouseAge: handleDateChange(e),
                      });
                    }}
                  />
                </td>
                <td>
                  <input
                    disabled
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.spouseAge}
                    onChange={(e) =>
                      handleFormDataChange("spouseAge", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={formData.spousePlaceOfBirth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        spousePlaceOfBirth: e.target.value,
                      })
                    }
                  />
                </td>
                <td>
                  <select
                    value={formData.spouseNationality}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        spouseNationality: e.target.value,
                      })
                    }
                  >
                    {nationalityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={formData.spouseMaritalStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        spouseMaritalStatus: e.target.value,
                      })
                    }
                  >
                    {maritalOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={formData.spouseReligion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        spouseReligion: e.target.value,
                      })
                    }
                  >
                    {religionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  {formData.spouseReligion === "Other" && (
                    <input
                      type="text"
                      placeholder="Religion"
                      value={otherReligion.spouse || ""}
                      onChange={(e) =>
                        handleOtherReligionChange("spouse", e.target.value)
                      }
                      className="months-input"
                    />
                  )}
                </td>

                <td>
                  <select
                    value={formData.spouseEthnicity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        spouseEthnicity: e.target.value,
                      })
                    }
                  >
                    {ethnicityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={formData.spouseVoter}
                    onChange={(e) =>
                      setFormData({ ...formData, spouseVoter: e.target.value })
                    }
                  >
                    {voterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={formData.spouseHLEC}
                    onChange={(e) =>
                      setFormData({ ...formData, spouseLEC: e.target.value })
                    }
                    required
                  >
                    {educationLevels.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={formData.spouseSchoolLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        spouseSchoolLevel: e.target.value,
                      })
                    }
                    disabled={formData.spouseAge < 3 || formData.spouseAge > 24}
                  >
                    {educationLevels.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={formData.spousePOS}
                    onChange={(e) =>
                      setFormData({ ...formData, spousePOS: e.target.value })
                    }
                    disabled={formData.spouseAge < 3 || formData.spouseAge > 24}
                  />
                </td>

                <td>
                  <select
                    value={formData.spouseHouseLot}
                    onChange={(e) =>
                      handleFormDataChange("spouseHouseLot", e.target.value)
                    }
                    required
                  >
                    {houseLotOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {formData.spouseHouseLot === "Other" && (
                    <input
                      type="text"
                      placeholder="House and Lot"
                      value={otherHouseAndLot.spouse || ""}
                      onChange={(e) =>
                        handleOtherHouseAndLotChange("spouse", e.target.value)
                      }
                      className="months-input"
                    />
                  )}
                </td>
                <td>
                  <select
                    value={formData.spouseWaterSupply}
                    onChange={(e) =>
                      handleFormDataChange("spouseWaterSupply", e.target.value)
                    }
                    required
                  >
                    {waterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {formData.spouseWaterSupply === "Other" && (
                    <input
                      type="text"
                      placeholder="House and Lot"
                      value={otherWaterSupply.spouse || ""}
                      onChange={(e) =>
                        handleOtherWaterSupplyChange("spouse", e.target.value)
                      }
                      className="months-input"
                    />
                  )}
                </td>
                <td>
                  <select
                    value={formData.spouseComfortRoom}
                    onChange={(e) =>
                      handleFormDataChange("spouseComfortRoom", e.target.value)
                    }
                    required
                  >
                    {comfortRoomOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {formData.spouseComfortRoom === "Other" && (
                    <input
                      type="text"
                      placeholder="Comfort Room"
                      value={otherComfortRoom.spouse || ""}
                      onChange={(e) =>
                        handleOtherComfortRoomChange("spouse", e.target.value)
                      }
                      className="months-input"
                    />
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Years in Darasa"
                    value={formData.spouseResidence}
                    onChange={(e) =>
                      handleFormDataChange("spouseResidence", e.target.value)
                    }
                    required
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Family Members Table */}
        <div className="responsive-table-container">
          <div className="section-title">
            FAMILY MEMBERS (Including 0 mos old to Senior)
          </div>
          {showFamilyMembers ? (
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>FIRST NAME</th>
                  <th>MIDDLE NAME</th>
                  <th>LAST NAME</th>
                  <th>RELATIONSHIP</th>
                  <th>SEX</th>
                  <th>BIRTHDAY</th>
                  <th>AGE</th>
                  <th>
                    PLACE OF BIRTH
                    <br />
                    <span className="pob-hint">(Ex. Talisay, Batangas)</span>
                  </th>
                  <th>NATIONALITY</th>
                  <th>MARITAL STATUS</th>
                  <th>RELIGION</th>
                  <th>ETHNICITY</th>
                  <th>REGISTERED VOTER</th>
                  <th>HIGHEST LEVEL OF EDUCATION</th>
                  <th className="education-col">
                    SCHOOL LEVEL
                    <br />
                    <span className="note-text">(For ages 3-24 only)</span>
                  </th>
                  <th className="education-col">
                    PLACE OF SCHOOL
                    <br />
                    <span className="note-text">(For ages 3-24 only)</span>
                  </th>
                  <th>HOUSE & LOT</th>
                  <th>WATER SUPPLY</th>
                  <th>COMFORT ROOM</th>
                  <th>
                    RESIDENCE YEARS
                    <br />
                    <span className="note-text">(In Darasa)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {familyMembers.map((member, index) => (
                  <tr key={index}>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeFamilyMember(index)}
                        className="remove-info-btn"
                      >
                        Remove Row
                      </button>
                    </td>
                    <td>
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
                        required
                      />
                    </td>
                    <td>
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
                        required
                      />
                    </td>
                    <td>
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
                        required
                      />
                    </td>
                    <td>
                      <select
                        value={member.relationship}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "relationship",
                            e.target.value
                          )
                        }
                        required
                      >
                        {relationshipOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>

                      {member.relationship === "Other" && (
                        <input
                          type="text"
                          placeholder="Relationship"
                          value={
                            otherRelationshipFamMember[index]?.relationship ||
                            ""
                          }
                          onChange={(e) =>
                            handleOtherRelationshipFamilyMemberChange(
                              index,
                              "relationship",
                              e.target.value
                            )
                          }
                          className="months-input"
                        />
                      )}
                    </td>
                    <td>
                      <select
                        value={member.sex}
                        onChange={(e) =>
                          handleFamilyMemberChange(index, "sex", e.target.value)
                        }
                        required
                      >
                        {sexOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="date"
                        value={member.birthday}
                        onChange={(e) => {
                          handleFamilyMemberChange(
                            index,
                            "birthday",
                            e.target.value
                          );
                          handleFamilyMemberChange(
                            index,
                            "age",
                            handleDateChange(e)
                          );
                        }}
                        required
                      />
                    </td>
                    <td>
                      <input
                        disabled
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={member.age}
                        onChange={(e) =>
                          handleFamilyMemberChange(index, "age", e.target.value)
                        }
                        required
                      />
                    </td>
                    <td>
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
                        required
                      />
                    </td>
                    <td>
                      <select
                        value={member.nationality}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "nationality",
                            e.target.value
                          )
                        }
                        required
                      >
                        {nationalityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={member.maritalStatus}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "maritalStatus",
                            e.target.value
                          )
                        }
                        required
                      >
                        {maritalOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={member.religion}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "religion",
                            e.target.value
                          )
                        }
                        required
                      >
                        {religionOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>

                      {member.religion === "Other" && (
                        <input
                          type="text"
                          placeholder="Religion"
                          value={otherReligionFamMember[index]?.religion || ""}
                          onChange={(e) =>
                            handleOtherReligionFamilyMemberChange(
                              index,
                              "religion",
                              e.target.value
                            )
                          }
                          className="months-input"
                        />
                      )}
                    </td>
                    <td>
                      <select
                        value={member.ethnicity}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "ethnicity",
                            e.target.value
                          )
                        }
                        required
                      >
                        {ethnicityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={member.voter}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "voter",
                            e.target.value
                          )
                        }
                        required
                      >
                        {voterOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={member.hlec}
                        onChange={(e) =>
                          setFormData({ ...formData, hlec: e.target.value })
                        }
                        required
                      >
                        {educationLevels.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={member.schoolLevel}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "schoolLevel",
                            e.target.value
                          )
                        }
                        required
                        disabled={member.age < 3 || member.age > 24}
                      >
                        {educationLevels.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={member.schoolPlace}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "schoolPlace",
                            e.target.value
                          )
                        }
                        required
                        disabled={member.age < 3 || member.age > 24}
                      />
                    </td>
                    <td>
                      <select
                        value={member.houseLot}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "houseLot",
                            e.target.value
                          )
                        }
                        required
                      >
                        {houseLotOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {member.houseLot === "Other" && (
                        <input
                          type="text"
                          placeholder="House and Lot"
                          value={
                            otherHouseAndLotFamMember[index]?.houseAndLot || ""
                          }
                          onChange={(e) =>
                            handleOtherHouseAndLotFamMemberChange(
                              index,
                              "houseAndLot",
                              e.target.value
                            )
                          }
                          className="months-input"
                        />
                      )}
                    </td>
                    <td>
                      <select
                        value={member.waterSupply}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "waterSupply",
                            e.target.value
                          )
                        }
                        required
                      >
                        {waterOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {member.waterSupply === "Other" && (
                        <input
                          type="text"
                          placeholder="Water Supply"
                          value={
                            otherWaterSupplyFamMember[index]?.waterSupply || ""
                          }
                          onChange={(e) =>
                            handleOtherWaterSupplyFamMemberChange(
                              index,
                              "waterSupply",
                              e.target.value
                            )
                          }
                          className="months-input"
                        />
                      )}
                    </td>
                    <td>
                      <select
                        value={member.comfortRoom}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "comfortRoom",
                            e.target.value
                          )
                        }
                        required
                      >
                        {comfortRoomOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {member.comfortRoom === "Other" && (
                        <input
                          type="text"
                          placeholder="Water Supply"
                          value={
                            otherComfortRoomFamMember[index]?.comfortRoom || ""
                          }
                          onChange={(e) =>
                            handleOtherComfortRoomFamMemberChange(
                              index,
                              "comfortRoom",
                              e.target.value
                            )
                          }
                          className="months-input"
                        />
                      )}
                    </td>
                    <td>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Years in Darasa"
                        value={member.residence}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "residence",
                            e.target.value
                          )
                        }
                        required
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            ""
          )}
          <div className="addDetails">
            <button
              type="button"
              onClick={addFamilyMember}
              className="add-member-btn"
            >
              Add Family Member
            </button>
          </div>
        </div>

        {/* Additional Info Table */}
        <div className="responsive-table-container">
          <div className="section-title">ADDITIONAL INFO</div>
          <div className="info-note">
            Note: Pregnant field is for women 10 years old and above only.
            Family Planning can only be selected if Pregnant is "No".
          </div>
          {showAdditionalInfo ? (
            <div className="table-responsive">
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>NAME</th>
                    <th>PREGNANT</th>
                    <th>FAMILY PLANNING</th>
                    <th>
                      PWD
                      <br />
                      <span className="note-text">
                        (Specify disability or N/A)
                      </span>
                    </th>
                    <th>SOLO PARENT</th>
                    <th>
                      SENIOR CITIZEN
                      <br />
                      <span className="note-text">(ID Number)</span>
                    </th>
                    <th>
                      MAINTENANCE
                      <br />
                      <span className="note-text">(Medicine/Diagnosis)</span>
                    </th>
                    <th>
                      PHILHEALTH
                      <br />
                      <span className="note-text">(ID Number)</span>
                    </th>
                    {/* <th>HOUSE & LOT</th>
                    <th>WATER SUPPLY</th>
                    <th>COMFORT ROOM</th> */}
                    <th className="ofw-col">
                      OFW COUNTRY
                      <br />
                      <span className="note-text">(If applicable)</span>
                    </th>
                    <th className="ofw-col">YEARS IN SERVICE</th>
                    <th>
                      OUT OF SCHOOL
                      <br />
                      <span className="note-text">(Grade/Level stopped)</span>
                    </th>
                    <th className="immigrant-col">IMMIGRANT NATIONALITY</th>
                    <th className="immigrant-col">YEARS OF STAY</th>
                    {/* <th>
                      RESIDENCE YEARS
                      <br />
                      <span className="note-text">(In Darasa)</span>
                    </th> */}
                  </tr>
                </thead>
                <tbody>
                  {additionalInfos.map((info, index) => (
                    <tr key={index}>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeAdditionalInfo(index)}
                          className="remove-info-btn"
                        >
                          Remove Row
                        </button>
                      </td>
                      <td>
                        <select
                          value={info.name}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="">Select Names</option>

                          {formData.headFirstName &&
                            formData.headMiddleName &&
                            formData.headLastName && (
                              <option
                                key="head"
                                value={`${formData.headFirstName} ${formData.headMiddleName} ${formData.headLastName}`}
                              >
                                {`${formData.headFirstName} ${formData.headMiddleName} ${formData.headLastName}`}
                              </option>
                            )}

                          {formData.spouseFirstName &&
                            formData.spouseMiddleName &&
                            formData.spouseLastName && (
                              <option
                                key="spouse"
                                value={`${formData.spouseFirstName} ${formData.spouseMiddleName} ${formData.spouseLastName}`}
                              >
                                {`${formData.spouseFirstName} ${formData.spouseMiddleName} ${formData.spouseLastName}`}
                              </option>
                            )}

                          {familyMembers.map((member, idx) => {
                            const fullName = `${member.firstName} ${member.middleName} ${member.lastName}`;
                            return (
                              <option key={`member-${idx}`} value={fullName}>
                                {fullName}
                              </option>
                            );
                          })}
                        </select>
                        {/* <input
                          type="text"
                          value={info.name}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          required
                        /> */}
                      </td>
                      <td className="pregnant-cell">
                        <select
                          value={info.pregnant}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "pregnant",
                              e.target.value
                            )
                          }
                          required
                        >
                          {yesNoOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {info.pregnant === "Yes" && (
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[1-9]"
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
                      </td>
                      <td>
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
                          {info.pregnant !== "Yes" &&
                            familyPlanningOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Specify or N/A"
                          value={info.pwd}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "pwd",
                              e.target.value
                            )
                          }
                          required
                        />
                      </td>
                      <td>
                        <select
                          value={info.soloParent}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "soloParent",
                              e.target.value
                            )
                          }
                          required
                        >
                          {yesNoOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          // inputMode="numeric"
                          // pattern="[0-9]*"
                          placeholder="ID Number"
                          value={info.seniorCitizen}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "seniorCitizen",
                              e.target.value
                            )
                          }
                          required
                        />
                      </td>
                      <td>
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
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          // inputMode="numeric"
                          // pattern="[0-9]*"
                          placeholder="ID Number"
                          value={info.philhealth}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "philhealth",
                              e.target.value
                            )
                          }
                          required
                        />
                      </td>
                      {/* <td>
                        <select
                          value={info.houseLot}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "houseLot",
                              e.target.value
                            )
                          }
                          required
                        >
                          {houseLotOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={info.waterSupply}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "waterSupply",
                              e.target.value
                            )
                          }
                          required
                        >
                          {waterOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={info.comfortRoom}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "comfortRoom",
                              e.target.value
                            )
                          }
                          required
                        >
                          {comfortRoomOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </td> */}
                      <td>
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
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Years"
                          value={info.ofwYears}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "ofwYears",
                              e.target.value
                            )
                          }
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Grade/Level stopped"
                          value={info.dropout}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "dropout",
                              e.target.value
                            )
                          }
                          required
                        />
                      </td>
                      <td>
                        <select
                          value={info.immigrantNationality}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "immigrantNationality",
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="Not an immigrant">
                            Not an immigrant
                          </option>
                          {nationalityOptions.map((option) =>
                            option ? (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ) : null
                          )}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Years"
                          value={info.immigrantStay}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "immigrantStay",
                              e.target.value
                            )
                          }
                          required
                        />
                      </td>
                      {/* <td>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Years in Darasa"
                          value={info.residence}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              index,
                              "residence",
                              e.target.value
                            )
                          }
                          required
                        />
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            ""
          )}
          <div className="addDetails">
            <button type="button" onClick={addAdditionalInfo}>
              Add Additional Info
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="button-holder">
          <button type="submit" id="saveButton" disabled={isProcessing}>
            {isProcessing ? <span className="spinner"></span> : "Save"}
          </button>
          <button type="button" id="backToMenuFromFormButton" onClick={onBack}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

export default FamilyForm;
