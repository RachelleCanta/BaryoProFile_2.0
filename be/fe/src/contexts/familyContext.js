import { createContext, useState } from "react";

const FamilyContext = createContext();

export const FamilyProvider = ({ children }) => {
  // * ORIG
  const [formData, setFormData] = useState({
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
    headVoter: "Registered",
    headHLEC: "College Level",
    schoolLevel: "N/A",
    POS: "N/A",

    headHouseLot: "Owned",
    headWaterSupply: "Own",
    headComfortRoom: "Owned",
    headResidence: 0,

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
    spouseVoter: "Registered",
    spouseHLEC: "College Level",
    spouseSchoolLevel: "N/A",
    spousePOS: "N/A",

    spouseHouseLot: "Owned",
    spouseWaterSupply: "Own",
    spouseComfortRoom: "Owned",
    spouseResidence: 0,
  });
  const familyMember = {
    firstName: "",
    middleName: "",
    lastName: "",
    relationship: "Son",
    sex: "Male",
    age: "",
    birthday: "",
    placeOfBirth: "N/A",
    nationality: "Filipino",
    maritalStatus: "Single",
    religion: "Roman Catholic",
    ethnicity: "Tagalog",
    voter: "Not Registered",
    hlec: "Elementary Level",
    schoolLevel: "N/A",
    schoolPlace: "N/A",

    houseLot: "Owned",
    waterSupply: "Own",
    comfortRoom: "Owned",
    residence: 0,
  };

  const additionalInfo = {
    name: "",
    pregnant: "No",
    pregnantMonths: 0,
    familyPlanning: "None",
    pwd: "N/A",
    soloParent: "No",
    seniorCitizen: "N/A",
    maintenance: "N/A",
    philhealth: "N/A",
    // houseLot: "Owned",
    // waterSupply: "Own",
    // comfortRoom: "Owned",
    ofwCountry: "N/A",
    ofwYears: 0,
    dropout: "N/A",
    immigrantNationality: "Not an immigrant",
    immigrantStay: 0,
    // residence: 0,
  };

  const [familyMembers, setFamilyMembers] = useState([]);

  const [additionalInfos, setAdditionalInfos] = useState([]);

  return (
    <FamilyContext.Provider
      value={{
        formData,
        setFormData,
        familyMember,
        familyMembers,
        setFamilyMembers,
        additionalInfo,
        additionalInfos,
        setAdditionalInfos,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export { FamilyContext };
