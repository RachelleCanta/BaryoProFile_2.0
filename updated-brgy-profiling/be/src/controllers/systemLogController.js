import { AuditLog } from "../models/systemLogModel.js";

const getSystemLog = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate(
      "user",
      "username email"
    );
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }
    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "username email")
      .sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createSystemLog = async (req, res) => {
  try {
    const { action, module, user, details } = req.body;

    const newLog = new AuditLog({
      action,
      module,
      user,
      details,
    });

    await newLog.save();
    res.status(201).json({ message: "Log created successfully", log: newLog });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateSystemLog = async (req, res) => {
  try {
    const updatedLog = await AuditLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedLog) {
      return res.status(404).json({ message: "Log not found" });
    }

    res
      .status(200)
      .json({ message: "Log updated successfully", log: updatedLog });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteSystemLog = async (req, res) => {
  try {
    if (req.params.id === "all") {
      await AuditLog.deleteMany({});
      return res.status(200).json({ message: "All logs deleted successfully" });
    }

    const deletedLog = await AuditLog.findByIdAndDelete(req.params.id);
    if (!deletedLog) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.status(200).json({ message: "Log deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  createSystemLog,
  deleteSystemLog,
  updateSystemLog,
  getSystemLog,
  getSystemLogs,
};
