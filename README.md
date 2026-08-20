# Longbranch Automation & Controls — Business Management System

A custom full-stack business management and bookkeeping application being developed for **Longbranch Automation & Controls**, an industrial automation and process control company serving the agriculture, chemical processing, and food processing industries.

## Project Overview

Longbranch Automation & Controls provides industrial automation, controls engineering, system integration, installation, maintenance, and technical support services.

This application is being developed to provide Longbranch with a centralized system for managing the financial and operational side of the business, replacing disconnected spreadsheets and manual processes with a purpose-built application.

The system is designed around Longbranch's actual workflow, including customers, customer facilities, jobs, billing, expenses, inventory, and reporting.

## Current Development Status

The project is currently in active development.

### Completed

- Full-stack project structure with separate React client and Express server
- TypeScript configuration for frontend and backend development
- PostgreSQL database development environment
- Prisma ORM configuration and database migrations
- Customer data model
- Facility data model
- Job data model
- Customer → Facility relational database structure
- Facility → Job relational database structure
- Customer API endpoints
- Facility creation API
- Job creation API
- Nested relational queries for customers, facilities, and jobs
- Input validation and API error handling
- API testing with Postman

### Current Backend Structure

The application currently supports the following business hierarchy:

```text
Customer
└── Facility
    └── Job
```

A customer can have multiple facilities, and each facility can have multiple jobs.

This structure reflects Longbranch's real-world workflow, where work is performed for customers at specific plant or facility locations.

## Current API Endpoints

### Customers

```http
GET /api/customers
GET /api/customers/:id
POST /api/customers
```

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
