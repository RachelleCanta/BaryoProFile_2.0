import { Resident } from "../models/residentModel.js";
import { User } from "../models/userModel.js";
import { AuditLog } from "../models/systemLogModel.js";
import { getCertificateReport } from "../controllers/certificateController.js";

const getResidentStatistics = async (req, res) => {
  try {
    const { filterType, filterValue } = req.query;
    let certReports = [];
    console.log(filterType, filterValue);

    let startDate, endDate;
    const currentYear = new Date().getFullYear();

    switch (filterType) {
      case "Yearly":
        startDate = new Date(filterValue, 0, 1);
        endDate = new Date(filterValue, 11, 31, 23, 59, 59);
        certReports = await getCertificateReport({
          year: filterValue,
        });
        break;
      case "Monthly":
        startDate = new Date(currentYear, filterValue - 1, 1);
        endDate = new Date(currentYear, filterValue, 0, 23, 59, 59); // last day of the month
        certReports = await getCertificateReport({
          month: filterValue,
        });
        break;
      case "Quarterly":
        const quarter = parseInt(filterValue);
        const startMonth = (quarter - 1) * 3;
        startDate = new Date(currentYear, startMonth, 1);
        endDate = new Date(currentYear, startMonth + 3, 0, 23, 59, 59);
        certReports = await getCertificateReport({
          quarter: filterValue,
        });
        break;
      default:
        // fallback: current month
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
        certReports = await getCertificateReport({
          month: filterValue || new Date().getMonth() + 1,
        });
    }

    const residents = await Resident.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    let totalPopulation = 0;
    let totalHouseholds = residents.length;
    let seniorCount = 0;
    let pwdCount = 0;
    let soloParentCount = 0;
    let ofwCount = 0;
    let immigrantCount = 0;
    let osyCount = 0;
    let maleCount = 0;
    let femaleCount = 0;
    let lgbtqPlusCount = 0;
    let pregnantCount = 0;

    // Initialize age group counters
    const ageGroups = {
      "0-6M": 0,
      "7M-2": 0,
      "3-5": 0,
      "6-12": 0,
      "13-17": 0,
      "18-59": 0,
      "60+": 0,
    };

    // residents.forEach((resident) => {
    //   totalPopulation += resident.totalMembers || 0;

    //   if (resident.headAge >= 60) seniorCount++;
    //   if (resident.spouseAge >= 60) seniorCount++;

    //   [resident.headSex, resident.spouseSex].forEach((sex) => {
    //     if (sex === "Male") maleCount++;
    //     if (sex === "Female") femaleCount++;
    //     if (sex === "LGBTQ+") lgbtqPlusCount++;
    //   });

    //   // Extract all ages from household members
    //   const householdAges = [
    //     resident.headAge,
    //     resident.spouseAge,
    //     ...(resident.familyMembers?.map((member) => member.age) || []),
    //   ];

    //   // Categorize ages into age groups
    //   householdAges.forEach((age) => {
    //     if (age !== undefined && !isNaN(age)) {
    //       // if (age >= 0 && age <= 14) ageGroups["0-14"]++;
    //       if (age >= 0 && age <= 2) ageGroups["7M-2"]++;
    //       else if (age >= 3 && age <= 5) ageGroups["3-5"]++;
    //       else if (age >= 6 && age <= 12) ageGroups["6-12"]++;
    //       else if (age >= 13 && age <= 17) ageGroups["13-17"]++;
    //       else if (age >= 18 && age <= 59) ageGroups["18-59"]++;
    //       else if (age >= 60) ageGroups["60+"]++;
    //     }
    //   });

    //   (resident.familyMembers || []).forEach((member) => {
    //     if (member.age >= 60) seniorCount++;
    //     if (["Male"].includes(member.sex)) maleCount++;
    //     if (["Female"].includes(member.sex)) femaleCount++;
    //     if (["LGBTQ+"].includes(member.sex)) lgbtqPlusCount++;
    //   });

    //   (resident.additionalInfos || []).forEach((info) => {
    //     // if (
    //     //   info?.seniorCitizen !== "" &&
    //     //   info?.seniorCitizen?.toLowerCase() !== "n/a"
    //     // )
    //     //   seniorCount++;
    //     if (
    //       info?.pregnant.toLowerCase() === "yes" &&
    //       info?.immigrantNationality.toLowerCase() !== "no" &&
    //       info?.immigrantNationality.toLowerCase() !== "n/a"
    //     )
    //       pregnantCount++;
    //     if (info?.pwd?.toLowerCase() !== "n/a") pwdCount++;
    //     if (info?.soloParent?.toLowerCase() === "yes") soloParentCount++;
    //     if (info?.ofwCountry.toLowerCase() !== "n/a" && info?.ofwCountry !== "")
    //       ofwCount++;
    //     if (
    //       info?.immigrantNationality.toLowerCase() !== "n/a" &&
    //       info?.immigrantNationality !== "" &&
    //       info?.immigrantNationality.toLowerCase() !== "not an immigrant"
    //     )
    //       immigrantCount++;
    //     if (info?.outOfSchool?.toLowerCase() === "yes") osyCount++;
    //   });
    // });

    // Function to calculate percentages (avoid division by zero)
    const calculatePercentage = (count) =>
      totalPopulation > 0
        ? ((count / totalPopulation) * 100).toFixed(2)
        : "0.00";

    residents.forEach((resident) => {
      totalPopulation += resident.totalMembers || 0;

      // Helper function to calculate age in months from birthday
      const calculateAgeInMonths = (birthday) => {
        if (!birthday) return null;
        const today = new Date();
        const birthDate = new Date(birthday);
        const years = today.getFullYear() - birthDate.getFullYear();
        const months = today.getMonth() - birthDate.getMonth();
        return years * 12 + months;
      };

      // Helper function to get age (in years or months as needed)
      const getAge = (age, birthday) => {
        if (age !== undefined && !isNaN(age)) return age; // Use provided age if valid
        if (birthday) {
          const months = calculateAgeInMonths(birthday);
          return months !== null ? months / 12 : null; // Convert to years
        }
        return null;
      };

      if (resident.headAge >= 60) seniorCount++;
      if (resident.spouseAge >= 60) seniorCount++;

      [resident.headSex, resident.spouseSex].forEach((sex) => {
        if (sex === "Male") maleCount++;
        if (sex === "Female") femaleCount++;
        if (sex === "LGBTQ+") lgbtqPlusCount++;
      });

      // Extract all ages and birthdays
      const householdAges = [
        { age: resident.headAge, birthday: resident.headBirthday },
        { age: resident.spouseAge, birthday: resident.spouseBirthday },
        ...(resident.familyMembers?.map((member) => ({
          age: member.age,
          birthday: member.birthday,
        })) || []),
      ];

      // Categorize ages into age groups
      householdAges.forEach(({ age, birthday }) => {
        let effectiveAge = getAge(age, birthday); // Age in years
        let months = birthday ? calculateAgeInMonths(birthday) : null;

        if (effectiveAge !== null && !isNaN(effectiveAge)) {
          if (months !== null && months <= 6)
            ageGroups["0-6M"]++; // 0 to 6 months
          else if (months !== null && months <= 24)
            ageGroups["7M-2"]++; // 7 months to 2 years
          else if (effectiveAge >= 3 && effectiveAge <= 5) ageGroups["3-5"]++;
          else if (effectiveAge >= 6 && effectiveAge <= 12) ageGroups["6-12"]++;
          else if (effectiveAge >= 13 && effectiveAge <= 17)
            ageGroups["13-17"]++;
          else if (effectiveAge >= 18 && effectiveAge <= 59)
            ageGroups["18-59"]++;
          else if (effectiveAge >= 60) ageGroups["60+"]++;
        }
      });

      (resident.familyMembers || []).forEach((member) => {
        if (member.age >= 60) seniorCount++;
        if (member.sex === "Male") maleCount++;
        if (member.sex === "Female") femaleCount++;
        if (member.sex === "LGBTQ+") lgbtqPlusCount++;
      });

      (resident.additionalInfos || []).forEach((info) => {
        if (
          info?.pregnant.toLowerCase() === "yes" &&
          info?.immigrantNationality.toLowerCase() !== "no" &&
          info?.immigrantNationality.toLowerCase() !== "n/a"
        )
          pregnantCount++;
        if (info?.pwd?.toLowerCase() !== "n/a") pwdCount++;
        if (info?.soloParent?.toLowerCase() === "yes") soloParentCount++;
        if (info?.ofwCountry.toLowerCase() !== "n/a" && info?.ofwCountry !== "")
          ofwCount++;
        if (
          info?.immigrantNationality.toLowerCase() !== "n/a" &&
          info?.immigrantNationality !== "" &&
          info?.immigrantNationality.toLowerCase() !== "not an immigrant"
        )
          immigrantCount++;
        if (info?.outOfSchool?.toLowerCase() === "yes") osyCount++;
      });
    });

    // ... (calculatePercentage function remains the same)

    res.status(200).json({
      success: true,
      data: {
        totalPopulation,
        totalHouseholds,
        pregnantCount,
        pregnantPercentage: calculatePercentage(pregnantCount),
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
        maleCount,
        femaleCount,
        lgbtqPlusCount,
        malePercentage: calculatePercentage(maleCount),
        femalePercentage: calculatePercentage(femaleCount),
        lgbtqPlusPercentage: calculatePercentage(lgbtqPlusCount),
        ageGroups: {
          "0-6M": {
            count: ageGroups["0-6M"],
            percentage: calculatePercentage(ageGroups["0-6M"]),
          },
          "7M-2": {
            count: ageGroups["7M-2"],
            percentage: calculatePercentage(ageGroups["7M-2"]),
          },
          "3-5": {
            count: ageGroups["3-5"],
            percentage: calculatePercentage(ageGroups["3-5"]),
          },
          "6-12": {
            count: ageGroups["6-12"],
            percentage: calculatePercentage(ageGroups["6-12"]),
          },
          "13-17": {
            count: ageGroups["13-17"],
            percentage: calculatePercentage(ageGroups["13-17"]),
          },
          "18-59": {
            count: ageGroups["18-59"],
            percentage: calculatePercentage(ageGroups["18-59"]),
          },
          "60+": {
            count: ageGroups["60+"],
            percentage: calculatePercentage(ageGroups["60+"]),
          },
        },
        certReports,
      },
    });
  } catch (error) {
    console.error("Error fetching resident statistics:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getResidentReportsByAgeAndGender = async (req, res) => {
  try {
    const today = new Date();

    const ageBrackets = {
      zeroToSixMonths: {
        totalCount: 0,
        male: {
          pwd: 0,
          nonPwd: 0,
        },
        female: {
          pwd: 0,
          nonPwd: 0,
        },
        lgbtqPlus: 0,
      },
      sevenMonthsToTwoYears: {
        totalCount: 0,
        male: {
          pwd: 0,
          nonPwd: 0,
        },
        female: {
          pwd: 0,
          nonPwd: 0,
        },
        lgbtqPlus: 0,
      },
      threeToFiveYears: {
        totalCount: 0,
        male: {
          pwd: 0,
          nonPwd: 0,
        },
        female: {
          pwd: 0,
          nonPwd: 0,
        },
        lgbtqPlus: 0,
      },
      sixToTwelveYears: {
        totalCount: 0,
        male: {
          pwd: 0,
          nonPwd: 0,
        },
        female: {
          pwd: 0,
          nonPwd: 0,
        },
        lgbtqPlus: 0,
      },
      thirteenToSeventeenYears: {
        totalCount: 0,
        male: {
          pwd: 0,
          nonPwd: 0,
        },
        female: {
          pwd: 0,
          nonPwd: 0,
        },
        lgbtqPlus: 0,
      },
      eighteenToFiftyNineYears: {
        totalCount: 0,
        male: {
          pwd: 0,
          nonPwd: 0,
        },
        female: {
          pwd: 0,
          nonPwd: 0,
        },
        lgbtqPlus: 0,
      },
      sixtyAbove: {
        totalCount: 0,
        male: {
          pwd: 0,
          nonPwd: 0,
        },
        female: {
          pwd: 0,
          nonPwd: 0,
        },
        lgbtqPlus: 0,
      },
    };

    const overallPopulation = {
      barangay: 0,
      household: 0,
      male: 0,
      female: 0,
      lgbtqPlus: 0,
    };

    const ALL_RESIDENTS = await Resident.find({});

    ALL_RESIDENTS.forEach((resident) => {
      overallPopulation.barangay += 2;
      overallPopulation.household++;

      if (resident.headSex === "Male") {
        overallPopulation.male++;
      } else if (resident.headSex === "Female") {
        overallPopulation.zeroToSixMonths.female++;
      } else {
        ageBrackets.zeroToSixMonths.lgbtqPlus++;
      }

      if (resident.spouseSex === "Male") {
        overallPopulation.male++;
      } else if (resident.spouseSex === "Female") {
        overallPopulation.female++;
      } else {
        overallPopulation.lgbtqPlus++;
      }

      resident.familyMembers.forEach((member) => {
        overallPopulation.barangay++;
        if (member.sex === "Male") {
          overallPopulation.male++;
        } else if (member.sex === "Female") {
          overallPopulation.female++;
        } else {
          overallPopulation.lgbtqPlus++;
        }
      });
    });

    // * 0-6 Months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    const zeroToSixMonthsResidents = await Resident.find({
      $or: [
        {
          headBirthday: { $gte: sixMonthsAgo, $lte: today },
        },
        {
          spouseBirthday: { $gte: sixMonthsAgo, $lte: today },
        },
        {
          familyMembers: {
            $elemMatch: {
              birthday: { $gte: sixMonthsAgo, $lte: today },
            },
          },
        },
      ],
    });

    zeroToSixMonthsResidents.forEach((resident) => {
      // * check head
      ageBrackets.zeroToSixMonths.totalCount++;
      const headFullname = `${resident.headFirstName} ${resident.headMiddleName} ${resident.headLastName}`;
      if (resident.headSex === "Male") {
        ageBrackets.zeroToSixMonths.male.nonPwd++;
      } else if (resident.headSex === "Female") {
        ageBrackets.zeroToSixMonths.female.nonPwd++;
      } else {
        ageBrackets.zeroToSixMonths.lgbtqPlus++;
      }

      // * check spouse
      ageBrackets.zeroToSixMonths.totalCount++;
      const spouseFullname = `${resident.spouseFirstName} ${resident.spouseMiddleName} ${resident.spouseLastName}`;
      if (resident.spouseSex === "Male") {
        ageBrackets.zeroToSixMonths.male.nonPwd++;
      } else if (resident.spouseSex === "Female") {
        ageBrackets.zeroToSixMonths.female.nonPwd++;
      } else {
        ageBrackets.zeroToSixMonths.lgbtqPlus++;
      }

      // * check fam members
      resident.familyMembers.forEach((member) => {
        ageBrackets.zeroToSixMonths.totalCount++;
        if (member.sex === "Male") {
          ageBrackets.zeroToSixMonths.male.nonPwd++;
        } else if (member.sex === "Female") {
          ageBrackets.zeroToSixMonths.female.nonPwd++;
        } else {
          ageBrackets.zeroToSixMonths.lgbtqPlus++;
        }
      });

      resident.additionalInfos.forEach((info) => {
        // * check head if pwd then subtract prev then add new
        if (info.pwd.toLowerCase() !== "n/a" && info.name === headFullname) {
          if (resident.headSex === "Male") {
            ageBrackets.zeroToSixMonths.male.nonPwd--;
            ageBrackets.zeroToSixMonths.male.pwd++;
          } else if (resident.headSex === "Female") {
            ageBrackets.zeroToSixMonths.female.nonPwd--;
            ageBrackets.zeroToSixMonths.female.pwd++;
          }
        }

        // * check spouse if pwd then subtract prev then add new
        if (info.pwd.toLowerCase() !== "n/a" && info.name === spouseFullname) {
          if (resident.spouseSex === "Male") {
            ageBrackets.zeroToSixMonths.male.nonPwd--;
            ageBrackets.zeroToSixMonths.male.pwd++;
          } else if (resident.spouseSex === "Female") {
            ageBrackets.zeroToSixMonths.female.nonPwd--;
            ageBrackets.zeroToSixMonths.female.pwd++;
          }
        }

        // * check fam members
        resident.familyMembers.forEach((member) => {
          const memberFullname = `${member.firstName} ${member.middleName} ${member.lastName}`;
          if (
            info.pwd.toLowerCase() !== "n/a" &&
            info.name === memberFullname
          ) {
            if (member.sex === "Male") {
              ageBrackets.zeroToSixMonths.male.nonPwd--;
              ageBrackets.zeroToSixMonths.male.pwd++;
            } else if (member.sex === "Female") {
              ageBrackets.zeroToSixMonths.female.nonPwd--;
              ageBrackets.zeroToSixMonths.female.pwd++;
            }
          }
        });
      });
    });

    // * 7M-2Years
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(today.getFullYear() - 2);

    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(today.getMonth() - 7);

    const sevenMonthsToTwoYearsResidents = await Resident.find({
      $or: [
        {
          headBirthday: { $gte: twoYearsAgo, $lte: sevenMonthsAgo },
        },
        {
          spouseBirthday: { $gte: twoYearsAgo, $lte: sevenMonthsAgo },
        },
        {
          familyMembers: {
            $elemMatch: {
              birthday: { $gte: twoYearsAgo, $lte: sevenMonthsAgo },
            },
          },
        },
      ],
    });

    sevenMonthsToTwoYearsResidents.forEach((resident) => {
      const headFullname = `${resident.headFirstName} ${resident.headMiddleName} ${resident.headLastName}`;
      const spouseFullname = `${resident.spouseFirstName} ${resident.spouseMiddleName} ${resident.spouseLastName}`;

      ageBrackets.sevenMonthsToTwoYears.totalCount++;

      // Head
      if (
        resident.headBirthday >= twoYearsAgo &&
        resident.headBirthday <= sevenMonthsAgo
      ) {
        if (resident.headSex === "Male") {
          ageBrackets.sevenMonthsToTwoYears.male.nonPwd++;
        } else if (resident.headSex === "Female") {
          ageBrackets.sevenMonthsToTwoYears.female.nonPwd++;
        } else {
          ageBrackets.sevenMonthsToTwoYears.lgbtqPlus++;
        }
      }

      // Spouse
      if (
        resident.spouseBirthday >= twoYearsAgo &&
        resident.spouseBirthday <= sevenMonthsAgo
      ) {
        if (resident.spouseSex === "Male") {
          ageBrackets.sevenMonthsToTwoYears.male.nonPwd++;
        } else if (resident.spouseSex === "Female") {
          ageBrackets.sevenMonthsToTwoYears.female.nonPwd++;
        } else {
          ageBrackets.sevenMonthsToTwoYears.lgbtqPlus++;
        }
      }

      // Family Members
      resident.familyMembers.forEach((member) => {
        if (
          member.birthday >= twoYearsAgo &&
          member.birthday <= sevenMonthsAgo
        ) {
          if (member.sex === "Male") {
            ageBrackets.sevenMonthsToTwoYears.male.nonPwd++;
          } else if (member.sex === "Female") {
            ageBrackets.sevenMonthsToTwoYears.female.nonPwd++;
          } else {
            ageBrackets.sevenMonthsToTwoYears.lgbtqPlus++;
          }
        }
      });

      // Handle PWDs
      resident.additionalInfos.forEach((info) => {
        if (
          info.pwd.toLowerCase() !== "n/a" &&
          info.name === headFullname &&
          resident.headBirthday >= twoYearsAgo &&
          resident.headBirthday <= sevenMonthsAgo
        ) {
          if (resident.headSex === "Male") {
            ageBrackets.sevenMonthsToTwoYears.male.nonPwd--;
            ageBrackets.sevenMonthsToTwoYears.male.pwd++;
          } else if (resident.headSex === "Female") {
            ageBrackets.sevenMonthsToTwoYears.female.nonPwd--;
            ageBrackets.sevenMonthsToTwoYears.female.pwd++;
          }
        }

        if (
          info.pwd.toLowerCase() !== "n/a" &&
          info.name === spouseFullname &&
          resident.spouseBirthday >= twoYearsAgo &&
          resident.spouseBirthday <= sevenMonthsAgo
        ) {
          if (resident.spouseSex === "Male") {
            ageBrackets.sevenMonthsToTwoYears.male.nonPwd--;
            ageBrackets.sevenMonthsToTwoYears.male.pwd++;
          } else if (resident.spouseSex === "Female") {
            ageBrackets.sevenMonthsToTwoYears.female.nonPwd--;
            ageBrackets.sevenMonthsToTwoYears.female.pwd++;
          }
        }

        resident.familyMembers.forEach((member) => {
          const memberFullname = `${member.firstName} ${member.middleName} ${member.lastName}`;
          if (
            info.pwd.toLowerCase() !== "n/a" &&
            info.name === memberFullname &&
            member.birthday >= twoYearsAgo &&
            member.birthday <= sevenMonthsAgo
          ) {
            if (member.sex === "Male") {
              ageBrackets.sevenMonthsToTwoYears.male.nonPwd--;
              ageBrackets.sevenMonthsToTwoYears.male.pwd++;
            } else if (member.sex === "Female") {
              ageBrackets.sevenMonthsToTwoYears.female.nonPwd--;
              ageBrackets.sevenMonthsToTwoYears.female.pwd++;
            }
          }
        });
      });
    });

    // * 3-5
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);

    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(today.getFullYear() - 3);

    const threeToFiveYearsResidents = await Resident.find({
      $or: [
        {
          headBirthday: { $gte: fiveYearsAgo, $lte: threeYearsAgo },
        },
        {
          spouseBirthday: { $gte: fiveYearsAgo, $lte: threeYearsAgo },
        },
        {
          familyMembers: {
            $elemMatch: {
              birthday: { $gte: fiveYearsAgo, $lte: threeYearsAgo },
            },
          },
        },
      ],
    });

    threeToFiveYearsResidents.forEach((resident) => {
      const headFullname = `${resident.headFirstName} ${resident.headMiddleName} ${resident.headLastName}`;
      const spouseFullname = `${resident.spouseFirstName} ${resident.spouseMiddleName} ${resident.spouseLastName}`;

      ageBrackets.threeToFiveYears.totalCount++;

      // Head
      if (
        resident.headBirthday >= fiveYearsAgo &&
        resident.headBirthday <= threeYearsAgo
      ) {
        if (resident.headSex === "Male") {
          ageBrackets.threeToFiveYears.male.nonPwd++;
        } else if (resident.headSex === "Female") {
          ageBrackets.threeToFiveYears.female.nonPwd++;
        } else {
          ageBrackets.threeToFiveYears.lgbtqPlus++;
        }
      }

      // Spouse
      if (
        resident.spouseBirthday >= fiveYearsAgo &&
        resident.spouseBirthday <= threeYearsAgo
      ) {
        if (resident.spouseSex === "Male") {
          ageBrackets.threeToFiveYears.male.nonPwd++;
        } else if (resident.spouseSex === "Female") {
          ageBrackets.threeToFiveYears.female.nonPwd++;
        } else {
          ageBrackets.threeToFiveYears.lgbtqPlus++;
        }
      }

      // Family Members
      resident.familyMembers.forEach((member) => {
        if (
          member.birthday >= fiveYearsAgo &&
          member.birthday <= threeYearsAgo
        ) {
          if (member.sex === "Male") {
            ageBrackets.threeToFiveYears.male.nonPwd++;
          } else if (member.sex === "Female") {
            ageBrackets.threeToFiveYears.female.nonPwd++;
          } else {
            ageBrackets.threeToFiveYears.lgbtqPlus++;
          }
        }
      });

      // Handle PWDs
      resident.additionalInfos.forEach((info) => {
        if (
          info.pwd.toLowerCase() !== "n/a" &&
          info.name === headFullname &&
          resident.headBirthday >= fiveYearsAgo &&
          resident.headBirthday <= threeYearsAgo
        ) {
          if (resident.headSex === "Male") {
            ageBrackets.threeToFiveYears.male.nonPwd--;
            ageBrackets.threeToFiveYears.male.pwd++;
          } else if (resident.headSex === "Female") {
            ageBrackets.threeToFiveYears.female.nonPwd--;
            ageBrackets.threeToFiveYears.female.pwd++;
          }
        }

        if (
          info.pwd.toLowerCase() !== "n/a" &&
          info.name === spouseFullname &&
          resident.spouseBirthday >= fiveYearsAgo &&
          resident.spouseBirthday <= threeYearsAgo
        ) {
          if (resident.spouseSex === "Male") {
            ageBrackets.threeToFiveYears.male.nonPwd--;
            ageBrackets.threeToFiveYears.male.pwd++;
          } else if (resident.spouseSex === "Female") {
            ageBrackets.threeToFiveYears.female.nonPwd--;
            ageBrackets.threeToFiveYears.female.pwd++;
          }
        }

        resident.familyMembers.forEach((member) => {
          const memberFullname = `${member.firstName} ${member.middleName} ${member.lastName}`;
          if (
            info.pwd.toLowerCase() !== "n/a" &&
            info.name === memberFullname &&
            member.birthday >= fiveYearsAgo &&
            member.birthday <= threeYearsAgo
          ) {
            if (member.sex === "Male") {
              ageBrackets.threeToFiveYears.male.nonPwd--;
              ageBrackets.threeToFiveYears.male.pwd++;
            } else if (member.sex === "Female") {
              ageBrackets.threeToFiveYears.female.nonPwd--;
              ageBrackets.threeToFiveYears.female.pwd++;
            }
          }
        });
      });
    });

    // * 6-12
    const twelveYearsAgo = new Date();
    twelveYearsAgo.setFullYear(today.getFullYear() - 12);
    const sixYearsAgo = new Date();
    sixYearsAgo.setFullYear(today.getFullYear() - 6);

    const sixToTwelveYearsResidents = await Resident.find({
      $or: [
        {
          headBirthday: { $gte: twelveYearsAgo, $lte: sixYearsAgo },
        },
        {
          spouseBirthday: { $gte: twelveYearsAgo, $lte: sixYearsAgo },
        },
        {
          familyMembers: {
            $elemMatch: {
              birthday: { $gte: twelveYearsAgo, $lte: sixYearsAgo },
            },
          },
        },
      ],
    });

    sixToTwelveYearsResidents.forEach((resident) => {
      const headFullname = `${resident.headFirstName} ${resident.headMiddleName} ${resident.headLastName}`;
      const spouseFullname = `${resident.spouseFirstName} ${resident.spouseMiddleName} ${resident.spouseLastName}`;

      // Head
      if (
        resident.headBirthday >= twelveYearsAgo &&
        resident.headBirthday <= sixYearsAgo
      ) {
        ageBrackets.sixToTwelveYears.totalCount++;
        if (resident.headSex === "Male") {
          ageBrackets.sixToTwelveYears.male.nonPwd++;
        } else if (resident.headSex === "Female") {
          ageBrackets.sixToTwelveYears.female.nonPwd++;
        } else {
          ageBrackets.sixToTwelveYears.lgbtqPlus++;
        }
      }

      // Spouse
      if (
        resident.spouseBirthday >= twelveYearsAgo &&
        resident.spouseBirthday <= sixYearsAgo
      ) {
        ageBrackets.sixToTwelveYears.totalCount++;
        if (resident.spouseSex === "Male") {
          ageBrackets.sixToTwelveYears.male.nonPwd++;
        } else if (resident.spouseSex === "Female") {
          ageBrackets.sixToTwelveYears.female.nonPwd++;
        } else {
          ageBrackets.sixToTwelveYears.lgbtqPlus++;
        }
      }

      // Family Members
      resident.familyMembers.forEach((member) => {
        if (
          member.birthday >= twelveYearsAgo &&
          member.birthday <= sixYearsAgo
        ) {
          ageBrackets.sixToTwelveYears.totalCount++;
          if (member.sex === "Male") {
            ageBrackets.sixToTwelveYears.male.nonPwd++;
          } else if (member.sex === "Female") {
            ageBrackets.sixToTwelveYears.female.nonPwd++;
          } else {
            ageBrackets.sixToTwelveYears.lgbtqPlus++;
          }
        }
      });

      // Handle PWDs
      resident.additionalInfos.forEach((info) => {
        if (
          info.pwd.toLowerCase() !== "n/a" &&
          info.name === headFullname &&
          resident.headBirthday >= twelveYearsAgo &&
          resident.headBirthday <= sixYearsAgo
        ) {
          if (resident.headSex === "Male") {
            ageBrackets.sixToTwelveYears.male.nonPwd--;
            ageBrackets.sixToTwelveYears.male.pwd++;
          } else if (resident.headSex === "Female") {
            ageBrackets.sixToTwelveYears.female.nonPwd--;
            ageBrackets.sixToTwelveYears.female.pwd++;
          }
        }

        if (
          info.pwd.toLowerCase() !== "n/a" &&
          info.name === spouseFullname &&
          resident.spouseBirthday >= twelveYearsAgo &&
          resident.spouseBirthday <= sixYearsAgo
        ) {
          if (resident.spouseSex === "Male") {
            ageBrackets.sixToTwelveYears.male.nonPwd--;
            ageBrackets.sixToTwelveYears.male.pwd++;
          } else if (resident.spouseSex === "Female") {
            ageBrackets.sixToTwelveYears.female.nonPwd--;
            ageBrackets.sixToTwelveYears.female.pwd++;
          }
        }

        resident.familyMembers.forEach((member) => {
          const memberFullname = `${member.firstName} ${member.middleName} ${member.lastName}`;
          if (
            info.pwd.toLowerCase() !== "n/a" &&
            info.name === memberFullname &&
            member.birthday >= twelveYearsAgo &&
            member.birthday <= sixYearsAgo
          ) {
            if (member.sex === "Male") {
              ageBrackets.sixToTwelveYears.male.nonPwd--;
              ageBrackets.sixToTwelveYears.male.pwd++;
            } else if (member.sex === "Female") {
              ageBrackets.sixToTwelveYears.female.nonPwd--;
              ageBrackets.sixToTwelveYears.female.pwd++;
            }
          }
        });
      });
    });

    // * 13-17
    const seventeenYearsAgo = new Date();
    seventeenYearsAgo.setFullYear(today.getFullYear() - 17);
    const thirteenYearsAgo = new Date();
    thirteenYearsAgo.setFullYear(today.getFullYear() - 13);

    const thirteenToSeventeenYearsResidents = await Resident.find({
      $or: [
        {
          headBirthday: { $gte: seventeenYearsAgo, $lte: thirteenYearsAgo },
        },
        {
          spouseBirthday: { $gte: seventeenYearsAgo, $lte: thirteenYearsAgo },
        },
        {
          familyMembers: {
            $elemMatch: {
              birthday: { $gte: seventeenYearsAgo, $lte: thirteenYearsAgo },
            },
          },
        },
      ],
    });

    thirteenToSeventeenYearsResidents.forEach((resident) => {
      const headFullname = `${resident.headFirstName} ${resident.headMiddleName} ${resident.headLastName}`;
      const spouseFullname = `${resident.spouseFirstName} ${resident.spouseMiddleName} ${resident.spouseLastName}`;

      // Head
      if (
        resident.headBirthday >= seventeenYearsAgo &&
        resident.headBirthday <= thirteenYearsAgo
      ) {
        ageBrackets.thirteenToSeventeenYears.totalCount++;
        if (resident.headSex === "Male") {
          ageBrackets.thirteenToSeventeenYears.male.nonPwd++;
        } else if (resident.headSex === "Female") {
          ageBrackets.thirteenToSeventeenYears.female.nonPwd++;
        } else {
          ageBrackets.thirteenToSeventeenYears.lgbtqPlus++;
        }
      }

      // Spouse
      if (
        resident.spouseBirthday >= seventeenYearsAgo &&
        resident.spouseBirthday <= thirteenYearsAgo
      ) {
        ageBrackets.thirteenToSeventeenYears.totalCount++;
        if (resident.spouseSex === "Male") {
          ageBrackets.thirteenToSeventeenYears.male.nonPwd++;
        } else if (resident.spouseSex === "Female") {
          ageBrackets.thirteenToSeventeenYears.female.nonPwd++;
        } else {
          ageBrackets.thirteenToSeventeenYears.lgbtqPlus++;
        }
      }

      // Family Members
      resident.familyMembers.forEach((member) => {
        if (
          member.birthday >= seventeenYearsAgo &&
          member.birthday <= thirteenYearsAgo
        ) {
          ageBrackets.thirteenToSeventeenYears.totalCount++;
          if (member.sex === "Male") {
            ageBrackets.thirteenToSeventeenYears.male.nonPwd++;
          } else if (member.sex === "Female") {
            ageBrackets.thirteenToSeventeenYears.female.nonPwd++;
          } else {
            ageBrackets.thirteenToSeventeenYears.lgbtqPlus++;
          }
        }
      });

      // Handle PWDs
      resident.additionalInfos.forEach((info) => {
        if (
          info.pwd.toLowerCase() !== "n/a" &&
          info.name === headFullname &&
          resident.headBirthday >= seventeenYearsAgo &&
          resident.headBirthday <= thirteenYearsAgo
        ) {
          if (resident.headSex === "Male") {
            ageBrackets.thirteenToSeventeenYears.male.nonPwd--;
            ageBrackets.thirteenToSeventeenYears.male.pwd++;
          } else if (resident.headSex === "Female") {
            ageBrackets.thirteenToSeventeenYears.female.nonPwd--;
            ageBrackets.thirteenToSeventeenYears.female.pwd++;
          }
        }

        if (
          info.pwd.toLowerCase() !== "n/a" &&
          info.name === spouseFullname &&
          resident.spouseBirthday >= seventeenYearsAgo &&
          resident.spouseBirthday <= thirteenYearsAgo
        ) {
          if (resident.spouseSex === "Male") {
            ageBrackets.thirteenToSeventeenYears.male.nonPwd--;
            ageBrackets.thirteenToSeventeenYears.male.pwd++;
          } else if (resident.spouseSex === "Female") {
            ageBrackets.thirteenToSeventeenYears.female.nonPwd--;
            ageBrackets.thirteenToSeventeenYears.female.pwd++;
          }
        }

        resident.familyMembers.forEach((member) => {
          const memberFullname = `${member.firstName} ${member.middleName} ${member.lastName}`;
          if (
            info.pwd.toLowerCase() !== "n/a" &&
            info.name === memberFullname &&
            member.birthday >= seventeenYearsAgo &&
            member.birthday <= thirteenYearsAgo
          ) {
            if (member.sex === "Male") {
              ageBrackets.thirteenToSeventeenYears.male.nonPwd--;
              ageBrackets.thirteenToSeventeenYears.male.pwd++;
            } else if (member.sex === "Female") {
              ageBrackets.thirteenToSeventeenYears.female.nonPwd--;
              ageBrackets.thirteenToSeventeenYears.female.pwd++;
            }
          }
        });
      });
    });

    // * 18-59
    const fiftyNineYearsAgo = new Date();
    fiftyNineYearsAgo.setFullYear(today.getFullYear() - 59);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(today.getFullYear() - 18);

    const eighteenToFiftyNineYearsResidents = await Resident.find({
      $or: [
        {
          headBirthday: { $gte: fiftyNineYearsAgo, $lte: eighteenYearsAgo },
        },
        {
          spouseBirthday: { $gte: fiftyNineYearsAgo, $lte: eighteenYearsAgo },
        },
        {
          familyMembers: {
            $elemMatch: {
              birthday: { $gte: fiftyNineYearsAgo, $lte: eighteenYearsAgo },
            },
          },
        },
      ],
    });

    eighteenToFiftyNineYearsResidents.forEach((resident) => {
      const headFullname = `${resident.headFirstName} ${resident.headMiddleName} ${resident.headLastName}`;
      const spouseFullname = `${resident.spouseFirstName} ${resident.spouseMiddleName} ${resident.spouseLastName}`;

      // Head
      if (
        resident.headBirthday >= fiftyNineYearsAgo &&
        resident.headBirthday <= eighteenYearsAgo
      ) {
        ageBrackets.eighteenToFiftyNineYears.totalCount++;
        if (resident.headSex === "Male") {
          ageBrackets.eighteenToFiftyNineYears.male.nonPwd++;
        } else if (resident.headSex === "Female") {
          ageBrackets.eighteenToFiftyNineYears.female.nonPwd++;
        } else {
          ageBrackets.eighteenToFiftyNineYears.lgbtqPlus++;
        }
      }

      // Spouse
      if (
        resident.spouseBirthday >= fiftyNineYearsAgo &&
        resident.spouseBirthday <= eighteenYearsAgo
      ) {
        ageBrackets.eighteenToFiftyNineYears.totalCount++;
        if (resident.spouseSex === "Male") {
          ageBrackets.eighteenToFiftyNineYears.male.nonPwd++;
        } else if (resident.spouseSex === "Female") {
          ageBrackets.eighteenToFiftyNineYears.female.nonPwd++;
        } else {
          ageBrackets.eighteenToFiftyNineYears.lgbtqPlus++;
        }
      }

      // Family Members
      resident.familyMembers.forEach((member) => {
        if (
          member.birthday >= fiftyNineYearsAgo &&
          member.birthday <= eighteenYearsAgo
        ) {
          ageBrackets.eighteenToFiftyNineYears.totalCount++;
          if (member.sex === "Male") {
            ageBrackets.eighteenToFiftyNineYears.male.nonPwd++;
          } else if (member.sex === "Female") {
            ageBrackets.eighteenToFiftyNineYears.female.nonPwd++;
          } else {
            ageBrackets.eighteenToFiftyNineYears.lgbtqPlus++;
          }
        }
      });

      // Handle PWDs
      resident.additionalInfos.forEach((info) => {
        if (
          info.pwd.toLowerCase() !== "n/a" &&
          info.name === headFullname &&
          resident.headBirthday >= fiftyNineYearsAgo &&
          resident.headBirthday <= eighteenYearsAgo
        ) {
          if (resident.headSex === "Male") {
            ageBrackets.eighteenToFiftyNineYears.male.nonPwd--;
            ageBrackets.eighteenToFiftyNineYears.male.pwd++;
          } else if (resident.headSex === "Female") {
            ageBrackets.eighteenToFiftyNineYears.female.nonPwd--;
            ageBrackets.eighteenToFiftyNineYears.female.pwd++;
          }
        }

        if (
          info.pwd.toLowerCase() !== "n/a" &&
          info.name === spouseFullname &&
          resident.spouseBirthday >= fiftyNineYearsAgo &&
          resident.spouseBirthday <= eighteenYearsAgo
        ) {
          if (resident.spouseSex === "Male") {
            ageBrackets.eighteenToFiftyNineYears.male.nonPwd--;
            ageBrackets.eighteenToFiftyNineYears.male.pwd++;
          } else if (resident.spouseSex === "Female") {
            ageBrackets.eighteenToFiftyNineYears.female.nonPwd--;
            ageBrackets.eighteenToFiftyNineYears.female.pwd++;
          }
        }

        resident.familyMembers.forEach((member) => {
          const memberFullname = `${member.firstName} ${member.middleName} ${member.lastName}`;
          if (
            info.pwd.toLowerCase() !== "n/a" &&
            info.name === memberFullname &&
            member.birthday >= fiftyNineYearsAgo &&
            member.birthday <= eighteenYearsAgo
          ) {
            if (member.sex === "Male") {
              ageBrackets.eighteenToFiftyNineYears.male.nonPwd--;
              ageBrackets.eighteenToFiftyNineYears.male.pwd++;
            } else if (member.sex === "Female") {
              ageBrackets.eighteenToFiftyNineYears.female.nonPwd--;
              ageBrackets.eighteenToFiftyNineYears.female.pwd++;
            }
          }
        });
      });
    });

    // * 60 ABOVE
    const sixtyYearsAgo = new Date();
    sixtyYearsAgo.setFullYear(today.getFullYear() - 60);

    const sixtyAboveYearsResidents = await Resident.find({
      $or: [
        {
          headBirthday: { $lte: sixtyYearsAgo },
        },
        {
          spouseBirthday: { $lte: sixtyYearsAgo },
        },
        {
          familyMembers: {
            $elemMatch: {
              birthday: { $lte: sixtyYearsAgo },
            },
          },
        },
      ],
    });

    sixtyAboveYearsResidents.forEach((resident) => {
      const headFullname = `${resident.headFirstName} ${resident.headMiddleName} ${resident.headLastName}`;
      const spouseFullname = `${resident.spouseFirstName} ${resident.spouseMiddleName} ${resident.spouseLastName}`;

      // Head
      if (resident.headBirthday <= sixtyYearsAgo) {
        ageBrackets.sixtyAbove.totalCount++;
        if (resident.headSex === "Male") {
          ageBrackets.sixtyAbove.male.nonPwd++;
        } else if (resident.headSex === "Female") {
          ageBrackets.sixtyAbove.female.nonPwd++;
        } else {
          ageBrackets.sixtyAbove.lgbtqPlus++;
        }
      }

      // Spouse
      if (resident.spouseBirthday <= sixtyYearsAgo) {
        ageBrackets.sixtyAbove.totalCount++;
        if (resident.spouseSex === "Male") {
          ageBrackets.sixtyAbove.male.nonPwd++;
        } else if (resident.spouseSex === "Female") {
          ageBrackets.sixtyAbove.female.nonPwd++;
        } else {
          ageBrackets.sixtyAbove.lgbtqPlus++;
        }
      }

      // Family Members
      resident.familyMembers.forEach((member) => {
        if (member.birthday <= sixtyYearsAgo) {
          ageBrackets.sixtyAbove.totalCount++;
          if (member.sex === "Male") {
            ageBrackets.sixtyAbove.male.nonPwd++;
          } else if (member.sex === "Female") {
            ageBrackets.sixtyAbove.female.nonPwd++;
          } else {
            ageBrackets.sixtyAbove.lgbtqPlus++;
          }
        }
      });

      // Handle PWDs
      resident.additionalInfos.forEach((info) => {
        if (
          info.pwd.toLowerCase() !== "n/a" &&
          info.name === headFullname &&
          resident.headBirthday <= sixtyYearsAgo
        ) {
          if (resident.headSex === "Male") {
            ageBrackets.sixtyAbove.male.nonPwd--;
            ageBrackets.sixtyAbove.male.pwd++;
          } else if (resident.headSex === "Female") {
            ageBrackets.sixtyAbove.female.nonPwd--;
            ageBrackets.sixtyAbove.female.pwd++;
          }
        }

        if (
          info.pwd.toLowerCase() !== "n/a" &&
          info.name === spouseFullname &&
          resident.spouseBirthday <= sixtyYearsAgo
        ) {
          if (resident.spouseSex === "Male") {
            ageBrackets.sixtyAbove.male.nonPwd--;
            ageBrackets.sixtyAbove.male.pwd++;
          } else if (resident.spouseSex === "Female") {
            ageBrackets.sixtyAbove.female.nonPwd--;
            ageBrackets.sixtyAbove.female.pwd++;
          }
        }

        resident.familyMembers.forEach((member) => {
          const memberFullname = `${member.firstName} ${member.middleName} ${member.lastName}`;
          if (
            info.pwd.toLowerCase() !== "n/a" &&
            info.name === memberFullname &&
            member.birthday <= sixtyYearsAgo
          ) {
            if (member.sex === "Male") {
              ageBrackets.sixtyAbove.male.nonPwd--;
              ageBrackets.sixtyAbove.male.pwd++;
            } else if (member.sex === "Female") {
              ageBrackets.sixtyAbove.female.nonPwd--;
              ageBrackets.sixtyAbove.female.pwd++;
            }
          }
        });
      });
    });

    res.status(200).json({
      success: true,
      overallPopulation,
      ageBrackets,
    });
  } catch (error) {
    console.error("Error fetching residents with infants:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createResident = async (req, res) => {
  try {
    const { householdNo } = req.body;
    console.log(householdNo);

    // Check for existing household number
    const existingResident = await Resident.findOne({ householdNo });
    if (existingResident && existingResident.householdNo !== "N/A") {
      return res.status(400).json({
        success: false,
        message: "Household number already exists",
      });
    }

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
    // Extract query parameters
    const {
      senior,
      pwd,
      ofw,
      soloParent,
      pregnant,
      outOfSchool,
      immigrant,
      sex,
      ageGroup,
      name,
      all,
      forUsers,
    } = req.query;

    if (sex) {
      console.error("SEX : ", sex);
    }

    // Initialize aggregation pipeline
    let pipeline = [];

    // Reusable ageGroup expression for aggregation
    const ageGroupExpression = (ageField) => ({
      $switch: {
        branches: [
          {
            case: { $and: [{ $gte: [ageField, 0] }, { $lte: [ageField, 14] }] },
            then: "0-14",
          },
          {
            case: {
              $and: [{ $gte: [ageField, 15] }, { $lte: [ageField, 29] }],
            },
            then: "15-29",
          },
          {
            case: {
              $and: [{ $gte: [ageField, 30] }, { $lte: [ageField, 59] }],
            },
            then: "30-59",
          },
          { case: { $gte: [ageField, 60] }, then: "60+" },
        ],
        default: null,
      },
    });

    // Helper function to normalize names
    const normalizeName = (name) => ({
      $trim: {
        input: { $toLower: name },
      },
    });

    // Helper function to build pipeline for additionalInfos filters
    const buildAdditionalInfoPipeline = (field, condition, fields) => {
      return [
        {
          $match: {
            $and: [
              { additionalInfos: { $exists: true, $ne: [] } },
              { additionalInfos: { $elemMatch: condition } },
            ],
          },
        },
        { $unwind: "$additionalInfos" },
        {
          $match: {
            [`additionalInfos.${field}`]: condition[field],
          },
        },
        {
          $project: {
            _id: 0,
            deletion: "$deletion",
            householdId: "$_id",
            name: "$additionalInfos.name",
            headLastName: "$headLastName",
            cluster: "$cluster",
            householdNo: "$householdNo",
            sex: {
              $cond: {
                if: {
                  $eq: [
                    normalizeName("$additionalInfos.name"),
                    normalizeName({
                      $concat: ["$headFirstName", " ", "$headLastName"],
                    }),
                  ],
                },
                then: { $ifNull: ["$headSex", null] },
                else: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ["$spouseFirstName", ""] },
                        {
                          $eq: [
                            normalizeName("$additionalInfos.name"),
                            normalizeName({
                              $concat: [
                                "$spouseFirstName",
                                " ",
                                "$spouseLastName",
                              ],
                            }),
                          ],
                        },
                      ],
                    },
                    then: { $ifNull: ["$spouseSex", null] },
                    else: {
                      $let: {
                        vars: {
                          matchedMember: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: { $ifNull: ["$familyMembers", []] },
                                  as: "member",
                                  cond: {
                                    $eq: [
                                      normalizeName("$additionalInfos.name"),
                                      normalizeName({
                                        $concat: [
                                          "$$member.firstName",
                                          " ",
                                          "$$member.lastName",
                                        ],
                                      }),
                                    ],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: { $ifNull: ["$$matchedMember.sex", null] },
                      },
                    },
                  },
                },
              },
            },
            age: {
              $cond: {
                if: {
                  $eq: [
                    normalizeName("$additionalInfos.name"),
                    normalizeName({
                      $concat: ["$headFirstName", " ", "$headLastName"],
                    }),
                  ],
                },
                then: { $ifNull: ["$headAge", null] },
                else: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ["$spouseFirstName", ""] },
                        {
                          $eq: [
                            normalizeName("$additionalInfos.name"),
                            normalizeName({
                              $concat: [
                                "$spouseFirstName",
                                " ",
                                "$spouseLastName",
                              ],
                            }),
                          ],
                        },
                      ],
                    },
                    then: { $ifNull: ["$spouseAge", null] },
                    else: {
                      $let: {
                        vars: {
                          matchedMember: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: { $ifNull: ["$familyMembers", []] },
                                  as: "member",
                                  cond: {
                                    $eq: [
                                      normalizeName("$additionalInfos.name"),
                                      normalizeName({
                                        $concat: [
                                          "$$member.firstName",
                                          " ",
                                          "$$member.lastName",
                                        ],
                                      }),
                                    ],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: { $ifNull: ["$$matchedMember.age", null] },
                      },
                    },
                  },
                },
              },
            },
            ageGroup: ageGroupExpression({
              $cond: {
                if: {
                  $eq: [
                    normalizeName("$additionalInfos.name"),
                    normalizeName({
                      $concat: ["$headFirstName", " ", "$headLastName"],
                    }),
                  ],
                },
                then: { $ifNull: ["$headAge", 0] },
                else: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ["$spouseFirstName", ""] },
                        {
                          $eq: [
                            normalizeName("$additionalInfos.name"),
                            normalizeName({
                              $concat: [
                                "$spouseFirstName",
                                " ",
                                "$spouseLastName",
                              ],
                            }),
                          ],
                        },
                      ],
                    },
                    then: { $ifNull: ["$spouseAge", 0] },
                    else: {
                      $let: {
                        vars: {
                          matchedMember: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: { $ifNull: ["$familyMembers", []] },
                                  as: "member",
                                  cond: {
                                    $eq: [
                                      normalizeName("$additionalInfos.name"),
                                      normalizeName({
                                        $concat: [
                                          "$$member.firstName",
                                          " ",
                                          "$$member.lastName",
                                        ],
                                      }),
                                    ],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: { $ifNull: ["$$matchedMember.age", 0] },
                      },
                    },
                  },
                },
              },
            }),
            ...fields,
          },
        },
        // Apply sex and ageGroup filters if provided
        ...(sex || ageGroup
          ? [
              {
                $match: {
                  ...(sex && { sex: sex }),
                  ...(ageGroup && { ageGroup: ageGroup }),
                },
              },
            ]
          : []),
        { $sort: { name: 1 } },
      ];
    };

    // Handle specific filters
    if (senior === "true") {
      pipeline = [
        {
          $match: {
            $or: [
              { headAge: { $gte: 60 } },
              { spouseAge: { $gte: 60 } },
              { "familyMembers.age": { $gte: 60 } },
            ],
          },
        },
        {
          $facet: {
            head: [
              { $match: { headAge: { $gte: 60 } } },
              {
                $project: {
                  _id: 0,
                  householdId: "$_id",
                  name: { $concat: ["$headFirstName", " ", "$headLastName"] },
                  headLastName: "$headLastName",
                  cluster: "$cluster",
                  householdNo: "$householdNo",
                  age: "$headAge",
                  relationship: "Head",
                  sex: { $ifNull: ["$headSex", null] },
                  ageGroup: ageGroupExpression("$headAge"),
                },
              },
            ],
            spouse: [
              {
                $match: {
                  $and: [
                    { spouseAge: { $gte: 60 } },
                    { spouseFirstName: { $ne: "" } },
                  ],
                },
              },
              {
                $project: {
                  _id: 0,
                  householdId: "$_id",
                  name: {
                    $concat: ["$spouseFirstName", " ", "$spouseLastName"],
                  },
                  headLastName: "$headLastName",
                  cluster: "$cluster",
                  householdNo: "$householdNo",
                  age: "$spouseAge",
                  relationship: "Spouse",
                  sex: { $ifNull: ["$spouseSex", null] },
                  ageGroup: ageGroupExpression("$spouseAge"),
                },
              },
            ],
            familyMembers: [
              {
                $unwind: {
                  path: "$familyMembers",
                  preserveNullAndEmptyArrays: true,
                },
              },
              { $match: { "familyMembers.age": { $gte: 60 } } },
              {
                $project: {
                  _id: 0,
                  householdId: "$_id",
                  name: {
                    $concat: [
                      "$familyMembers.firstName",
                      " ",
                      "$familyMembers.lastName",
                    ],
                  },
                  headLastName: "$headLastName",
                  cluster: "$cluster",
                  householdNo: "$householdNo",
                  age: "$familyMembers.age",
                  relationship: "$familyMembers.relationship",
                  sex: { $ifNull: ["$familyMembers.sex", null] },
                  ageGroup: ageGroupExpression("$familyMembers.age"),
                },
              },
            ],
          },
        },
        {
          $project: {
            seniors: { $concatArrays: ["$head", "$spouse", "$familyMembers"] },
          },
        },
        { $unwind: "$seniors" },
        {
          $project: {
            _id: 0,
            householdId: "$seniors.householdId",
            name: "$seniors.name",
            headLastName: "$seniors.headLastName",
            cluster: "$seniors.cluster",
            householdNo: "$seniors.householdNo",
            age: "$seniors.age",
            relationship: "$seniors.relationship",
            sex: "$seniors.sex",
            ageGroup: "$seniors.ageGroup",
          },
        },
        // Apply sex and ageGroup filters if provided
        ...(sex || ageGroup
          ? [
              {
                $match: {
                  ...(sex && { sex: sex }),
                  ...(ageGroup && { ageGroup: ageGroup }),
                },
              },
            ]
          : []),
        { $sort: { name: 1 } },
      ];
    } else if (immigrant === "true") {
      pipeline = buildAdditionalInfoPipeline(
        "immigrantNationality",
        {
          immigrantNationality: {
            $nin: ["N/A", "", "n/a", "Not an immigrant"],
          },
        },
        {
          immigrantNationality: {
            $ifNull: ["$additionalInfos.immigrantNationality", "N/A"],
          },
          yearsOfStay: { $ifNull: ["$additionalInfos.yearsOfStay", 0] },
        }
      );
    } else if (pregnant === "true") {
      pipeline = buildAdditionalInfoPipeline(
        "pregnant",
        {
          pregnant: {
            $nin: ["No", "N/A", "n/a", ""],
          },
        },
        {
          pregnantMonths: { $ifNull: ["$additionalInfos.pregnantMonths", 0] },
        }
      );
    } else if (ofw === "true") {
      pipeline = buildAdditionalInfoPipeline(
        "ofwCountry",
        { ofwCountry: { $nin: ["N/A", "n/a", ""] } },
        {
          ofwCountry: { $ifNull: ["$additionalInfos.ofwCountry", ""] },
          yearsInService: { $ifNull: ["$additionalInfos.yearsInService", 0] },
        }
      );
    } else if (pwd === "true") {
      pipeline = buildAdditionalInfoPipeline(
        "pwd",
        { pwd: { $nin: ["N/A", "n/a", ""] } },
        {}
      );
    } else if (soloParent === "true") {
      pipeline = buildAdditionalInfoPipeline(
        "soloParent",
        { soloParent: { $nin: ["No", "N/A", "n/a", ""] } },
        {}
      );
    } else if (outOfSchool === "true") {
      pipeline = buildAdditionalInfoPipeline(
        "outOfSchool",
        { outOfSchool: { $nin: ["No", "N/A", "n/a", ""] } },
        {}
      );
    } else {
      // Handle name, sex, and ageGroup filters with detailed output
      pipeline = [
        {
          $facet: {
            head: [
              {
                $match: {
                  ...(name && {
                    $or: [
                      { headFirstName: new RegExp(name, "i") },
                      { headLastName: new RegExp(name, "i") },
                    ],
                  }),
                  ...(sex && { headSex: sex }),
                  ...(ageGroup && {
                    headAge: {
                      $gte: parseInt(ageGroup.split("-")[0]),
                      ...(ageGroup.includes("-") && {
                        $lte: parseInt(ageGroup.split("-")[1]),
                      }),
                    },
                  }),
                },
              },
              {
                $project: {
                  _id: 0,
                  householdId: "$_id",
                  name: { $concat: ["$headFirstName", " ", "$headLastName"] },
                  headLastName: "$headLastName",
                  cluster: "$cluster",
                  householdNo: "$householdNo",
                  age: "$headAge",
                  relationship: "Head",
                  sex: { $ifNull: ["$headSex", null] },
                  ageGroup: ageGroupExpression("$headAge"),
                },
              },
            ],
            spouse: [
              {
                $match: {
                  $and: [
                    { spouseFirstName: { $ne: "" } },
                    {
                      ...(name && {
                        $or: [
                          { spouseFirstName: new RegExp(name, "i") },
                          { spouseLastName: new RegExp(name, "i") },
                        ],
                      }),
                      ...(sex && { spouseSex: sex }),
                      ...(ageGroup && {
                        spouseAge: {
                          $gte: parseInt(ageGroup.split("-")[0]),
                          ...(ageGroup.includes("-") && {
                            $lte: parseInt(ageGroup.split("-")[1]),
                          }),
                        },
                      }),
                    },
                  ],
                },
              },
              {
                $project: {
                  _id: 0,
                  householdId: "$_id",
                  name: {
                    $concat: ["$spouseFirstName", " ", "$spouseLastName"],
                  },
                  headLastName: "$headLastName",
                  cluster: "$cluster",
                  householdNo: "$householdNo",
                  age: "$spouseAge",
                  relationship: "Spouse",
                  sex: { $ifNull: ["$spouseSex", null] },
                  ageGroup: ageGroupExpression("$spouseAge"),
                },
              },
            ],
            familyMembers: [
              {
                $unwind: {
                  path: "$familyMembers",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $match: {
                  ...(name && {
                    $or: [
                      { "familyMembers.firstName": new RegExp(name, "i") },
                      { "familyMembers.lastName": new RegExp(name, "i") },
                    ],
                  }),
                  ...(sex && { "familyMembers.sex": sex }),
                  ...(ageGroup && {
                    "familyMembers.age": {
                      $gte: parseInt(ageGroup.split("-")[0]),
                      ...(ageGroup.includes("-") && {
                        $lte: parseInt(ageGroup.split("-")[1]),
                      }),
                    },
                  }),
                },
              },
              {
                $project: {
                  _id: 0,
                  householdId: "$_id",
                  name: {
                    $concat: [
                      "$familyMembers.firstName",
                      " ",
                      "$familyMembers.lastName",
                    ],
                  },
                  headLastName: "$headLastName",
                  cluster: "$cluster",
                  householdNo: "$householdNo",
                  age: "$familyMembers.age",
                  relationship: "$familyMembers.relationship",
                  sex: { $ifNull: ["$familyMembers.sex", null] },
                  ageGroup: ageGroupExpression("$familyMembers.age"),
                },
              },
            ],
          },
        },
        {
          $project: {
            residents: {
              $concatArrays: ["$head", "$spouse", "$familyMembers"],
            },
          },
        },
        { $unwind: "$residents" },
        {
          $project: {
            _id: 0,
            householdId: "$residents.householdId",
            name: "$residents.name",
            headLastName: "$residents.headLastName",
            cluster: "$residents.cluster",
            householdNo: "$residents.householdNo",
            age: "$residents.age",
            relationship: "$residents.relationship",
            sex: "$residents.sex",
            ageGroup: "$residents.ageGroup",
          },
        },
        { $sort: { name: 1 } },
      ];
    }

    let residents = [];
    // Execute aggregation
    if (all === "true") {
      residents = await Resident.find().sort({ headLastName: 1 });
      console.log("ALL");
    } else if (name && name.trim() !== "") {
      console.log("NAME");
      residents = await Resident.find({
        $or: [
          // Search in head's first and last name
          { headFirstName: { $regex: name, $options: "i" } },
          { headLastName: { $regex: name, $options: "i" } },
          // Search in spouse's first and last name
          { spouseFirstName: { $regex: name, $options: "i" } },
          { spouseLastName: { $regex: name, $options: "i" } },
          // Search in family members' first and last name
          { "familyMembers.firstName": { $regex: name, $options: "i" } },
          { "familyMembers.lastName": { $regex: name, $options: "i" } },
        ],
      }).sort({ headLastName: 1 });
    } else if (forUsers === "true") {
      residents = await Resident.find({});
    } else {
      console.log("FILTER");
      residents = await Resident.aggregate(pipeline);
    }

    return res
      .status(200)
      .json({ success: true, data: residents, length: residents.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getResidentsForExcel = async (req, res) => {
  try {
    const { residentIds } = req.body;
    const residents = await Resident.find({
      _id: { $in: residentIds },
    });
    return res
      .status(200)
      .json({ success: true, data: residents, length: residents.length });
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

const updateRequestForDeletion = async (req, res) => {
  try {
    const updatedResident = await Resident.findByIdAndUpdate(
      req.params.requestDeletionID,
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
      message: "Request for deletion sent!",
      data: updatedResident,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteResident = async (req, res) => {
  try {
    // Step 1: Delete the resident
    const deletedResident = await Resident.findByIdAndDelete(req.params.id);
    if (!deletedResident) {
      return res.status(404).json({
        success: false,
        error: "Resident not found",
      });
    }

    // Step 2: Find users linked to this resident
    const linkedUsers = await User.find({ linkedResident: req.params.id });

    // Step 3: Extract the IDs of those users
    const linkedUserIds = linkedUsers.map((user) => user._id);

    // Step 4: Delete those users
    const deletedUsers = await User.deleteMany({ _id: { $in: linkedUserIds } });

    // Step 5: Delete audit logs created by those users
    const deletedLogs = await AuditLog.deleteMany({
      user: { $in: linkedUserIds },
    });

    return res.status(200).json({
      success: true,
      message: "Resident, linked users, and audit logs deleted successfully",
      deletedResident,
      deletedUsers: deletedUsers.deletedCount,
      deletedLogs: deletedLogs.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export {
  getResidentsForExcel,
  getResident,
  getResidents,
  createResident,
  updateResident,
  deleteResident,
  getResidentStatistics,
  updateRequestForDeletion,
  getResidentReportsByAgeAndGender,
};
