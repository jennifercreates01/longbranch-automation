# Longbranch Automation & Controls — Business Management System

A custom full-stack business management and bookkeeping application being developed for **Longbranch Automation & Controls**, an industrial automation and process control company serving the agriculture, chemical processing, and food processing industries.

## Project Overview

Longbranch Automation & Controls provides industrial automation, controls engineering, system integration, installation, maintenance, and technical support services.

This application is being developed to provide Longbranch with a centralized system for managing the financial and operational side of the business, replacing disconnected spreadsheets and manual processes with a purpose-built application.

The system is designed around Longbranch's actual workflow, including customers, customer facilities, jobs, billing, expenses, inventory, and reporting.

## Current Development Progress

### Backend API

The backend API is built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

The current relational data structure is:

Customer → Facility → Job

A customer can have multiple facilities, and each facility can have multiple jobs. Prisma relationships allow the API to retrieve nested business data across these records.

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
- Store facility address and contact-related information
- Retrieve facilities through customer records
- Retrieve jobs associated with each facility
- Maintain Customer → Facility relationships through PostgreSQL foreign keys

### Job Management

Full CRUD functionality has been implemented for jobs.

Current job endpoints support:

- Create a job for a facility
- Retrieve all jobs
- Retrieve an individual job by ID
- Update an existing job
- Delete a job
- Track job status
- Track start and completion dates
- Return the associated facility and customer

### API Endpoints

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

## Database

PostgreSQL is used as the relational database with Prisma ORM providing schema management, migrations, relationships, and database access.

Current models:

- `Customer`
- `Facility`
- `Job`

The current relationship structure is:

````text
Customer
   │
   └── Facility
          │
          └── Job

A customer can have multiple facilities, and each facility can have multiple jobs.

This structure reflects Longbranch's real-world workflow, where work is performed for customers at specific plant or facility locations.

## Current API Endpoints

### Customers

```http
GET /api/customers
GET /api/customers/:id
POST /api/customers
````

### Facilities

```http
POST /api/customers/:id/facilities
```

### Jobs

```http
POST /api/facilities/:id/jobs
```

Customer queries return their related facilities and the jobs associated with those facilities.

## Example Data Relationship

```text
Test Customer
└── Main Plant
    └── LB-2026-001 — PLC Controls Upgrade
```

This relationship has been successfully created, stored in PostgreSQL, and retrieved through the API.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite

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

## Planned Features

Future development will expand the system to include:

- Customer and facility management interface
- Job tracking and job status management
- Estimates and quotes
- Invoice creation and tracking
- Customer payments
- Expense tracking
- Vendor management
- Inventory and parts management
- Purchase tracking
- Job-specific labor and material costs
- Financial reporting
- Business dashboard
- Search and filtering
- Authentication and authorization
- Printable/exportable business documents

## Project Goals

The goal of this project is to build a practical business application around the specific operational needs of Longbranch Automation & Controls rather than relying on a generic bookkeeping platform.

The application will combine business management, job tracking, inventory, and financial workflows into a single system while providing a clean and straightforward interface for everyday use.

## Development

This project is being designed and developed by **Jennifer** as a custom full-stack software engineering project.

The repository documents the application's development incrementally as database models, API functionality, business logic, and frontend features are implemented.
