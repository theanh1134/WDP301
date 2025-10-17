import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getCurrentUser();
    const isEmailVerified = user?.isEmailVerified;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isEmailVerified) {
        return <Navigate to="/resend-verification" replace />;
    }

    return children;
};

export default ProtectedRoute;
