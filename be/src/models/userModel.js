import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Link to the User
  linkedResident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resident",
  },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["systemadmin", "staff", "user"],
    default: "user",
  },
  status: {
    type: String,
    enum: ["pending", "active", "inactive"],
    default: "pending",
  },
  editorType: {
    type: [String],
    enum: [
      "view_only",
      "add_only",
      "edit_only",
      "delete_only",
      "all",
      "view_and_manage_records",
      "manage_certificates",
      "view_reports_and_analytics",
    ],
    default: "view_only",
  },
  permissions: { type: [String], default: [] },
});

const assignPermissions = (user) => {
  if (user.role === "systemadmin") {
    user.permissions = [
      "manage_users",
      "manage_system",
      "add",
      "edit",
      "delete",
      "view",
      "certificates",
    ];
  } else if (user.role === "staff") {
    const editorPermissions = {
      view_only: ["View Records"],
      add_only: ["Add Records"],
      edit_only: ["edit"],
      delete_only: ["delete"],
      manage_certificates: ["Manage Certificates"],
      view_reports_and_analytics: ["View Reports & Analytics"],
      view_and_manage_records: ["View & Manage Records"],
      all: [
        "Add Records",
        "edit",
        "delete",
        "Manage Certificates",
        "View & Manage Records",
      ],
    };

    // Map multiple editorTypes to their respective permissions
    user.permissions = user.editorType.flatMap(
      (type) => editorPermissions[type] || []
    );
  } else {
    user.permissions = ["view_only"];
  }
};

// * pre-save hook
userSchema.pre("save", function (next) {
  assignPermissions(this);
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  let update = this.getUpdate();

  if (update.role || update.editorType) {
    const user = await this.model.findOne(this.getQuery()); // Fetch the existing user

    if (user) {
      const newUserData = { ...user.toObject(), ...update }; // Merge existing user data with updates
      assignPermissions(newUserData); // Assign correct permissions

      update.permissions = newUserData.permissions; // Update the permissions field
      this.setUpdate(update);
    }
  }

  next();
});

export const User = mongoose.model("User", userSchema);
