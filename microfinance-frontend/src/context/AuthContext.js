// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔐 AuthContext - Checking for saved admin session...');
        const loggedInAdmin = localStorage.getItem('admin');
        console.log('🔐 Found in localStorage:', loggedInAdmin);
        
        if (loggedInAdmin) {
            try {
                const adminData = JSON.parse(loggedInAdmin);
                console.log('🔐 Setting admin:', adminData);
                setAdmin(adminData);
            } catch (error) {
                console.error('🔐 Error parsing admin data:', error);
                localStorage.removeItem('admin');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            console.log('🔐 Login attempt:', username);
            
            // Simple hardcoded admin for demo - replace with API call
            if (username === 'admin' && password === 'adminabcd') {
                const adminData = {
                    id: 1,
                    username: 'admin',
                    name: 'System Administrator'
                };
                console.log('🔐 Login successful, setting admin:', adminData);
                setAdmin(adminData);
                localStorage.setItem('admin', JSON.stringify(adminData));
                return { success: true };
            } else {
                console.log('🔐 Login failed: Invalid credentials');
                return { success: false, error: 'Invalid credentials' };
            }
        } catch (error) {
            console.error('🔐 Login error:', error);
            return { success: false, error: 'Login failed' };
        }
    };

    const logout = () => {
        console.log('🔐 Logging out...');
        setAdmin(null);
        localStorage.removeItem('admin');
    };

    const value = {
        admin,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};