import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
    roles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ roles }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>; // Replace with a proper spinner later
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />; // Or unauthorized page
    }

    return <Outlet />;
};

export default PrivateRoute;
