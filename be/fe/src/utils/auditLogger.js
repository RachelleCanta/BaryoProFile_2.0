// src/utils/auditLogger.js
export const ACTIONS = {
    CREATE: 'Create', 
    EDIT: 'Edit',
    DELETE: 'Delete',
    VIEW: 'View',
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    DOWNLOAD: 'Download'
};

export const logActivity = (user, action, module, details = {}) => {
    const log = {
        timestamp: new Date().toISOString(),
        user: user,
        action: action,
        module: module,
        details: details,
        metadata: {
            browser: navigator.userAgent,
            platform: navigator.platform,
            ...details
        }
    };

    const existingLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
    existingLogs.unshift(log);
    localStorage.setItem('systemLogs', JSON.stringify(existingLogs));
};

export const logResidentActivity = (user, action, details, metadata = {}) => {
    logActivity(user, action, 'Resident Management', { ...details, ...metadata });
};