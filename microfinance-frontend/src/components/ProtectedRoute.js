// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Container } from 'react-bootstrap';

const ProtectedRoute = ({ children }) => {
    const { admin, loading } = useAuth();

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Loading...</span>
            </Container>
        );
    }

    return admin ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;