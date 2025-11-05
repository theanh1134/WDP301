import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getCurrentUser();
    const isEmailVerified = user?.isEmailVerified;
    // Role is stored as a string directly, not as an object
    const userRole = user?.role;

    console.log('RoleProtectedRoute - User:', user);
    console.log('RoleProtectedRoute - User Role:', userRole);
    console.log('RoleProtectedRoute - Allowed Roles:', allowedRoles);

    // Check if user is authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if email is verified
    if (!isEmailVerified) {
        return <Navigate to="/resend-verification" replace />;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        console.log('Access denied - User role does not match');
        // Redirect to home page if user doesn't have required role
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RoleProtectedRoute;
