// src/utils/userManager.js

export const userRoles = {
    systemadmin: {
        permissions: ['manage_users', 'manage_system', 'view_all', 'edit_all', 'delete_all'],
        label: 'System Administrator'
    },
    staff: {
        permissions: [], // Will be set based on checkbox selection
        label: 'Editor'
    },
    user: {
        permissions: ['view_menu_only'],
        label: 'Viewer'
    }
};

// Initialize default admin user if none exists
export const initializeUsers = () => {
    const existingUsers = localStorage.getItem('users');
    if (!existingUsers) {
        const defaultAdmin = {
            id: 1,
            username: 'systemadmin',
            password: 'admin123',
            email: 'systemadmin@example.com',
            role: 'systemadmin',
            status: 'active',
            permissions: ['manage_users', 'manage_system', 'view_all', 'edit_all', 'delete_all']
        };
        localStorage.setItem('users', JSON.stringify([defaultAdmin]));
    }
};

export const addUser = (userData) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const newUser = {
        id: Date.now(),
        ...userData,
        status: 'active',
        permissions: userRoles[userData.role]?.permissions || []
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
};

export const updateUser = (userId, userData) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index] = { ...users[index], ...userData };
        localStorage.setItem('users', JSON.stringify(users));
        return users[index];
    }
    return null;
};

export const deleteUser = (userId) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const filteredUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
};

export const getUsers = () => {
    return JSON.parse(localStorage.getItem('users')) || [];
};

export const hasPermission = (user, permission) => {
    if (!user) return false;

    switch (user.role) {
        case 'systemadmin':
            return true;
        case 'staff':
            if (user.permissions.includes('all')) {
                return true;
            }
            return user.permissions.includes(permission);
        case 'user':
            return permission === 'view_menu_only';
        default:
            return false;
    }
};