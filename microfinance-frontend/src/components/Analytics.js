import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';

const Analytics = () => {
    const [loading, setLoading] = useState(false);
    const [defaulters, setDefaulters] = useState([]);
    const [regionalData, setRegionalData] = useState([]);
    const [queryResults, setQueryResults] = useState({
        nested: [],
        join: [],
        aggregate: []
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        loadDefaulters();
        loadRegionalAnalysis();
    }, []);

    const loadDefaulters = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/analytics/defaulters');
            setDefaulters(response.data);
        } catch (error) {
            setMessage({ 
                text: '❌ Error loading defaulters: ' + (error.response?.data?.error || error.message), 
                type: 'danger' 
            });
        } finally {
            setLoading(false);
        }
    };

    const loadRegionalAnalysis = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/analytics/regional');
            setRegionalData(response.data);
        } catch (error) {
            setMessage({ 
                text: '❌ Error loading regional analysis: ' + (error.response?.data?.error || error.message), 
                type: 'danger' 
            });
        }
    };

    const runNestedQuery = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/analytics/nested-query');
            setQueryResults(prev => ({ ...prev, nested: response.data }));
            setMessage({ 
                text: '✅ Nested query executed successfully!', 
                type: 'success' 
            });
        } catch (error) {
            setMessage({ 
                text: '❌ Error running nested query: ' + (error.response?.data?.error || error.message), 
                type: 'danger' 
            });
        } finally {
            setLoading(false);
        }
    };

    const runJoinQuery = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/analytics/join-query');
            setQueryResults(prev => ({ ...prev, join: response.data }));
            setMessage({ 
                text: '✅ Join query executed successfully!', 
                type: 'success' 
            });
        } catch (error) {
            setMessage({ 
                text: '❌ Error running join query: ' + (error.response?.data?.error || error.message), 
                type: 'danger' 
            });
        } finally {
            setLoading(false);
        }
    };

    const runAggregateQuery = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/analytics/aggregate-query');
            setQueryResults(prev => ({ ...prev, aggregate: response.data }));
            setMessage({ 
                text: '✅ Aggregate query executed successfully!', 
                type: 'success' 
            });
        } catch (error) {
            setMessage({ 
                text: '❌ Error running aggregate query: ' + (error.response?.data?.error || error.message), 
                type: 'danger' 
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const getDefaulterStatus = (daysOverdue) => {
        if (daysOverdue > 90) return { variant: 'danger', label: 'High Risk' };
        if (daysOverdue > 60) return { variant: 'warning', label: 'Medium Risk' };
        return { variant: 'info', label: 'Watch List' };
    };

    return (
        <Container fluid className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
            {/* Header Section */}
            <Row className="mb-6">
                <Col>
                    <div className="text-center bg-white/95 rounded-2xl p-8 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-3">📊 Microfinance Loan Management System</h1>
                        <p className="text-lg text-gray-600">Advanced Analytics & Business Intelligence</p>
                    </div>
                </Col>
            </Row>

            {/* Message Alert */}
            {message.text && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant={message.type} className="mb-0 border-0 shadow-lg" dismissible 
                            onClose={() => setMessage({ text: '', type: '' })}>
                            {message.text}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Top Section - Defaulters and Regional Analysis */}
            <Row className="mb-6">
                {/* Top Defaulters */}
                <Col lg={6} className="mb-6">
                    <Card className="h-100 bg-white/95 backdrop-blur-sm border-0 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        <Card.Header className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 rounded-t-2xl p-6">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 text-xl font-semibold">🚨 Top Defaulters Analysis</h5>
                                <Button 
                                    variant="outline-light" 
                                    size="sm" 
                                    onClick={loadDefaulters}
                                    disabled={loading}
                                    className="border-2 rounded-xl px-3 py-2 transition-all duration-300 hover:bg-white/20 hover:-translate-y-1"
                                >
                                    🔄 Refresh
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-8">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="text-gray-600 mt-3">Loading defaulters data...</p>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-b-2xl">
                                    <Table hover className="mb-0">
                                        <thead className="bg-gray-800 text-white">
                                            <tr>
                                                <th className="p-4 font-semibold">Borrower</th>
                                                <th className="p-4 font-semibold text-center">Loan ID</th>
                                                <th className="p-4 font-semibold text-center">Overdue Days</th>
                                                <th className="p-4 font-semibold text-center">Due Amount</th>
                                                <th className="p-4 font-semibold text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {defaulters.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                                        No defaulters found
                                                    </td>
                                                </tr>
                                            ) : (
                                                defaulters.map((defaulter, index) => {
                                                    const status = getDefaulterStatus(defaulter.days_overdue);
                                                    return (
                                                        <tr key={index} className="transition-all duration-200 hover:bg-red-50">
                                                            <td className="p-4 font-semibold text-gray-800">{defaulter.borrower_name}</td>
                                                            <td className="p-4 text-center">
                                                                <Badge className="bg-gray-600 text-white px-3 py-2 rounded-lg">
                                                                    #{defaulter.loan_id}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4 text-center font-semibold text-red-600">
                                                                {defaulter.days_overdue} days
                                                            </td>
                                                            <td className="p-4 text-center font-semibold text-gray-800">
                                                                {formatCurrency(defaulter.due_amount)}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <Badge bg={status.variant} className="px-3 py-2 rounded-lg font-semibold">
                                                                    {status.label}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Regional Analysis */}
                <Col lg={6} className="mb-6">
                    <Card className="h-100 bg-white/95 backdrop-blur-sm border-0 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        <Card.Header className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 rounded-t-2xl p-6">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 text-xl font-semibold">🌍 Regional Analysis</h5>
                                <Button 
                                    variant="outline-light" 
                                    size="sm" 
                                    onClick={loadRegionalAnalysis}
                                    disabled={loading}
                                    className="border-2 rounded-xl px-3 py-2 transition-all duration-300 hover:bg-white/20 hover:-translate-y-1"
                                >
                                    🔄 Refresh
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="overflow-hidden rounded-b-2xl">
                                <Table hover className="mb-0">
                                    <thead className="bg-gray-800 text-white">
                                        <tr>
                                            <th className="p-4 font-semibold">Region</th>
                                            <th className="p-4 font-semibold text-center">Total Loans</th>
                                            <th className="p-4 font-semibold text-center">Avg Loan Size</th>
                                            <th className="p-4 font-semibold text-center">Total Disbursed</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {regionalData.map((region, index) => (
                                            <tr key={index} className="transition-all duration-200 hover:bg-green-50">
                                                <td className="p-4 font-semibold text-gray-800">{region.region_name}</td>
                                                <td className="p-4 text-center">
                                                    <Badge className="bg-blue-600 text-white px-3 py-2 rounded-lg">
                                                        {region.total_loans}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-center font-semibold text-blue-600">
                                                    {formatCurrency(region.avg_loan_size)}
                                                </td>
                                                <td className="p-4 text-center font-semibold text-green-600">
                                                    {formatCurrency(region.total_disbursed)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Complex Queries Section */}
            <Row>
                <Col>
                    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                        <Card.Header className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 rounded-t-2xl p-6">
                            <h5 className="mb-0 text-xl font-semibold">🔍 Complex Queries Demonstration</h5>
                        </Card.Header>
                        <Card.Body className="p-6">
                            {/* Query Buttons */}
                            <Row className="mb-6">
                                <Col md={4} className="mb-4">
                                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                                        <h6 className="font-semibold text-gray-800 mb-3">Nested Query</h6>
                                        <p className="text-gray-600 text-sm mb-4">
                                            Borrowers with pending repayments using IN subquery
                                        </p>
                                        <Button 
                                            variant="outline-primary" 
                                            onClick={runNestedQuery}
                                            disabled={loading}
                                            className="w-100 border-2 border-blue-500 text-blue-600 rounded-xl py-3 font-semibold transition-all duration-300 hover:bg-blue-500 hover:text-white hover:-translate-y-1"
                                        >
                                            🎯 Run Nested Query
                                        </Button>
                                    </div>
                                </Col>
                                <Col md={4} className="mb-4">
                                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                                        <h6 className="font-semibold text-gray-800 mb-3">Join Query</h6>
                                        <p className="text-gray-600 text-sm mb-4">
                                            Multiple table join showing loan details with borrower, staff, and branch info
                                        </p>
                                        <Button 
                                            variant="outline-success" 
                                            onClick={runJoinQuery}
                                            disabled={loading}
                                            className="w-100 border-2 border-green-500 text-green-600 rounded-xl py-3 font-semibold transition-all duration-300 hover:bg-green-500 hover:text-white hover:-translate-y-1"
                                        >
                                            🔗 Run Join Query
                                        </Button>
                                    </div>
                                </Col>
                                <Col md={4} className="mb-4">
                                    <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                                        <h6 className="font-semibold text-gray-800 mb-3">Aggregate Query</h6>
                                        <p className="text-gray-600 text-sm mb-4">
                                            Statistical analysis of loan portfolio using COUNT, SUM, AVG, MAX, MIN
                                        </p>
                                        <Button 
                                            variant="outline-warning" 
                                            onClick={runAggregateQuery}
                                            disabled={loading}
                                            className="w-100 border-2 border-yellow-500 text-yellow-600 rounded-xl py-3 font-semibold transition-all duration-300 hover:bg-yellow-500 hover:text-white hover:-translate-y-1"
                                        >
                                            📈 Run Aggregate Query
                                        </Button>
                                    </div>
                                </Col>
                            </Row>

                            {/* Query Results */}
                            <Row>
                                {/* Nested Query Results */}
                                {queryResults.nested.length > 0 && (
                                    <Col lg={4} className="mb-4">
                                        <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                            <Card.Header className="bg-blue-600 text-white border-0 rounded-t-2xl p-4">
                                                <h6 className="mb-0 font-semibold">Nested Query Results</h6>
                                            </Card.Header>
                                            <Card.Body className="p-0">
                                                <div className="max-h-60 overflow-y-auto">
                                                    <Table hover size="sm" className="mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th className="p-3 font-semibold bg-gray-100">Borrower</th>
                                                                <th className="p-3 font-semibold bg-gray-100">Contact</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {queryResults.nested.map((result, index) => (
                                                                <tr key={index} className="border-b border-gray-200">
                                                                    <td className="p-3 font-semibold text-gray-800">{result.name}</td>
                                                                    <td className="p-3 text-gray-600">{result.contact}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                )}

// In your Analytics component, update the Join Query Results section:

{/* Join Query Results */}
{queryResults.join.length > 0 && (
    <Col lg={6} className="mb-4">
        <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <Card.Header className="bg-green-600 text-white border-0 rounded-t-2xl p-4">
                <h6 className="mb-0 font-semibold">Join Query Results</h6>
                <small>Loan Details with Borrower, Staff & Branch Info</small>
            </Card.Header>
            <Card.Body className="p-0">
                <div className="max-h-80 overflow-y-auto">
                    <Table hover size="sm" className="mb-0">
                        <thead className="sticky-top">
                            <tr>
                                <th className="p-3 font-semibold bg-gray-100">Loan ID</th>
                                <th className="p-3 font-semibold bg-gray-100">Borrower</th>
                                <th className="p-3 font-semibold bg-gray-100">Amount</th>
                                <th className="p-3 font-semibold bg-gray-100">Approved By</th>
                                <th className="p-3 font-semibold bg-gray-100">Branch</th>
                                <th className="p-3 font-semibold bg-gray-100">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queryResults.join.map((result, index) => (
                                <tr key={index} className="border-b border-gray-200">
                                    <td className="p-3 text-center">
                                        <Badge className="bg-gray-600 text-white px-2 py-1 rounded">
                                            #{result.loan_id}
                                        </Badge>
                                    </td>
                                    <td className="p-3">
                                        <div>
                                            <div className="font-semibold text-gray-800">{result.borrower_name}</div>
                                            <small className="text-gray-500">{result.interest_rate}% · {result.tenure} months</small>
                                        </div>
                                    </td>
                                    <td className="p-3 font-semibold text-gray-800">
                                        {formatCurrency(result.amount)}
                                    </td>
                                    <td className="p-3">
                                        {result.approved_by ? (
                                            <div>
                                                <div className="text-gray-800">{result.approved_by}</div>
                                                <small className="text-gray-500">Staff</small>
                                            </div>
                                        ) : (
                                            <Badge bg="secondary" className="px-2 py-1 rounded">
                                                Not Approved
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {result.branch_location ? (
                                            <div className="text-gray-800">{result.branch_location}</div>
                                        ) : (
                                            <Badge bg="secondary" className="px-2 py-1 rounded">
                                                Not Assigned
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        <Badge bg={
                                            result.status === 'Approved' ? 'success' : 
                                            result.status === 'Pending' ? 'warning' : 
                                            result.status === 'Rejected' ? 'danger' : 'secondary'
                                        } className="px-2 py-1 rounded">
                                            {result.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
        </Card>
    </Col>
)}
                                

                                {/* Aggregate Query Results */}
                                {queryResults.aggregate.length > 0 && (
                                    <Col lg={4} className="mb-4">
                                        <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                            <Card.Header className="bg-yellow-500 text-gray-800 border-0 rounded-t-2xl p-4">
                                                <h6 className="mb-0 font-semibold">Aggregate Query Results</h6>
                                            </Card.Header>
                                            <Card.Body>
                                                {queryResults.aggregate.map((result, index) => (
                                                    <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200">
                                                        <div className="d-flex justify-content-between mb-2">
                                                            <span className="font-semibold text-gray-700">Region:</span>
                                                            <span className="text-gray-800">{result.region_name}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between mb-2">
                                                            <span className="text-gray-600">Total Loans:</span>
                                                            <Badge className="bg-blue-600 text-white px-2 py-1 rounded">
                                                                {result.total_loans}
                                                            </Badge>
                                                        </div>
                                                        <div className="d-flex justify-content-between mb-2">
                                                            <span className="text-gray-600">Avg Loan Size:</span>
                                                            <span className="font-semibold text-blue-600">
                                                                {formatCurrency(result.avg_loan_size)}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex justify-content-between">
                                                            <span className="text-gray-600">Total Disbursed:</span>
                                                            <span className="font-semibold text-green-600">
                                                                {formatCurrency(result.total_disbursed)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                )}
                            </Row>

                            {/* Empty State for Query Results */}
                            {Object.values(queryResults).every(arr => arr.length === 0) && (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4 opacity-50">🔍</div>
                                    <h5 className="text-xl text-gray-600 mb-3">No Query Results Yet</h5>
                                    <p className="text-gray-500">
                                        Run any of the complex queries above to see the results here
                                    </p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Analytics;