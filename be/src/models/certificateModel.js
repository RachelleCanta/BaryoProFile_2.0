import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
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
    ],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  printedBy: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "User",
    type: String,
    required: true,
  },
  data: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
});

export const Certificate = mongoose.model("Certificate", certificateSchema);
