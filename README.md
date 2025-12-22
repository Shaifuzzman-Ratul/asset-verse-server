## AssetVerse – Server


### Project Overview

The AssetVerse backend is a robust RESTful API built to power the AssetVerse Corporate Asset Management System. It handles authentication, role-based authorization, asset inventory management, employee affiliation, asset requests, approvals, subscription package enforcement, and secure payment processing. The server ensures data integrity, real-time synchronization with the frontend, and scalable business logic for multi-company asset management.

### Features

REST API Architecture: Clean and scalable RESTful endpoints

JWT Authentication: Secure token-based authentication system

Role-Based Authorization: Separate access control for HR Managers and Employees

User Management: Store and manage HR and employee profiles

Asset Management API: Add, update, delete, and retrieve company assets

Asset Request Workflow: Create, approve, reject, and return asset requests

Auto-Affiliation Logic: Automatically affiliate employees on first approved request

Multi-Company Support: Employees can be affiliated with multiple companies

Package Enforcement: Prevent approvals beyond subscription limits

Stripe Integration: Secure payment processing for package upgrades

Analytics Endpoints: Provide data for charts and dashboards

Server-Side Pagination: Paginated responses for large datasets

Error Handling: Centralized error and response handling

Environment Security: Sensitive credentials stored in environment variables

### 🧰 Tech Stack
🖥️ Backend

Node.js

Express.js

MongoDB

Mongoose

🔐 Authentication & Security

JSON Web Token (JWT)

Firebase Admin SDK (Optional)

Role-Based Middleware

💳 Payment

Stripe API

☁️ Deployment

Vercel

Render
