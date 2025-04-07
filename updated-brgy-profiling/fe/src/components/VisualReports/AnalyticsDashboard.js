// src/components/VisualReports/AnalyticsDashboard.js
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowUpIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { checkPermission, PERMISSIONS } from '../Permission/Permissions';
import PermissionErrorModal from '../Permission/PermissionErrorModal';
import './AnalyticsDashboard.css';
import axiosInstance from '../../axios';
import { toast } from "react-toastify";

const AnalyticsDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [summaryData, setSummaryData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [specialSectorsData, setSpecialSectorsData] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [timePeriod, setTimePeriod] = useState('Yearly'); // Default period
  // Families are no longer used for processing, since we’re getting API data directly.

  useEffect(() => {
    const getReports = async () => {
      try {
        const res = await axiosInstance.get('/residents/statistics');
        if (res.data && res.data.success) {
          const stats = res.data.data;
          console.log('Data from API:', stats);

          // Build summaryData based on API stats
          setSummaryData([
            {
              title: "Total Population",
              value: stats.totalPopulation,
              change: "", // You may adjust if you want dynamic text here
              subtext: "Total residents"
            },
            {
              title: "Total Households",
              value: stats.totalHouseholds,
              change: "",
              subtext: "Registered households"
            },
            {
              title: "Senior Citizens",
              value: stats.seniorCount,
              change: `${stats.seniorPercentage}%`,
              subtext: "of population"
            },
            {
              title: "PWD Residents",
              value: stats.pwdCount,
              change: `${stats.pwdPercentage}%`,
              subtext: "of population"
            },
            {
              title: "Solo Parents",
              value: stats.soloParentCount,
              change: `${stats.soloParentPercentage}%`,
              subtext: "of population"
            },
            {
              title: "OFW Members",
              value: stats.ofwCount,
              change: `${stats.ofwPercentage}%`,
              subtext: "of population"
            },
            {
              title: "Immigrants",
              value: stats.immigrantCount,
              change: `${stats.immigrantPercentage}%`,
              subtext: "of population"
            },
            {
              title: "Out of School Youth",
              value: stats.osyCount,
              change: `${stats.osyPercentage}%`,
              subtext: "of population"
            }
          ]);

          // Build ageData from the API's ageGroups data. Only include groups with count > 0.
          const ageGroups = stats.ageGroups || {};
          const processedAgeData = Object.keys(ageGroups)
            .filter(key => ageGroups[key].count > 0)
            .map(key => ({
              name: key,
              value: ageGroups[key].count,
              percentage: ageGroups[key].percentage
            }));
          setAgeData(processedAgeData);

          // Build special sectors data
          const processedSectorsData = [
            { name: "Senior Citizens", value: stats.seniorCount },
            { name: "PWD", value: stats.pwdCount },
            { name: "Solo Parents", value: stats.soloParentCount },
            { name: "OFW Members", value: stats.ofwCount },
            { name: "Immigrants", value: stats.immigrantCount },
            { name: "Out of School Youth", value: stats.osyCount }
          ].filter(item => item.value > 0);
          setSpecialSectorsData(processedSectorsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    getReports();

    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);

    if (!checkPermission(user, PERMISSIONS.REPORTS)) {
      setShowErrorModal(true);
      return;
    }
  }, []);

  // The timePeriod and families processing have been removed,
  // because backend API provides aggregated statistics.

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
    // If needed, trigger a new API call with period parameter (not shown here)
  };

  const exportReport = async () => {
    if (!checkPermission(currentUser, PERMISSIONS.REPORTS)) {
      setShowErrorModal(true);
      return;
    }
    
    try {
      await axiosInstance.post('/system-logs', {
        action: "Download",
        module: "Analytics Report Export",
        user: JSON.parse(localStorage.getItem('userId') || '""'),
        details: `User ${currentUser?.username || 'unknown'} exported an analytics report on ${new Date().toLocaleString()}`
      });
    } catch (error) {
      console.error('Error logging export action:', error);
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(20);
    doc.text('Barangay Darasa Analytics Report', pageWidth/2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth/2, 30, { align: 'center' });
    
    // Using first summaryData change text or fallback text
    const periodDisplay = summaryData[0]?.change || timePeriod;
    doc.text(`Period: ${periodDisplay}`, pageWidth/2, 40, { align: 'center' });

    doc.setFontSize(16);
    doc.text('Summary Statistics', 14, 50);
    
    const summaryTableData = summaryData.map(item => [
      item.title,
      item.value.toString(),
      item.change
    ]);

    doc.autoTable({
      startY: 55,
      head: [['Category', 'Value', 'Change']],
      body: summaryTableData,
      theme: 'grid',
      headStyles: { fillColor: [66, 153, 225] },
      styles: { fontSize: 12 }
    });

    doc.setFontSize(16);
    doc.text('Population by Age Group', 14, doc.lastAutoTable.finalY + 20);

    const ageTableData = ageData.map(item => [
      item.name,
      item.value.toString(),
      `${item.percentage}%`
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 25,
      head: [['Age Group', 'Count', 'Percentage']],
      body: ageTableData,
      theme: 'grid',
      headStyles: { fillColor: [66, 153, 225] }
    });

    doc.setFontSize(16);
    doc.text('Special Sectors Distribution', 14, doc.lastAutoTable.finalY + 20);

    const sectorsTableData = specialSectorsData.map(item => [
      item.name,
      item.value.toString(),
      `${((item.value / (summaryData[0]?.value || 1)) * 100).toFixed(1)}%`
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 25,
      head: [['Sector', 'Count', 'Percentage']],
      body: sectorsTableData,
      theme: 'grid',
      headStyles: { fillColor: [66, 153, 225] }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth/2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    const period = timePeriod.toLowerCase();
    doc.save(`Barangay_Darasa_Analytics_${period}_${new Date().toISOString().split('T')[0]}.pdf`);

    toast.success("Report exported successfully!")
  };

  const COLORS = ['#4C51BF', '#48BB78', '#4299E1', '#ED8936', '#9F7AEA', '#ED64A6'];

  const NoDataMessage = () => (
    <div style={{ 
      height: "100%", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      color: "#666",
      fontStyle: "italic"
    }}>
      No data available for the selected time period
    </div>
  );

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div className="welcome-section">
          <div className="brgy-logo-container">
            <img 
              src="/images/darasa-logo.png" 
              alt="Darasa Logo" 
              className="brgy-logo" 
              onError={(e) => console.error('Error loading image:', e)}
            />
          </div>
          <div className="title-section">
            <h1>Barangay Darasa</h1>
            <p>Profiling System Analytics Dashboard</p>
          </div>
          <div className="controls-section">
            <select 
              className="time-select" 
              value={timePeriod} 
              onChange={handleTimePeriodChange}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
            <button className="export-button" onClick={exportReport}>
              Export Report
            </button>
          </div>
        </div>

        <div className="summary-grid">
          {summaryData.map((item, index) => (
            <div key={index} className="summary-card">
              <div className="card-content">
                <p className="card-title">{item.title}</p>
                <div className="value-section">
                  <h2 className="card-value">{item.value}</h2>
                  <span className="card-change">
                    <ArrowUpIcon className="h-4 w-4" />
                    {item.change}
                  </span>
                </div>
                <p className="card-subtext">{item.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="charts-grid">
          <div className="chart-container">
            <h3 className="chart-title">Population by Age Group</h3>
            <div className="chart-content">
              {ageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={ageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      innerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {ageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Population"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <NoDataMessage />
              )}
            </div>
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Special Sectors Distribution</h3>
            <div className="chart-content">
              {specialSectorsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={specialSectorsData} layout="vertical" margin={{ left: 150 }}>
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={140} />
                    <Tooltip formatter={(value) => [`${value} residents`, ""]} />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      fill="#4299E1" 
                      radius={[0, 4, 4, 0]}
                      label={{ position: 'right', formatter: (value) => value }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <NoDataMessage />
              )}
            </div>
          </div>
        </div>
      </div>
      <PermissionErrorModal 
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};

export default AnalyticsDashboard;
