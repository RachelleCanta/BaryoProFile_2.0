import { checkPermission, PERMISSIONS } from "../Permission/Permissions";

const  BaseComponent = ({
  index,
  type,
  resident,
  currentUser,
  handleEdit,
  handleDelete,
  ExportToPDF,
  processing,
  setProcessing,
  toggleFamily,
  formatDate,
  expandedFamilies,
}) => {
  function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  return (
    <>
      {type === "all" ? (
        <div key={index} className="family-card">
          <div
            className="family-header"
            onClick={() => toggleFamily(index, resident)}
          >
            <div className="header-content">
              <div className="family-basic-info">
                {/* <h3>{`${resident.headFirstName} ${resident.headLastName}'s Family`}</h3> */}
                <h3>{`${resident.headLastName} Family`}</h3>
                <div className="family-meta">
                  <span>Cluster: {resident.cluster}</span>
                  <span>•</span>
                  <span>Household: {resident.householdNo}</span>
                </div>
              </div>
              <div className="header-badges">
                {parseInt(resident.headAge) >= 60 && (
                  <span className="badge senior">Senior Citizen (Head)</span>
                )}
                {parseInt(resident.spouseAge) >= 60 && (
                  <span className="badge senior">Senior Citizen (Spouse)</span>
                )}
                {resident.additionalInfos?.some(
                  (info) =>
                    info.pwd?.toLowerCase() !== "n/a" &&
                    info.pwd?.toLowerCase() !== "no"
                ) && <span className="badge pwd">PWD</span>}
                {resident.additionalInfos?.some(
                  (info) => info.ofwCountry?.trim().toLowerCase() !== "n/a"
                ) && <span className="badge ofw">OFW</span>}
                {resident.additionalInfos?.some(
                  (info) => info.soloParent?.toLowerCase() === "yes"
                ) && <span className="badge solo-parent">Solo Parent</span>}
                {resident.additionalInfos?.some(
                  (info) => info.pregnant?.toLowerCase() === "yes"
                ) && <span className="badge pregnant">Pregnant</span>}
                {resident.additionalInfos?.some(
                  (info) => info.dropout?.toLowerCase() === "yes"
                ) && (
                  <span className="badge out-of-school">
                    Out of School Youth
                  </span>
                )}
                {resident.additionalInfos?.some(
                  (info) =>
                    info.immigrantNationality?.trim() &&
                    info.immigrantNationality !== "Not an immigrant"
                ) && <span className="badge immigrant">Immigrant</span>}
              </div>
              <div className="action-buttons">
                {checkPermission(currentUser, PERMISSIONS.MANAGE) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(index, resident._id);
                    }}
                    className="edit-btn"
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                )}
                {checkPermission(currentUser, PERMISSIONS.MANAGE) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(resident, resident._id);
                    }}
                    className="delete-btn"
                  >
                    <i className="fas fa-trash"></i>{" "}
                    {resident.deletion?.reason ? "Pending Deletion" : "Delete"}
                  </button>
                )}
                <ExportToPDF
                  data={[resident]}
                  label={"Export Data"}
                  icon={true}
                  isProcessing={processing[resident._id]}
                  setIsProcessing={setProcessing}
                  index={resident._id}
                ></ExportToPDF>
              </div>
            </div>
            <div className="dropdown-arrow">
              {expandedFamilies[index] ? "▼" : "▶"}
            </div>
          </div>

          {expandedFamilies[index] && (
            <div className="family-content">
              <div className="basic-info">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Cluster</label>
                    <span>{resident.cluster}</span>
                  </div>
                  <div className="info-item">
                    <label>Barangay Health Worker</label>
                    <span>{resident.brgyHealthWorker}</span>
                  </div>
                  <div className="info-item">
                    <label>Household Number</label>
                    <span>{resident.householdNo}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Members</label>
                    <span>{resident.totalMembers}</span>
                  </div>
                  <div className="info-item">
                    <label>House/Lot and Block No.</label>
                    <span>{resident.houseLotBlockNo}</span>
                  </div>
                  <div className="info-item">
                    <label>Door No./Apartment Name</label>
                    <span>{resident.doorInput}</span>
                  </div>
                  <div className="info-item">
                    <label>4P's ID No.</label>
                    <span>{resident.fourPsIdNo || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="family-details">
                <div className="section-title">Head of Family</div>
                <div className="family-table-container">
                  <table className="family-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Sex</th>
                        <th>Birthday</th>
                        <th>Place of Birth</th>
                        <th>Nationality</th>
                        <th>House and Lot</th>
                        <th>Water Supply</th>
                        <th>Comfort Room</th>
                        <th>Residence Years</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{`${resident.headFirstName || ""} ${
                          resident.headMiddleName || ""
                        } ${resident.headLastName || ""}`}</td>
                        <td>{resident.headAge || ""}</td>
                        <td>{resident.headSex || ""}</td>
                        <td>{formatDate(resident.headBirthday)}</td>
                        <td>{resident.headPlaceOfBirth || ""}</td>
                        <td>{resident.headNationality || ""}</td>
                        <td>{resident.headHouseAndLot || ""}</td>
                        <td>{resident.headWaterSupply || ""}</td>
                        <td>{resident.headComfortRoom || ""}</td>
                        <td>{resident.headResidence || 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="family-table-container">
                  <table className="family-table">
                    <thead>
                      <tr>
                        <th>Marital Status</th>
                        <th>Religion</th>
                        <th>Ethnicity</th>
                        <th>HLE</th>
                        <th>School Level</th>
                        <th>Place of School</th>
                        <th>Voter</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{resident.headMaritalStatus || ""}</td>
                        <td>{resident.headReligion || ""}</td>
                        <td>{resident.headEthnicity || ""}</td>
                        <td>{resident.headHighestLevelOfEducation || ""}</td>
                        <td>{resident.headSchoolLevel || ""}</td>
                        <td>{resident.headPlaceOfSchool || ""}</td>
                        <td>{resident.headIsRegisteredVoter || ""}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {(resident.spouseFirstName || resident.spouseLastName) && (
                  <>
                    <div className="section-title">Spouse Information</div>
                    <div className="family-table-container">
                      <table className="family-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Sex</th>
                            <th>Birthday</th>
                            <th>Place of Birth</th>
                            <th>Nationality</th>
                            <th>House and Lot</th>
                            <th>Water Supply</th>
                            <th>Comfort Room</th>
                            <th>Residence Years</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{`${resident.spouseFirstName || ""} ${
                              resident.spouseMiddleName || ""
                            } ${resident.spouseLastName || ""}`}</td>
                            <td>{resident.spouseAge || ""}</td>
                            <td>{resident.spouseSex || ""}</td>
                            <td>{formatDate(resident.spouseBirthday)}</td>
                            <td>{resident.spousePlaceOfBirth || ""}</td>
                            <td>{resident.spouseNationality || ""}</td>
                            <td>{resident.headHouseAndLot || ""}</td>
                            <td>{resident.headWaterSupply || ""}</td>
                            <td>{resident.headComfortRoom || ""}</td>
                            <td>{resident.headResidence || 0}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="family-table-container">
                      <table className="family-table">
                        <thead>
                          <tr>
                            <th>Marital Status</th>
                            <th>Religion</th>
                            <th>Ethnicity</th>
                            <th>Voter</th>
                            <th>HLE</th>
                            <th>School Level</th>
                            <th>Place of School</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{resident.spouseMaritalStatus || ""}</td>
                            <td>{resident.spouseReligion || ""}</td>
                            <td>{resident.spouseEthnicity || ""}</td>
                            <td>
                              {resident.spouseIsRegisteredVoter
                                ? "Registered"
                                : "Not Registered" || ""}
                            </td>
                            <td>
                              {resident.spouseHighestLevelOfEducation || ""}
                            </td>
                            <td>{resident.spouseSchoolLevel || ""}</td>
                            <td>{resident.spouseSchoolLevel || ""}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {resident.familyMembers?.length > 0 && (
                  <>
                    <div className="section-title">Family Members</div>
                    <div className="family-table-container">
                      <table className="family-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Sex</th>
                            <th>Relationship</th>
                            <th>Birthday</th>
                            <th>Place of Birth</th>
                            <th>Nationality</th>
                            <th>House and Lot</th>
                            <th>Water Supply</th>
                            <th>Comfort Room</th>
                            <th>Residence Years</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resident.familyMembers?.map((member, idx) => (
                            <tr key={idx}>
                              <td>{`${member.firstName || ""} ${
                                member.middleName || ""
                              } ${member.lastName || ""}`}</td>
                              <td>{member.age || ""}</td>
                              <td>{member.sex || ""}</td>
                              <td>{member.relationship || ""}</td>
                              <td>{formatDate(member.birthday)}</td>
                              <td>{member.placeOfBirth || ""}</td>
                              <td>{member.nationality || ""}</td>
                              <td>{member.houseAndLot || ""}</td>
                              <td>{member.waterSupply || ""}</td>
                              <td>{member.comfortRoom || ""}</td>
                              <td>{member.residence || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="family-table-container">
                      <table className="family-table">
                        <thead>
                          <tr>
                            <th>Marital Status</th>
                            <th>Religion</th>
                            <th>Ethnicity</th>
                            <th>Voter</th>
                            <th>HLE</th>
                            <th>School Level</th>
                            <th>School Place</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resident.familyMembers?.map((member, idx) => (
                            <tr key={idx}>
                              <td>{member.maritalStatus || ""}</td>
                              <td>{member.religion || ""}</td>
                              <td>{member.ethnicity || ""}</td>
                              <td>
                                {member.spouseIsRegisteredVoter
                                  ? "Registered"
                                  : "Not Registered" || ""}
                              </td>
                              <td>{member.hlec || ""}</td>
                              <td>{member.schoolLevel || ""}</td>
                              <td>{member.placeOfSchool || ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {resident.additionalInfos?.length > 0 && (
                  <>
                    <div className="section-title">Additional Information</div>
                    <div className="family-table-container">
                      <table className="family-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Pregnant</th>
                            <th>Family Planning</th>
                            <th>PWD</th>
                            <th>Solo Parent</th>
                            <th>Senior Citizen</th>
                            <th>Maintenance</th>
                            <th>PhilHealth</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resident.additionalInfos?.map((info, idx) => (
                            <tr key={idx}>
                              <td>{info.name || ""}</td>
                              <td>{`${info.pregnant || ""}${
                                info.pregnant === "Yes" && info.pregnantMonths
                                  ? ` (${info.pregnantMonths} months)`
                                  : ""
                              }`}</td>
                              <td>{info.familyPlanning || ""}</td>
                              <td>{info.pwd || ""}</td>
                              <td>{info.soloParent || ""}</td>
                              <td>{info.seniorCitizen || ""}</td>
                              <td>{info.maintenance || ""}</td>
                              <td>{info.philhealth || ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="family-table-container">
                      <table className="family-table">
                        <thead>
                          <tr>
                            {/* <th>House & Lot</th>
                            <th>Water Supply</th>
                            <th>Comfort Room</th> */}
                            <th>OFW Country</th>
                            <th>Years in Service</th>
                            <th>Out of School</th>
                            <th>Immigrant</th>
                            <th>Years of Stay</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resident.additionalInfos?.map((info, idx) => (
                            <tr key={idx}>
                              {/* <td>{info.houseLot || ""}</td>
                              <td>{info.waterSupply || ""}</td>
                              <td>{info.comfortRoom || ""}</td> */}
                              <td>{info.ofwCountry || ""}</td>
                              <td>{info.yearsInService || 0}</td>
                              <td>{info.outOfSchool || ""}</td>
                              <td>{info.immigrantNationality || ""}</td>
                              <td>{info.yearsOfStay || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div key={index} className="filtered-members">
          <div key={index} className="filtered-member-card">
            <div className="member-info">
              <h4>{resident.name}</h4>
              <p>
                Status:{" "}
                {type === "outOfSchool"
                  ? "Out of School Youth"
                  : type === "soloParent"
                  ? "Solo Parent"
                  : capitalizeFirstLetter(type)}
              </p>
              <p>From: {resident.headLastName}'s Family</p>
              <p>
                Cluster: {resident.cluster} • Household: {resident.householdNo}
              </p>

              {/* FOR PREGNANT ONLY */}
              {type === "pregnant" && (
                <>
                  <p>Pregnant Months: {resident.pregnantMonths}</p>
                </>
              )}

              {/* FOR IMMIGRANT ONLY */}
              {type === "immigrant" && (
                <>
                  <p>Nationality: {resident.immigrantNationality}</p>
                  <p>Years of Stay: {resident.yearsOfStay}</p>
                </>
              )}

              {/* FOR SENIOR ONLY */}
              {type === "senior" && (
                <>
                  <p>Role: {resident.relationship}</p>
                  <p>Age: {resident.age}</p>
                </>
              )}

              {/* FOR OFW ONLY */}
              {type === "ofw" && (
                <>
                  <p>Country: {resident.ofwCountry}</p>
                  <p>Years as OFW: {resident.yearsInService}</p>
                </>
              )}
            </div>
            <div className="member-actions">
              {checkPermission(currentUser, PERMISSIONS.MANAGE) && ( // Changed from EDIT to MANAGE
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(index, resident.householdId);
                  }}
                  className="edit-btn"
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
              )}
              {checkPermission(currentUser, PERMISSIONS.MANAGE) && ( // Changed from DELETE to MANAGE
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(resident, resident.householdId);
                  }}
                  className="delete-btn"
                >
                  <i className="fas fa-trash"></i>{" "}
                  {resident.deletion?.reason ? "Pending Deletion" : "Delete"}
                </button>
              )}
              <ExportToPDF
                data={[resident]}
                label={"Export Data"}
                icon={true}
                isProcessing={processing[index]}
                setIsProcessing={setProcessing}
                index={index}
              ></ExportToPDF>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { BaseComponent };
