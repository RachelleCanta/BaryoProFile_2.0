import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, FileText } from 'lucide-react';
import { logActivity } from '../../utils/auditLogger';
import { checkPermission, handlePermissionError, PERMISSIONS } from '../Permission/Permissions';
import PermissionErrorModal from '../Permission/PermissionErrorModal';
import './CertificateManager.css';
import axiosInstance from '../../axios';
import { toast } from "react-toastify";

const CertificateManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadStatus, setDownloadStatus] = useState({ loading: false, error: null });
  const [currentUser, setCurrentUser] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);

    if (!checkPermission(user, PERMISSIONS.CERTIFICATES)) {
      setShowErrorModal(true);
        return;
    }
}, []);

  const certificates = {
    "Personal Documents": [
      {
        name: 'Barangay Clearance',
        description: 'Official document certifying individual has no criminal record',
        templateUrls: [
          '/templates/personal/barangay-clearance1.docx',
          '/templates/personal/barangay-clearance2.docx',
          '/templates/personal/barangay-clearance3.docx'
        ]
      },
      {
        name: 'Certificate of Residency',
        description: 'Confirms current residence status in the barangay',
        templateUrls: [
          '/templates/personal/certificate-of-residency1.docx',
          '/templates/personal/certificate-of-residency2.docx'
        ]
      },
      {
        name: 'Certification of Residency',
        description: 'Verifies long-term residency status and history in the barangay',
        templateUrls: '/templates/personal/certification-of-residency.docx'
      },
      {
        name: 'Certificate of Appearance',
        description: 'Certifies individual appeared at the barangay office',
        templateUrl: '/templates/personal/certificate-of-appearance.docx'
      },
      {
        name: 'Certificate of Good Moral',
        description: 'Attests to the good moral character of an individual',
        templateUrl: '/templates/personal/good-moral-certificate.docx'
      },
      {
        name: 'Barangay Certification',
        description: 'General purpose barangay certification',
        templateUrl: [
          '/templates/personal/certification-signedby-K.templo.docx',
          '/templates/personal/certification-signedby-K.barrogo.docx',
          '/templates/personal/certification-signedby-K.villegas.docx',
          '/templates/personal/certification-signedby-K.onsay.docx',
          '/templates/personal/certification-signedby-K.carandang.docx',
          '/templates/personal/certification-signedby-K.arguilles-temp1.docx',
          '/templates/personal/certification-signedby-K.arguilles-temp2.docx',
          '/templates/personal/certification-signedby-K.sumargo-temp1.docx',
          '/templates/personal/certification-signedby-K.sumargo-temp2.docx',
          '/templates/personal/certification-signedby-K.castillo-temp1.docx',
          '/templates/personal/certification-signedby-K.castillo-temp2.docx',
          '/templates/personal/certification-signedby-K.castillo-temp3.docx',
          '/templates/personal/certification-signedby-K.castillo-temp4.docx'
        ]
      }
    ],
    "Health Documents": [
      {
        name: 'Barangay Health Certification',
        description: 'Certifies health status of an individual',
        templateUrl: '/templates/health/health-certification.docx'
      },
      {
        name: 'Certification of Mortuary',
        description: 'Documentation for mortuary services',
        templateUrl: '/templates/health/mortuary-certification.docx'
      }
    ],
    "Travel Documents": [
      {
        name: 'Permit to Travel',
        description: 'Authorization for travel purposes',
        templateUrl: '/templates/travel/travel-permit.docx'
      }
    ],
    "Business Documents": [
      {
        name: 'Business Permit',
        description: 'Official permit to operate a business in the barangay',
        templateUrl: '/templates/business/business-permit.docx'
      },
      {
        name: 'Certification of Business Closure',
        description: 'Official certification of business cessation',
        templateUrl: '/templates/business/business-closure.docx'
      }
    ],
    "Financial Documents": [
      {
        name: 'Certificate of Indigency',
        description: 'Certifies individual as qualified for financial assistance',
        templateUrl: '/templates/financial/certificate-of-indigency.docx'
      },
      {
        name: 'Certificate of No Income',
        description: 'Confirms individual has no regular source of income',
        templateUrl: '/templates/financial/no-income-certificate.docx'
      },
      {
        name: 'Certificate of Income',
        description: 'Confirms individual has a regular source of income',
        templateUrl: '/templates/financial/income-certificate.docx'
      },
      {
        name: 'Libreng Tulong Hatid',
        description: 'Certification for financial assistance with funeral and transportation services for bereaved families',
        templateUrl: '/templates/financial/libreng-tulong-hatid.docx'
      }
    ],
    "Legal Documents": [
      {
        name: 'Certification of Late Registration',
        description: 'Confirms late registration of civil documents',
        templateUrl: '/templates/legal/late-registration-cert.docx'
      },
      {
        name: 'Oath of Undertaking',
        description: 'Legal sworn statement of commitment',
        templateUrl: '/templates/legal/oath-of-undertaking.docx'
      },
      {
        name: 'Sworn Affidavit of the Barangay Council',
        description: 'Official affidavit from the Barangay Council',
        templateUrl: '/templates/legal/council-affidavit.docx'
      }
    ],
    "Relationship Documents": [
      {
        name: 'Certification of Live In Partner',
        description: 'Confirms cohabitation status of partners',
        templateUrl: '/templates/relationship/live-in-partner-certificate.docx'
      },
      {
        name: 'Certification of Relationship',
        description: 'Verifies relationship between two individuals',
        templateUrl: '/templates/relationship/certificate-of-relationship.docx'
      }
    ],
    "Special Documents": [
      {
        name: 'Solo Parent Certification',
        description: 'Certifies status as a solo parent',
        templateUrl: '/templates/special/solo-parent-certificate.docx'
      }
    ]
  };

  const allDocuments = useMemo(() => {
    return Object.entries(certificates).flatMap(([category, docs]) => 
      docs.map(doc => ({
        ...doc,
        category
      }))
    );
  }, []);

  const filteredDocuments = useMemo(() => {
    if (!searchTerm) {
      return null;
    }

    const searchLower = searchTerm.toLowerCase();
    return allDocuments.filter(doc => {
      const nameMatch = doc.name.toLowerCase().includes(searchLower);
      const descriptionMatch = doc.description.toLowerCase().includes(searchLower);
      const templateMatch = (doc.templateUrl && typeof doc.templateUrl === 'string' && 
        doc.templateUrl.toLowerCase().includes(searchLower)) ||
        (doc.templateUrls && Array.isArray(doc.templateUrls) && 
        doc.templateUrls.some(url => url.toLowerCase().includes(searchLower)));
      
      return nameMatch || descriptionMatch || templateMatch;
    });
  }, [searchTerm, allDocuments]);

  const handleDownload = async (templateUrls, certName) => {
    if (!checkPermission(currentUser, PERMISSIONS.CERTIFICATES)) {
        setShowErrorModal(true);
        return;
    }

    setDownloadStatus({ loading: true, error: null });

    try {
        const baseUrl = window.location.origin;
        const urls = Array.isArray(templateUrls) ? templateUrls : [templateUrls];

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const username = currentUser?.username || 'systemadmin';

        await Promise.all(urls.map(async (templateUrl) => {
            const fullUrl = `${baseUrl}${templateUrl}`;

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to download template (${response.status})`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = templateUrl.split('/').pop();
            link.download = filename;

            // // Log the download activity with proper user format
            // logActivity(username, 'Download', 'Certificate Management', {
            //     certificateName: certName,
            //     templateFile: filename,
            //     downloadedAt: new Date().toISOString()
            // });

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }));

        // Make sure the userId is properly formatted before making the API request
        const userId = JSON.parse(localStorage.getItem('userId') || 'null');
        
        await axiosInstance.post("/system-logs", {
          action: "Download",
          module: "Manage Certificate Templates",
          user: userId, // Ensures proper formatting (null if unavailable)
          details: `User ${username} downloaded ${certName} (${
            urls.length > 1 ? "multiple files" : urls[0].split("/").pop()
          })`,
        });

        toast.success(`${certName} File downloaded successfully!`);

        setDownloadStatus({ loading: false, error: null });
    } catch (error) {
        console.error('Download error:', error);
        setDownloadStatus({ 
            loading: false, 
            error: 'Failed to download template. Please try again later.'
        });
    }
};


  return (
    <div className="certificate-manager-container">
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
        <div className="error-message">
          {downloadStatus.error}
        </div>
      )}

      <div className="document-sections">
        {searchTerm ? (
          <div className="search-results">
            {filteredDocuments?.length === 0 ? (
              <div className="no-results">No documents found matching your search.</div>
            ) : (
              <div className="document-list">
                {filteredDocuments?.map((doc, index) => (
                  <div key={index} className="document-item">
                    <div className="document-icon">
                      <FileText size={20} />
                    </div>
                    <div className="document-details">
                      <h4>{doc.name}</h4>
                      <p>{doc.description}</p>
                      <span className="document-category">{doc.category}</span>
                    </div>
                    <button 
                      className={`download-button ${downloadStatus.loading ? 'loading' : ''}`}
                      onClick={() => handleDownload(doc.templateUrls || doc.templateUrl, doc.name)}
                      disabled={downloadStatus.loading}
                      title="Download template"
                    >
                      <Download size={16} />
                    </button>
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
                  <div key={index} className="document-item">
                    <div className="document-icon">
                      <FileText size={20} />
                    </div>
                    <div className="document-details">
                      <h4>{doc.name}</h4>
                      <p>{doc.description}</p>
                    </div>
                    <button 
                      className={`download-button ${downloadStatus.loading ? 'loading' : ''}`}
                      onClick={() => handleDownload(doc.templateUrls || doc.templateUrl, doc.name)}
                      disabled={downloadStatus.loading}
                      title="Download template"
                    >
                      <Download size={16} />
                    </button>
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