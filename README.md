# Finance Data Processing and Access Control System

A complete backend API for managing financial records and calculating dashboard summaries with Role-Based Access Control (RBAC).

## Stack
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for Authentication
- Zod for Input Validation

## Features
- **User Management**: Authentication, Registration, and Login (with Bcrypt).
- **Role-Based Access Control**:
  - `viewer`: Can only access dashboard summary.
  - `analyst`: Can manage financial records and view dashboard summary.
  - `admin`: Can manage users, manage records, and view dashboard summary.
- **Financial Records Management**: CRUD with soft delete.
- **Dashboard Summary**: Aggregate queries to get net balance, category totals, and recent transactions.
- **Validation & Error Handling**: Global exception handling and schema validation with Zod.

## Project Setup

1. **Clone/Navigate to Repository**
   \`\`\`bash
   cd finance-dashboard
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   Copy `.env.example` to `.env` and fill the variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Important: Ensure MongoDB is running on `mongodb://localhost:27017/finance_dashboard` (or update `.env`).

4. **Run Server**
   \`\`\`bash
   # Development
   npm run dev
   
   # Production
   npm run start
   \`\`\`

## Assumptions and Design Decisions
1. **Soft Delete vs Hard Delete**: When deleting records, they are marked with `isDeleted: true` to preserve historical integrity, rather than completely dropping the row from the database.
2. **First Admin Setup**: The API currently allows passing a `role` during registration. In production, this should be removed and the first admin handled via seeders.
3. **Mongoose Aggregations**: The dashboard heavily uses Mongoose aggregate pipelines so that calculations are done efficiently on the DB side instead of loading everything into process memory.

## Expected Roles & Permissions

- `viewer`: View Dashboard Summary.
- `analyst`: View Dashboard Summary. Create, Read, Update, Delete (soft-delete) Financial Records.
- `admin`: The same as analyst, plus endpoints to get all users and update a user's role or status (`isActive`).

## API Endpoints Overview

| Method | Endpoint                    | Description                    | Requires Auth | Access         |
| ------ | --------------------------- | ------------------------------ | ------------- | -------------- |
| POST   | `/api/auth/register`        | Register User                  | No            | Any            |
| POST   | `/api/auth/login`           | Login User                     | No            | Any            |
| GET    | `/api/auth/me`              | Get Current User               | Yes           | Any            |
| GET    | `/api/users/`               | Get All Users                  | Yes           | Admin          |
| PUT    | `/api/users/:id`            | Update User Status/Role        | Yes           | Admin          |
| POST   | `/api/records/`             | Add Financial Record           | Yes           | Admin, Analyst |
| GET    | `/api/records/`             | Get Relevant Financial Records | Yes           | Admin, Analyst |
| GET    | `/api/records/:id`          | Get One Financial Record       | Yes           | Admin, Analyst |
| PUT    | `/api/records/:id`          | Update Financial Record        | Yes           | Admin, Analyst |
| DELETE | `/api/records/:id`          | Soft Delete Financial Record   | Yes           | Admin, Analyst |
| GET    | `/api/dashboard/summary`    | Analytical Summaries           | Yes           | Viewer, Analyst, Admin |

*See \`postman_collection.json\` for examples that can be directly imported in Postman for testing.*
