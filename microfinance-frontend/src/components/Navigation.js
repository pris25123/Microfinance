import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const { admin, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="navbar-custom">
            <Container>
                <Navbar.Brand className="brand-text">
                    💰 Microfinance Loan Management System
                    {admin && <small className="ms-2 text-warning">(Admin Mode)</small>}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <LinkContainer to="/">
                            <Nav.Link className="nav-link-custom">
                                🏠 Dashboard
                            </Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/borrowers">
                            <Nav.Link className="nav-link-custom">
                                👥 Borrowers
                            </Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/loans">
                            <Nav.Link className="nav-link-custom">
                                📄 All Loans
                            </Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/repayments">
                            <Nav.Link className="nav-link-custom">
                                💳 Repayments
                            </Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/guarantors">
                            <Nav.Link className="nav-link-custom">
                                🤝 Guarantors
                            </Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/staff-management">
                            <Nav.Link>👨‍💼 Staff</Nav.Link>
                        </LinkContainer>
                        
                        <LinkContainer to="/analytics">
                            <Nav.Link className="nav-link-custom">
                                📊 Analytics
                            </Nav.Link>
                        </LinkContainer>
                        {admin && (
                            <Button 
                                variant="outline-light" 
                                onClick={handleLogout}
                                className="ms-3"
                            >
                                🚪 Logout
                            </Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;