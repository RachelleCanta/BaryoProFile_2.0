import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import { AuditLog } from "../models/systemLogModel.js";

// * Register User
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, editorType } = req.body;

    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (req.body.linkedResident) {
      user = new User({
        username,
        email,
        password: hashedPassword,
        role,
        editorType,
        linkedResident: req.body.linkedResident,
      });
    } else {
      user = new User({
        username,
        email,
        password: hashedPassword,
        role,
        editorType,
      });
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username,
        email,
        role,
        editorType,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// * Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    // const isMatch = password == user.password;
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        editorType: user.editorType,
        permissions: user.permissions,
        status: user.status,
        linkedResident: user.linkedResident,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// * Get Current User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User profile retrieved", user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// * Get User by ID
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User retrieved", user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// * Get All Users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, message: "Users retrieved", users });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// * Update User
const updateUser = async (req, res) => {
  try {
    const { username, email, password, role, editorType, status } = req.body;

    console.log(req.body);

    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;
    user.editorType = editorType || user.editorType;

    if (req.body.linkedResident) {
      user.linkedResident = req.body.linkedResident;
    }

    if (status) {
      user.status = status;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        editorType: user.editorType,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.status = status;

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        editorType: user.editorType,
        permissions: user.permissions,
        status: user.status,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// * Delete User
const deleteUser = async (req, res) => {
  try {
    // Step 1: Delete the user by ID
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Step 2: Delete any documents in other collections that reference this user's ID
    const deletedLinkedData = await AuditLog.deleteMany({
      user: req.params.id, // Match documents where linkedUser matches the user's ID
    });

    // Optionally handle the case where no linked data was deleted
    if (deletedLinkedData.deletedCount === 0) {
      console.log("No linked data found to delete.");
    }

    res.json({
      success: true,
      message: "User and linked data deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export {
  loginUser,
  registerUser,
  updateUser,
  deleteUser,
  getUser,
  getUserProfile,
  getUsers,
  updateUserStatus,
};
