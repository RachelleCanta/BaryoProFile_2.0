import { Resident } from "../models/residentModel.js";

const getResidentStatistics = async (req, res) => {
  try {
    const residents = await Resident.find();

    let totalPopulation = 0;
    let totalHouseholds = residents.length;
    let seniorCount = 0;
    let pwdCount = 0;
    let soloParentCount = 0;
    let ofwCount = 0;
    let immigrantCount = 0;
    let osyCount = 0;

    // Initialize age group counters
    const ageGroups = {
      "0-14": 0,
      "15-29": 0,
      "30-59": 0,
      "60+": 0,
    };

    residents.forEach((resident) => {
      totalPopulation += resident.totalMembers || 0;

      // Extract all ages from household members
      const householdAges = [
        resident.headAge,
        resident.spouseAge,
        ...(resident.familyMembers?.map((member) => member.age) || []),
      ];

      // Categorize ages into age groups
      householdAges.forEach((age) => {
        if (age !== undefined && !isNaN(age)) {
          if (age >= 0 && age <= 14) ageGroups["0-14"]++;
          else if (age >= 15 && age <= 29) ageGroups["15-29"]++;
          else if (age >= 30 && age <= 59) ageGroups["30-59"]++;
          else if (age >= 60) ageGroups["60+"]++;
        }
      });

      (resident.additionalInfos || []).forEach((info) => {
        if (info?.seniorCitizen?.toLowerCase() === "yes") seniorCount++;
        if (info?.pwd?.toLowerCase() === "yes") pwdCount++;
        if (info?.soloParent?.toLowerCase() === "yes") soloParentCount++;
        if (info?.ofwCountry) ofwCount++;
        if (info?.immigrantNationality) immigrantCount++;
        if (info?.outOfSchool?.toLowerCase() === "yes") osyCount++;
      });
    });

    // Function to calculate percentages (avoid division by zero)
    const calculatePercentage = (count) =>
      totalPopulation > 0
        ? ((count / totalPopulation) * 100).toFixed(2)
        : "0.00";

    res.status(200).json({
      success: true,
      data: {
        totalPopulation,
        totalHouseholds,
        seniorCount,
        seniorPercentage: calculatePercentage(seniorCount),
        pwdCount,
        pwdPercentage: calculatePercentage(pwdCount),
        soloParentCount,
        soloParentPercentage: calculatePercentage(soloParentCount),
        ofwCount,
        ofwPercentage: calculatePercentage(ofwCount),
        immigrantCount,
        immigrantPercentage: calculatePercentage(immigrantCount),
        osyCount,
        osyPercentage: calculatePercentage(osyCount),
        ageGroups: {
          "0-14": {
            count: ageGroups["0-14"],
            percentage: calculatePercentage(ageGroups["0-14"]),
          },
          "15-29": {
            count: ageGroups["15-29"],
            percentage: calculatePercentage(ageGroups["15-29"]),
          },
          "30-59": {
            count: ageGroups["30-59"],
            percentage: calculatePercentage(ageGroups["30-59"]),
          },
          "60+": {
            count: ageGroups["60+"],
            percentage: calculatePercentage(ageGroups["60+"]),
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching resident statistics:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const createResident = async (req, res) => {
  try {
    const newResident = new Resident(req.body);
    await newResident.save();
    res.status(201).json({
      success: true,
      message: "Resident created successfully",
      data: newResident,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getResidents = async (req, res) => {
  try {
    const residents = await Resident.find();
    res.status(200).json({ success: true, data: residents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res
        .status(404)
        .json({ success: false, error: "Resident not found" });
    }
    res.status(200).json({ success: true, data: resident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateResident = async (req, res) => {
  try {
    const updatedResident = await Resident.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedResident) {
      return res
        .status(404)
        .json({ success: false, error: "Resident not found" });
    }
    res.status(200).json({
      success: true,
      message: "Resident updated successfully",
      data: updatedResident,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteResident = async (req, res) => {
  try {
    const deletedResident = await Resident.findByIdAndDelete(req.params.id);
    if (!deletedResident) {
      return res
        .status(404)
        .json({ success: false, error: "Resident not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Resident deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export {
  getResident,
  getResidents,
  createResident,
  updateResident,
  deleteResident,
  getResidentStatistics,
};
