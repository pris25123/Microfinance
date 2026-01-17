import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Badge, Modal, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';

const BorrowerManagement = () => {
    const [borrowers, setBorrowers] = useState([]);
    const [guarantors, setGuarantors] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        income: '',
        address: '',
        region_id: 1,
        loan_amount: '',
        interest_rate: '',
        tenure: '',
        // Guarantor fields
        guarantor_name: '',
        guarantor_contact: '',
        guarantor_relation: 'Friend'
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEMIModal, setShowEMIModal] = useState(false);
    const [emiResult, setEmiResult] = useState(null);
    const [selectedBorrower, setSelectedBorrower] = useState(null);
    const [showGuarantorModal, setShowGuarantorModal] = useState(false);
    const [activeTab, setActiveTab] = useState('borrower');

    useEffect(() => {
        fetchBorrowers();
        fetchGuarantors();
    }, []);

    const fetchBorrowers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/borrowers');
            const sortedBorrowers = response.data.sort((a, b) => b.borrower_id - a.borrower_id);
            setBorrowers(sortedBorrowers);
        } catch (error) {
            setMessage('❌ Error fetching borrowers data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchGuarantors = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/guarantors');
            setGuarantors(response.data);
        } catch (error) {
            console.error('Error fetching guarantors:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // First register the borrower
            const borrowerResponse = await axios.post('http://localhost:5000/api/borrowers', {
                name: formData.name,
                contact: formData.contact,
                income: formData.income,
                region_id: formData.region_id
            });
            
            const borrowerId = borrowerResponse.data.borrower_id;
            
            // Add guarantor if provided
            if (formData.guarantor_name && formData.guarantor_contact) {
                try {
                    await axios.post('http://localhost:5000/api/guarantors', {
                        name: formData.guarantor_name,
                        contact: formData.guarantor_contact,
                        relation: formData.guarantor_relation,
                        borrower_id: borrowerId
                    });
                } catch (guarantorError) {
                    console.error('Error adding guarantor:', guarantorError);
                    // Continue even if guarantor fails
                }
            }
            
            // Apply for loan if loan details are provided
            if (formData.loan_amount && formData.interest_rate && formData.tenure) {
                await axios.post('http://localhost:5000/api/loans', {
                    borrower_id: borrowerId,
                    amount: formData.loan_amount,
                    interest_rate: formData.interest_rate,
                    tenure: formData.tenure
                });
                
                setMessage(`✅ Borrower registered successfully with ID: ${borrowerId}, guarantor added, and loan application submitted!`);
            } else {
                setMessage(`✅ Borrower registered successfully with ID: ${borrowerId}${formData.guarantor_name ? ' with guarantor' : ''}`);
            }
            
            // Reset form
            setFormData({ 
                name: '', 
                contact: '', 
                income: '', 
                address: '',
                region_id: 1,
                loan_amount: '', 
                interest_rate: '', 
                tenure: '',
                guarantor_name: '',
                guarantor_contact: '',
                guarantor_relation: 'Friend'
            });
            
            fetchBorrowers();
            fetchGuarantors();
            
        } catch (error) {
            setMessage('❌ Error: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const addGuarantorToBorrower = async (e) => {
        e.preventDefault();
        if (!selectedBorrower) return;
        
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/guarantors', {
                name: formData.guarantor_name,
                contact: formData.guarantor_contact,
                relation: formData.guarantor_relation,
                borrower_id: selectedBorrower.borrower_id
            });
            
            setMessage(`✅ Guarantor added successfully to ${selectedBorrower.name}`);
            setFormData(prev => ({
                ...prev,
                guarantor_name: '',
                guarantor_contact: '',
                guarantor_relation: 'Friend'
            }));
            setShowGuarantorModal(false);
            fetchGuarantors();
            
        } catch (error) {
            setMessage('❌ Error adding guarantor: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const calculateEMI = async () => {
        if (!formData.loan_amount || !formData.interest_rate || !formData.tenure) {
            setMessage('❌ Please fill loan amount, interest rate, and tenure to calculate EMI');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/calculate-emi', {
                amount: parseFloat(formData.loan_amount),
                interest_rate: parseFloat(formData.interest_rate),
                tenure: parseInt(formData.tenure)
            });

            setEmiResult({
                emi: response.data.emi,
                totalPayment: response.data.totalPayment,
                totalInterest: response.data.totalInterest
            });
            setShowEMIModal(true);
        } catch (error) {
            setMessage('❌ Error calculating EMI: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getBorrowerGuarantors = (borrowerId) => {
        return guarantors.filter(g => g.borrower_id === borrowerId);
    };

    return (
        <Container className="mt-4">
            <Row className="mb-4">
                <Col>
                    <div className="text-center">
                        <h2 className="text-white mb-3">👥 Borrower & Guarantor Management</h2>
                        <p className="text-white-50">Register borrowers, add guarantors, and apply for loans</p>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col lg={6} className="mb-4">
                    <Card className="h-100">
                        <Card.Header className="bg-primary text-white">
                            <Tabs 
                                activeKey={activeTab} 
                                onSelect={(tab) => setActiveTab(tab)} 
                                className="mb-0"
                            >
                                <Tab eventKey="borrower" title="👤 Borrower & Loan" />
                                <Tab eventKey="guarantor" title="🤝 Add Guarantor" />
                            </Tabs>
                        </Card.Header>
                        <Card.Body>
                            {message && <Alert variant={message.includes('❌') ? 'danger' : 'success'}>{message}</Alert>}
                            
                            {activeTab === 'borrower' && (
                                <Form onSubmit={handleSubmit}>
                                    <h6 className="text-primary mb-3">👤 Borrower Information</h6>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Full Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter borrower's full name"
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
                                            placeholder="Enter 10-digit phone number"
                                            pattern="[0-9]{10}"
                                            required
                                            disabled={loading}
                                        />
                                        <Form.Text className="text-muted">Must be 10 digits without spaces or special characters</Form.Text>
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label>Monthly Income (₹) *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="income"
                                            value={formData.income}
                                            onChange={handleChange}
                                            placeholder="Enter monthly income"
                                            min="0"
                                            step="0.01"
                                            required
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label>Address</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Enter borrower's address"
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <h6 className="text-primary mb-3 mt-4">🤝 Guarantor Information (Optional)</h6>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Guarantor Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="guarantor_name"
                                                    value={formData.guarantor_name}
                                                    onChange={handleChange}
                                                    placeholder="Guarantor name"
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Relationship</Form.Label>
                                                <Form.Select
                                                    name="guarantor_relation"
                                                    value={formData.guarantor_relation}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                >
                                                    <option value="Friend">Friend</option>
                                                    <option value="Relative">Relative</option>
                                                    <option value="Family">Family</option>
                                                    <option value="Colleague">Colleague</option>
                                                    <option value="Business Partner">Business Partner</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Guarantor Contact</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="guarantor_contact"
                                            value={formData.guarantor_contact}
                                            onChange={handleChange}
                                            placeholder="Guarantor contact number"
                                            pattern="[0-9]{10}"
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                    
                                    <hr />
                                    <h6 className="text-primary mb-3">💳 Loan Details (Optional)</h6>
                                    
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Loan Amount (₹)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="loan_amount"
                                                    value={formData.loan_amount}
                                                    onChange={handleChange}
                                                    placeholder="Loan amount"
                                                    min="0"
                                                    step="0.01"
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Interest Rate (%)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    name="interest_rate"
                                                    value={formData.interest_rate}
                                                    onChange={handleChange}
                                                    placeholder="Interest rate"
                                                    min="0.1"
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    
                                    <Form.Group className="mb-4">
                                        <Form.Label>Tenure (months)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="tenure"
                                            value={formData.tenure}
                                            onChange={handleChange}
                                            placeholder="Loan tenure in months"
                                            min="1"
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                    
                                    <div className="d-grid gap-2">
                                        <Button 
                                            variant="outline-primary" 
                                            onClick={calculateEMI}
                                            disabled={!formData.loan_amount || !formData.interest_rate || !formData.tenure}
                                        >
                                            📊 Calculate EMI
                                        </Button>
                                        <Button variant="success" type="submit" disabled={loading} size="lg">
                                            {loading ? 'Processing...' : '🚀 Register Borrower & Apply Loan'}
                                        </Button>
                                    </div>
                                </Form>
                            )}

                            {activeTab === 'guarantor' && (
                                <Form onSubmit={addGuarantorToBorrower}>
                                    <h6 className="text-primary mb-3">🤝 Add Guarantor to Existing Borrower</h6>
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label>Select Borrower *</Form.Label>
                                        <Form.Select
                                            value={selectedBorrower ? selectedBorrower.borrower_id : ''}
                                            onChange={(e) => {
                                                const borrower = borrowers.find(b => b.borrower_id === parseInt(e.target.value));
                                                setSelectedBorrower(borrower);
                                            }}
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Choose a borrower...</option>
                                            {borrowers.map(borrower => (
                                                <option key={borrower.borrower_id} value={borrower.borrower_id}>
                                                    {borrower.name} (ID: {borrower.borrower_id})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Guarantor Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="guarantor_name"
                                                    value={formData.guarantor_name}
                                                    onChange={handleChange}
                                                    placeholder="Guarantor name"
                                                    required
                                                    disabled={loading || !selectedBorrower}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Relationship *</Form.Label>
                                                <Form.Select
                                                    name="guarantor_relation"
                                                    value={formData.guarantor_relation}
                                                    onChange={handleChange}
                                                    required
                                                    disabled={loading || !selectedBorrower}
                                                >
                                                    <option value="Friend">Friend</option>
                                                    <option value="Relative">Relative</option>
                                                    <option value="Family">Family</option>
                                                    <option value="Colleague">Colleague</option>
                                                    <option value="Business Partner">Business Partner</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    
                                    <Form.Group className="mb-4">
                                        <Form.Label>Guarantor Contact *</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="guarantor_contact"
                                            value={formData.guarantor_contact}
                                            onChange={handleChange}
                                            placeholder="Guarantor contact number"
                                            pattern="[0-9]{10}"
                                            required
                                            disabled={loading || !selectedBorrower}
                                        />
                                    </Form.Group>
                                    
                                    <div className="d-grid">
                                        <Button 
                                            variant="primary" 
                                            type="submit" 
                                            disabled={loading || !selectedBorrower}
                                            size="lg"
                                        >
                                            {loading ? 'Adding...' : '🤝 Add Guarantor'}
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col lg={6}>
                    <Card className="h-100">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-info text-white">
                            <h4 className="mb-0">📋 Registered Borrowers & Guarantors</h4>
                            <Badge bg="light" text="dark">{borrowers.length} Borrowers</Badge>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary mb-3"></div>
                                    <p>Loading data...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                        <Table hover className="mb-0">
                                            <thead className="bg-light sticky-top">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Name</th>
                                                    <th>Contact</th>
                                                    <th>Income</th>
                                                    <th>Guarantors</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {borrowers.map((borrower) => {
                                                    const borrowerGuarantors = getBorrowerGuarantors(borrower.borrower_id);
                                                    return (
                                                        <tr key={borrower.borrower_id}>
                                                            <td><Badge bg="primary">#{borrower.borrower_id}</Badge></td>
                                                            <td className="fw-bold">{borrower.name}</td>
                                                            <td className="font-monospace">{borrower.contact}</td>
                                                            <td><Badge bg="success">{formatCurrency(borrower.income)}</Badge></td>
                                                            <td>
                                                                {borrowerGuarantors.length > 0 ? (
                                                                    <div>
                                                                        {borrowerGuarantors.map(guarantor => (
                                                                            <Badge 
                                                                                key={guarantor.guarantor_id} 
                                                                                bg="warning" 
                                                                                text="dark" 
                                                                                className="me-1 mb-1"
                                                                            >
                                                                                {guarantor.name}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <Badge bg="secondary">No Guarantor</Badge>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                    {borrowers.length === 0 && (
                                        <div className="text-center py-4 text-muted">
                                            <div className="mb-3" style={{ fontSize: '2.5rem' }}>👥</div>
                                            <h5>No borrowers registered yet</h5>
                                            <p>Start by registering a new borrower</p>
                                        </div>
                                    )}
                                    <div className="p-3 border-top">
                                        <div className="d-grid gap-2">
                                            <Button variant="outline-primary" onClick={fetchBorrowers} disabled={loading}>
                                                🔄 Refresh List
                                            </Button>
                                            <Button 
                                                variant="outline-info" 
                                                onClick={() => {
                                                    setActiveTab('guarantor');
                                                    window.scrollTo(0, 0);
                                                }}
                                            >
                                                ➕ Add Guarantor to Borrower
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* EMI Calculator Modal */}
            <Modal show={showEMIModal} onHide={() => setShowEMIModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>📊 EMI Calculation Result</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {emiResult && (
                        <div>
                            <div className="text-center mb-4">
                                <h4 className="text-primary">₹{emiResult.emi}</h4>
                                <p className="text-muted">Monthly EMI</p>
                            </div>
                            
                            <Row className="text-center">
                                <Col md={4}>
                                    <div className="border rounded p-3">
                                        <h6 className="text-success">Total Payment</h6>
                                        <p className="fw-bold">₹{emiResult.totalPayment}</p>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="border rounded p-3">
                                        <h6 className="text-warning">Principal</h6>
                                        <p className="fw-bold">₹{formData.loan_amount}</p>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="border rounded p-3">
                                        <h6 className="text-danger">Total Interest</h6>
                                        <p className="fw-bold">₹{emiResult.totalInterest}</p>
                                    </div>
                                </Col>
                            </Row>
                            
                            <div className="mt-4">
                                <h6>Loan Details:</h6>
                                <p><strong>Amount:</strong> ₹{formData.loan_amount}</p>
                                <p><strong>Interest Rate:</strong> {formData.interest_rate}%</p>
                                <p><strong>Tenure:</strong> {formData.tenure} months</p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowEMIModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default BorrowerManagement;