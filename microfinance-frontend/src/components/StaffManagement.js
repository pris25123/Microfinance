import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        role: 'Loan Officer',
        branch_id: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStaff();
        fetchBranches();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/staff');
            // Sort staff by ID to ensure sequence
            const sortedStaff = response.data.sort((a, b) => a.staff_id - b.staff_id);
            setStaff(sortedStaff);
        } catch (error) {
            setMessage({ text: '❌ Error fetching staff: ' + error.message, type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/branches');
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
            setMessage({ text: '❌ Error fetching branches', type: 'danger' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim() || !formData.branch_id) {
            setMessage({ text: '❌ Please fill all required fields', type: 'danger' });
            return;
        }

        setLoading(true);

        try {
            // Send only the required fields - let the database auto-generate the ID
            const staffData = {
                name: formData.name,
                role: formData.role,
                branch_id: formData.branch_id
            };

            await axios.post('http://localhost:5000/api/staff', staffData);
            setMessage({ text: '✅ Staff member added successfully!', type: 'success' });
            setFormData({ name: '', role: 'Loan Officer', branch_id: '' });
            fetchStaff(); // Refresh the list
        } catch (error) {
            console.error('Error adding staff:', error);
            setMessage({ 
                text: '❌ Error: ' + (error.response?.data?.error || error.message), 
                type: 'danger' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const getRoleBadge = (role) => {
        const variants = {
            'Branch Manager': 'success',
            'Loan Officer': 'primary',
            'Admin': 'warning'
        };
        return variants[role] || 'secondary';
    };

    return (
        <div className="bg-light min-vh-100">
            <Container fluid className="py-4">
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <div className="text-center">
                            <h2 className="text-dark mb-3">👨‍💼 Staff Management</h2>
                            <p className="text-muted">Manage bank staff members and their assignments</p>
                        </div>
                    </Col>
                </Row>

                {/* Message Alert */}
                {message.text && (
                    <Alert variant={message.type} dismissible onClose={() => setMessage({ text: '', type: '' })}>
                        {message.text}
                    </Alert>
                )}

                {/* Main Content */}
                <Row>
                    {/* Add Staff Form */}
                    <Col lg={4} className="mb-4">
                        <Card className="h-100">
                            <Card.Header className="bg-primary text-white">
                                <h5 className="mb-0">➕ Add New Staff</h5>
                            </Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Staff Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter staff name"
                                            required
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Role *</Form.Label>
                                        <Form.Select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            disabled={loading}
                                        >
                                            <option value="Loan Officer">Loan Officer</option>
                                            <option value="Branch Manager">Branch Manager</option>
                                            <option value="Admin">Admin</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Assign to Branch *</Form.Label>
                                        <Form.Select
                                            name="branch_id"
                                            value={formData.branch_id}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Select Branch</option>
                                            {branches.map(branch => (
                                                <option key={branch.branch_id} value={branch.branch_id}>
                                                    {branch.location} (ID: {branch.branch_id})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button 
                                            variant="success" 
                                            type="submit" 
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <Spinner animation="border" size="sm" className="me-2" />
                                            ) : (
                                                '➕ Add Staff Member'
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Staff List */}
                    <Col lg={8}>
                        <Card className="h-100">
                            <Card.Header className="d-flex justify-content-between align-items-center bg-info text-white">
                                <h5 className="mb-0">📋 Staff List</h5>
                                <Badge bg="light" text="dark">{staff.length} Total Staff</Badge>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {loading ? (
                                    <div className="text-center py-4">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2">Loading staff...</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive" style={{ maxHeight: '500px' }}>
                                        <Table hover striped className="mb-0">
                                            <thead className="table-dark sticky-top">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Name</th>
                                                    <th>Role</th>
                                                    <th>Branch</th>
                                                    <th>Loans Approved</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {staff.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-5 text-muted">
                                                            <div className="mb-3" style={{ fontSize: '3rem' }}>👨‍💼</div>
                                                            <h5>No staff members found</h5>
                                                            <p className="mb-0">Add your first staff member using the form</p>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    staff.map(staffMember => (
                                                        <tr key={staffMember.staff_id}>
                                                            <td>
                                                                <Badge bg="primary">#{staffMember.staff_id}</Badge>
                                                            </td>
                                                            <td className="fw-bold">{staffMember.name}</td>
                                                            <td>
                                                                <Badge bg={getRoleBadge(staffMember.role)}>
                                                                    {staffMember.role}
                                                                </Badge>
                                                            </td>
                                                            <td>{staffMember.branch_location}</td>
                                                            <td>
                                                                <Badge bg="light" text="primary">
                                                                    {staffMember.loans_approved || 0} loans
                                                                </Badge>
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
            </Container>
        </div>
    );
};

export default StaffManagement;