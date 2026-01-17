// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/HomePage';
import BorrowerManagement from './components/BorrowerManagement';
import LoansList from './components/LoansList';
import RepaymentManagement from './components/RepaymentManagement';
import Analytics from './components/Analytics';
import StaffManagement from './components/StaffManagement';
import GuarantorManagement from './components/GuarantorManagement';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Component to handle redirection based on auth
const AppRoutes = () => {
    const { admin, loading } = useAuth();

    console.log('🔄 AppRoutes - Admin:', admin, 'Loading:', loading);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {admin && <Navigation />}
            <Routes>
                {/* Public route - redirect to home if already logged in */}
                <Route 
                    path="/login" 
                    element={admin ? <Navigate to="/" replace /> : <Login />} 
                />
                
                {/* Protected routes */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                } />
                <Route path="/borrowers" element={
                    <ProtectedRoute>
                        <BorrowerManagement />
                    </ProtectedRoute>
                } />
                <Route path="/loans" element={
                    <ProtectedRoute>
                        <LoansList />
                    </ProtectedRoute>
                } />
                <Route path="/repayments" element={
                    <ProtectedRoute>
                        <RepaymentManagement />
                    </ProtectedRoute>
                } />
                <Route path="/guarantors" element={
                    <ProtectedRoute>
                        <GuarantorManagement />
                    </ProtectedRoute>
                } />
                <Route path="/staff-management" element={
                    <ProtectedRoute>
                        <StaffManagement />
                    </ProtectedRoute>
                } />
                           
                <Route path="/analytics" element={
                    <ProtectedRoute>
                        <Analytics />
                    </ProtectedRoute>
                } />
                
                {/* Catch all route - redirect based on auth status */}
                <Route 
                    path="*" 
                    element={<Navigate to={admin ? "/" : "/login"} replace />} 
                />
            </Routes>
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <AppRoutes />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;