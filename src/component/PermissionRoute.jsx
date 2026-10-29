
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router';

const PermissionRoute = ({ permission }) => {
    const { can, loading } = useAuth();

    // Wait until authentication/user permissions are loaded
    if (loading) {
        return <div>Loading...</div>;
    }

    // Check permission
    if (permission && !can(permission)) {
        return <Navigate to="/admin/error-403" replace />;
    }

    return <Outlet />;
};

export default PermissionRoute; 