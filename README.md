# Longbranch Automation & Controls — Business Management System

A custom full-stack business management and bookkeeping application being developed for **Longbranch Automation & Controls**, an industrial automation and process control company serving the agriculture, chemical processing, and food processing industries.

## Project Overview

Longbranch Automation & Controls provides industrial automation, controls engineering, system integration, installation, maintenance, and technical support services.

This application is being developed to provide Longbranch with a centralized system for managing the financial and operational side of the business, replacing disconnected spreadsheets and manual processes with a purpose-built application.

The system is designed around Longbranch's actual workflow, including customers, customer facilities, jobs, billing, expenses, inventory, and reporting.

## Current Development Progress

### Backend API

The backend API is built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

The current relational data structure has expanded to support customers, facilities, jobs, invoices, and invoice line items.

```text
Customer
   │
   ├── Facility
   │      │
   │      └── Job
   │
   └── Invoice
          │
          └── InvoiceLineItem
```

Invoices can also be associated with jobs, allowing billing records to remain connected to the work performed for a customer.

### Customer Management

Implemented functionality includes:

- Create a customer
- Retrieve all customers
- Retrieve a customer by ID
- Return associated facilities
- Return jobs nested within each facility
- Customer input validation
- Appropriate HTTP status and error responses

### Facility Management

Implemented functionality includes:

- Create facilities associated with a customer
- Store facility address and related information
- Retrieve facilities through customer records
- Retrieve jobs associated with each facility
- Maintain Customer → Facility relationships through PostgreSQL foreign keys

### Job Management

Full CRUD functionality has been implemented for jobs.

Current job functionality includes:

- Create a job for a facility
- Retrieve all jobs
- Retrieve an individual job by ID
- Update an existing job
- Delete a job
- Track job status
- Track start and completion dates
- Return the associated facility and customer

### Invoice Management

A full invoice workflow has now been implemented across the backend and frontend.

Current invoice functionality includes:

- Create customer invoices
- Associate invoices with customers
- Associate invoices with jobs
- Add multiple invoice line items
- Store quantity and rate for each line item
- Automatically calculate line-item amounts
- Calculate invoice subtotal
- Apply invoice discounts
- Calculate final invoice totals
- Set issue and due dates
- Track invoice status
- Retrieve all invoices
- Retrieve individual invoice details
- Edit existing invoices
- Mark invoices as paid
- Display total invoiced, outstanding, and paid amounts
- Generate professional branded invoice documents
- Download invoices as PDF files

### Invoice Interface

The React frontend now includes an invoice management interface designed around Longbranch's branding.

Implemented interface features include:

- Longbranch Automation & Controls logo and brand colors
- Business management sidebar navigation
- Invoice dashboard
- Invoice summary cards
- Invoice list
- New invoice form
- Customer selection
- Job selection
- Dynamic invoice line items
- Automatic invoice calculations
- Invoice editing
- Detailed invoice view
- Payment status display
- Mark Paid functionality
- PDF invoice export

### PDF Invoice Generation

Invoices can be exported directly from the application as professional PDF documents.

Generated invoices include:

- Longbranch Automation & Controls branding
- Invoice number
- Issue date
- Due date
- Payment status
- Customer contact information
- Associated job
- Associated facility
- Itemized services or charges
- Quantity
- Rate
- Line-item totals
- Subtotal
- Discount
- Final invoice total
- Invoice notes

PDF generation is handled client-side using **html2canvas** and **jsPDF**.

## API Endpoints

| Method | Endpoint                        | Description                                     |
| ------ | ------------------------------- | ----------------------------------------------- |
| GET    | `/`                             | API health check                                |
| GET    | `/api/customers`                | Retrieve all customers with facilities and jobs |
| POST   | `/api/customers`                | Create a customer                               |
| GET    | `/api/customers/:id`            | Retrieve a customer with facilities and jobs    |
| POST   | `/api/customers/:id/facilities` | Create a facility for a customer                |
| POST   | `/api/facilities/:id/jobs`      | Create a job for a facility                     |
| GET    | `/api/jobs`                     | Retrieve all jobs                               |
| GET    | `/api/jobs/:id`                 | Retrieve a single job                           |
| PUT    | `/api/jobs/:id`                 | Update a job                                    |
| DELETE | `/api/jobs/:id`                 | Delete a job                                    |
| GET    | `/api/invoices`                 | Retrieve all invoices                           |
| POST   | `/api/invoices`                 | Create an invoice                               |
| GET    | `/api/invoices/:id`             | Retrieve an invoice with related business data  |
| PUT    | `/api/invoices/:id`             | Update an existing invoice                      |

## Database

PostgreSQL is used as the relational database with Prisma ORM providing schema management, migrations, relationships, and database access.

Current models include:

- `Customer`
- `Facility`
- `Job`
- `Invoice`
- `InvoiceLineItem`

The relational structure reflects Longbranch's real-world workflow, where work is performed for customers at specific plant or facility locations and billing can be associated with that work.

## Example Business Relationship

```text
Test Customer
│
└── Main Plant
      │
      └── LB-2026-001 — PLC Controls Upgrade
             │
             └── LBAC-INV-002
                    │
                    └── Service Line Item
```

This relationship can be created, stored in PostgreSQL, retrieved through the API, displayed through the React frontend, edited, marked as paid, and exported as a branded PDF invoice.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- CSS
- html2canvas
- jsPDF

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL

### Development & Testing

- Postman
- Git
- GitHub
- VS Code
- Browser developer tools

## Planned Features

Future development will expand the system to include:

- Customer and facility management interface
- Expanded job tracking interface
- Estimates and quotes
- Customer payment history
- Expense tracking
- Vendor management
- Inventory and parts management
- Purchase tracking
- Job-specific labor and material costs
- Financial reporting
- Expanded business dashboard
- Search and filtering
- Authentication and authorization
- Additional printable/exportable business documents

## Project Goals

The goal of this project is to build a practical business application around the specific operational needs of Longbranch Automation & Controls rather than relying on a generic bookkeeping platform.

The application will combine business management, job tracking, inventory, billing, and financial workflows into a single system while providing a clean and straightforward interface for everyday use.

## Development

This project is being designed and developed by **Jennifer** as a custom full-stack software engineering project.

The repository documents the application's development incrementally as database models, API functionality, business logic, and frontend features are implemented.
