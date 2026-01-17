import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Badge, Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';

const GuarantorManagement = () => {
    const [guarantors, setGuarantors] = useState([]);
    const [borrowers, setBorrowers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        relation: 'Friend',
        borrower_id: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingGuarantor, setEditingGuarantor] = useState(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState('');
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        fetchGuarantors();
        fetchBorrowers();
        fetchLoans();
    }, []);

    const fetchGuarantors = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/guarantors');
            setGuarantors(response.data);
        } catch (error) {
            setMessage({ text: '❌ Error fetching guarantors: ' + error.message, type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const fetchBorrowers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/borrowers');
            setBorrowers(response.data);
        } catch (error) {
            console.error('Error fetching borrowers:', error);
        }
    };

    const fetchLoans = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/loans');
            setLoans(response.data.filter(loan => loan.status === 'Approved' || loan.status === 'Pending'));
        } catch (error) {
            console.error('Error fetching loans:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingGuarantor) {
                await axios.put(`http://localhost:5000/api/guarantors/${editingGuarantor.guarantor_id}`, formData);
                setMessage({ text: '✅ Guarantor updated successfully!', type: 'success' });
            } else {
                await axios.post('http://localhost:5000/api/guarantors', formData);
                setMessage({ text: '✅ Guarantor added successfully!', type: 'success' });
            }

            setFormData({ name: '', contact: '', relation: 'Friend', borrower_id: '' });
            setEditingGuarantor(null);
            setShowModal(false);
            fetchGuarantors();
        } catch (error) {
            setMessage({ 
                text: '❌ Error: ' + (error.response?.data?.error || error.message), 
                type: 'danger' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (guarantor) => {
        setEditingGuarantor(guarantor);
        setFormData({
            name: guarantor.name,
            contact: guarantor.contact,
            relation: guarantor.relation,
            borrower_id: guarantor.borrower_id
        });
        setShowModal(true);
    };

    const handleDelete = async (guarantorId) => {
        if (!window.confirm('Are you sure you want to delete this guarantor?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/guarantors/${guarantorId}`);
            setMessage({ text: '✅ Guarantor deleted successfully!', type: 'success' });
            fetchGuarantors();
        } catch (error) {
            setMessage({ 
                text: '❌ Error: ' + (error.response?.data?.error || error.message), 
                type: 'danger' 
            });
        }
    };

    const handleLinkGuarantor = async (guarantorId) => {
        if (!selectedLoan) {
            setMessage({ text: '❌ Please select a loan first', type: 'danger' });
            return;
        }

        try {
            await axios.post(`http://localhost:5000/api/loans/${selectedLoan}/guarantors`, {
                guarantor_id: guarantorId
            });
            setMessage({ text: '✅ Guarantor linked to loan successfully!', type: 'success' });
            setShowLinkModal(false);
            setSelectedLoan('');
        } catch (error) {
            setMessage({ 
                text: '❌ Error: ' + (error.response?.data?.error || error.message), 
                type: 'danger' 
            });
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({ name: '', contact: '', relation: 'Friend', borrower_id: '' });
        setEditingGuarantor(null);
        setShowModal(false);
    };

    return (
        <Container fluid className="mt-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="text-center">
                        <h2 className="text-white mb-3">👥 Guarantor Management</h2>
                        <p className="text-white-50">Manage loan guarantors and their relationships</p>
                    </div>
                </Col>
            </Row>

            {/* Message Alert */}
            {message.text && (
                <Alert variant={message.type} dismissible onClose={() => setMessage({ text: '', type: '' })}>
                    {message.text}
                </Alert>
            )}

            <Row>
                {/* Guarantor Form Card */}
                <Col lg={4} className="mb-4">
                    <Card className="h-100">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">
                                {editingGuarantor ? '✏️ Edit Guarantor' : '➕ Add New Guarantor'}
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Guarantor Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter guarantor name"
                                        required
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Contact Number *</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        placeholder="Enter contact number"
                                        pattern="[0-9]{10}"
                                        required
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Relationship</Form.Label>
                                    <Form.Select
                                        name="relation"
                                        value={formData.relation}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="Friend">Friend</option>
                                        <option value="Relative">Relative</option>
                                        <option value="Family">Family</option>
                                        <option value="Colleague">Colleague</option>
                                        <option value="Business Partner">Business Partner</option>
                                        <option value="Other">Other</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Associated Borrower *</Form.Label>
                                    <Form.Select
                                        name="borrower_id"
                                        value={formData.borrower_id}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select Borrower</option>
                                        {borrowers.map(borrower => (
                                            <option key={borrower.borrower_id} value={borrower.borrower_id}>
                                                {borrower.name} (ID: {borrower.borrower_id})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button 
                                        variant="success" 
                                        type="submit" 
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Spinner animation="border" size="sm" className="me-2" />
                                        ) : editingGuarantor ? (
                                            '💾 Update Guarantor'
                                        ) : (
                                            '➕ Add Guarantor'
                                        )}
                                    </Button>
                                    
                                    {editingGuarantor && (
                                        <Button 
                                            variant="secondary" 
                                            onClick={resetForm}
                                            disabled={loading}
                                        >
                                            ❌ Cancel Edit
                                        </Button>
                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Guarantors List Card */}
                <Col lg={8}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center bg-info text-white">
                            <h5 className="mb-0">📋 Guarantors List</h5>
                            <Badge bg="light" text="dark">{guarantors.length} Total</Badge>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2">Loading guarantors...</p>
                                </div>
                            ) : (
                                <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    <Table hover striped>
                                        <thead className="table-dark sticky-top">
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Contact</th>
                                                <th>Relationship</th>
                                                <th>Borrower</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {guarantors.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4 text-muted">
                                                        <div className="mb-2" style={{ fontSize: '2rem' }}>👥</div>
                                                        <h6>No guarantors found</h6>
                                                        <p>Add your first guarantor using the form</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                guarantors.map(guarantor => (
                                                    <tr key={guarantor.guarantor_id}>
                                                        <td>
                                                            <Badge bg="primary">#{guarantor.guarantor_id}</Badge>
                                                        </td>
                                                        <td className="fw-bold">{guarantor.name}</td>
                                                        <td>{guarantor.contact}</td>
                                                        <td>
                                                            <Badge bg="secondary">{guarantor.relation}</Badge>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <strong>{guarantor.borrower_name}</strong>
                                                                <div className="small text-muted">
                                                                    Contact: {guarantor.borrower_contact}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="btn-group btn-group-sm">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => handleEdit(guarantor)}
                                                                >
                                                                    ✏️
                                                                </Button>
                                                                <Button
                                                                    variant="outline-info"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedLoan('');
                                                                        setShowLinkModal(true);
                                                                    }}
                                                                >
                                                                    🔗
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(guarantor.guarantor_id)}
                                                                >
                                                                    🗑️
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Link Guarantor to Loan Modal */}
            <Modal show={showLinkModal} onHide={() => setShowLinkModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>🔗 Link Guarantor to Loan</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Select Loan</Form.Label>
                        <Form.Select
                            value={selectedLoan}
                            onChange={(e) => setSelectedLoan(e.target.value)}
                        >
                            <option value="">Choose a loan...</option>
                            {loans.map(loan => (
                                <option key={loan.loan_id} value={loan.loan_id}>
                                    Loan #{loan.loan_id} - {loan.borrower_name} - ₹{loan.amount}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <div className="mt-3">
                        <small className="text-muted">
                            This will link the selected guarantor to the chosen loan for security purposes.
                        </small>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLinkModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => handleLinkGuarantor(guarantors[0]?.guarantor_id)}
                        disabled={!selectedLoan}
                    >
                        🔗 Link to Loan
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default GuarantorManagement;