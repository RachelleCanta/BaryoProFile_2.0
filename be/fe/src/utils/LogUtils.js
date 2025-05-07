// src/utils/logUtils.js

export const logActivity = (user, action, module) => {
    const log = {
        timestamp: new Date().toISOString(),
        user: user,
        action: action,
        module: module
    };

    // Get existing logs from localStorage
    const existingLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
    
    // Add new log at the beginning
    existingLogs.unshift(log);
    
    // Store back in localStorage
    localStorage.setItem('systemLogs', JSON.stringify(existingLogs));
};

export const getLogs = () => {
    return JSON.parse(localStorage.getItem('systemLogs') || '[]');
};

export const filterLogs = (logs, searchQuery, selectedActivity) => {
    return logs.filter(log => {
        const matchesSearch = 
            log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.module.toLowerCase().includes(searchQuery.toLowerCase());
            
        const matchesActivity = selectedActivity === 'all' || log.action === selectedActivity;
        
        return matchesSearch && matchesActivity;
    });
};

export const exportLogs = (logs) => {
    const csvContent = [
        ['Timestamp', 'User', 'Action', 'Module'],
        ...logs.map(log => [
            new Date(log.timestamp).toLocaleString(),
            log.user,
            log.action,
            log.module
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
};