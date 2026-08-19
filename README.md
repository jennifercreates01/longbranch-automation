# Longbranch Automation & Controls — Business Management System

A custom full-stack business management and bookkeeping application being developed for **Longbranch Automation & Controls**, an industrial automation and process control company serving the agriculture, chemical processing, and food processing industries.

## Project Overview

Longbranch Automation & Controls provides industrial automation, controls engineering, system integration, installation, maintenance, and technical support services.

This application is being developed to provide Longbranch with a centralized system for managing the financial and operational side of its work. Rather than functioning as a generic retail inventory application, the system is being designed around Longbranch's project- and service-based workflow.

The long-term goal is to connect customers, facilities, jobs, labor, materials, purchasing, invoicing, payments, and job profitability within one application.

## Current Development Status

**In active development**

The initial full-stack architecture and database foundation are currently being built.

### Completed

- React + TypeScript frontend initialized with Vite
- Node.js + Express + TypeScript backend
- REST API development environment
- CORS and environment configuration
- PostgreSQL development database
- Prisma ORM integration
- Initial database migration
- Customer data model
- Facility data model
- Customer-to-facility relational structure
- Git version control and private GitHub repository

### In Progress

- Requirements gathering and workflow analysis
- Database architecture
- Customer and facility management
- Job/project data modeling

## Planned Core Features

- Customer management
- Multiple facilities/sites per customer
- Jobs and service calls
- Estimates and quotes
- Labor and time tracking
- Materials and hardware tracking
- Vendor and purchasing management
- Job-related expenses
- Invoicing
- Payment tracking
- Job costing and profitability reporting
- Business dashboard and reporting

## Business Workflow

The application is being designed around the following core workflow:

**Customer → Facility → Job → Estimate → Labor / Materials / Expenses → Invoice → Payment → Profitability**

This structure allows Longbranch to associate work, costs, materials, and revenue with the specific customer facility and job that generated them.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- ESLint

### Backend

- Node.js
- Express
- TypeScript

### Database

- PostgreSQL
- Prisma ORM

### Development & Version Control

- Git
- GitHub
- VS Code

## Database Foundation

The first database relationship establishes customers and their associated facilities.

```text
Customer
   |
   +-- Facility
   +-- Facility
   +-- Facility
```

This architecture supports industrial clients that may operate multiple plants or facilities while maintaining a single customer account.

Future relationships will extend this structure to jobs, labor, materials, expenses, estimates, invoices, and payments.

## Development Approach

This project is being developed for a real business based on its operational requirements and existing workflows. Features and database architecture will be refined as requirements are gathered and validated with the client.

Development is being completed incrementally with Git commits documenting major milestones throughout the project.

---

**Developer:** Jennifer
**Status:** Active Development
