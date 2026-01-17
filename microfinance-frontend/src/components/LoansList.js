import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Button, ButtonGroup, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const LoansList = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [staffId, setStaffId] = useState(1);
    const [branchId, setBranchId] = useState(1);
    const [rejectReason, setRejectReason] = useState('');

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/loans');
            const realLoans = response.data.filter(loan => loan.status !== 'Demo');
            setLoans(realLoans);
        } catch (error) {
            setMessage('❌ Error fetching loans: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const handleApprove = async () => {
        try {
            setLoading(true);
            const response = await axios.put(`http://localhost:5000/api/loans/${selectedLoan.loan_id}/approve`, {
                staff_id: parseInt(staffId),
                branch_id: parseInt(branchId)
            });
            
            setMessage(`✅ ${response.data.message}`);
            setShowApproveModal(false);
            fetchLoans();
            
        } catch (error) {
            console.error('Approve error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
            setMessage(`❌ Error approving loan: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setLoading(true);
            const response = await axios.put(`http://localhost:5000/api/loans/${selectedLoan.loan_id}/reject`, {
                reason: rejectReason
            });
            
            setMessage(`✅ ${response.data.message}`);
            setShowRejectModal(false);
            setRejectReason('');
            fetchLoans();
            
        } catch (error) {
            console.error('Reject error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
            setMessage(`❌ Error rejecting loan: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const openApproveModal = (loan) => {
        setSelectedLoan(loan);
        setShowApproveModal(true);
    };

    const openRejectModal = (loan) => {
        setSelectedLoan(loan);
        setShowRejectModal(true);
    };

    const getStatusVariant = (status) => {
        switch(status) {
            case 'Approved': return 'success';
            case 'Pending': return 'warning';
            case 'Rejected': return 'danger';
            case 'Completed': return 'info';
            default: return 'secondary';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const cleanupDemoLoans = async () => {
        try {
            setLoading(true);
            await axios.delete('http://localhost:5000/api/loans/cleanup-demo');
            setMessage('✅ Demo loans cleaned up successfully');
            fetchLoans();
        } catch (error) {
            setMessage('❌ Error cleaning up demo loans: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="mt-4" style={{ minHeight: '100vh' }}>
            <Row className="mb-4">
                <Col>
                    <div className="text-center">
                        <h2 className="text-white mb-3">👑 Admin - Loan Management</h2>
                        <p className="text-white-50">Approve or reject loan applications</p>
                    </div>
                </Col>
            </Row>

            {message && (
                <Alert variant={message.includes('❌') ? 'danger' : 'success'}>
                    {message}
                </Alert>
            )}

            <Row className="h-100">
                <Col>
                    <Card className="h-100">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-info text-white">
                            <h4 className="mb-0">📋 Loan Applications</h4>
                            <div>
                                <Button variant="outline-light" onClick={fetchLoans} disabled={loading} className="me-2">
                                    {loading ? 'Refreshing...' : '🔄 Refresh'}
                                </Button>
                                {/* <Button variant="warning" onClick={cleanupDemoLoans} disabled={loading} size="sm">
                                    🧹 Clean Demo Data
                                </Button> */}
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0 d-flex flex-column">
                            {loading ? (
                                <div className="text-center py-5 flex-grow-1 d-flex align-items-center justify-content-center">
                                    <div>
                                        <div className="spinner-border text-primary mb-3"></div>
                                        <p>Loading loans...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-grow-1 d-flex flex-column">
                                    <div className="table-responsive flex-grow-1" style={{ maxHeight: 'none', height: '100%' }}>
                                        <Table hover striped className="mb-0 h-100">
                                            <thead className="table-dark sticky-top">
                                                <tr>
                                                    <th>Loan ID</th>
                                                    <th>Borrower</th>
                                                    <th>Amount</th>
                                                    <th>Interest</th>
                                                    <th>Tenure</th>
                                                    <th>Start Date</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loans.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="8" className="text-center py-5">
                                                            <div className="py-5">
                                                                <div className="mb-3" style={{ fontSize: '3rem' }}>📄</div>
                                                                <h5>No loans found</h5>
                                                                <p className="text-muted">Borrowers can apply for loans in the Borrower Management section</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    loans.map((loan) => (
                                                        <tr key={loan.loan_id}>
                                                            <td>
                                                                <Badge bg="primary">#{loan.loan_id}</Badge>
                                                            </td>
                                                            <td className="fw-bold">
                                                                {loan.borrower_name}
                                                                <div className="small text-muted">ID: {loan.borrower_id}</div>
                                                            </td>
                                                            <td className="fw-bold text-success">
                                                                {formatCurrency(loan.amount)}
                                                            </td>
                                                            <td>
                                                                <Badge bg="primary" text="white">
                                                                    {loan.interest_rate}%
                                                                </Badge>
                                                            </td>
                                                            <td>{loan.tenure} months</td>
                                                            <td>{new Date(loan.start_date).toLocaleDateString('en-IN')}</td>
                                                            <td>
                                                                <Badge bg={getStatusVariant(loan.status)}>
                                                                    {loan.status}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                {loan.status === 'Pending' && (
                                                                    <ButtonGroup size="sm">
                                                                        <Button 
                                                                            variant="success" 
                                                                            onClick={() => openApproveModal(loan)}
                                                                        >
                                                                            ✅ Approve
                                                                        </Button>
                                                                        <Button 
                                                                            variant="danger" 
                                                                            onClick={() => openRejectModal(loan)}
                                                                        >
                                                                            ❌ Reject
                                                                        </Button>
                                                                    </ButtonGroup>
                                                                )}
                                                                {loan.status !== 'Pending' && (
                                                                    <span className="text-muted">No actions</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Stats - Only show if there are loans */}
            {loans.length > 0 && (
                <Row className="mt-4">
                    <Col md={3}>
                        <Card className="text-center bg-light">
                            <Card.Body>
                                <h6 className="text-primary">Total Loans</h6>
                                <h4 className="fw-bold">{loans.length}</h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={2}>
                        <Card className="text-center bg-light">
                            <Card.Body>
                                <h6 className="text-success">Approved</h6>
                                <h4 className="fw-bold">
                                    {loans.filter(l => l.status === 'Approved').length}
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={2}>
                        <Card className="text-center bg-light">
                            <Card.Body>
                                <h6 className="text-warning">Pending</h6>
                                <h4 className="fw-bold">
                                    {loans.filter(l => l.status === 'Pending').length}
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={2}>
                        <Card className="text-center bg-light">
                            <Card.Body>
                                <h6 className="text-danger">Rejected</h6>
                                <h4 className="fw-bold">
                                    {loans.filter(l => l.status === 'Rejected').length}
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center bg-light">
                            <Card.Body>
                                <h6 className="text-info">Awaiting Action</h6>
                                <h4 className="fw-bold">
                                    {loans.filter(l => l.status === 'Pending').length}
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Approve Modal */}
            <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>✅ Approve Loan</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedLoan && (
                        <div>
                            <p>Approve loan for <strong>{selectedLoan.borrower_name}</strong>?</p>
                            <p><strong>Amount:</strong> {formatCurrency(selectedLoan.amount)}</p>
                            <p><strong>Interest Rate:</strong> {selectedLoan.interest_rate}%</p>
                            <p><strong>Tenure:</strong> {selectedLoan.tenure} months</p>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Staff ID (for records)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={staffId}
                                    onChange={(e) => setStaffId(e.target.value)}
                                    min="1"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Branch ID (for records)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                    min="1"
                                />
                            </Form.Group>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={handleApprove}>
                        ✅ Approve Loan
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Reject Modal */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>❌ Reject Loan</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedLoan && (
                        <div>
                            <p>Reject loan for <strong>{selectedLoan.borrower_name}</strong>?</p>
                            <Form.Group className="mb-3">
                                <Form.Label>Reason for rejection</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                />
                            </Form.Group>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleReject}>
                        ❌ Reject Loan
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default LoansList;