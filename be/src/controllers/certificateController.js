import { Certificate } from "../models/certificateModel.js";

const getCertRecord = async (req, res) => {
  try {
    const certRecord = await Certificate.findById(req.params.id).populate(
      "printedBy",
      "_id username email"
    );
    if (!certRecord) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.status(200).json({ success: true, certRecord });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCertRecords = async (req, res) => {
  try {
    const { filterType, filterValue } = req.query;
    let startDate, endDate;
    const currentYear = new Date().getFullYear();

    switch (filterType) {
      case "Yearly":
        startDate = new Date(filterValue, 0, 1);
        endDate = new Date(filterValue, 11, 31, 23, 59, 59);
        break;
      case "Monthly":
        startDate = new Date(currentYear, filterValue - 1, 1);
        endDate = new Date(currentYear, filterValue, 0, 23, 59, 59);
        break;
      case "Quarterly":
        const quarter = parseInt(filterValue);
        const startMonth = (quarter - 1) * 3;
        startDate = new Date(currentYear, startMonth, 1);
        endDate = new Date(currentYear, startMonth + 3, 0, 23, 59, 59);
        break;
      default:
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59
        );
        break;
    }

    const certRecords = await Certificate.find({
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("printedBy", "_id username email")
      .sort({ timestamp: -1 });

    return res.status(200).json({ success: true, certRecords });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


// const getCertRecords = async (req, res) => {
//   try {
//     const certReports = await getCertificateReport({ year: 2025, month: 4 });

//     const certRecords = await Certificate.find()
//       .populate("printedBy", "_id username email")
//       .sort({ timestamp: -1 });
//     return res.status(200).json({ success: true, certRecords });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

// const createCertificateRecord = async (req, res) => {
//   try {
//     const newRecord = new Certificate(req.body);
//     await newRecord.save();
//     return res
//       .status(201)
//       .json({ message: "Record created successfully", record: newRecord });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

const createCertificateRecord = async (req, res) => {
  try {
    const certificateData = { ...req.body };
    console.log(certificateData);

    // Check if 'data' exists and has at least one element before trying to access 'name'
    if (certificateData.data && certificateData.data.name) {
      certificateData.data.requestedBy = certificateData.data.name;
      delete certificateData.data.name; // Remove 'name' if you don't want it saved
    }

    const newRecord = new Certificate(certificateData);
    await newRecord.save();

    return res
      .status(201)
      .json({ message: "Record created successfully", record: newRecord });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const updateCertificateRecord = async (req, res) => {
  try {
    const updatedRecord = await Certificate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }

    res
      .status(200)
      .json({ message: "Record updated successfully", record: updatedRecord });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteCertificateRecord = async (req, res) => {
  try {
    if (req.params.id === "all") {
      await Certificate.deleteMany({});
      return res
        .status(200)
        .json({ message: "All cert records deleted successfully" });
    }

    const deletedRecord = await Certificate.findByIdAndDelete(req.params.id);
    if (!deletedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// const getCertificateReport = async ({ year, quarter, month }) => {
//   const matchStage = {};

//   // Optional year filter
//   if (year) {
//     matchStage.timestamp = {
//       ...matchStage.timestamp,
//       $gte: new Date(`${year}-01-01T00:00:00.000Z`),
//       $lte: new Date(`${year}-12-31T23:59:59.999Z`),
//     };
//   }

//   // Optional quarter filter
//   if (quarter && year) {
//     const quarterStartMonth = (quarter - 1) * 3 + 1;
//     const start = new Date(
//       `${year}-${String(quarterStartMonth).padStart(2, "0")}-01T00:00:00.000Z`
//     );
//     const endMonth = quarterStartMonth + 2;
//     const end = new Date(
//       `${year}-${String(endMonth).padStart(2, "0")}-31T23:59:59.999Z`
//     );
//     matchStage.timestamp = {
//       $gte: start,
//       $lte: end,
//     };
//   }

//   // Optional month filter
//   if (month && year) {
//     const start = new Date(
//       `${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`
//     );
//     const end = new Date(
//       `${year}-${String(month).padStart(2, "0")}-31T23:59:59.999Z`
//     );
//     matchStage.timestamp = {
//       $gte: start,
//       $lte: end,
//     };
//   }

//   const aggregation = [
//     { $match: matchStage },
//     {
//       $group: {
//         _id: "$type",
//         count: { $sum: 1 },
//       },
//     },
//     {
//       $sort: {
//         count: -1,
//       },
//     },
//   ];

//   const result = await Certificate.aggregate(aggregation);
//   return result;
// };

const getCertificateReport = async ({ year, quarter, month }) => {
  const matchStage = {};
  let startDate, endDate;

  const currentYear = new Date().getFullYear();
  const resolvedYear = year || currentYear;

  if (month) {
    // If only month is provided, assume current year or use given year
    startDate = new Date(
      `${resolvedYear}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`
    );
    endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1)); // Start of next month
    endDate = new Date(endDate.getTime() - 1); // One ms before next month
  } else if (quarter) {
    // If only quarter is provided, assume current year or use given year
    const startMonth = (quarter - 1) * 3;
    startDate = new Date(Date.UTC(resolvedYear, startMonth, 1));
    endDate = new Date(Date.UTC(resolvedYear, startMonth + 3, 1));
    endDate = new Date(endDate.getTime() - 1); // One ms before next quarter
  } else if (year) {
    // If only year is provided
    startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    endDate = new Date(`${year}-12-31T23:59:59.999Z`);
  }

  if (startDate && endDate) {
    matchStage.timestamp = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const aggregation = [
    { $match: matchStage },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ];

  const result = await Certificate.aggregate(aggregation);
  return result;
};

export {
  createCertificateRecord,
  deleteCertificateRecord,
  updateCertificateRecord,
  getCertRecord,
  getCertRecords,
  getCertificateReport,
};
