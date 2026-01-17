const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'hagriddobby1@',
    database: process.env.DB_NAME || 'loan_management'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// Helper function to calculate EMI
function calculateEMI(principal, annualRate, months) {
    const monthlyRate = annualRate / 12 / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                (Math.pow(1 + monthlyRate, months) - 1);
    return isNaN(emi) ? 0 : parseFloat(emi.toFixed(2));
}

// =============================================
// API ENDPOINTS (CLEAN VERSION - NO DUPLICATES)
// =============================================

// ✅ EMI Calculation
app.post('/api/calculate-emi', (req, res) => {
    const { amount, interest_rate, tenure } = req.body;
    
    if (!amount || !interest_rate || !tenure) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const principal = parseFloat(amount);
    const rate = parseFloat(interest_rate);
    const months = parseInt(tenure);

    const emi = calculateEMI(principal, rate, months);
    
    res.json({ 
        emi: emi.toFixed(2),
        totalPayment: (emi * months).toFixed(2),
        totalInterest: ((emi * months) - principal).toFixed(2)
    });
});

// ✅ Borrower Management
app.get('/api/borrowers', (req, res) => {
    db.query('SELECT * FROM Borrower ORDER BY borrower_id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/borrowers', (req, res) => {
    const { name, contact, income, region_id } = req.body;
    
    if (!name || !contact || !income) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'INSERT INTO Borrower (name, contact, income, region_id) VALUES (?, ?, ?, ?)';
    db.query(query, [name, contact, income, region_id || 1], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ 
            message: 'Borrower registered successfully', 
            borrower_id: results.insertId 
        });
    });
});

// ✅ Loan Management
app.get('/api/loans', (req, res) => {
    const query = `
        SELECT 
            l.loan_id, l.borrower_id, b.name as borrower_name, 
            l.amount, l.interest_rate, l.tenure, l.start_date, l.status,
            s.name as staff_name, br.location as branch_location
        FROM Loan l
        JOIN Borrower b ON l.borrower_id = b.borrower_id
        LEFT JOIN LoanApproval la ON l.loan_id = la.loan_id
        LEFT JOIN Staff s ON la.staff_id = s.staff_id
        LEFT JOIN Branch br ON la.branch_id = br.branch_id
        WHERE l.status != 'Demo'
        ORDER BY l.loan_id DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/loans', (req, res) => {
    const { borrower_id, amount, interest_rate, tenure } = req.body;
    
    if (!borrower_id || !amount || !interest_rate || !tenure) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const loanQuery = 'INSERT INTO Loan (borrower_id, amount, interest_rate, tenure, start_date, status) VALUES (?, ?, ?, ?, CURDATE(), "Pending")';
    db.query(loanQuery, [borrower_id, amount, interest_rate, tenure], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({ 
            message: 'Loan application submitted for admin approval', 
            loan_id: results.insertId,
            status: 'Pending'
        });
    });
});

// ✅ Loan Approval/Rejection
app.put('/api/loans/:loan_id/approve', (req, res) => {
    const loanId = req.params.loan_id;
    const { staff_id = 1, branch_id = 1 } = req.body;

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: err.message });

        // Check if loan exists and is pending
        const checkQuery = 'SELECT * FROM Loan WHERE loan_id = ? AND status = "Pending"';
        db.query(checkQuery, [loanId], (err, results) => {
            if (err) {
                db.rollback();
                return res.status(500).json({ error: err.message });
            }

            if (results.length === 0) {
                db.rollback();
                return res.status(404).json({ error: 'Loan not found or already processed' });
            }

            const loan = results[0];

            // Update loan status
            const updateLoanQuery = 'UPDATE Loan SET status = "Approved" WHERE loan_id = ?';
            db.query(updateLoanQuery, [loanId], (err) => {
                if (err) {
                    db.rollback();
                    return res.status(500).json({ error: err.message });
                }

                // Create approval record
                const approvalQuery = 'INSERT INTO LoanApproval (loan_id, staff_id, branch_id, approval_date) VALUES (?, ?, ?, CURDATE())';
                db.query(approvalQuery, [loanId, staff_id, branch_id], (err) => {
                    if (err) {
                        db.rollback();
                        return res.status(500).json({ error: err.message });
                    }

                    // Generate repayment schedule
                    const emi = calculateEMI(loan.amount, loan.interest_rate, loan.tenure);
                    const repaymentQueries = [];
                    
                    for (let i = 1; i <= loan.tenure; i++) {
                        const dueDate = new Date();
                        dueDate.setMonth(dueDate.getMonth() + i);
                        
                        repaymentQueries.push([
                            loanId,
                            dueDate.toISOString().split('T')[0],
                            emi,
                            0, 0, 'Pending'
                        ]);
                    }

                    const repaymentQuery = 'INSERT INTO Repayment (loan_id, due_date, amount_due, amount_paid, penalty, status) VALUES ?';
                    db.query(repaymentQuery, [repaymentQueries], (err) => {
                        if (err) {
                            console.log('Repayment schedule creation failed:', err.message);
                        }

                        db.commit((err) => {
                            if (err) {
                                db.rollback();
                                return res.status(500).json({ error: err.message });
                            }
                            
                            res.json({ 
                                message: 'Loan approved successfully!', 
                                loan_id: loanId,
                                emi: emi.toFixed(2)
                            });
                        });
                    });
                });
            });
        });
    });
});

app.put('/api/loans/:loan_id/reject', (req, res) => {
    const loanId = req.params.loan_id;
    const { reason } = req.body;

    const checkQuery = 'SELECT * FROM Loan WHERE loan_id = ? AND status = "Pending"';
    db.query(checkQuery, [loanId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(404).json({ error: 'Loan not found or already processed' });
        }

        const updateQuery = 'UPDATE Loan SET status = "Rejected" WHERE loan_id = ?';
        db.query(updateQuery, [loanId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({ 
                message: 'Loan rejected successfully!', 
                loan_id: loanId,
                reason: reason || 'Not specified'
            });
        });
    });
});

// ✅ Repayment Management
app.get('/api/repayments', (req, res) => {
    const query = `
        SELECT 
            r.repayment_id, r.loan_id, b.name as borrower_name,
            r.due_date, r.amount_due, r.amount_paid, r.penalty, r.status
        FROM Repayment r
        JOIN Loan l ON r.loan_id = l.loan_id
        JOIN Borrower b ON l.borrower_id = b.borrower_id
        WHERE l.status != 'Demo'
        ORDER BY r.due_date ASC
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.put('/api/repayments/:repayment_id/pay', (req, res) => {
    const repaymentId = req.params.repayment_id;
    const { amount_paid } = req.body;
    
    if (!amount_paid || amount_paid <= 0) {
        return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const getQuery = 'SELECT * FROM Repayment WHERE repayment_id = ?';
    db.query(getQuery, [repaymentId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Repayment record not found' });
        
        const repayment = results[0];
        const newAmountPaid = parseFloat(repayment.amount_paid) + parseFloat(amount_paid);
        
        const updateQuery = `
            UPDATE Repayment 
            SET amount_paid = ?, 
                status = ?,
                penalty = CASE 
                    WHEN ? < amount_due AND due_date < CURDATE() THEN (amount_due - ?) * 0.02 
                    ELSE penalty 
                END
            WHERE repayment_id = ?
        `;
        
        const newStatus = newAmountPaid >= repayment.amount_due ? 'Paid' : 
                         newAmountPaid > 0 ? 'Partial' : 'Pending';
        
        db.query(updateQuery, [newAmountPaid, newStatus, newAmountPaid, newAmountPaid, repaymentId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ 
                message: 'Payment processed successfully',
                repayment_id: repaymentId,
                amount_paid: newAmountPaid,
                status: newStatus
            });
        });
    });
});

// ✅ Analytics Endpoints
app.get('/api/analytics/portfolio-summary', (req, res) => {
    const query = `
        SELECT 
            COUNT(*) as total_loans,
            SUM(amount) as total_portfolio,
            AVG(amount) as average_loan_size,
            SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as active_loans,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_loans
        FROM Loan WHERE status != 'Demo'
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || {});
    });
});

app.get('/api/analytics/defaulters', (req, res) => {
    const query = `
        SELECT 
            b.name AS borrower_name, l.loan_id,
            DATEDIFF(CURDATE(), r.due_date) AS days_overdue,
            (r.amount_due - COALESCE(r.amount_paid, 0)) AS due_amount
        FROM Borrower b
        JOIN Loan l ON b.borrower_id = l.borrower_id
        JOIN Repayment r ON l.loan_id = r.loan_id
        WHERE r.due_date < CURDATE() 
        AND (r.amount_paid IS NULL OR r.amount_paid < r.amount_due)
        AND l.status = 'Approved'
        ORDER BY days_overdue DESC
        LIMIT 10
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Complex Queries
app.get('/api/analytics/nested-query', (req, res) => {
    const query = `
        SELECT b.name, b.contact 
        FROM Borrower b
        WHERE b.borrower_id IN (
            SELECT l.borrower_id 
            FROM Loan l 
            JOIN Repayment r ON l.loan_id = r.loan_id 
            WHERE r.amount_paid < r.amount_due
            AND r.due_date < CURDATE()
            AND l.status = 'Approved'
        )
        LIMIT 10
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/analytics/join-query', (req, res) => {
    const query = `
        SELECT 
            l.loan_id, b.name AS borrower_name, br.location AS branch_location,
            s.name AS approved_by, l.amount, l.status
        FROM Loan l
        JOIN Borrower b ON l.borrower_id = b.borrower_id
        JOIN LoanApproval la ON l.loan_id = la.loan_id
        JOIN Staff s ON la.staff_id = s.staff_id
        JOIN Branch br ON la.branch_id = br.branch_id
        WHERE l.status = 'Approved'
        ORDER BY l.loan_id DESC
        LIMIT 10
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/analytics/aggregate-query', (req, res) => {
    const query = `
        SELECT 
            r.name AS region_name,
            COUNT(l.loan_id) AS total_loans,
            AVG(l.amount) AS avg_loan_size,
            SUM(l.amount) AS total_disbursed,
            MAX(l.amount) AS max_loan,
            MIN(l.amount) AS min_loan
        FROM Region r
        LEFT JOIN Borrower b ON r.region_id = b.region_id
        LEFT JOIN Loan l ON b.borrower_id = l.borrower_id
        WHERE l.status = 'Approved' OR l.status IS NULL
        GROUP BY r.region_id, r.name
        HAVING total_loans > 0
        ORDER BY total_disbursed DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ✅ Admin Authentication
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
        res.json({
            success: true,
            admin: { id: 1, username: 'admin', name: 'System Administrator' }
        });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

// ✅ Staff Management
app.get('/api/staff', (req, res) => {
    const query = `
        SELECT 
            s.staff_id, s.name, s.role, b.location as branch_location,
            COUNT(la.loan_id) as loans_approved
        FROM Staff s
        LEFT JOIN Branch b ON s.branch_id = b.branch_id
        LEFT JOIN LoanApproval la ON s.staff_id = la.staff_id
        GROUP BY s.staff_id, s.name, s.role, b.location
        ORDER BY s.staff_id ASC
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/staff', (req, res) => {
    const { name, role, branch_id } = req.body;
    
    if (!name || !role) {
        return res.status(400).json({ error: 'Name and role are required' });
    }

    const getNextIdQuery = 'SELECT COALESCE(MAX(staff_id), 0) + 1 as next_id FROM Staff';
    
    db.query(getNextIdQuery, (err, idResults) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const nextId = idResults[0].next_id;
        const insertQuery = 'INSERT INTO Staff (staff_id, name, role, branch_id) VALUES (?, ?, ?, ?)';
        
        db.query(insertQuery, [nextId, name, role, branch_id || null], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({ 
                message: 'Staff member added successfully',
                staff_id: nextId
            });
        });
    });
});

// ✅ Guarantor Management - FIXED WITH UPDATE AND DELETE ENDPOINTS
app.get('/api/guarantors', (req, res) => {
    const query = `
        SELECT 
            g.guarantor_id, g.name, g.contact, g.relation, g.borrower_id,
            b.name as borrower_name, b.contact as borrower_contact
        FROM Guarantor g
        LEFT JOIN Borrower b ON g.borrower_id = b.borrower_id
        ORDER BY g.guarantor_id DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/guarantors', (req, res) => {
    const { name, contact, relation, borrower_id } = req.body;
    
    if (!name || !contact || !borrower_id) {
        return res.status(400).json({ error: 'Name, contact, and borrower ID are required' });
    }

    const getNextIdQuery = 'SELECT COALESCE(MAX(guarantor_id), 0) + 1 as next_id FROM Guarantor';
    
    db.query(getNextIdQuery, (err, idResults) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const nextId = idResults[0].next_id;
        const insertQuery = 'INSERT INTO Guarantor (guarantor_id, name, contact, relation, borrower_id) VALUES (?, ?, ?, ?, ?)';
        
        db.query(insertQuery, [nextId, name, contact, relation || 'Friend', borrower_id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({ 
                message: 'Guarantor added successfully',
                guarantor_id: nextId
            });
        });
    });
});

// ✅ ADDED: Update guarantor endpoint
app.put('/api/guarantors/:guarantor_id', (req, res) => {
    const guarantorId = req.params.guarantor_id;
    const { name, contact, relation, borrower_id } = req.body;
    
    if (!name || !contact || !borrower_id) {
        return res.status(400).json({ error: 'Name, contact, and borrower ID are required' });
    }

    const updateQuery = 'UPDATE Guarantor SET name = ?, contact = ?, relation = ?, borrower_id = ? WHERE guarantor_id = ?';
    
    db.query(updateQuery, [name, contact, relation, borrower_id, guarantorId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Guarantor not found' });
        }
        
        res.json({ 
            message: 'Guarantor updated successfully',
            guarantor_id: guarantorId
        });
    });
});

// ✅ ADDED: Delete guarantor endpoint
app.delete('/api/guarantors/:guarantor_id', (req, res) => {
    const guarantorId = req.params.guarantor_id;

    // First, delete any associations in LoanGuarantor table
    const deleteAssociationsQuery = 'DELETE FROM LoanGuarantor WHERE guarantor_id = ?';
    
    db.query(deleteAssociationsQuery, [guarantorId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Then delete the guarantor
        const deleteGuarantorQuery = 'DELETE FROM Guarantor WHERE guarantor_id = ?';
        
        db.query(deleteGuarantorQuery, [guarantorId], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Guarantor not found' });
            }
            
            res.json({ 
                message: 'Guarantor deleted successfully',
                guarantor_id: guarantorId
            });
        });
    });
});

// ✅ Branches
app.get('/api/branches', (req, res) => {
    const query = `
        SELECT 
            b.branch_id, b.location, r.name as region_name,
            COUNT(DISTINCT s.staff_id) as total_staff,
            COUNT(la.loan_id) as total_loans_approved
        FROM Branch b
        LEFT JOIN Region r ON b.region_id = r.region_id
        LEFT JOIN Staff s ON b.branch_id = s.branch_id
        LEFT JOIN LoanApproval la ON b.branch_id = la.branch_id
        GROUP BY b.branch_id, b.location, r.name
        ORDER BY b.branch_id
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    db.query('SELECT 1', (err) => {
        if (err) return res.status(500).json({ status: 'Database connection failed' });
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
});

// ✅ Debug Endpoint - Check Loan Data
app.get('/api/debug/loans-data', (req, res) => {
    const query = `
        SELECT 
            l.loan_id,
            l.amount,
            l.status,
            l.interest_rate,
            l.tenure,
            b.name as borrower_name,
            r.name as region_name
        FROM Loan l
        JOIN Borrower b ON l.borrower_id = b.borrower_id
        LEFT JOIN Region r ON b.region_id = r.region_id
        ORDER BY l.loan_id DESC
        LIMIT 20
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ✅ Regional Analysis Endpoint
app.get('/api/analytics/regional', (req, res) => {
    const query = `
        SELECT 
            r.region_id,
            r.name AS region_name,
            COUNT(DISTINCT b.borrower_id) AS total_borrowers,
            COUNT(DISTINCT l.loan_id) AS total_loans,
            COALESCE(SUM(l.amount), 0) AS total_approved_amount,
            COALESCE(AVG(l.amount), 0) AS avg_loan_amount,
            SUM(CASE WHEN l.status = 'Pending' THEN 1 ELSE 0 END) AS pending_loans,
            SUM(CASE WHEN l.status = 'Approved' THEN 1 ELSE 0 END) AS approved_loans,
            SUM(CASE WHEN l.status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_loans
        FROM Region r
        LEFT JOIN Borrower b ON r.region_id = b.region_id
        LEFT JOIN Loan l ON b.borrower_id = l.borrower_id
        GROUP BY r.region_id, r.name
        ORDER BY total_approved_amount DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ✅ Region Management Endpoints
app.get('/api/regions', (req, res) => {
    const query = 'SELECT * FROM Region ORDER BY region_id';
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/regions', (req, res) => {
    const { name } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Region name is required' });
    }

    const query = 'INSERT INTO Region (name) VALUES (?)';
    db.query(query, [name], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({ 
            message: 'Region added successfully',
            region_id: results.insertId
        });
    });
});

app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});