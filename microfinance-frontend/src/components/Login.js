// components/Login.js
import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('🔐 Attempting login...');

        try {
            const result = await login(username, password);
            
            if (result.success) {
                console.log('🔐 Login successful, redirecting...');
                navigate('/');
            } else {
                setError(result.error || 'Login failed');
                console.log('🔐 Login failed:', result.error);
            }
        } catch (error) {
            setError('An unexpected error occurred');
            console.error('🔐 Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <Card style={{ width: '400px' }} className="shadow-lg border-0">
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <div className="display-4 mb-3">🏦</div>
                        <h2 className="fw-bold text-primary">Admin Login</h2>
                        <p className="text-muted">Microfinance Loan System</p>
                    </div>
                    
                    {error && (
                        <Alert variant="danger" className="text-center">
                            {error}
                        </Alert>
                    )}
                    
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Username</Form.Label>
                            <Form.Control
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                                className="py-2"
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                                className="py-2"
                            />
                        </Form.Group>
                        
                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100 py-2 fw-semibold" 
                            disabled={loading}
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </Button>
                    </Form>
                    
                    <div className="text-center mt-4">
                        <small className="text-muted">
                            Demo credentials: <strong>admin</strong> / <strong>adminabcd</strong>
                        </small>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;