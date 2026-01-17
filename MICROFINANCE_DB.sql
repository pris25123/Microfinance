-- =============================================
-- MICROFINANCE LOAN MANAGEMENT SYSTEM
-- Complete Database Setup for Admin-Only Website
-- Database: LOAN_MANAGEMENT
-- Team: Ritika Seth (PES1UG23AM239) & Priyanka S (PES1UG23AM219)
-- =============================================

-- Create Database
-- DROP DATABASE IF EXISTS LOAN_MANAGEMENT;
-- CREATE DATABASE LOAN_MANAGEMENT;
-- USE LOAN_MANAGEMENT;

-- =============================================
-- TABLE CREATION WITH CONSTRAINTS
-- =============================================

-- Region Table
CREATE TABLE Region (
    region_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Staff Table (created first due to circular dependency)
CREATE TABLE Staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    branch_id INT
);

-- Branch Table
CREATE TABLE Branch (
    branch_id INT PRIMARY KEY,
    location VARCHAR(200) NOT NULL,
    manager_id INT,
    region_id INT NOT NULL,
    FOREIGN KEY (region_id) REFERENCES Region(region_id),
    FOREIGN KEY (manager_id) REFERENCES Staff(staff_id)
);

-- Update Staff table with foreign key
ALTER TABLE Staff ADD FOREIGN KEY (branch_id) REFERENCES Branch(branch_id);

-- Borrower Table
CREATE TABLE Borrower (
    borrower_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(15),
    dob DATE,
    income DECIMAL(12,2),
    region_id INT NOT NULL,
    referred_by INT,
    FOREIGN KEY (region_id) REFERENCES Region(region_id),
    FOREIGN KEY (referred_by) REFERENCES Borrower(borrower_id)
);

-- Loan Table
CREATE TABLE Loan (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,
    borrower_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    tenure INT NOT NULL,
    start_date DATE,
    status VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (borrower_id) REFERENCES Borrower(borrower_id)
);

-- Guarantor Table
CREATE TABLE Guarantor (
    guarantor_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(15),
    relation VARCHAR(50),
    borrower_id INT NOT NULL,
    FOREIGN KEY (borrower_id) REFERENCES Borrower(borrower_id)
);

-- LoanApproval Table (Ternary Relationship)
CREATE TABLE LoanApproval (
    loan_id INT PRIMARY KEY,
    staff_id INT NOT NULL,
    branch_id INT NOT NULL,
    approval_date DATE,
    FOREIGN KEY (loan_id) REFERENCES Loan(loan_id),
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id),
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
);

-- Repayment Table
CREATE TABLE Repayment (
    repayment_id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    due_date DATE NOT NULL,
    actual_payment_date DATE,
    amount_due DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    penalty DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (loan_id) REFERENCES Loan(loan_id)
);

-- PaymentTxn Table
CREATE TABLE PaymentTxn (
    txn_id INT PRIMARY KEY,
    repayment_id INT NOT NULL,
    payment_mode VARCHAR(20),
    txn_date DATE,
    FOREIGN KEY (repayment_id) REFERENCES Repayment(repayment_id)
);

-- LoanGuarantor Table (M:N Relationship)
CREATE TABLE LoanGuarantor (
    loan_id INT,
    guarantor_id INT,
    PRIMARY KEY (loan_id, guarantor_id),
    FOREIGN KEY (loan_id) REFERENCES Loan(loan_id),
    FOREIGN KEY (guarantor_id) REFERENCES Guarantor(guarantor_id)
);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert Regions
INSERT INTO Region VALUES 
(1, 'Urban Bangalore', 'Metropolitan area'),
(2, 'Rural Karnataka', 'Villages in Karnataka'),
(3, 'Urban Mumbai', 'Metropolitan area'),
(4, 'Rural Maharashtra', 'Villages in Maharashtra'),
(5, 'Urban Delhi', 'Metropolitan area'),
(6, 'Rural Haryana', 'Villages in Haryana'),
(7, 'Urban Chennai', 'Metropolitan area'),
(8, 'Rural Tamil Nadu', 'Villages in Tamil Nadu'),
(9, 'Urban Kolkata', 'Metropolitan area'),
(10, 'Rural West Bengal', 'Villages in West Bengal');

-- Insert Staff (without branch_id initially)
INSERT INTO Staff (name, role) VALUES 
('Raj Kumar', 'Loan Officer'),
('Priya Sharma', 'Branch Manager'),
('Suresh Reddy', 'Loan Officer'),
('Amit Verma', 'Branch Manager'),
('Neha Gupta', 'Loan Officer'),
('Rahul Singh', 'Branch Manager'),
('Deepa Nair', 'Loan Officer'),
('Karthik Iyer', 'Branch Manager'),
('Sunil Das', 'Loan Officer'),
('Anjali Mehta', 'Branch Manager'),
('Vikram Rao', 'Loan Officer'),
('Pooja Reddy', 'Branch Manager');

-- Insert Branches
INSERT INTO Branch VALUES 
(1, 'BSK III Stage, Bangalore', 2, 1),
(2, 'Mysore Rural Branch', 3, 2),
(3, 'Andheri Branch, Mumbai', 4, 3),
(4, 'Pune Rural Branch', 5, 4),
(5, 'Connaught Place, Delhi', 6, 5),
(6, 'Gurgaon Rural Branch', 7, 6),
(7, 'T Nagar, Chennai', 8, 7),
(8, 'Coimbatore Rural Branch', 9, 8),
(9, 'Park Street, Kolkata', 10, 9),
(10, 'Howrah Rural Branch', 11, 10);

-- Update Staff with branch_id
UPDATE Staff SET branch_id = 1 WHERE staff_id = 1;
UPDATE Staff SET branch_id = 1 WHERE staff_id = 2;
UPDATE Staff SET branch_id = 2 WHERE staff_id = 3;
UPDATE Staff SET branch_id = 3 WHERE staff_id = 4;
UPDATE Staff SET branch_id = 4 WHERE staff_id = 5;
UPDATE Staff SET branch_id = 5 WHERE staff_id = 6;
UPDATE Staff SET branch_id = 6 WHERE staff_id = 7;
UPDATE Staff SET branch_id = 7 WHERE staff_id = 8;
UPDATE Staff SET branch_id = 8 WHERE staff_id = 9;
UPDATE Staff SET branch_id = 9 WHERE staff_id = 10;
UPDATE Staff SET branch_id = 10 WHERE staff_id = 11;
UPDATE Staff SET branch_id = 2 WHERE staff_id = 12;

-- Insert Borrowers
INSERT INTO Borrower (name, contact, dob, income, region_id, referred_by) VALUES 
('Ramesh Kumar', '9876543210', '1990-01-15', 50000.00, 1, NULL),
('Sita Patel', '8765432109', '1985-05-20', 35000.00, 1, 1),
('Gopal Reddy', '7654321098', '1992-08-10', 28000.00, 2, NULL),
('Anita Desai', '6543210987', '1988-03-25', 42000.00, 3, 3),
('Vikram Malhotra', '5432109876', '1991-11-12', 38000.00, 4, NULL),
('Priya Iyer', '4321098765', '1987-07-30', 32000.00, 5, 5),
('Rohan Sharma', '3210987654', '1993-04-18', 45000.00, 6, NULL),
('Meena Kapoor', '2109876543', '1984-09-05', 29000.00, 7, 7),
('Arun Joshi', '1098765432', '1990-12-22', 41000.00, 8, NULL),
('Lata Singh', '9988776655', '1986-06-14', 36000.00, 9, 9),
('Sanjay Verma', '8877665544', '1994-02-28', 27000.00, 10, NULL),
('Kavita Rao', '7766554433', '1989-10-08', 48000.00, 1, 2);

-- Insert Loans
INSERT INTO Loan (borrower_id, amount, interest_rate, tenure, start_date, status) VALUES 
(1, 50000.00, 12.5, 12, '2024-01-01', 'Approved'),
(2, 25000.00, 10.0, 6, '2024-02-01', 'Approved'),
(3, 75000.00, 15.0, 24, '2024-01-15', 'Pending'),
(4, 60000.00, 11.5, 18, '2024-03-01', 'Approved'),
(5, 35000.00, 9.5, 12, '2024-02-15', 'Approved'),
(6, 80000.00, 13.0, 24, '2024-01-20', 'Pending'),
(7, 45000.00, 10.5, 12, '2024-03-10', 'Approved'),
(8, 55000.00, 12.0, 18, '2024-02-28', 'Approved'),
(9, 70000.00, 14.5, 24, '2024-01-25', 'Pending'),
(10, 30000.00, 8.5, 6, '2024-03-05', 'Approved'),
(11, 65000.00, 11.0, 18, '2024-02-10', 'Approved'),
(12, 40000.00, 9.0, 12, '2024-03-15', 'Pending');

-- Insert Guarantors
INSERT INTO Guarantor VALUES 
(1, 'Anil Kumar', '9123456780', 'Friend', 1),
(2, 'Mohan Das', '8234567891', 'Relative', 2),
(3, 'Ravi Shastri', '7345678902', 'Colleague', 3),
(4, 'Sunita Devi', '6456789013', 'Sister', 4),
(5, 'Prakash Jain', '5567890124', 'Business Partner', 5),
(6, 'Geeta Menon', '4678901235', 'Friend', 6),
(7, 'Harish Pandey', '3789012346', 'Brother', 7),
(8, 'Nisha Choudhary', '2890123457', 'Relative', 8),
(9, 'Dinesh Bansal', '1901234568', 'Friend', 9),
(10, 'Rekha Agarwal', '9012345679', 'Sister', 10),
(11, 'Manoj Tiwari', '8123456790', 'Colleague', 11),
(12, 'Swati Mishra', '7234567801', 'Friend', 12);

-- Insert Loan Approvals
INSERT INTO LoanApproval VALUES 
(1, 1, 1, '2024-01-02'),
(2, 2, 1, '2024-02-02'),
(4, 4, 3, '2024-03-02'),
(5, 5, 4, '2024-02-16'),
(7, 7, 6, '2024-03-11'),
(8, 8, 7, '2024-02-29'),
(10, 10, 9, '2024-03-06'),
(11, 11, 10, '2024-02-11');

-- Insert Repayments
INSERT INTO Repayment (loan_id, due_date, actual_payment_date, amount_due, amount_paid, penalty, status) VALUES 
(1, '2024-02-01', '2024-02-01', 4500.00, 4500.00, 0, 'Paid'),
(1, '2024-03-01', '2024-03-05', 4500.00, 4500.00, 50.00, 'Paid'),
(2, '2024-03-01', NULL, 4400.00, 0, 0, 'Pending'),
(4, '2024-04-01', '2024-04-01', 3600.00, 3600.00, 0, 'Paid'),
(5, '2024-03-15', '2024-03-15', 3100.00, 3100.00, 0, 'Paid'),
(7, '2024-04-10', '2024-04-10', 4000.00, 4000.00, 0, 'Paid'),
(8, '2024-03-28', '2024-03-28', 3300.00, 3300.00, 0, 'Paid'),
(10, '2024-04-05', '2024-04-05', 5200.00, 5200.00, 0, 'Paid'),
(11, '2024-03-10', '2024-03-12', 3800.00, 3800.00, 25.00, 'Paid');

-- Link Guarantors to Loans
INSERT INTO LoanGuarantor VALUES 
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
(6, 6), (7, 7), (8, 8), (9, 9), (10, 10),
(11, 11), (12, 12);

-- =============================================
-- STORED PROCEDURES
-- =============================================

DELIMITER //

-- Procedure 1: Calculate EMI
CREATE PROCEDURE CalculateEMI(
    IN loan_amount DECIMAL(12,2),
    IN annual_rate DECIMAL(5,2),
    IN tenure_months INT,
    OUT emi_amount DECIMAL(10,2)
)
BEGIN
    DECLARE monthly_rate DECIMAL(10,6);
    SET monthly_rate = annual_rate / 1200;
    
    SET emi_amount = loan_amount * monthly_rate * 
                     POW(1 + monthly_rate, tenure_months) / 
                     (POW(1 + monthly_rate, tenure_months) - 1);
    
    SET emi_amount = ROUND(emi_amount, 2);
END //

-- Procedure 2: Generate Repayment Schedule
CREATE PROCEDURE GenerateRepaymentSchedule(
    IN p_loan_id INT
)
BEGIN
    DECLARE v_counter INT DEFAULT 1;
    DECLARE v_due_date DATE;
    DECLARE v_emi_amount DECIMAL(10,2);
    DECLARE v_loan_amount DECIMAL(12,2);
    DECLARE v_interest_rate DECIMAL(5,2);
    DECLARE v_tenure INT;
    DECLARE v_start_date DATE;
    
    -- Get loan details
    SELECT amount, interest_rate, tenure, start_date 
    INTO v_loan_amount, v_interest_rate, v_tenure, v_start_date
    FROM Loan WHERE loan_id = p_loan_id;
    
    -- Calculate EMI
    CALL CalculateEMI(v_loan_amount, v_interest_rate, v_tenure, v_emi_amount);
    
    -- Delete existing repayment schedule if any
    DELETE FROM Repayment WHERE loan_id = p_loan_id;
    
    -- Generate repayment schedule
    WHILE v_counter <= v_tenure DO
        SET v_due_date = DATE_ADD(v_start_date, INTERVAL v_counter MONTH);
        
        INSERT INTO Repayment (loan_id, due_date, amount_due, status)
        VALUES (p_loan_id, v_due_date, v_emi_amount, 'Pending');
        
        SET v_counter = v_counter + 1;
    END WHILE;
    
    SELECT CONCAT('Repayment schedule generated for Loan ID ', p_loan_id, ' with ', v_tenure, ' installments of ₹', v_emi_amount) AS message;
END //

DELIMITER ;

-- =============================================
-- TRIGGERS
-- =============================================

DELIMITER //

-- Trigger 1: Auto-calculate penalty for late payments
CREATE TRIGGER CalculateLatePenalty
BEFORE UPDATE ON Repayment
FOR EACH ROW
BEGIN
    IF NEW.actual_payment_date IS NOT NULL AND NEW.actual_payment_date > NEW.due_date THEN
        SET NEW.penalty = (NEW.amount_due - NEW.amount_paid) * 0.02; -- 2% penalty on overdue amount
    END IF;
END //

-- Trigger 2: Auto-update repayment status
CREATE TRIGGER UpdateRepaymentStatus
BEFORE UPDATE ON Repayment
FOR EACH ROW
BEGIN
    IF NEW.amount_paid >= NEW.amount_due THEN
        SET NEW.status = 'Paid';
    ELSEIF NEW.amount_paid > 0 THEN
        SET NEW.status = 'Partial';
    ELSEIF NEW.due_date < CURDATE() THEN
        SET NEW.status = 'Overdue';
    ELSE
        SET NEW.status = 'Pending';
    END IF;
END //

-- Trigger 3: Auto-update loan status when all repayments are completed
CREATE TRIGGER UpdateLoanStatus
AFTER UPDATE ON Repayment
FOR EACH ROW
BEGIN
    DECLARE total_repayments INT;
    DECLARE paid_repayments INT;
    
    SELECT COUNT(*) INTO total_repayments 
    FROM Repayment WHERE loan_id = NEW.loan_id;
    
    SELECT COUNT(*) INTO paid_repayments 
    FROM Repayment WHERE loan_id = NEW.loan_id AND status = 'Paid';
    
    IF paid_repayments = total_repayments AND total_repayments > 0 THEN
        UPDATE Loan SET status = 'Completed' WHERE loan_id = NEW.loan_id;
    END IF;
END //

DELIMITER ;

-- =============================================
-- COMPLEX QUERIES DEMONSTRATION
-- =============================================

-- Query 1: NESTED QUERY - Borrowers with pending/overdue repayments
SELECT 
    b.borrower_id,
    b.name AS borrower_name,
    b.contact,
    COUNT(r.repayment_id) AS pending_repayments,
    SUM(r.amount_due - r.amount_paid) AS total_due_amount
FROM Borrower b
WHERE b.borrower_id IN (
    SELECT DISTINCT l.borrower_id 
    FROM Loan l 
    JOIN Repayment r ON l.loan_id = r.loan_id 
    WHERE r.status IN ('Pending', 'Overdue')
    AND l.status = 'Approved'
)
GROUP BY b.borrower_id, b.name, b.contact
ORDER BY total_due_amount DESC;

-- Query 2: JOIN QUERY - Complete loan details with all relationships
SELECT 
    l.loan_id,
    b.name AS borrower_name,
    b.contact AS borrower_contact,
    b.income,
    l.amount AS loan_amount,
    l.interest_rate,
    l.tenure,
    l.start_date,
    l.status AS loan_status,
    s.name AS approved_by,
    br.location AS branch_location,
    g.name AS guarantor_name,
    g.contact AS guarantor_contact,
    g.relation AS guarantor_relation,
    la.approval_date
FROM Loan l
JOIN Borrower b ON l.borrower_id = b.borrower_id
LEFT JOIN LoanApproval la ON l.loan_id = la.loan_id
LEFT JOIN Staff s ON la.staff_id = s.staff_id
LEFT JOIN Branch br ON la.branch_id = br.branch_id
LEFT JOIN LoanGuarantor lg ON l.loan_id = lg.loan_id
LEFT JOIN Guarantor g ON lg.guarantor_id = g.guarantor_id
ORDER BY l.loan_id;

-- Query 3: AGGREGATE QUERY - Regional portfolio analysis with comprehensive statistics
SELECT 
    r.region_id,
    r.name AS region_name,
    COUNT(DISTINCT b.borrower_id) AS total_borrowers,
    COUNT(l.loan_id) AS total_loans,
    SUM(l.amount) AS total_portfolio,
    AVG(l.amount) AS avg_loan_size,
    MAX(l.amount) AS largest_loan,
    MIN(l.amount) AS smallest_loan,
    SUM(CASE WHEN l.status = 'Approved' THEN 1 ELSE 0 END) AS approved_loans,
    SUM(CASE WHEN l.status = 'Pending' THEN 1 ELSE 0 END) AS pending_loans,
    SUM(CASE WHEN l.status = 'Completed' THEN 1 ELSE 0 END) AS completed_loans,
    ROUND((SUM(CASE WHEN l.status = 'Approved' THEN 1 ELSE 0 END) * 100.0 / COUNT(l.loan_id)), 2) AS approval_rate,
    SUM(CASE WHEN rp.status = 'Overdue' THEN 1 ELSE 0 END) AS overdue_repayments
FROM Region r
LEFT JOIN Borrower b ON r.region_id = b.region_id
LEFT JOIN Loan l ON b.borrower_id = l.borrower_id
LEFT JOIN Repayment rp ON l.loan_id = rp.loan_id
GROUP BY r.region_id, r.name
ORDER BY total_portfolio DESC;

-- Query 4: Top Defaulters Analysis (Combining Aggregate and Multiple Joins)
SELECT 
    b.borrower_id,
    b.name AS borrower_name,
    b.contact,
    l.loan_id,
    l.amount AS loan_amount,
    l.interest_rate,
    l.start_date,
    COUNT(r.repayment_id) AS total_overdue_repayments,
    SUM(r.amount_due - r.amount_paid) AS total_due_amount,
    SUM(r.penalty) AS total_penalties,
    MAX(r.due_date) AS last_due_date,
    DATEDIFF(CURDATE(), MAX(r.due_date)) AS days_overdue
FROM Borrower b
JOIN Loan l ON b.borrower_id = l.borrower_id
JOIN Repayment r ON l.loan_id = r.loan_id
WHERE r.status = 'Overdue'
AND l.status = 'Approved'
GROUP BY b.borrower_id, b.name, b.contact, l.loan_id, l.amount, l.interest_rate, l.start_date
ORDER BY total_due_amount DESC
LIMIT 10;

-- =============================================
-- CRUD OPERATIONS DEMONSTRATION
-- =============================================

-- CREATE Operations
INSERT INTO Borrower (name, contact, income, region_id) 
VALUES ('Amit Sharma', '7788996655', 48000.00, 1);

INSERT INTO Loan (borrower_id, amount, interest_rate, tenure, start_date, status) 
VALUES (13, 55000.00, 11.0, 18, CURDATE(), 'Pending');

INSERT INTO Staff (name, role, branch_id) 
VALUES ('Neha Kapoor', 'Loan Officer', 1);

-- READ Operations
SELECT * FROM Borrower WHERE region_id = 1;
SELECT * FROM Loan WHERE status = 'Pending';
SELECT b.borrower_id, b.name, b.contact, b.income, r.name as region_name
FROM Borrower b
JOIN Region r ON b.region_id = r.region_id;

-- UPDATE Operations
UPDATE Borrower SET income = 52000.00 WHERE borrower_id = 1;
UPDATE Loan SET status = 'Approved' WHERE loan_id = 3;
UPDATE Repayment SET amount_paid = 2000.00, actual_payment_date = CURDATE() WHERE repayment_id = 3;

-- DELETE Operations
DELETE FROM Repayment WHERE repayment_id = 11;
DELETE FROM LoanGuarantor WHERE loan_id = 12;
DELETE FROM Guarantor WHERE guarantor_id = 12;

-- =============================================
-- TESTING STORED PROCEDURES AND TRIGGERS
-- =============================================

-- Test Stored Procedure: EMI Calculation
CALL CalculateEMI(50000, 12.5, 12, @emi_result);
SELECT @emi_result AS monthly_emi;

CALL CalculateEMI(100000, 10.0, 24, @emi_result2);
SELECT @emi_result2 AS monthly_emi_2;

-- Test Stored Procedure: Generate Repayment Schedule
CALL GenerateRepaymentSchedule(3);

-- Test Triggers: Process a late payment to see penalty calculation
UPDATE Repayment 
SET amount_paid = 4500.00, actual_payment_date = '2024-03-10' 
WHERE repayment_id = 3;

-- Verify trigger worked
SELECT repayment_id, loan_id, due_date, amount_due, amount_paid, penalty, status 
FROM Repayment WHERE repayment_id = 3;

-- =============================================
-- DATABASE VERIFICATION QUERIES
-- =============================================

-- Show all tables
SHOW TABLES;

-- Count records in each table
SELECT 'Region' as table_name, COUNT(*) as record_count FROM Region
UNION ALL SELECT 'Branch', COUNT(*) FROM Branch
UNION ALL SELECT 'Staff', COUNT(*) FROM Staff
UNION ALL SELECT 'Borrower', COUNT(*) FROM Borrower
UNION ALL SELECT 'Loan', COUNT(*) FROM Loan
UNION ALL SELECT 'Guarantor', COUNT(*) FROM Guarantor
UNION ALL SELECT 'LoanApproval', COUNT(*) FROM LoanApproval
UNION ALL SELECT 'Repayment', COUNT(*) FROM Repayment
UNION ALL SELECT 'LoanGuarantor', COUNT(*) FROM LoanGuarantor;

-- Verify auto-increment is working
SELECT MAX(borrower_id) as last_borrower_id FROM Borrower;
SELECT MAX(loan_id) as last_loan_id FROM Loan;
SELECT MAX(staff_id) as last_staff_id FROM Staff;
SELECT MAX(repayment_id) as last_repayment_id FROM Repayment;

-- =============================================
-- ADMIN DASHBOARD QUERIES
-- =============================================

-- Portfolio Summary
SELECT 
    COUNT(*) as total_loans,
    SUM(amount) as total_portfolio,
    AVG(amount) as average_loan_size,
    SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END) as active_portfolio,
    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_approvals,
    SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_loans
FROM Loan;

-- Recent Activity
SELECT 
    'Loan' as activity_type,
    loan_id as id,
    CONCAT('Loan #', loan_id, ' - ', status) as description,
    start_date as activity_date
FROM Loan 
WHERE start_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
UNION ALL
SELECT 
    'Repayment' as activity_type,
    repayment_id as id,
    CONCAT('Repayment #', repayment_id, ' - ', status) as description,
    COALESCE(actual_payment_date, due_date) as activity_date
FROM Repayment 
WHERE COALESCE(actual_payment_date, due_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY activity_date DESC
LIMIT 10;

-- System Status Summary
SELECT 
    (SELECT COUNT(*) FROM Borrower) as total_borrowers,
    (SELECT COUNT(*) FROM Staff) as total_staff,
    (SELECT COUNT(*) FROM Branch) as total_branches,
    (SELECT COUNT(*) FROM Loan WHERE status = 'Approved') as active_loans,
    (SELECT COUNT(*) FROM Repayment WHERE status = 'Overdue') as overdue_repayments,
    (SELECT SUM(amount_paid) FROM Repayment WHERE status = 'Paid') as total_collections;

-- =============================================
-- END OF DATABASE SETUP
-- =============================================
-- Add this to your database setup
USE loan_management;
CREATE TABLE Users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'loan_officer', 'viewer') NOT NULL,
    branch_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
);

-- Insert sample users
INSERT INTO Users VALUES 
(1, 'admin', 'admin123', 'admin', 1, NOW()),
(2, 'officer', 'officer123', 'loan_officer', 1, NOW()),
(3, 'viewer', 'viewer123', 'viewer', 1, NOW());