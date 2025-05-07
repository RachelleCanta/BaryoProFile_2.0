// src/components/UserManagement/userActions.js

// Get all users
export const getUsers = () => {
    return JSON.parse(localStorage.getItem('users')) || [];
};

// Add new user
export const addUser = (userData) => {
    const users = getUsers();
    const newUser = {
        id: Date.now(),
        ...userData,
        status: 'active',
        permissions: getPermissionsForRole(userData.role, userData.selectedPermission)
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
};

// Update existing user
export const updateUser = (userId, userData) => {
    const users = getUsers();
    const index = users.findIndex(user => user.id === userId);
    if (index !== -1) {
        const updatedPermissions = getPermissionsForRole(userData.role, userData.selectedPermission);
        users[index] = { 
            ...users[index], 
            ...userData,
            permissions: updatedPermissions
        };
        localStorage.setItem('users', JSON.stringify(users));
        return users[index];
    }
    return null;
};

// Delete user
export const deleteUser = (userId) => {
    const users = getUsers();
    const updatedUsers = users.filter(user => user.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return updatedUsers;
};

// Get permissions based on role and selected permission type
const getPermissionsForRole = (role, selectedPermission) => {
    if (role === 'systemadmin') {
        return ['view_reports', 'add', 'edit', 'delete', 'manage_users', 'manage_system'];
    }
    
    if (role === 'user') {
        return ['view_reports'];
    }
    
    // For staff role
    const basePermissions = ['view_reports'];
    switch (selectedPermission) {
        case 'add_only':
            return [...basePermissions, 'add'];
        case 'edit_only':
            return [...basePermissions, 'edit'];
        case 'delete_only':
            return [...basePermissions, 'delete'];
        default:
            return basePermissions; // view_only
    }
};

// Check user permissions
export const hasPermission = (user, permission) => {
    if (!user || !user.permissions) return false;

    if (user.role === 'systemadmin') return true;
    
    // Base view permission check
    if (permission === 'view_reports') {
        return user.permissions.includes('view_reports');
    }

    // Specific permission checks
    return user.permissions.includes(permission);
};

// User roles configuration
export const userRoles = {
    systemadmin: {
        label: 'System Administrator',
        permissions: ['view_reports', 'add', 'edit', 'delete', 'manage_users', 'manage_system']
    },
    staff: {
        label: 'Editor',
        permissions: [] // Will be set based on selected permission type
    },
    user: {
        label: 'Viewer',
        permissions: ['view_reports']
    }
};

// Permission types for staff role
export const staffPermissionTypes = {
    view_only: {
        label: 'View Only',
        description: 'Can only view records'
    },
    add_only: {
        label: 'Add Records Only',
        description: 'Can view and add new records'
    },
    edit_only: {
        label: 'Edit Records Only',
        description: 'Can view and edit existing records'
    },
    delete_only: {
        label: 'Delete Records Only',
        description: 'Can view and delete records'
    }
};