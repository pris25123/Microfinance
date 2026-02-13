# Microfinance Loan Management System

## 📋 Overview
A comprehensive database-driven web application for managing microfinance loan operations, including borrower management, loan processing, repayment tracking, and financial analytics. Built with MySQL backend and React frontend.

## 🎥 Demo Video

[![Project Demo](https://img.youtube.com/vi/AEvAwIRPoZE/0.jpg)](https://www.youtube.com/watch?v=AEvAwIRPoZE)

## 🚀 Features

### **Core Functionalities**
- **Borrower Management** - Store and manage borrower profiles with financial details
- **Loan Application & Disbursement** - Complete loan lifecycle from application to approval
- **Repayment Tracking** - Monitor EMI payments and schedule management
- **Overdue Management** - Automatic penalty calculation for late payments
- **Analytics & Reporting** - Regional analysis, default tracking, and compliance monitoring

### **Technical Highlights**
- **Database Design** - Fully 3NF compliant relational schema with 10+ tables
- **Stored Procedures** - EMI calculation, repayment schedule generation
- **Triggers** - Automated penalty calculation and loan status updates
- **Complex Queries** - Nested queries, joins, and aggregate functions for analytics
- **Role-Based Access** - Three-tier user permission system (Admin, Loan Officer, Viewer)

## 🏗️ System Architecture

### **Backend Stack**
- **Database**: MySQL with stored procedures, functions, and triggers
- **API**: RESTful API for frontend communication
- **Security**: Role-based access control and data validation

### **Frontend Stack**
- **Framework**: React.js with functional components
- **Styling**: CSS3 with responsive design
- **State Management**: React hooks and context API
- **Routing**: React Router for navigation

### **Database Schema**
The system implements a comprehensive ER model with:
- **8 Core Entities**: Borrower, Loan, Guarantor, Staff, Branch, Region, Repayment, Transaction
- **Multiple Relationship Types**: 1:1, 1:N, M:N, Recursive, and Ternary relationships
- **Full 3NF Compliance**: Proper normalization with no redundancy

## 📊 Key Database Operations

### **Stored Procedures**
1. **CalculateEMI** - Computes monthly installment using financial formula
2. **GenerateRepaymentSchedule** - Creates EMI schedule for approved loans
3. **CalculateLatePenalty** - Automatic penalty calculation (2% per month)

### **Triggers**
1. **Auto Penalty Calculation** - Triggers on repayment updates
2. **Loan Status Update** - Updates loan status when fully paid

### **Complex Queries**
- Top 5 defaulters identification
- Regional loan distribution analysis
- Repayment compliance rate calculation
- Overdue amount aggregation by region

## 👥 User Role

### **Admin** 👑
- Full system access and user management
- Staff management and record deletion
- System configuration and oversight

## 🗂️ Project Structure
```
Microfinance_Loan_Management/
├── microfinance-backend/
│   ├── .gitignore
│   ├── .gitattributes
│   ├── package.json
│   ├── package-lock.json
│   ├── yarn.lock
│   └── server.js
├── microfinance-frontend/
│   ├── public/
│   │   └── (static files)
│   ├── src/
│   │   └── (React source code)
│   ├── .gitignore
│   ├── README.md
│   ├── package.json
│   ├── package-lock.json
│   └── yarn.lock
├── MICROFINANCE_DB.sql
├── README.md
└── .gitignore
└── demo_video.mp4
```

## 🛠️ Setup Instructions

### **Prerequisites**
- MySQL 8.0+
- Node.js 16+
- React 18+

### **Database Setup**
1. Clone the repository
2. Import `MICROFINANCE_DB.sql` to MySQL
3. Configure database connection in backend

### **Backend Setup**
```bash
cd microfinance-backend
npm install
npm start
```

### **Frontend Setup**
```bash
cd microfinance-frontend
npm install
npm start
```

## 📈 Sample Queries

### **EMI Calculation**
```sql
CALL CalculateEMI(100000, 12.5, 24, @emi);
SELECT @emi;
```

### **Regional Analysis**
```sql
SELECT r.name, COUNT(l.loan_id) as total_loans, 
       AVG(l.amount) as avg_loan_size
FROM Region r
JOIN Borrower b ON r.region_id = b.region_id
JOIN Loan l ON b.borrower_id = l.borrower_id
GROUP BY r.region_id;
```

### **Defaulters Report**
```sql
SELECT b.name, COUNT(*) as missed_payments
FROM Borrower b
JOIN Loan l ON b.borrower_id = l.borrower_id
JOIN Repayment r ON l.loan_id = r.loan_id
WHERE r.actual_payment_date > r.due_date
GROUP BY b.borrower_id
ORDER BY missed_payments DESC
LIMIT 5;
```

## 🎯 Learning Outcomes
- Database design and normalization (3NF compliance)
- SQL programming with stored procedures and triggers
- Complex query optimization and analytics
- Full-stack development with React and MySQL
- Role-based access control implementation
- Financial system modeling and implementation


## 👥 Contributors
- **RITIKA** 
- **PRIYANKA**


