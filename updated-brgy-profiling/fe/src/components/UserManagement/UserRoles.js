const userRoles = {
    systemadmin: {
        permissions: ['manage_users', 'manage_system', 'add', 'edit', 'delete', 'view', 'certificates'],
        label: 'System Administrator'
    },
    staff: {
        permissions: [], // Will be set based on editorType
        label: 'Editor'
    },
    user: {
        permissions: ['view_only'],
        label: 'Viewer'
    }
};

export const hasPermission = (user, permission) => {
    if (!user) return false;

    // System admin has all permissions
    if (user.role === 'systemadmin') return true;

    // For staff members, check their specific editor type
    if (user.role === 'staff') {
        switch (user.editorType) {
            case 'view_only':
                return false;  // Cannot perform any actions
            case 'add_only':
                return permission === 'add';
            case 'edit_only':
                return permission === 'edit';
            case 'delete_only':
                return permission === 'delete';
            case 'all':
                return ['add', 'edit', 'delete', 'certificates'].includes(permission);
            default:
                return false;
        }
    }

    // Regular users can only view
    if (user.role === 'user') {
        return false;
    }

    return false;
};

export default userRoles;