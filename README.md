@@ -1,839 +1 @@
# Development of Smart Procurement & Purchase Order Management System — Group 2

## 📌 Project Overview

The **Smart Procurement & Purchase Order Management System** is a full-stack web application designed to digitize and streamline the procurement process.

The system manages procurement requisitions, multi-level approvals, purchase orders, shipment tracking, analytics, reporting, audit logs, and role-based administration through a centralized platform.

---

## 🎯 Project Objectives

- Digitize procurement requisition creation and submission.
- Implement a structured multi-level approval workflow.
- Manage the complete Purchase Order lifecycle.
- Provide procurement analytics and management KPIs.
- Maintain audit logs for important system activities.
- Implement Role-Based Access Control (RBAC).
- Provide PDF and Excel reporting.
- Support email notification after final requisition approval.
- Provide REST APIs for application operations and integration.

---

# 🚀 Major Modules

## 1. Master Data Management

The system provides management functionality for core procurement data:

- Departments
- Products
- Suppliers
- Users and Roles

> Category information is used within the product and analytics model. A separate dedicated category-management screen is not currently implemented.

---

## 2. Requisition Workflow

Employees can create procurement requisitions and submit them for approval.

### Requisition Status Flow

```text
DRAFT
  ↓
PENDING_LEVEL_1
  ↓
PENDING_LEVEL_2
  ↓
PENDING_LEVEL_3
  ↓
APPROVED
```

A requisition can also be rejected during the approval process:

```text
PENDING_LEVEL_1
       ↓
   REJECTED
```

```text
PENDING_LEVEL_2
       ↓
   REJECTED
```

```text
PENDING_LEVEL_3
       ↓
   REJECTED
```

### Approval Hierarchy

| Level | Role | Responsibility |
|---|---|---|
| Level 1 | MANAGER | Department-level approval |
| Level 2 | FINANCE | Financial approval |
| Level 3 | PROCUREMENT_HEAD | Final procurement approval |

The backend validates the user's role and applicable department rules before allowing an approval action.

---

# 3. Purchase Order Management

Approved requisitions can be converted into Purchase Orders.

### Purchase Order Lifecycle

```text
GENERATED
    ↓
SENT_TO_SUPPLIER
    ↓
SHIPMENT_IN_PROGRESS
    ↓
DELIVERED
    ↓
CLOSED
```

### PO Features

- Generate PO from an approved requisition
- Select supplier
- Send PO to supplier
- Start shipment tracking
- Mark shipment as delivered
- Close completed purchase orders
- Track PO status
- Maintain PO audit history

---

# 4. Analytics & Reporting

The Analytics module provides procurement information through REST APIs and the React dashboard.

### Analytics Features

- Spend by Department
- Spend by Category
- Supplier Ratings
- Total Requisitions
- Approved Requisitions
- Rejected Requisitions
- Total Procurement Spend
- Total Purchase Orders
- Closed Purchase Orders

### Reports

The system supports downloadable:

- 📄 PDF Reports
- 📊 Excel Reports

---

# 5. Security & Administration

The application uses **Spring Security** and **Role-Based Access Control (RBAC)**.

### User Roles

- EMPLOYEE
- MANAGER
- FINANCE
- PROCUREMENT_HEAD
- ADMIN

### Role Permissions

| Functionality | Access |
|---|---|
| Requisition Workflow | Authenticated workflow roles |
| Purchase Orders | PROCUREMENT_HEAD, ADMIN |
| Analytics | FINANCE, PROCUREMENT_HEAD, ADMIN |
| Audit Logs | ADMIN |
| User Management | ADMIN |
| Supplier Management | PROCUREMENT_HEAD, ADMIN |
| Product Management | PROCUREMENT_HEAD, ADMIN |
| Department Management | ADMIN, MANAGER |

Passwords are configured as write-only in API responses so they are not returned in normal user JSON responses.

---

# 6. Audit Logging

Important procurement activities are recorded through the Audit Log module.

Audit information includes:

- Audit Log ID
- Action
- Entity
- Entity ID
- Performed By
- Timestamp
- Details

This provides traceability for important requisition and purchase-order activities.

---

# 7. Email Notifications

The backend includes Gmail SMTP integration through an `EmailService`.

After final requisition approval, the system can send an email notification to the requester when SMTP credentials are correctly configured.

### Email Flow

```text
Requisition
     ↓
Manager Approval
     ↓
Finance Approval
     ↓
Procurement Head Approval
     ↓
APPROVED
     ↓
Email Service
     ↓
Requester Email
```

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │       React + Vite      │
                    │       Frontend UI       │
                    └────────────┬────────────┘
                                 │
                                 │ REST API
                                 ▼
                    ┌─────────────────────────┐
                    │      Spring Boot        │
                    │                         │
                    │ Controllers             │
                    │ Services                │
                    │ Security                │
                    │ Workflow Engine         │
                    │ Audit Logging            │
                    │ Reporting               │
                    └────────────┬────────────┘
                                 │
                                 │ JPA / Hibernate
                                 ▼
                    ┌─────────────────────────┐
                    │          MySQL          │
                    │                         │
                    │ Users                   │
                    │ Departments             │
                    │ Products                │
                    │ Suppliers               │
                    │ Requisitions            │
                    │ Purchase Orders         │
                    │ Audit Logs              │
                    └─────────────────────────┘

             ┌──────────────────┐
             │ Gmail SMTP       │
             │ Notifications    │
             └──────────────────┘

             ┌──────────────────┐
             │ PDF / Excel      │
             │ Reports          │
             └──────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

- React
- Vite
- JavaScript
- CSS
- React Router

## Backend

- Java
- Spring Boot
- Spring Web / REST API
- Spring Data JPA
- Hibernate
- Spring Security
- Maven

## Database

- MySQL

## Reporting

- PDF
- Excel

## Communication

- Gmail SMTP

## Development Tools

- IntelliJ IDEA
- Visual Studio Code
- Postman
- Git
- GitHub

---

# 📂 Backend Project Structure

```text
src/
└── main/
    ├── java/
    │   └── ...
    │       ├── controller/
    │       ├── entity/
    │       ├── repository/
    │       ├── service/
    │       └── security/
    │
    └── resources/
        ├── application.properties
        └── application-example.properties
```

### Backend Layers

- Entity Layer
- Repository Layer
- Service Layer
- Controller Layer
- Security Layer

---

# 📂 Frontend Project Structure

```text
smart-procurement-purchase-order-management/
│
├── src/
│   ├── components/
│   │   └── Sidebar.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Requisitions.jsx
│   │   ├── CreateRequisition.jsx
│   │   ├── RequisitionDetails.jsx
│   │   ├── PurchaseOrders.jsx
│   │   ├── Analytics.jsx
│   │   ├── AuditLogs.jsx
│   │   ├── Users.jsx
│   │   ├── Departments.jsx
│   │   ├── Suppliers.jsx
│   │   └── Products.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   └── index.css
│
├── package.json
└── vite.config.js
```

---

# 🔌 Main REST API Endpoints

## Authentication

```text
GET /auth/me
POST /auth/register
```

---

## Requisitions

```text
GET  /requisitions
POST /requisitions
PUT  /requisitions/{id}/submit
PUT  /requisitions/{id}/approve/{userId}
PUT  /requisitions/{id}/reject
```

---

## Purchase Orders

```text
GET  /purchase-orders
POST /purchase-orders/generate
PUT  /purchase-orders/{id}/send
PUT  /purchase-orders/{id}/start-shipment
PUT  /purchase-orders/{id}/deliver
PUT  /purchase-orders/{id}/close
```

---

## Analytics

```text
GET /analytics/dashboard
GET /analytics/spend-by-department
GET /analytics/spend-by-category
GET /analytics/supplier-ratings
GET /analytics/report/pdf
GET /analytics/report/excel
```

---

## Audit Logs

```text
GET /audit-logs
```

---

## Administration

```text
GET    /admin/users
POST   /admin/users
PUT    /admin/users/{id}
DELETE /admin/users/{id}
```

---

## Departments

```text
GET /departments
```

---

## Suppliers

```text
GET    /suppliers
POST   /suppliers
PUT    /suppliers/{id}
DELETE /suppliers/{id}
```

---

## Products

```text
GET  /products
POST /products
```

---

# 🔄 Complete Application Flow

```text
                    USER LOGIN
                        │
                        ▼
                    DASHBOARD
                        │
                        ▼
              CREATE REQUISITION
                        │
                        ▼
              SUBMIT REQUISITION
                        │
                        ▼
               MANAGER APPROVAL
                        │
                        ▼
                FINANCE APPROVAL
                        │
                        ▼
          PROCUREMENT HEAD APPROVAL
                        │
                        ▼
                    APPROVED
                        │
                        ▼
              GENERATE PURCHASE ORDER
                        │
                        ▼
               SEND TO SUPPLIER
                        │
                        ▼
               TRACK SHIPMENT
                        │
                        ▼
                    DELIVERED
                        │
                        ▼
                      CLOSED
                        │
                        ▼
             ANALYTICS / REPORTS
                        │
                        ▼
                   AUDIT LOGS
```

---

# 📊 Dashboard

The dashboard provides a centralized overview of procurement activities.

### KPI Cards

- Total Requisitions
- Approved Requisitions
- Rejected Requisitions
- Total Spend
- Total Purchase Orders
- Closed Purchase Orders

### Quick Actions

- Requisitions
- Purchase Orders
- Analytics
- Audit Logs
- User Management

The dashboard also displays the currently logged-in user's name and role.

---

# 🖥️ Application UI

The React frontend contains the following major screens:

### Login

User authentication using the configured backend security mechanism.

### Dashboard

Displays procurement KPIs and quick navigation.

### Requisitions

Allows users to view procurement requisitions and create new requests.

### Create Requisition

Allows employees to enter:

- Description
- Quantity
- Department
- Product

### Requisition Details

Displays:

- Requisition information
- Current status
- Approval workflow
- Approval actions
- Rejection action

### Purchase Orders

Provides:

- PO generation
- Supplier selection
- PO status
- Shipment status
- Lifecycle actions

### Analytics

Displays:

- Procurement KPIs
- Department spending
- Category spending
- Supplier ratings
- Reports

### Audit Logs

Displays system activity and procurement actions.

### User Management

Administrators can manage users and assign roles/departments.

### Master Data

Provides management interfaces for:

- Departments
- Suppliers
- Products

---

# 🧪 Testing & Demonstration

The major workflows were tested through the running application and REST APIs.

## Requisition Workflow Test

```text
Create
   ↓
Submit
   ↓
Manager Approval
   ↓
Finance Approval
   ↓
Procurement Head Approval
   ↓
APPROVED
```

## Purchase Order Test

```text
Generate
   ↓
Send
   ↓
Shipment In Progress
   ↓
Delivered
   ↓
Closed
```

## Analytics Test

The following functionality was tested:

- Dashboard KPIs
- Spend by Department
- Spend by Category
- Supplier Ratings
- PDF Report
- Excel Report

## Audit Test

Requisition and Purchase Order actions were successfully recorded in the audit log.

## Security Test

Role-based endpoint restrictions were implemented using Spring Security.

---

# 🔐 Environment Configuration

Sensitive credentials should **never be committed to GitHub**.

The project uses environment variables for database and email credentials.

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/spring_demo
spring.datasource.username=springuser
spring.datasource.password=${DB_PASSWORD}

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}

spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

An example configuration file is provided separately for setup reference.

---

# ▶️ How to Run the Project

## Backend

From the project root:

```bash
mvn spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

---

## Frontend

Open the frontend directory:

```bash
cd smart-procurement-purchase-order-management
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# 🗄️ Database Setup

Create the MySQL database:

```sql
CREATE DATABASE spring_demo;
```

Configure the required database environment variables before starting the backend.

Spring Boot JPA/Hibernate is configured to manage/update the database schema.

---

# 📦 GitHub Repository

### Repository

https://github.com/sahigrace/smart-procurement-purchase-order-management

The repository contains:

```text
Spring Boot Backend
        +
React Frontend
        +
Project Documentation
```

---

# 📈 Future Enhancements

Possible future improvements include:

- Configurable approval hierarchy through an admin interface
- Dedicated category management module
- Advanced supplier performance scoring
- Real-time shipment integrations
- JWT/OAuth2 authentication
- Email templates and notification preferences
- Advanced analytics and forecasting
- Cloud deployment
- Automated CI/CD pipeline
- Database migration management
- Automated unit and integration testing

---

# ✅ Project Status

The project demonstrates an end-to-end Smart Procurement and Purchase Order Management workflow with:

- ✅ React + Vite frontend
- ✅ Spring Boot backend
- ✅ MySQL database
- ✅ REST APIs
- ✅ Requisition management
- ✅ Multi-level approval workflow
- ✅ Purchase Order lifecycle
- ✅ Supplier management
- ✅ Product management
- ✅ Department management
- ✅ Analytics dashboard
- ✅ PDF and Excel reports
- ✅ Audit logging
- ✅ Role-Based Access Control
- ✅ Administrative user management
- ✅ Email notification integration

---

# 👥 Team

## Group 2

### Project Title

**Development of Smart Procurement & Purchase Order Management System Group 2**

---

## 📄 Project Documentation

The repository may also contain:

- Project Presentation
- Project Reports
- Screenshots
- Supporting Documentation

---

## 📜 License

This project was developed as part of an internship/project training program.
