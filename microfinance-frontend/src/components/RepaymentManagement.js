import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';

const RepaymentManagement = () => {
    const [repayments, setRepayments] = useState([]);
    const [paymentData, setPaymentData] = useState({
        repayment_id: '',
        amount_paid: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [creatingDemo, setCreatingDemo] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        fetchRepayments();
    }, []);

    const fetchRepayments = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/repayments');
            setRepayments(response.data);
            setMessage({ text: '', type: '' });
        } catch (error) {
            console.error('Error fetching repayments:', error);
            setMessage({ 
                text: '❌ Error fetching repayment data: ' + (error.response?.data?.error || error.message), 
                type: 'danger' 
            });
        } finally {
            setLoading(false);
        }
    };

    const createDemoData = async () => {
        setCreatingDemo(true);
        try {
            const response = await axios.post('http://localhost:5000/api/repayments/demo');
            setMessage({ 
                text: '✅ Demo repayment data created successfully!', 
                type: 'success' 
            });
            fetchRepayments();
        } catch (error) {
            setMessage({ 
                text: '❌ Error creating demo data: ' + (error.response?.data?.error || error.message), 
                type: 'danger' 
            });
        } finally {
            setCreatingDemo(false);
        }
    };

    const processPayment = async (e) => {
        e.preventDefault();
        setProcessingPayment(true);
        try {
            await axios.put(`http://localhost:5000/api/repayments/${paymentData.repayment_id}/pay`, {
                amount_paid: parseFloat(paymentData.amount_paid)
            });
            setMessage({ 
                text: `✅ Payment of ₹${paymentData.amount_paid} processed successfully for Repayment ID: ${paymentData.repayment_id}!`, 
                type: 'success' 
            });
            setPaymentData({ repayment_id: '', amount_paid: '' });
            fetchRepayments();
        } catch (error) {
            setMessage({ 
                text: '❌ Error processing payment: ' + (error.response?.data?.error || error.message), 
                type: 'danger' 
            });
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getStatusInfo = (repayment) => {
        const amountPaid = parseFloat(repayment.amount_paid) || 0;
        const amountDue = parseFloat(repayment.amount_due) || 0;
        const dueDate = new Date(repayment.due_date);
        const today = new Date();

        if (amountPaid >= amountDue) {
            return { status: 'Paid', variant: 'success' };
        } else if (amountPaid > 0 && amountPaid < amountDue) {
            return { status: 'Partial', variant: 'warning' };
        } else if (dueDate < today) {
            return { status: 'Overdue', variant: 'danger' };
        } else {
            return { status: 'Pending', variant: 'secondary' };
        }
    };

    const formatCurrency = (amount) => {
        const numAmount = parseFloat(amount) || 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numAmount);
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getDaysOverdue = (dueDate) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = today - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // Calculate statistics
    const totalDue = repayments.reduce((sum, r) => sum + (parseFloat(r.amount_due) || 0), 0);
    const totalPaid = repayments.reduce((sum, r) => sum + (parseFloat(r.amount_paid) || 0), 0);
    const totalPending = totalDue - totalPaid;
    const overdueCount = repayments.filter(r => {
        const dueDate = new Date(r.due_date);
        const today = new Date();
        return dueDate < today && (parseFloat(r.amount_paid) || 0) < (parseFloat(r.amount_due) || 0);
    }).length;

    return (
        <Container fluid className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
            {/* Header Section */}
            <Row className="mb-6">
                <Col>
                    <div className="text-center bg-white/95 rounded-2xl p-8 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-3">💳 Repayment Management</h1>
                        <p className="text-lg text-gray-600">Process payments and track repayment schedules</p>
                    </div>
                </Col>
            </Row>

            {/* Statistics Overview */}
            {repayments.length > 0 && (
                <Row className="mb-6">
                    <Col lg={3} md={6} className="mb-4">
                        <Card className="h-100 bg-white/95 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <Card.Body className="text-center p-6">
                                <div className="text-4xl mb-3 text-blue-600">💰</div>
                                <h4 className="text-2xl font-bold text-gray-800 mb-2">{formatCurrency(totalDue)}</h4>
                                <p className="text-gray-600 font-medium">Total Due</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6} className="mb-4">
                        <Card className="h-100 bg-white/95 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <Card.Body className="text-center p-6">
                                <div className="text-4xl mb-3 text-green-600">✅</div>
                                <h4 className="text-2xl font-bold text-gray-800 mb-2">{formatCurrency(totalPaid)}</h4>
                                <p className="text-gray-600 font-medium">Total Paid</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6} className="mb-4">
                        <Card className="h-100 bg-white/95 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <Card.Body className="text-center p-6">
                                <div className="text-4xl mb-3 text-yellow-600">⏳</div>
                                <h4 className="text-2xl font-bold text-gray-800 mb-2">{formatCurrency(totalPending)}</h4>
                                <p className="text-gray-600 font-medium">Pending Amount</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6} className="mb-4">
                        <Card className="h-100 bg-white/95 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <Card.Body className="text-center p-6">
                                <div className="text-4xl mb-3 text-red-600">⚠️</div>
                                <h4 className="text-2xl font-bold text-gray-800 mb-2">{overdueCount}</h4>
                                <p className="text-gray-600 font-medium">Overdue Payments</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Message Alert */}
            {message.text && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant={message.type} className="mb-0 border-0 shadow-lg" dismissible onClose={() => setMessage({ text: '', type: '' })}>
                            {message.text}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Demo Data Creation Prompt */}
            {repayments.length === 0 && !loading && (
                <Row className="mb-6">
                    <Col className="text-center">
                        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                            <Card.Body className="py-12">
                                <div className="text-6xl mb-4 opacity-70">📊</div>
                                <h4 className="text-2xl text-gray-600 mb-4">No Repayment Data Found</h4>
                                <p className="text-gray-500 mb-6 text-lg">Create demo repayment data to test the payment processing system</p>
                                <Button 
                                    variant="primary" 
                                    onClick={createDemoData}
                                    disabled={creatingDemo}
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                >
                                    {creatingDemo ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Creating Demo Data...
                                        </>
                                    ) : (
                                        '📊 Create Demo Repayment Data'
                                    )}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Main Content */}
            <Row className="min-h-[60vh]">
                {/* Payment Processing Card */}
                <Col lg={4} className="mb-6">
                    <Card className="h-100 bg-white/95 backdrop-blur-sm border-0 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        <Card.Header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 rounded-t-2xl p-6">
                            <h5 className="mb-0 text-xl font-semibold">
                                <span className="mr-2">💰</span>
                                Process Payment
                            </h5>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column p-6">
                            <Form onSubmit={processPayment} className="flex-grow-1 d-flex flex-column">
                                <div className="flex-grow-1">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="font-semibold text-gray-700 text-lg mb-2">Repayment ID</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="repayment_id"
                                            value={paymentData.repayment_id}
                                            onChange={handleChange}
                                            placeholder="Enter repayment ID from table"
                                            required
                                            disabled={processingPayment || repayments.length === 0}
                                            min="1"
                                            className="border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                                        />
                                        <Form.Text className="text-gray-500 text-sm mt-1">
                                            Enter the Repayment ID from the table below
                                        </Form.Text>
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-6">
                                        <Form.Label className="font-semibold text-gray-700 text-lg mb-2">Amount Paid (₹)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            name="amount_paid"
                                            value={paymentData.amount_paid}
                                            onChange={handleChange}
                                            placeholder="Enter payment amount"
                                            required
                                            disabled={processingPayment || repayments.length === 0}
                                            min="0.01"
                                            className="border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                                        />
                                        <Form.Text className="text-gray-500 text-sm mt-1">
                                            Enter the payment amount in INR
                                        </Form.Text>
                                    </Form.Group>
                                </div>
                                
                                <div className="mt-auto">
                                    <Button 
                                        variant="primary" 
                                        type="submit" 
                                        disabled={processingPayment || !paymentData.repayment_id || !paymentData.amount_paid || repayments.length === 0}
                                        className="w-100 bg-gradient-to-r from-blue-500 to-purple-600 border-0 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:shadow-lg"
                                        size="lg"
                                    >
                                        {processingPayment ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Processing Payment...
                                            </>
                                        ) : (
                                            <>
                                                💳 Process Payment
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                
                {/* Repayment Schedule Card */}
                <Col lg={8}>
                    <Card className="h-100 bg-white/95 backdrop-blur-sm border-0 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        <Card.Header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 rounded-t-2xl p-6 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 text-xl font-semibold">
                                <span className="mr-2">📋</span>
                                Repayment Schedule
                            </h5>
                            <div className="d-flex align-items-center gap-3">
                                <Badge bg="light" text="dark" className="fs-6 px-3 py-2 rounded-pill">
                                    {repayments.length} Installments
                                </Badge>
                                <Button 
                                    variant="outline-light" 
                                    size="sm" 
                                    onClick={fetchRepayments}
                                    disabled={loading}
                                    className="border-2 rounded-xl px-3 py-2 transition-all duration-300 hover:bg-white/20 hover:-translate-y-1"
                                >
                                    🔄 Refresh
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0 d-flex flex-column">
                            {loading ? (
                                <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-8">
                                    <Spinner animation="border" variant="primary" className="w-12 h-12 mb-4" />
                                    <p className="text-gray-600 text-lg">Loading repayment schedule...</p>
                                </div>
                            ) : repayments.length === 0 ? (
                                <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-8 text-center">
                                    <div className="text-6xl mb-4 opacity-50">📋</div>
                                    <h5 className="text-xl text-gray-600 mb-2">No Repayment Records</h5>
                                    <p className="text-gray-500">Create demo data to see the repayment schedule</p>
                                </div>
                            ) : (
                                <div className="flex-grow-1 d-flex flex-column min-h-[500px]">
                                    <div className="flex-grow-1 overflow-hidden rounded-b-2xl">
                                        <Table hover className="mb-0 w-full">
                                            <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white sticky top-0 z-10">
                                                <tr>
                                                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-center">ID</th>
                                                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-center">Loan ID</th>
                                                    <th className="p-4 font-semibold text-sm uppercase tracking-wider">Borrower</th>
                                                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-center">Due Date</th>
                                                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-center">Amount Due</th>
                                                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-center">Amount Paid</th>
                                                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-center">Penalty</th>
                                                    <th className="p-4 font-semibold text-sm uppercase tracking-wider text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {repayments.map((repayment) => {
                                                    const statusInfo = getStatusInfo(repayment);
                                                    const amountPaid = parseFloat(repayment.amount_paid) || 0;
                                                    const amountDue = parseFloat(repayment.amount_due) || 0;
                                                    const overdueAmount = amountDue - amountPaid;
                                                    const dueDate = new Date(repayment.due_date);
                                                    const today = new Date();
                                                    const isOverdue = dueDate < today && amountPaid < amountDue;
                                                    const daysOverdue = getDaysOverdue(repayment.due_date);
                                                    
                                                    return (
                                                        <tr 
                                                            key={repayment.repayment_id} 
                                                            className={`transition-all duration-200 hover:bg-blue-50 ${
                                                                isOverdue ? 'bg-red-50 hover:bg-red-100' : ''
                                                            }`}
                                                        >
                                                            <td className="p-4 text-center">
                                                                <Badge className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                                                                    #{repayment.repayment_id}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <Badge className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                                                                    {repayment.loan_id}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4 font-semibold text-gray-800">
                                                                {repayment.borrower_name}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <div className={isOverdue ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                                                                    {formatDate(repayment.due_date)}
                                                                    {isOverdue && (
                                                                        <div className="text-xs text-red-500 font-medium mt-1">
                                                                            {daysOverdue} days overdue
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-center font-semibold text-blue-700">
                                                                {formatCurrency(repayment.amount_due)}
                                                            </td>
                                                            <td className={`p-4 text-center font-semibold ${
                                                                amountPaid > 0 ? 'text-green-600' : 'text-gray-500'
                                                            }`}>
                                                                {formatCurrency(repayment.amount_paid)}
                                                            </td>
                                                            <td className={`p-4 text-center ${
                                                                repayment.penalty > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'
                                                            }`}>
                                                                {repayment.penalty > 0 ? formatCurrency(repayment.penalty) : '—'}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <div className="d-flex flex-column items-center">
                                                                    <Badge 
                                                                        bg={statusInfo.variant} 
                                                                        className="px-3 py-2 rounded-lg text-sm font-semibold mb-1"
                                                                    >
                                                                        {statusInfo.status}
                                                                        {statusInfo.status === 'Partial' && 
                                                                            ` (${((amountPaid / amountDue) * 100).toFixed(0)}%)`
                                                                        }
                                                                    </Badge>
                                                                    {isOverdue && amountPaid < amountDue && (
                                                                        <div className="text-xs text-red font-semibold mt-1">
                                                                            Due: {formatCurrency(overdueAmount)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RepaymentManagement;