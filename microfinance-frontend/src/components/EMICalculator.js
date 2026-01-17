import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col, Spinner, Table } from 'react-bootstrap';
import axios from 'axios';

const EMICalculator = () => {
    const [loanData, setLoanData] = useState({
        amount: '10000',
        interest_rate: '1',
        tenure: '5'
    });
    const [emi, setEmi] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [calculationMethod, setCalculationMethod] = useState('');
    const [repaymentSchedule, setRepaymentSchedule] = useState([]);

    // Client-side EMI calculation as fallback
    const calculateEMIClient = (principal, annualRate, months) => {
        try {
            const monthlyRate = annualRate / 12 / 100;
            const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                       (Math.pow(1 + monthlyRate, months) - 1);
            return isNaN(emi) ? 0 : parseFloat(emi.toFixed(2));
        } catch (err) {
            console.error('Client-side calculation error:', err);
            return 0;
        }
    };

    // Generate repayment schedule
    const generateRepaymentSchedule = (principal, annualRate, months, monthlyEMI) => {
        try {
            let balance = principal;
            const schedule = [];
            const monthlyRate = annualRate / 12 / 100;

            for (let month = 1; month <= months; month++) {
                const interest = balance * monthlyRate;
                const principalComponent = monthlyEMI - interest;
                balance -= principalComponent;

                schedule.push({
                    month,
                    payment: parseFloat(monthlyEMI.toFixed(2)),
                    principal: parseFloat(principalComponent.toFixed(2)),
                    interest: parseFloat(interest.toFixed(2)),
                    balance: Math.max(parseFloat(balance.toFixed(2)), 0)
                });

                if (balance <= 0) break;
            }
            return schedule;
        } catch (err) {
            console.error('Schedule generation error:', err);
            return [];
        }
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setError('');
        setEmi(null);
        setRepaymentSchedule([]);
        setLoading(true);

        const principal = parseFloat(loanData.amount);
        const rate = parseFloat(loanData.interest_rate);
        const tenure = parseInt(loanData.tenure);

        // Client-side validation
        if (!principal || !rate || !tenure) {
            setError('Please fill all fields');
            setLoading(false);
            return;
        }

        if (principal <= 0 || rate <= 0 || tenure <= 0) {
            setError('All values must be greater than zero');
            setLoading(false);
            return;
        }

        try {
            console.log('Sending EMI calculation request...');
            
            // Call backend API with timeout
            const response = await axios.post('http://localhost:5000/api/calculate-emi', {
                amount: principal,
                interest_rate: rate,
                tenure: tenure
            }, {
                timeout: 5000 // 5 second timeout
            });

            console.log('Backend response received:', response.data);
            
            if (response.data && response.data.emi) {
                const calculatedEMI = parseFloat(response.data.emi);
                setEmi(calculatedEMI);
                setCalculationMethod('Backend API');
                
                const schedule = generateRepaymentSchedule(principal, rate, tenure, calculatedEMI);
                setRepaymentSchedule(schedule);
            } else {
                throw new Error('Invalid response from server');
            }
            
        } catch (err) {
            console.error('API Error details:', err);
            
            // Fallback to client-side calculation
            console.log('Using client-side calculation as fallback');
            const calculatedEMI = calculateEMIClient(principal, rate, tenure);
            setEmi(calculatedEMI);
            setCalculationMethod('Client-side (Fallback)');
            
            const schedule = generateRepaymentSchedule(principal, rate, tenure, calculatedEMI);
            setRepaymentSchedule(schedule);
            
            // Set appropriate error message
            if (err.code === 'ECONNABORTED') {
                setError('❌ Request timeout. Server is not responding. Using client-side calculation.');
            } else if (err.response) {
                // Server responded with error status
                setError(`❌ Server error: ${err.response.data?.error || err.response.statusText}. Using client-side calculation.`);
            } else if (err.request) {
                // Request was made but no response received
                setError('❌ Cannot connect to server. Please check if backend is running on port 5000. Using client-side calculation.');
            } else {
                // Other errors
                setError('❌ Error calculating EMI. Using client-side calculation.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoanData(prev => ({
            ...prev,
            [name]: value
        }));
        // Reset results when inputs change
        setEmi(null);
        setError('');
        setRepaymentSchedule([]);
    };

    const handleApplyForLoan = async () => {
        if (!emi) {
            setError('Please calculate EMI first');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/loans', {
                borrower_id: 1,
                amount: loanData.amount,
                interest_rate: loanData.interest_rate,
                tenure: loanData.tenure
            }, {
                timeout: 5000
            });

            setError('');
            alert(`✅ Loan application submitted successfully! Loan ID: ${response.data.loan_id}`);
        } catch (err) {
            let errorMessage = '❌ Error applying for loan: ';
            if (err.response) {
                errorMessage += err.response.data?.error || err.response.statusText;
            } else if (err.request) {
                errorMessage += 'Cannot connect to server. Please check if backend is running.';
            } else {
                errorMessage += err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        } catch (err) {
            return `$${parseFloat(amount).toFixed(2)}`;
        }
    };

    return (
        <Card className="mt-4">
            <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">💰 EMI Calculator</h4>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleCalculate}>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label><strong>Loan Amount ($)</strong></Form.Label>
                                <Form.Control
                                    type="number"
                                    name="amount"
                                    value={loanData.amount}
                                    onChange={handleInputChange}
                                    placeholder="Enter loan amount"
                                    min="1"
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label><strong>Interest Rate (% per year)</strong></Form.Label>
                                <Form.Control
                                    type="number"
                                    name="interest_rate"
                                    value={loanData.interest_rate}
                                    onChange={handleInputChange}
                                    placeholder="Enter interest rate"
                                    step="0.1"
                                    min="0.1"
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label><strong>Tenure (months)</strong></Form.Label>
                                <Form.Control
                                    type="number"
                                    name="tenure"
                                    value={loanData.tenure}
                                    onChange={handleInputChange}
                                    placeholder="Enter tenure in months"
                                    min="1"
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {error && (
                        <Alert variant={error.includes('client-side') ? 'warning' : 'danger'}>
                            {error}
                        </Alert>
                    )}

                    <div className="d-grid gap-2">
                        <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={loading}
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Calculating...
                                </>
                            ) : (
                                '🧮 Calculate EMI'
                            )}
                        </Button>

                        {emi && (
                            <Button 
                                variant="success" 
                                onClick={handleApplyForLoan}
                                disabled={loading}
                            >
                                📝 Apply for Loan
                            </Button>
                        )}
                    </div>
                </Form>

                {emi && (
                    <div className="mt-4">
                        <Alert variant="success">
                            <h5>📊 EMI Calculation Result</h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Monthly EMI:</strong> {formatCurrency(emi)}</p>
                                    <p><strong>Total Payment:</strong> {formatCurrency(emi * loanData.tenure)}</p>
                                    <p><strong>Total Interest:</strong> {formatCurrency((emi * loanData.tenure) - parseFloat(loanData.amount))}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Loan Amount:</strong> {formatCurrency(parseFloat(loanData.amount))}</p>
                                    <p><strong>Interest Rate:</strong> {loanData.interest_rate}% per year</p>
                                    <p><strong>Tenure:</strong> {loanData.tenure} months</p>
                                </div>
                            </div>
                            <p className="text-muted small mb-0">
                                <em>Calculated using: {calculationMethod}</em>
                            </p>
                        </Alert>

                        {/* Repayment Schedule */}
                        {repaymentSchedule.length > 0 && (
                            <Card className="mt-3">
                                <Card.Header>
                                    <h6 className="mb-0">📅 Repayment Schedule</h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="table-responsive">
                                        <Table striped bordered hover size="sm">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>Month</th>
                                                    <th>Payment</th>
                                                    <th>Principal</th>
                                                    <th>Interest</th>
                                                    <th>Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {repaymentSchedule.map((payment, index) => (
                                                    <tr key={index}>
                                                        <td>{payment.month}</td>
                                                        <td className="fw-bold text-primary">
                                                            {formatCurrency(payment.payment)}
                                                        </td>
                                                        <td className="text-success">
                                                            {formatCurrency(payment.principal)}
                                                        </td>
                                                        <td className="text-warning">
                                                            {formatCurrency(payment.interest)}
                                                        </td>
                                                        <td className={
                                                            payment.balance === 0 
                                                                ? 'fw-bold text-success' 
                                                                : 'text-muted'
                                                        }>
                                                            {formatCurrency(payment.balance)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Quick Stats */}
                        <Row className="mt-3">
                            <Col md={4}>
                                <Card className="text-center bg-light">
                                    <Card.Body>
                                        <h6 className="text-primary">Monthly EMI</h6>
                                        <h4 className="fw-bold">{formatCurrency(emi)}</h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="text-center bg-light">
                                    <Card.Body>
                                        <h6 className="text-success">Total Payment</h6>
                                        <h4 className="fw-bold">{formatCurrency(emi * loanData.tenure)}</h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="text-center bg-light">
                                    <Card.Body>
                                        <h6 className="text-warning">Total Interest</h6>
                                        <h4 className="fw-bold">
                                            {formatCurrency((emi * loanData.tenure) - parseFloat(loanData.amount))}
                                        </h4>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default EMICalculator;