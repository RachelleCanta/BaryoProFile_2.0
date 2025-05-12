import React, { useState, useMemo, useEffect } from "react";
import { Search, Download, FileText } from "lucide-react";
import { logActivity } from "../../utils/auditLogger";
import {
  checkPermission,
  handlePermissionError,
  PERMISSIONS,
} from "../Permission/Permissions";
import PermissionErrorModal from "../Permission/PermissionErrorModal";
import "./CertificateManager.css";
import axiosInstance from "../../axios";
import { toast } from "react-toastify";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

const CertificateManager = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadStatus, setDownloadStatus] = useState({
    loading: false,
    error: null,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // ! RESUME AT CERTIFICATE OF INCOME!!!!

  // ! SELECT OPTIONS
  const civilStatusOptions = [
    "Single",
    "Married",
    "Widowed",
    "Separated",
    "Live-in",
  ];
  const relationshipOptions = [
    "Son",
    "Daughter",
    "Mother",
    "Father",
    "Grandmother",
    "Grandfather",
    "Aunt",
    "Uncle",
    "Cousin",
    "Other",
  ];
  const nationalityOptions = [
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
  const genderOptions = ["Male", "Female", "Other"];
  // ! END OF SELECT OPTIONS

  const [barangayClearanceData, setBarangayClearanceData] = useState({
    name: "",
    birthPlace: "",
    age: "",
    civilStatus: "Single",
    birthday: "",
    parents: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [residencyDatav1, setResidencyDatav1] = useState({
    name: "",
    age: "",
    nationality: "Filipino",
    gender: "Male",
    civilStatus: "Single",
    streetAddress: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [residencyDatav2, setResidencyDatav2] = useState({
    name: "",
    age: "",
    streetAddress: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [appearanceData, setAppearanceData] = useState({
    name: "",
    appearanceDate: "",
    eventProgram: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [goodMoralData, setGoodMoralData] = useState({
    name: "",
    age: "",
    streetAddress: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
    gender: "He",
  });

  const [brgyCertData, setBrgyCertData] = useState({
    name: "",
    gender: "Male",
    relationship: "Son",
    birthday: "",
    parents: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [healthData, setHealthData] = useState({
    name: "",
    age: "",
    puiAndPum: "PUI",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [mortuaryData, setMortuaryData] = useState({
    salutations: "Mr",
    name: "",
    age: "",
    streetAddress: "",
    dateOfDeath: "",
    cause: "",
    seniorID: "",
    seniorIssuanceDate: "",
    heirName: "",
    requestorLastName: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [travelData, setTravelData] = useState({
    name: "",
    civilStatus: "Single",
    age: "",
    location: "",
    thingsOrAnimalsCarrying: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [businessPermitData, setBusinessPermitData] = useState({
    name: "",
    civilStatus: "Single",
    age: "",
    location: "",
    thingsOrAnimalsCarrying: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [businessClosureData, setBusinessClosureData] = useState({
    name: "",
    gender: "Him",
    businessName: "",
    closureDate: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [indigencyData, setIndigencyData] = useState({
    name: "",
    age: "",
    gender: "Male",
    civilStatus: "Single",
    streetAddress: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [noIncomeData, setNoIncomeData] = useState({
    name: "",
    pronouns: "him",
    age: "",
    streetAddress: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [incomeData, setIncomeData] = useState({
    name: "",
    pronouns: "she",
    age: "",
    streetAddress: "",
    businessName: "",
    income: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [tulongHatidData, setTulongHatidData] = useState({
    name: "",
    gender: "his",
    age: "",
    streetAddress: "",
    beneficiaryRelationship: "Son",
    beneficiaryName: "",
    dateOfDeath: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [lateRegData, setLateRegData] = useState({
    name: "",
    gender: "Male",
    birthday: "",
    birthplace: "",
    parents: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [oathData, setOathData] = useState({
    name: "",
    age: "",
    streetAddress: "",
    yearsOfResidence: "",
    dateSigned: "",
    validUntil: "",
  });

  const [councilAffidavitData, setCouncilAffidavitData] = useState({
    name: "",
    nationality: "Filipino",
    streetAddress: "",
    setHandDate: "",
    dateSworned: "",
  });

  const [liveInData, setLiveInData] = useState({
    name: "",
    label: "Partner",
    streetAddress: "",
    since: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [relationshipData, setRelationshipData] = useState({
    name: "",
    age: "",
    streetAddress: "",
    daughterInLawName: "",
    daughterInLawAge: "",
    daughterInLawBirthday: "",
    requestor: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [soloParentData, setSoloParentData] = useState({
    name: "",
    age: "",
    gender: "him",
    streetAddress: "",
    numberOfChildren: "",
    childrenNames: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);

    if (!checkPermission(user, PERMISSIONS.CERTIFICATES)) {
      setShowErrorModal(true);
      return;
    }
  }, []);

  const [certificates, setCertificates] = useState({
    "Personal Documents": [
      {
        isOpen: false,
        name: "Barangay Clearance",
        description:
          "Official document certifying individual has no criminal record",
        templateUrls: [
          // "/templates/personal/barangay-clearance1.docx",
          "/templates/personal/barangay-clearance2.docx",
          // "/templates/personal/barangay-clearance3.docx",
        ],
      },
      {
        isOpen: false,
        name: "Certificate of Residency",
        description: "Confirms current residence status in the barangay",
        templateUrls: [
          "/templates/personal/certificate-of-residency1.docx",
          // "/templates/personal/certificate-of-residency2.docx",
        ],
      },
      {
        isOpen: false,
        name: "Certification of Residency",
        description:
          "Verifies long-term residency status and history in the barangay",
        templateUrls: "/templates/personal/certification-of-residency.docx",
      },
      {
        isOpen: false,
        name: "Certificate of Appearance",
        description: "Certifies individual appeared at the barangay office",
        templateUrl: "/templates/personal/certificate-of-appearance.docx",
      },
      {
        isOpen: false,
        name: "Certificate of Good Moral",
        description: "Attests to the good moral character of an individual",
        templateUrl: "/templates/personal/good-moral-certificate.docx",
      },
      {
        isOpen: false,
        name: "Barangay Certification",
        description: "General purpose barangay certification",
        templateUrl: [
          "/templates/personal/certification-signedby-K.templo.docx",
          // "/templates/personal/certification-signedby-K.barrogo.docx",
          // "/templates/personal/certification-signedby-K.villegas.docx",
          // "/templates/personal/certification-signedby-K.onsay.docx",
          // "/templates/personal/certification-signedby-K.carandang.docx",
          // "/templates/personal/certification-signedby-K.arguilles-temp1.docx",
          // "/templates/personal/certification-signedby-K.arguilles-temp2.docx",
          // "/templates/personal/certification-signedby-K.sumargo-temp1.docx",
          // "/templates/personal/certification-signedby-K.sumargo-temp2.docx",
          // "/templates/personal/certification-signedby-K.castillo-temp1.docx",
          // "/templates/personal/certification-signedby-K.castillo-temp2.docx",
          // "/templates/personal/certification-signedby-K.castillo-temp3.docx",
          // "/templates/personal/certification-signedby-K.castillo-temp4.docx",
        ],
      },
    ],
    "Health Documents": [
      {
        isOpen: false,
        name: "Barangay Health Certification",
        description: "Certifies health status of an individual",
        // templateUrl: "/templates/health/health-certification.docx",
        templateUrl: "/templates/health/health-certification1.docx",
      },
      {
        isOpen: false,
        name: "Certification of Mortuary",
        description: "Documentation for mortuary services",
        // templateUrl: "/templates/health/mortuary-certification.docx",
        templateUrl: "/templates/health/mortuary-certificate.docx",
      },
    ],
    "Travel Documents": [
      {
        isOpen: false,
        name: "Permit to Travel",
        description: "Authorization for travel purposes",
        templateUrl: "/templates/travel/travel-permit.docx",
      },
    ],
    "Business Documents": [
      // ! NO DOCS AVAILABLE FOR THIS ONE
      // {
      //   name: "Business Permit",
      //   description: "Official permit to operate a business in the barangay",
      //   templateUrl: "/templates/business/business-permit.docx",
      // },
      {
        isOpen: false,
        name: "Certification of Business Closure",
        description: "Official certification of business cessation",
        templateUrl: "/templates/business/business-closure.docx",
      },
    ],
    "Financial Documents": [
      {
        isOpen: false,
        name: "Certificate of Indigency",
        description:
          "Certifies individual as qualified for financial assistance",
        templateUrl: "/templates/financial/certificate-of-indigency.docx",
      },
      {
        isOpen: false,
        name: "Certificate of No Income",
        description: "Confirms individual has no regular source of income",
        templateUrl: "/templates/financial/no-income-certificate.docx",
      },
      {
        isOpen: false,
        name: "Certificate of Income",
        description: "Confirms individual has a regular source of income",
        templateUrl: "/templates/financial/income-certificate.docx",
      },
      {
        isOpen: false,
        name: "Libreng Tulong Hatid",
        description:
          "Certification for financial assistance with funeral and transportation services for bereaved families",
        templateUrl: "/templates/financial/libreng-tulong-hatid.docx",
      },
    ],
    "Legal Documents": [
      {
        isOpen: false,
        name: "Certification of Late Registration",
        description: "Confirms late registration of civil documents",
        templateUrl: "/templates/legal/late-registration-cert.docx",
      },
      {
        isOpen: false,
        name: "Oath of Undertaking",
        description: "Legal sworn statement of commitment",
        templateUrl: "/templates/legal/oath-of-undertaking.docx",
      },
      {
        isOpen: false,
        name: "Sworn Affidavit of the Barangay Council",
        description: "Official affidavit from the Barangay Council",
        templateUrl: "/templates/legal/council-affidavit.docx",
      },
    ],
    "Relationship Documents": [
      {
        isOpen: false,
        name: "Certification of Live In Partner",
        description: "Confirms cohabitation status of partners",
        templateUrl: "/templates/relationship/live-in-partner-certificate.docx",
      },
      {
        isOpen: false,
        name: "Certification of Relationship",
        description: "Verifies relationship between two individuals",
        templateUrl: "/templates/relationship/certificate-of-relationship.docx",
      },
    ],
    "Special Documents": [
      {
        isOpen: false,
        name: "Solo Parent Certification",
        description: "Certifies status as a solo parent",
        templateUrl: "/templates/special/solo-parent-certificate.docx",
      },
    ],
  });

  // const certificates = {
  //   "Personal Documents": [
  //     {
  //       isOpen: false,
  //       name: "Barangay Clearance",
  //       description:
  //         "Official document certifying individual has no criminal record",
  //       templateUrls: [
  //         // "/templates/personal/barangay-clearance1.docx",
  //         "/templates/personal/barangay-clearance2.docx",
  //         // "/templates/personal/barangay-clearance3.docx",
  //       ],
  //     },
  //     {
  //       isOpen: false,
  //       name: "Certificate of Residency",
  //       description: "Confirms current residence status in the barangay",
  //       templateUrls: [
  //         "/templates/personal/certificate-of-residency1.docx",
  //         // "/templates/personal/certificate-of-residency2.docx",
  //       ],
  //     },
  //     {
  //       isOpen: false,
  //       name: "Certification of Residency",
  //       description:
  //         "Verifies long-term residency status and history in the barangay",
  //       templateUrls: "/templates/personal/certification-of-residency.docx",
  //     },
  //     {
  //       isOpen: false,
  //       name: "Certificate of Appearance",
  //       description: "Certifies individual appeared at the barangay office",
  //       templateUrl: "/templates/personal/certificate-of-appearance.docx",
  //     },
  //     {
  //       isOpen: false,
  //       name: "Certificate of Good Moral",
  //       description: "Attests to the good moral character of an individual",
  //       templateUrl: "/templates/personal/good-moral-certificate.docx",
  //     },
  //     {
  //       isOpen: false,
  //       name: "Barangay Certification",
  //       description: "General purpose barangay certification",
  //       templateUrl: [
  //         "/templates/personal/certification-signedby-K.templo.docx",
  //         // "/templates/personal/certification-signedby-K.barrogo.docx",
  //         // "/templates/personal/certification-signedby-K.villegas.docx",
  //         // "/templates/personal/certification-signedby-K.onsay.docx",
  //         // "/templates/personal/certification-signedby-K.carandang.docx",
  //         // "/templates/personal/certification-signedby-K.arguilles-temp1.docx",
  //         // "/templates/personal/certification-signedby-K.arguilles-temp2.docx",
  //         // "/templates/personal/certification-signedby-K.sumargo-temp1.docx",
  //         // "/templates/personal/certification-signedby-K.sumargo-temp2.docx",
  //         // "/templates/personal/certification-signedby-K.castillo-temp1.docx",
  //         // "/templates/personal/certification-signedby-K.castillo-temp2.docx",
  //         // "/templates/personal/certification-signedby-K.castillo-temp3.docx",
  //         // "/templates/personal/certification-signedby-K.castillo-temp4.docx",
  //       ],
  //     },
  //   ],
  //   "Health Documents": [
  //     {
  //       isOpen: false,
  //       name: "Barangay Health Certification",
  //       description: "Certifies health status of an individual",
  //       // templateUrl: "/templates/health/health-certification.docx",
  //       templateUrl: "/templates/health/health-certification1.docx",
  //     },
  //     {
  //       isOpen: true,
  //       name: "Certification of Mortuary",
  //       description: "Documentation for mortuary services",
  //       // templateUrl: "/templates/health/mortuary-certification.docx",
  //       templateUrl: "/templates/health/mortuary-certificate.docx",
  //     },
  //   ],
  //   "Travel Documents": [
  //     {
  //       isOpen: false,
  //       name: "Permit to Travel",
  //       description: "Authorization for travel purposes",
  //       templateUrl: "/templates/travel/travel-permit.docx",
  //     },
  //   ],
  //   "Business Documents": [
  //     // ! NO DOCS AVAILABLE FOR THIS ONE
  //     // {
  //     //   name: "Business Permit",
  //     //   description: "Official permit to operate a business in the barangay",
  //     //   templateUrl: "/templates/business/business-permit.docx",
  //     // },
  //     {
  //       isOpen: false,
  //       name: "Certification of Business Closure",
  //       description: "Official certification of business cessation",
  //       templateUrl: "/templates/business/business-closure.docx",
  //     },
  //   ],
  //   "Financial Documents": [
  //     {
  //       isOpen: false,
  //       name: "Certificate of Indigency",
  //       description:
  //         "Certifies individual as qualified for financial assistance",
  //       templateUrl: "/templates/financial/certificate-of-indigency.docx",
  //     },
  //     {
  //       isOpen: false,
  //       name: "Certificate of No Income",
  //       description: "Confirms individual has no regular source of income",
  //       templateUrl: "/templates/financial/no-income-certificate.docx",
  //     },
  //     {
  //       isOpen: false,
  //       name: "Certificate of Income",
  //       description: "Confirms individual has a regular source of income",
  //       templateUrl: "/templates/financial/income-certificate.docx",
  //     },
  //     {
  //       isOpen: false,
  //       name: "Libreng Tulong Hatid",
  //       description:
  //         "Certification for financial assistance with funeral and transportation services for bereaved families",
  //       templateUrl: "/templates/financial/libreng-tulong-hatid.docx",
  //     },
  //   ],
  //   "Legal Documents": [
  //     {
  //       isOpen: false,
  //       name: "Certification of Late Registration",
  //       description: "Confirms late registration of civil documents",
  //       templateUrl: "/templates/legal/late-registration-cert.docx",
  //     },
  //     {
  //       isOpen: false,
  //       name: "Oath of Undertaking",
  //       description: "Legal sworn statement of commitment",
  //       templateUrl: "/templates/legal/oath-of-undertaking.docx",
  //     },
  //     {
  //       isOpen: false,
  //       name: "Sworn Affidavit of the Barangay Council",
  //       description: "Official affidavit from the Barangay Council",
  //       templateUrl: "/templates/legal/council-affidavit.docx",
  //     },
  //   ],
  //   "Relationship Documents": [
  //     {
  //       isOpen: false,
  //       name: "Certification of Live In Partner",
  //       description: "Confirms cohabitation status of partners",
  //       templateUrl: "/templates/relationship/live-in-partner-certificate.docx",
  //     },
  //     {
  //       isOpen: false,
  //       name: "Certification of Relationship",
  //       description: "Verifies relationship between two individuals",
  //       templateUrl: "/templates/relationship/certificate-of-relationship.docx",
  //     },
  //   ],
  //   "Special Documents": [
  //     {
  //       isOpen: false,
  //       name: "Solo Parent Certification",
  //       description: "Certifies status as a solo parent",
  //       templateUrl: "/templates/special/solo-parent-certificate.docx",
  //     },
  //   ],
  // };

  const allDocuments = useMemo(() => {
    return Object.entries(certificates).flatMap(([category, docs]) =>
      docs.map((doc) => ({
        ...doc,
        category,
      }))
    );
  }, []);

  // const filteredDocuments = useMemo(() => {
  //   if (!searchTerm) {
  //     return null;
  //   }

  //   const searchLower = searchTerm.toLowerCase();
  //   return allDocuments.filter((doc) => {
  //     const nameMatch = doc.name.toLowerCase().includes(searchLower);
  //     const descriptionMatch = doc.description
  //       .toLowerCase()
  //       .includes(searchLower);
  //     const templateMatch =
  //       (doc.templateUrl &&
  //         typeof doc.templateUrl === "string" &&
  //         doc.templateUrl.toLowerCase().includes(searchLower)) ||
  //       (doc.templateUrls &&
  //         Array.isArray(doc.templateUrls) &&
  //         doc.templateUrls.some((url) =>
  //           url.toLowerCase().includes(searchLower)
  //         ));

  //     return nameMatch || descriptionMatch || templateMatch;
  //   });
  // }, [searchTerm, allDocuments]);

  const filteredDocuments = useMemo(() => {
    if (!searchTerm) {
      return null;
    }

    const searchLower = searchTerm.toLowerCase();

    return Object.entries(certificates).flatMap(
      ([section, docs]) =>
        docs
          .filter((doc) => {
            const nameMatch = doc.name.toLowerCase().includes(searchLower);
            const descriptionMatch = doc.description
              .toLowerCase()
              .includes(searchLower);
            const templateMatch =
              (doc.templateUrl &&
                typeof doc.templateUrl === "string" &&
                doc.templateUrl.toLowerCase().includes(searchLower)) ||
              (doc.templateUrls &&
                Array.isArray(doc.templateUrls) &&
                doc.templateUrls.some((url) =>
                  url.toLowerCase().includes(searchLower)
                ));

            return nameMatch || descriptionMatch || templateMatch;
          })
          .map((doc) => ({ ...doc, section })) // ✅ Add section info to each matching doc
    );
  }, [searchTerm, certificates]);

  const handleDownload = async (templateUrls, certName) => {
    if (!checkPermission(currentUser, PERMISSIONS.CERTIFICATES)) {
      setShowErrorModal(true);
      return;
    }
    setDownloadStatus({ loading: true, error: null });
    modifyWordFile(templateUrls, certName);

    // try {
    //   const baseUrl = window.location.origin;
    //   const urls = Array.isArray(templateUrls) ? templateUrls : [templateUrls];

    //   const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    //   const username = currentUser?.username || "systemadmin";

    //   await Promise.all(
    //     urls.map(async (templateUrl) => {
    //       const fullUrl = `${baseUrl}${templateUrl}`;

    //       const response = await fetch(fullUrl, {
    //         method: "GET",
    //         headers: {
    //           "Content-Type":
    //             "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    //         },
    //       });

    //       if (!response.ok) {
    //         throw new Error(`Failed to download template (${response.status})`);
    //       }

    //       const blob = await response.blob();
    //       const url = window.URL.createObjectURL(blob);
    //       const link = document.createElement("a");
    //       link.href = url;
    //       const filename = templateUrl.split("/").pop();
    //       link.download = filename;

    //       // // Log the download activity with proper user format
    //       // logActivity(username, 'Download', 'Certificate Management', {
    //       //     certificateName: certName,
    //       //     templateFile: filename,
    //       //     downloadedAt: new Date().toISOString()
    //       // });

    //       document.body.appendChild(link);
    //       link.click();
    //       document.body.removeChild(link);
    //       window.URL.revokeObjectURL(url);
    //     })
    //   );

    //   // Make sure the userId is properly formatted before making the API request
    //   const userId = JSON.parse(localStorage.getItem("userId") || "null");

    //   await axiosInstance.post("/system-logs", {
    //     action: "Download",
    //     module: "Manage Certificate Templates",
    //     user: userId, // Ensures proper formatting (null if unavailable)
    //     details: `User ${username} downloaded ${certName} (${
    //       urls.length > 1 ? "multiple files" : urls[0].split("/").pop()
    //     })`,
    //   });

    //   toast.success(`${certName} File downloaded successfully!`);

    //   setDownloadStatus({ loading: false, error: null });
    // } catch (error) {
    //   console.error("Download error:", error);
    //   setDownloadStatus({
    //     loading: false,
    //     error: "Failed to download template. Please try again later.",
    //   });
    // }
  };

  const modifyWordFile = async (templateUrls, certName) => {
    let data = {};
    switch (certName) {
      case "Barangay Clearance":
        data = barangayClearanceData;
        break;
      case "Certificate of Residency":
        data = residencyDatav1;
        break;
      case "Certification of Residency":
        data = residencyDatav2;
        break;
      case "Certificate of Appearance":
        data = appearanceData;
        break;
      case "Certificate of Good Moral":
        data = goodMoralData;
        break;
      case "Barangay Certification":
        data = brgyCertData;
        break;
      case "Barangay Health Certification":
        data = healthData;
        break;
      case "Certification of Mortuary":
        data = mortuaryData;
        break;
      case "Permit to Travel":
        data = travelData;
        break;
      case "Business Permit":
        data = businessPermitData;
        break;
      case "Certification of Business Closure":
        data = businessClosureData;
        break;
      case "Certificate of Indigency":
        indigencyData.pronouns =
          indigencyData.gender === "Male"
            ? "him"
            : indigencyData.gender === "Female"
            ? "her"
            : "they";
        data = indigencyData;
        break;
      case "Certificate of No Income":
        data = noIncomeData;
        break;
      case "Certificate of Income":
        incomeData.pronounsTwo =
          incomeData.gender === "he"
            ? "him"
            : incomeData.gender === "she"
            ? "her"
            : "their";
        data = incomeData;
        break;
      case "Libreng Tulong Hatid":
        data = tulongHatidData;
        break;
      case "Certification of Late Registration":
        lateRegData.relationship =
          lateRegData.gender === "Male"
            ? "Son"
            : lateRegData.gender === "Female"
            ? "Daughter"
            : "Son/Daughter/Other";
        data = lateRegData;
        break;
      case "Oath of Undertaking":
        data = oathData;
        break;
      case "Sworn Affidavit of the Barangay Council":
        data = councilAffidavitData;
        break;
      case "Certification of Live In Partner":
        data = liveInData;
        break;
      case "Certification of Relationship":
        data = relationshipData;
        break;
      case "Solo Parent Certification":
        soloParentData.pronounsTwo =
          soloParentData.pronouns === "he"
            ? "him"
            : soloParentData.pronouns === "she"
            ? "her"
            : "them";
        data = soloParentData;
        break;
      default:
        data = {};
    }

    const response = await fetch(templateUrls); // Load existing Word file
    const arrayBuffer = await response.arrayBuffer();

    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Inject variables
    doc.setData(data);

    try {
      doc.render();
      const blob = doc.getZip().generate({ type: "blob" });
      saveAs(blob, `${certName}.docx`);

      const certificateRecRes = await axiosInstance.post("/certificates", {
        type: certName,
        printedBy: currentUser.username,
        data: data,
      });

      console.log(certificateRecRes);

      if (certificateRecRes.data.message) {
        console.log("HAHAHA", {
          action: "Download",
          module: "Manage Certificate Templates",
          user: currentUser.id,
          details: `User ${currentUser.username} downloaded ${certName}`,
        });

        await axiosInstance.post("/system-logs", {
          action: "Download",
          module: "Manage Certificate Templates",
          user: currentUser.id,
          details: `User ${currentUser.username} downloaded ${certName}`,
        });

        toast.success(
          `${certName} File downloaded and record saved successfully!`
        );
      } else {
        toast.error(
          `${certName} Cannot Save Record Right Now. Please try again later.`
        );
      }

      setDownloadStatus({ loading: false, error: null });
      setBarangayClearanceData({
        name: "",
        birthPlace: "",
        age: "",
        civilStatus: "Single",
        birthday: "",
        parents: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setResidencyDatav1({
        name: "",
        age: "",
        nationality: "Filipino",
        gender: "Male",
        civilStatus: "Single",
        streetAddress: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setResidencyDatav2({
        name: "",
        age: "",
        streetAddress: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setAppearanceData({
        name: "",
        appearanceDate: "",
        eventProgram: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setGoodMoralData({
        name: "",
        age: "",
        streetAddress: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
        gender: "He",
      });
      setBrgyCertData({
        name: "",
        birthday: "",
        gender: "Male",
        relationship: "Son",
        parents: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setHealthData({
        name: "",
        puiAndPum: "PUI",
        age: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setMortuaryData({
        salutations: "Mr",
        name: "",
        age: "",
        streetAddress: "",
        dateOfDeath: "",
        cause: "",
        seniorID: "",
        seniorIssuanceDate: "",
        heirName: "",
        requestorLastName: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setTravelData({
        name: "",
        civilStatus: "Single",
        age: "",
        location: "",
        thingsOrAnimalsCarrying: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setBusinessClosureData({
        name: "",
        gender: "Him",
        businessName: "",
        closureDate: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setIndigencyData({
        name: "",
        age: "",
        gender: "Male",
        civilStatus: "Single",
        streetAddress: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setNoIncomeData({
        name: "",
        pronouns: "him",
        age: "",
        streetAddress: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setIncomeData({
        name: "",
        age: "",
        pronouns: "she",
        streetAddress: "",
        businessName: "",
        income: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setTulongHatidData({
        name: "",
        age: "",
        gender: "his",
        streetAddress: "",
        beneficiaryRelationship: "Son",
        beneficiaryName: "",
        dateOfDeath: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setLateRegData({
        name: "",
        gender: "Male",
        birthday: "",
        birthplace: "",
        parents: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setOathData({
        name: "",
        age: "",
        streetAddress: "",
        yearsOfResidence: "",
        dateSigned: "",
        validUntil: "",
      });
      setCouncilAffidavitData({
        name: "",
        nationality: "Filipino",
        streetAddress: "",
        setHandDate: "",
        dateSworned: "",
      });
      setLiveInData({
        name: "",
        label: "Partner",
        streetAddress: "",
        since: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setRelationshipData({
        name: "",
        age: "",
        streetAddress: "",
        daughterInLawName: "",
        daughterInLawAge: "",
        daughterInLawBirthday: "",
        requestor: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setSoloParentData({
        name: "",
        age: "",
        gender: "him",
        streetAddress: "",
        numberOfChildren: "",
        childrenNames: "",
        dateOfIssuance: "",
        validUntil: "",
      });
    } catch (error) {
      console.error("Error modifying DOCX:", error);
    }
  };

  const handleClearanceInputChange = (e) => {
    const { name, value } = e.target;
    setBarangayClearanceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResidencyInputChangeV1 = (e) => {
    const { name, value } = e.target;
    setResidencyDatav1((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResidencyInputChangeV2 = (e) => {
    const { name, value } = e.target;
    setResidencyDatav2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAppearanceInputChange = (e) => {
    const { name, value } = e.target;
    setAppearanceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoodMoralInputChange = (e) => {
    const { name, value } = e.target;
    setGoodMoralData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBrgyCertInputChange = (e) => {
    const { name, value } = e.target;
    setBrgyCertData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHealthInputChange = (e) => {
    const { name, value } = e.target;
    setHealthData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMortuaryInputChange = (e) => {
    const { name, value } = e.target;
    setMortuaryData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTravelInputChange = (e) => {
    const { name, value } = e.target;
    setTravelData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBusinessClosureInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessClosureData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIndigencyInputChange = (e) => {
    const { name, value } = e.target;
    setIndigencyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNoIncomeInputChange = (e) => {
    const { name, value } = e.target;
    setNoIncomeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIncomeInputChange = (e) => {
    const { name, value } = e.target;
    setIncomeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTulongHatidInputChange = (e) => {
    const { name, value } = e.target;
    setTulongHatidData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLateRegInputChange = (e) => {
    const { name, value } = e.target;
    setLateRegData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOathInputChange = (e) => {
    const { name, value } = e.target;
    setOathData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCouncilAffidavitInputChange = (e) => {
    const { name, value } = e.target;
    setCouncilAffidavitData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLiveInInputChange = (e) => {
    const { name, value } = e.target;
    setLiveInData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRelationshipInputChange = (e) => {
    const { name, value } = e.target;
    setRelationshipData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSoloParentInputChange = (e) => {
    const { name, value } = e.target;
    setSoloParentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getCertificateInputs = (type) => {
    switch (type) {
      case "Barangay Clearance":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={barangayClearanceData.name}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>Birth Place:</label>
              <input
                type="text"
                name="birthPlace"
                value={barangayClearanceData.birthPlace}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={barangayClearanceData.age}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>Civil Status:</label>
              <select
                name="civilStatus"
                value={barangayClearanceData.civilStatus}
                onChange={handleClearanceInputChange}
              >
                {civilStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Birthday:</label>
              <input
                type="date"
                name="birthday"
                value={barangayClearanceData.birthday}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>
                Name of Parents{" "}
                <span className="hint">put an 'and' in between</span> :
              </label>
              <input
                type="text"
                name="parents"
                value={barangayClearanceData.parents}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={barangayClearanceData.purpose}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={barangayClearanceData.dateOfIssuance}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={barangayClearanceData.validUntil}
                onChange={handleClearanceInputChange}
              />
            </div>
          </>
        );
      case "Certificate of Residency":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={residencyDatav1.name}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
            <div>
              <label>Nationality:</label>
              <select
                name="nationality"
                value={residencyDatav1.nationality}
                onChange={handleResidencyInputChangeV1}
              >
                {nationalityOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={residencyDatav1.age}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
            <div>
              <label>Civil Status:</label>
              <select
                name="civilStatus"
                value={residencyDatav1.civilStatus}
                onChange={handleResidencyInputChangeV1}
              >
                {civilStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Gender:</label>
              <select
                name="gender"
                value={residencyDatav1.gender}
                onChange={handleResidencyInputChangeV1}
              >
                {genderOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={residencyDatav1.streetAddress}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={residencyDatav1.purpose}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={residencyDatav1.dateOfIssuance}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={residencyDatav1.validUntil}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
          </>
        );
      case "Certification of Residency":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={residencyDatav2.name}
                onChange={handleResidencyInputChangeV2}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={residencyDatav2.age}
                onChange={handleResidencyInputChangeV2}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={residencyDatav2.streetAddress}
                onChange={handleResidencyInputChangeV2}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={residencyDatav2.purpose}
                onChange={handleResidencyInputChangeV2}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={residencyDatav2.dateOfIssuance}
                onChange={handleResidencyInputChangeV2}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={residencyDatav2.validUntil}
                onChange={handleResidencyInputChangeV2}
              />
            </div>
          </>
        );
      case "Certificate of Appearance":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={appearanceData.name}
                onChange={handleAppearanceInputChange}
              />
            </div>
            <div>
              <label>Event/Program</label>
              <input
                type="text"
                name="eventProgram"
                value={appearanceData.eventProgram}
                onChange={handleAppearanceInputChange}
              />
            </div>
            <div>
              <label>Appearance Date:</label>
              <input
                type="date"
                name="appearanceDate"
                value={appearanceData.appearanceDate}
                onChange={handleAppearanceInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={appearanceData.dateOfIssuance}
                onChange={handleAppearanceInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={appearanceData.validUntil}
                onChange={handleAppearanceInputChange}
              />
            </div>
          </>
        );
      case "Certificate of Good Moral":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={goodMoralData.name}
                onChange={handleGoodMoralInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={goodMoralData.age}
                onChange={handleGoodMoralInputChange}
              />
            </div>
            <div>
              <label>Gender:</label>
              <select
                name="gender"
                value={goodMoralData.gender}
                onChange={handleGoodMoralInputChange}
              >
                {["He", "She"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={goodMoralData.streetAddress}
                onChange={handleGoodMoralInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={goodMoralData.purpose}
                onChange={handleGoodMoralInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={goodMoralData.dateOfIssuance}
                onChange={handleGoodMoralInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={goodMoralData.validUntil}
                onChange={handleGoodMoralInputChange}
              />
            </div>
          </>
        );
      case "Barangay Certification":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={brgyCertData.name}
                onChange={handleBrgyCertInputChange}
              />
            </div>
            <div>
              <label>Gender:</label>
              <select
                name="gender"
                value={brgyCertData.gender}
                onChange={handleBrgyCertInputChange}
              >
                {genderOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Relationship:</label>
              <select
                name="relationship"
                value={brgyCertData.relationship}
                onChange={handleBrgyCertInputChange}
              >
                {relationshipOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Birthday:</label>
              <input
                type="date"
                name="birthday"
                value={brgyCertData.birthday}
                onChange={handleBrgyCertInputChange}
              />
            </div>
            <div>
              <label>
                Name of Parents{" "}
                <span className="hint">put an 'and' in between</span> :
              </label>
              <input
                type="text"
                name="parents"
                value={brgyCertData.parents}
                onChange={handleBrgyCertInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={brgyCertData.purpose}
                onChange={handleBrgyCertInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={brgyCertData.dateOfIssuance}
                onChange={handleBrgyCertInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={brgyCertData.validUntil}
                onChange={handleBrgyCertInputChange}
              />
            </div>
          </>
        );
      case "Barangay Health Certification":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={healthData.name}
                onChange={handleHealthInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={healthData.age}
                onChange={handleHealthInputChange}
              />
            </div>
            <div>
              <label>PUI AND/OR PUM:</label>
              <select
                name="puiAndPum"
                value={healthData.puiAndPum}
                onChange={handleHealthInputChange}
              >
                {["PUI", "PUM", "PUI and PUM"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={healthData.purpose}
                onChange={handleHealthInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={healthData.dateOfIssuance}
                onChange={handleHealthInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={healthData.validUntil}
                onChange={handleHealthInputChange}
              />
            </div>
          </>
        );
      case "Certification of Mortuary":
        return (
          <>
            <div>
              <label>Salutations:</label>
              <select
                name="salutations"
                value={mortuaryData.salutations}
                onChange={handleMortuaryInputChange}
              >
                {["Mr", "Ms", "Mrs"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={mortuaryData.name}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={mortuaryData.age}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Street Address:</label>
              <input
                type="text"
                name="streetAddress"
                value={mortuaryData.streetAddress}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Cause of Death:</label>
              <input
                type="text"
                name="cause"
                value={mortuaryData.cause}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Date of Death:</label>
              <input
                type="date"
                name="dateOfDeath"
                value={mortuaryData.dateOfDeath}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Senior Citizen ID:</label>
              <input
                type="text"
                name="seniorID"
                value={mortuaryData.seniorID}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Date of Senior ID Issuance:</label>
              <input
                type="date"
                name="seniorIssuanceDate"
                value={mortuaryData.seniorIssuanceDate}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Heir Name:</label>
              <input
                type="text"
                name="heirName"
                value={mortuaryData.heirName}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Requestor Surname:</label>
              <input
                type="text"
                name="requestorLastName"
                value={mortuaryData.requestorLastName}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={mortuaryData.dateOfIssuance}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={mortuaryData.validUntil}
                onChange={handleMortuaryInputChange}
              />
            </div>
          </>
        );
      case "Permit to Travel":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={travelData.name}
                onChange={handleTravelInputChange}
              />
            </div>
            <div>
              <label>Civil Status:</label>
              <select
                name="civilStatus"
                value={travelData.civilStatus}
                onChange={handleTravelInputChange}
              >
                {civilStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={travelData.age}
                onChange={handleTravelInputChange}
              />
            </div>
            <div>
              <label>Location:</label>
              <input
                type="text"
                name="location"
                value={travelData.location}
                onChange={handleTravelInputChange}
              />
            </div>
            <div>
              <label>
                Things/Animals Carrying{" "}
                <span className="hint">Ex. 15 Roosters, etc.</span> :
              </label>
              <input
                type="text"
                name="thingsOrAnimalsCarrying"
                value={travelData.thingsOrAnimalsCarrying}
                onChange={handleTravelInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={travelData.dateOfIssuance}
                onChange={handleTravelInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={travelData.validUntil}
                onChange={handleTravelInputChange}
              />
            </div>
          </>
        );
      case "Certification of Business Closure":
        return (
          <>
            <div>
              <label>Owner Name:</label>
              <input
                type="text"
                name="name"
                value={businessClosureData.name}
                onChange={handleBusinessClosureInputChange}
              />
            </div>
            <div>
              <label>Gender:</label>
              <select
                name="gender"
                value={businessClosureData.gender}
                onChange={handleBusinessClosureInputChange}
              >
                {["Him", "Her"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Business Name:</label>
              <input
                type="text"
                name="businessName"
                value={businessClosureData.businessName}
                onChange={handleBusinessClosureInputChange}
              />
            </div>
            <div>
              <label>Closure Date:</label>
              <input
                type="date"
                name="closureDate"
                value={businessClosureData.closureDate}
                onChange={handleBusinessClosureInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={businessClosureData.purpose}
                onChange={handleBusinessClosureInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={businessClosureData.dateOfIssuance}
                onChange={handleBusinessClosureInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={businessClosureData.validUntil}
                onChange={handleBusinessClosureInputChange}
              />
            </div>
          </>
        );
      case "Certificate of Indigency":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={indigencyData.name}
                onChange={handleIndigencyInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={indigencyData.age}
                onChange={handleIndigencyInputChange}
              />
            </div>
            <div>
              <label>Gender:</label>
              <select
                name="gender"
                value={indigencyData.gender}
                onChange={handleIndigencyInputChange}
              >
                {genderOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Civil Status:</label>
              <select
                name="civilStatus"
                value={indigencyData.civilStatus}
                onChange={handleIndigencyInputChange}
              >
                {civilStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={indigencyData.streetAddress}
                onChange={handleIndigencyInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={indigencyData.purpose}
                onChange={handleIndigencyInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={indigencyData.dateOfIssuance}
                onChange={handleIndigencyInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={indigencyData.validUntil}
                onChange={handleIndigencyInputChange}
              />
            </div>
          </>
        );
      case "Certificate of No Income":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={noIncomeData.name}
                onChange={handleNoIncomeInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={noIncomeData.age}
                onChange={handleNoIncomeInputChange}
              />
            </div>
            <div>
              <label>Gender:</label>
              <select
                name="pronouns"
                value={noIncomeData.pronouns}
                onChange={handleNoIncomeInputChange}
              >
                {["him", "her", "they"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={noIncomeData.streetAddress}
                onChange={handleNoIncomeInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={noIncomeData.purpose}
                onChange={handleNoIncomeInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={noIncomeData.dateOfIssuance}
                onChange={handleNoIncomeInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={noIncomeData.validUntil}
                onChange={handleNoIncomeInputChange}
              />
            </div>
          </>
        );
      case "Certificate of Income":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={incomeData.name}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={incomeData.age}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Gender:</label>
              <select
                name="pronouns"
                value={incomeData.pronouns}
                onChange={handleIncomeInputChange}
              >
                {["she", "he", "they"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={incomeData.streetAddress}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Business Name:</label>
              <input
                type="text"
                name="businessName"
                value={incomeData.businessName}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Monthly Income:</label>
              <input
                type="number"
                name="income"
                value={incomeData.income}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={incomeData.purpose}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={incomeData.dateOfIssuance}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={incomeData.validUntil}
                onChange={handleIncomeInputChange}
              />
            </div>
          </>
        );
      case "Libreng Tulong Hatid":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={tulongHatidData.name}
                onChange={handleTulongHatidInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={tulongHatidData.age}
                onChange={handleTulongHatidInputChange}
              />
            </div>
            <div>
              <label>Gender:</label>
              <select
                name="gender"
                value={tulongHatidData.gender}
                onChange={handleTulongHatidInputChange}
              >
                {["his", "her"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={tulongHatidData.streetAddress}
                onChange={handleTulongHatidInputChange}
              />
            </div>
            <div>
              <label>Relationship to the Beneficiary:</label>
              <select
                name="beneficiaryRelationship"
                value={tulongHatidData.beneficiaryRelationship}
                onChange={handleTulongHatidInputChange}
              >
                {relationshipOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Beneficiary Name:</label>
              <input
                type="text"
                name="beneficiaryName"
                value={tulongHatidData.beneficiaryName}
                onChange={handleTulongHatidInputChange}
              />
            </div>
            <div>
              <label>Date of Death:</label>
              <input
                type="date"
                name="dateOfDeath"
                value={tulongHatidData.dateOfDeath}
                onChange={handleTulongHatidInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={tulongHatidData.dateOfIssuance}
                onChange={handleTulongHatidInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={tulongHatidData.validUntil}
                onChange={handleTulongHatidInputChange}
              />
            </div>
          </>
        );
      case "Certification of Late Registration":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={lateRegData.name}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>Gender:</label>
              <select
                name="gender"
                value={lateRegData.gender}
                onChange={handleLateRegInputChange}
              >
                {genderOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={lateRegData.streetAddress}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>Date of Birth:</label>
              <input
                type="date"
                name="birthday"
                value={lateRegData.birthday}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>Place of Birth:</label>
              <input
                type="text"
                name="birthplace"
                value={lateRegData.birthplace}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>
                Parents Fullname{" "}
                <span className="hint">put an 'and' in between</span> :
              </label>
              <input
                type="text"
                name="parents"
                value={lateRegData.parents}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={lateRegData.purpose}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={lateRegData.dateOfIssuance}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={lateRegData.validUntil}
                onChange={handleLateRegInputChange}
              />
            </div>
          </>
        );
      case "Oath of Undertaking":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={oathData.name}
                onChange={handleOathInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={oathData.age}
                onChange={handleOathInputChange}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={oathData.streetAddress}
                onChange={handleOathInputChange}
              />
            </div>
            <div>
              <label>Years of Residence:</label>
              <input
                type="number"
                name="yearsOfResidence"
                value={oathData.yearsOfResidence}
                onChange={handleOathInputChange}
              />
            </div>
            <div>
              <label>Date Signed:</label>
              <input
                type="date"
                name="dateSigned"
                value={oathData.dateSigned}
                onChange={handleOathInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={oathData.validUntil}
                onChange={handleOathInputChange}
              />
            </div>
          </>
        );
      case "Sworn Affidavit of the Barangay Council":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={councilAffidavitData.name}
                onChange={handleCouncilAffidavitInputChange}
              />
            </div>
            <div>
              <label>Nationality:</label>
              <select
                name="nationality"
                value={councilAffidavitData.nationality}
                onChange={handleCouncilAffidavitInputChange}
              >
                {nationalityOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={councilAffidavitData.streetAddress}
                onChange={handleCouncilAffidavitInputChange}
              />
            </div>
            <div>
              <label>Hand Setting Date:</label>
              <input
                type="date"
                name="setHandDate"
                value={councilAffidavitData.setHandDate}
                onChange={handleCouncilAffidavitInputChange}
              />
            </div>
            <div>
              <label>Date Sworned:</label>
              <input
                type="date"
                name="dateSworned"
                value={councilAffidavitData.dateSworned}
                onChange={handleCouncilAffidavitInputChange}
              />
            </div>
          </>
        );
      case "Certification of Live In Partner":
        return (
          <>
            <div>
              <label>
                Names <span className="hint">Woman's and Man's</span> :{" "}
              </label>
              <input
                type="text"
                name="partnersName"
                value={liveInData.partnersName}
                onChange={handleLiveInInputChange}
              />
            </div>
            <div>
              <label>Relationship Label:</label>
              <select
                name="label"
                value={liveInData.label}
                onChange={handleLiveInInputChange}
              >
                {["Partner", "Couples"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={liveInData.streetAddress}
                onChange={handleLiveInInputChange}
              />
            </div>
            <div>
              <label>Since</label>
              <input
                type="date"
                name="since"
                value={liveInData.since}
                onChange={handleLiveInInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={liveInData.purpose}
                onChange={handleLiveInInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={liveInData.dateOfIssuance}
                onChange={handleLiveInInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={liveInData.validUntil}
                onChange={handleLiveInInputChange}
              />
            </div>
          </>
        );
      case "Certification of Relationship":
        return (
          <>
            <div>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={relationshipData.name}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={relationshipData.age}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={relationshipData.streetAddress}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Daughter-In-Law Name</label>
              <input
                type="text"
                name="daughterInLawName"
                value={relationshipData.daughterInLawName}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Daughter-In-Law Age</label>
              <input
                type="number"
                name="daughterInLawAge"
                value={relationshipData.daughterInLawAge}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Daughter-In-Law Birthday</label>
              <input
                type="date"
                name="daughterInLawBirthday"
                value={relationshipData.daughterInLawBirthday}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Requested By</label>
              <input
                type="text"
                name="requestor"
                value={relationshipData.requestor}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={relationshipData.purpose}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={relationshipData.dateOfIssuance}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={relationshipData.validUntil}
                onChange={handleRelationshipInputChange}
              />
            </div>
          </>
        );
      case "Solo Parent Certification":
        return (
          <>
            <div>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={soloParentData.name}
                onChange={handleSoloParentInputChange}
              />
            </div>
            <div>
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={soloParentData.age}
                onChange={handleSoloParentInputChange}
              />
            </div>
            <div>
              <label>Gender:</label>
              <select
                name="pronouns"
                value={soloParentData.pronouns}
                onChange={handleSoloParentInputChange}
              >
                {["him", "her", "they"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={soloParentData.streetAddress}
                onChange={handleSoloParentInputChange}
              />
            </div>
            <div>
              <label>Number of Children</label>
              <input
                type="number"
                name="numberOfChildren"
                value={soloParentData.numberOfChildren}
                onChange={handleSoloParentInputChange}
              />
            </div>
            <div>
              <label>Children Names</label>
              <input
                type="text"
                name="childrenNames"
                value={soloParentData.childrenNames}
                onChange={handleSoloParentInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={soloParentData.dateOfIssuance}
                onChange={handleSoloParentInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={soloParentData.validUntil}
                onChange={handleSoloParentInputChange}
              />
            </div>
          </>
        );
      default:
        console.log("Nothing...");
    }
  };

  return (
    <div className="certificate-manager-container">
      <button onClick={onBack} className="back-btn">
        Back to Menu
      </button>

      <header className="certificate-header">
        <h1>Certificate Management</h1>
        <p>Download and manage official barangay certificates and documents</p>
      </header>

      <div className="search-container">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {downloadStatus.error && (
        <div className="error-message">{downloadStatus.error}</div>
      )}

      <div className="document-sections">
        {searchTerm ? (
          <div className="search-results">
            {filteredDocuments?.length === 0 ? (
              <div className="no-results">
                No documents found matching your search.
              </div>
            ) : (
              <div className="document-list">
                {filteredDocuments?.map((doc, index) => (
                  <div
                    key={index}
                    className="document-item"
                    onClick={() =>
                      setCertificates((prevCertificates) => {
                        const updatedDocs = prevCertificates[doc.section].map(
                          (d) =>
                            d.name === doc.name
                              ? { ...d, isOpen: !d.isOpen }
                              : d
                        );

                        return {
                          ...prevCertificates,
                          [doc.section]: updatedDocs,
                        };
                      })
                    }
                  >
                    <div className="document-icon">
                      <FileText size={20} />
                      <div className="document-details">
                        <h4>{doc.name}</h4>
                        <p>{doc.description}</p>
                        <span className="document-category">
                          {doc.category}
                        </span>
                      </div>
                    </div>

                    {doc.isOpen && (
                      <>
                        <div
                          className="certificate-inputs-div"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {getCertificateInputs(doc.name)}
                        </div>
                        <button
                          className={`download-button ${
                            downloadStatus.loading ? "loading" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(
                              doc.templateUrls || doc.templateUrl,
                              doc.name
                            );
                          }}
                          disabled={downloadStatus.loading}
                          title="Download template"
                        >
                          <Download size={16} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          Object.entries(certificates).map(([section, docs]) => (
            <div key={section} className="document-section">
              <div className="section-header">
                <h3 className="section-title">{section}</h3>
              </div>
              <div className="document-list">
                {docs.map((doc, index) => (
                  <div
                    key={index}
                    className="document-item"
                    onClick={() =>
                      setCertificates((prevCertificates) => {
                        const updatedSectionDocs = prevCertificates[
                          section
                        ].map((d, i) =>
                          i === index ? { ...d, isOpen: !d.isOpen } : d
                        );

                        return {
                          ...prevCertificates,
                          [section]: updatedSectionDocs,
                        };
                      })
                    }
                  >
                    <div className="document-icon">
                      <FileText size={20} />
                      <div className="document-details">
                        <h4>{doc.name}</h4>
                        <p>{doc.description}</p>
                      </div>
                    </div>

                    {doc.isOpen && (
                      <>
                        <div
                          className="certificate-inputs-div"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {getCertificateInputs(doc.name)}
                        </div>
                        <button
                          className={`download-button ${
                            downloadStatus.loading ? "loading" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(
                              doc.templateUrls || doc.templateUrl,
                              doc.name
                            );
                          }}
                          disabled={downloadStatus.loading}
                          title="Download template"
                        >
                          <Download size={16} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <PermissionErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};

export default CertificateManager;
