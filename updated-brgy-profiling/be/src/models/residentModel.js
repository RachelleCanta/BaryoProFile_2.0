import mongoose from "mongoose";

const ResidentSchema = new mongoose.Schema(
  {
    cluster: { type: String, required: true },
    brgyHealthWorker: { type: String, required: true },
    householdNo: { type: String, required: true },
    totalMembers: { type: Number, required: true },
    houseLotBlockNo: { type: String, required: true },
    doorInput: { type: String, required: true },
    fourPsIdNo: { type: String, required: true },

    // Head of the Household
    headFirstName: { type: String, required: true },
    headMiddleName: { type: String },
    headLastName: { type: String, required: true },
    relationshipToHouseHoldHead: { type: String, required: true },
    headAge: { type: Number, required: true },
    headSex: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    headBirthday: { type: Date, required: true },
    headPlaceOfBirth: { type: String, required: true },
    headNationality: { type: String, required: true },
    headMaritalStatus: { type: String, required: true },
    headReligion: { type: String, required: true },
    headEthnicity: { type: String, required: true },
    headHighestLevelOfEducation: { type: String, required: true },
    headSchoolLevel: { type: String },
    headPlaceOfSchool: { type: String },

    // Spouse Information
    spouseFirstName: { type: String },
    spouseMiddleName: { type: String },
    spouseLastName: { type: String },
    spouseRelationshipToHouseHoldHead: { type: String },
    spouseAge: { type: Number },
    spouseSex: { type: String, enum: ["Male", "Female", "Other"] },
    spouseBirthday: { type: Date },
    spousePlaceOfBirth: { type: String },
    spouseNationality: { type: String },
    spouseMaritalStatus: { type: String },
    spouseReligion: { type: String },
    spouseEthnicity: { type: String },
    spouseIsRegisteredVoter: { type: Boolean },
    spouseSchoolLevel: { type: String },
    spousePlaceOfSchool: { type: String },

    // Family Members (Array of Objects)
    familyMembers: [
      {
        firstName: { type: String },
        middleName: { type: String },
        lastName: { type: String },
        relationship: { type: String },
        age: { type: Number },
        sex: {
          type: String,
          enum: ["Male", "Female", "Other"],
          required: true,
        },
        birthday: { type: Date },
        placeOfBirth: { type: String },
        nationality: { type: String },
        maritalStatus: { type: String },
        religion: { type: String },
        ethnicity: { type: String },
        isRegisteredVoter: { type: Boolean },
        schoolLevel: { type: String },
        placeOfSchool: { type: String },
      },
    ],

    // Additional Information
    additionalInfos: [
      {
        name: { type: String },
        pregnant: { type: String, default: "" },
        pregnantMonths: { type: Number, default: 0 },
        familyPlanning: { type: String, default: "" },
        pwd: { type: String, default: "N/A" },
        soloParent: { type: String, default: "" },
        seniorCitizen: { type: String, default: "" },
        maintenance: { type: String, default: "" },
        philhealth: { type: String, default: "" },
        houseLot: { type: String, default: "" },
        waterSupply: { type: String, default: "" },
        comfortRoom: { type: String, default: "" },
        ofwCountry: { type: String, default: "" },
        yearsInService: { type: Number, default: 0 },
        outOfSchool: { type: String, default: "" },
        immigrantNationality: { type: String, default: "" },
        yearsOfStay: { type: Number, default: 0 },
        residence: { type: Number, default: "" },
      },
    ],
  },
  { timestamps: true }
);

const Resident = mongoose.model("Resident", ResidentSchema);

export { Resident };
