import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
    const [stats, setStats] = useState({
        totalLoans: 0,
        totalPortfolio: 0,
        activeLoans: 0,
        pendingLoans: 0,
        totalBorrowers: 0
    });
    const [recentLoans, setRecentLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch portfolio summary
            const portfolioResponse = await axios.get('http://localhost:5000/api/analytics/portfolio-summary');
            
            // Fetch recent loans
            const loansResponse = await axios.get('http://localhost:5000/api/loans');
            const realLoans = loansResponse.data.filter(loan => loan.status !== 'Demo');
            
            // Fetch borrowers count
            const borrowersResponse = await axios.get('http://localhost:5000/api/borrowers');

            setStats({
                totalLoans: portfolioResponse.data.total_loans || 0,
                totalPortfolio: portfolioResponse.data.total_portfolio || 0,
                activeLoans: realLoans.filter(loan => loan.status === 'Approved').length,
                pendingLoans: realLoans.filter(loan => loan.status === 'Pending').length,
                totalBorrowers: borrowersResponse.data.length
            });

            // Get 5 most recent loans
            setRecentLoans(realLoans.slice(0, 5));
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getStatusVariant = (status) => {
        switch(status?.toLowerCase()) {
            case 'approved': return 'success';
            case 'pending': return 'warning';
            case 'rejected': return 'danger';
            case 'completed': return 'info';
            default: return 'secondary';
        }
    };

    const getStatusDisplayName = (status) => {
        switch(status?.toLowerCase()) {
            case 'approved': return 'Approved';
            case 'pending': return 'Pending';
            case 'rejected': return 'Rejected';
            case 'completed': return 'Completed';
            default: return status || 'Unknown';
        }
    };

    if (loading) {
        return (
            <Container className="mt-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3"></div>
                    <p>Loading dashboard...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            {/* Welcome Header */}
            <Row className="mb-4">
                <Col>
                    <div className="text-center">
                        <h1 className="text-white mb-3">🏠 Microfinance Loan Management System</h1>
                        <p className="text-white-50 lead">Welcome to your loan management dashboard</p>
                    </div>
                </Col>
            </Row>

            {/* Quick Stats Cards */}
            <Row className="mb-5">
                <Col md={3} className="mb-3">
                    <Card className="text-center h-100 shadow">
                        <Card.Body>
                            <div className="text-primary mb-2" style={{ fontSize: '2.5rem' }}>💰</div>
                            <h4 className="fw-bold">{stats.totalLoans}</h4>
                            <h6 className="text-muted">Total Loans</h6>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="text-center h-100 shadow">
                        <Card.Body>
                            <div className="text-success mb-2" style={{ fontSize: '2.5rem' }}>📈</div>
                            <h4 className="fw-bold">{formatCurrency(stats.totalPortfolio)}</h4>
                            <h6 className="text-muted">Total Portfolio</h6>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="text-center h-100 shadow">
                        <Card.Body>
                            <div className="text-warning mb-2" style={{ fontSize: '2.5rem' }}>⏳</div>
                            <h4 className="fw-bold">{stats.pendingLoans}</h4>
                            <h6 className="text-muted">Pending Approvals</h6>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-3">
                    <Card className="text-center h-100 shadow">
                        <Card.Body>
                            <div className="text-info mb-2" style={{ fontSize: '2.5rem' }}>👥</div>
                            <h4 className="fw-bold">{stats.totalBorrowers}</h4>
                            <h6 className="text-muted">Total Borrowers</h6>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Row className="mb-5">
                <Col>
                    <Card className="shadow">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">🚀 Quick Actions</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row className="text-center">
                                <Col md={4} className="mb-3">
                                    <Link to="/borrowers" className="text-decoration-none">
                                        <div className="p-4 border rounded hover-shadow">
                                            <div className="text-success mb-2" style={{ fontSize: '2rem' }}>👥</div>
                                            <h6>Manage Borrowers</h6>
                                            <small className="text-muted">Register new borrowers & loans</small>
                                        </div>
                                    </Link>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Link to="/loans" className="text-decoration-none">
                                        <div className="p-4 border rounded hover-shadow">
                                            <div className="text-warning mb-2" style={{ fontSize: '2rem' }}>📋</div>
                                            <h6>Review Loans</h6>
                                            <small className="text-muted">Approve or reject loan applications</small>
                                        </div>
                                    </Link>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Link to="/repayments" className="text-decoration-none">
                                        <div className="p-4 border rounded hover-shadow">
                                            <div className="text-info mb-2" style={{ fontSize: '2rem' }}>💳</div>
                                            <h6>Track Repayments</h6>
                                            <small className="text-muted">Manage payment schedules</small>
                                        </div>
                                    </Link>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Activity & Stats */}
            <Row>
                {/* Recent Loans */}
                <Col lg={8} className="mb-4">
                    <Card className="shadow">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-info text-white">
                            <h5 className="mb-0">📋 Recent Loan Applications</h5>
                            <Link to="/loans">
                                <Button variant="outline-light" size="sm">
                                    View All
                                </Button>
                            </Link>
                        </Card.Header>
                        <Card.Body>
                            {recentLoans.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <div className="mb-3" style={{ fontSize: '3rem' }}>📄</div>
                                    <h6>No recent loans</h6>
                                    <p>Loan applications will appear here</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover>
                                        <thead>
                                            <tr>
                                                <th>Loan ID</th>
                                                <th>Borrower</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentLoans.map((loan) => (
                                                <tr key={loan.loan_id}>
                                                    <td>
                                                        <Badge bg="primary">#{loan.loan_id}</Badge>
                                                    </td>
                                                    <td className="fw-bold">{loan.borrower_name}</td>
                                                    <td className="text-success fw-bold">{formatCurrency(loan.amount)}</td>
                                                    <td>
                                                        <Badge bg={getStatusVariant(loan.status)}>
                                                            {getStatusDisplayName(loan.status)}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* System Status */}
                <Col lg={4}>
                    <Card className="shadow">
                        <Card.Header className="bg-success text-white">
                            <h5 className="mb-0">✅ System Status</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-4">
                                <h6>Database Connection</h6>
                                <Badge bg="success">Connected</Badge>
                            </div>
                            
                            <div className="mb-4">
                                <h6>Pending Actions</h6>
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Loan Approvals</span>
                                    <Badge bg="warning">{stats.pendingLoans}</Badge>
                                </div>
                                <ProgressBar 
                                    now={(stats.pendingLoans / Math.max(stats.totalLoans, 1)) * 100} 
                                    variant="warning" 
                                />
                            </div>
                            
                            <div className="mb-3">
                                <h6>Portfolio Health</h6>
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Active Loans</span>
                                    <Badge bg="success">{stats.activeLoans}</Badge>
                                </div>
                                <ProgressBar 
                                    now={(stats.activeLoans / Math.max(stats.totalLoans, 1)) * 100} 
                                    variant="success" 
                                />
                            </div>

                            <div className="text-center mt-4">
                                <Button 
                                    variant="primary" 
                                    onClick={fetchDashboardData}
                                    disabled={loading}
                                >
                                    🔄 Refresh Dashboard
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default HomePage;