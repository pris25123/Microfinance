import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const LoanManagement = () => {
    const [formData, setFormData] = useState({
        borrower_id: '',
        amount: '',
        interest_rate: '',
        tenure: ''
    });
    const [emiResult, setEmiResult] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const calculateEMI = async () => {
        setLoading(true);
        setMessage('');
        setEmiResult('');
        
        try {
            // Validate inputs
            if (!formData.amount || !formData.interest_rate || !formData.tenure) {
                setMessage('❌ Please fill all fields');
                setLoading(false);
                return;
            }

            const response = await axios.post('http://localhost:5000/api/calculate-emi', {
                amount: parseFloat(formData.amount),
                interest_rate: parseFloat(formData.interest_rate),
                tenure: parseInt(formData.tenure)
            }, {
                timeout: 10000
            });

            setEmiResult(`✅ Monthly EMI: ₹${response.data.emi}`);
            
        } catch (error) {
            console.error('EMI Calculation Error:', error);
            
            let errorMessage = '❌ Error calculating EMI: ';
            
            if (error.response) {
                errorMessage += error.response.data?.error || error.response.statusText || 'Server error';
            } else if (error.request) {
                errorMessage += 'No response from server. Please check if backend is running on port 5000.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage += 'Request timeout. Server is taking too long to respond.';
            } else {
                errorMessage += error.message || 'Unknown error occurred';
            }
            
            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const applyForLoan = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        try {
            // Validate all fields
            if (!formData.borrower_id || !formData.amount || !formData.interest_rate || !formData.tenure) {
                setMessage('❌ Please fill all fields');
                setLoading(false);
                return;
            }

            const response = await axios.post('http://localhost:5000/api/loans', formData, {
                timeout: 10000
            });

            setMessage(`✅ ${response.data.message}`);
            setFormData({ borrower_id: '', amount: '', interest_rate: '', tenure: '' });
            setEmiResult('');
            
        } catch (error) {
            console.error('Loan Application Error:', error);
            
            let errorMessage = '❌ Error applying for loan: ';
            
            if (error.response) {
                errorMessage += error.response.data?.error || error.response.statusText || 'Server error';
            } else if (error.request) {
                errorMessage += 'No response from server. Please check if backend is running.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage += 'Request timeout.';
            } else {
                errorMessage += error.message || 'Unknown error occurred';
            }
            
            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">📄 Loan Application & Management</h4>
                        </Card.Header>
                        <Card.Body>
                            {message && (
                                <Alert variant={message.includes('❌') ? 'danger' : 'success'}>
                                    {message}
                                </Alert>
                            )}
                            
                            <Form onSubmit={applyForLoan}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Borrower ID</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="borrower_id"
                                                value={formData.borrower_id}
                                                onChange={handleChange}
                                                placeholder="Enter borrower ID"
                                                min="1"
                                                required
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Loan Amount (₹)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="amount"
                                                value={formData.amount}
                                                onChange={handleChange}
                                                placeholder="Enter loan amount"
                                                min="1"
                                                required
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Interest Rate (%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                name="interest_rate"
                                                value={formData.interest_rate}
                                                onChange={handleChange}
                                                placeholder="Enter interest rate"
                                                min="0.1"
                                                required
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tenure (months)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="tenure"
                                                value={formData.tenure}
                                                onChange={handleChange}
                                                placeholder="Enter tenure"
                                                min="1"
                                                required
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="mb-3">
                                    <Button 
                                        type="button" 
                                        variant="outline-primary" 
                                        onClick={calculateEMI}
                                        className="me-2"
                                        disabled={loading}
                                    >
                                        {loading ? 'Calculating...' : 'Calculate EMI'}
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        variant="primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Applying...' : 'Apply for Loan'}
                                    </Button>
                                </div>
                            </Form>

                            {emiResult && (
                                <Alert variant="info" className="mt-3">
                                    <strong>{emiResult}</strong>
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LoanManagement;