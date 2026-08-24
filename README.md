# TutorTrack

A full-stack Progressive Web Application (PWA) built specifically to manage tuition classes.
This repository contains Version 1, which focuses entirely on the **Teacher** administration dashboard. Student interfaces will be introduced in future phases.

## Technology Stack

- **Frontend:** React.js, Vite, React Router DOM, Tailwind CSS, Axios, Vite PWA Plugin
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs

## Prerequisites

- Node.js installed (v16+)
- MongoDB server running locally (or available via URI connection string)

## Getting Started

### 1. Database & Backend Setup

Navigate to the `backend` directory:
```bash
cd backend
```

Install Dependencies:
```bash
npm install
```

Configuration:
Copy the `.env.example` file to `.env` and configure your `MONGO_URI` and `JWT_SECRET`. By default, the app expects MongoDB on `mongodb://127.0.0.1:27017/tutortrack`.

Seed Database (Optional but Recommended):
We provide a seed script to generate an admin user, sample classes, students, and an announcement. Make sure your MongoDB instance is running.
```bash
node seed.js
```
*Note: This will clear the existing database if you run it again!*

Run the Backend Server:
```bash
npm run dev
```

The server will begin listening on `http://localhost:5000` (or your configured port).

### 2. Frontend Setup

Navigate to the `frontend` directory:
```bash
cd frontend
```

Install Dependencies:
```bash
npm install
```

Configure Environment Variables:
Copy `.env.example` to `.env` (it will use default proxy behavior in Vite if you point `/api` correctly inside `vite.config.js`). Currently, Axios is configured to use relative routes `//api`.

To connect the React dev server to the Backend API without CORS issues, you can implement a proxy inside `vite.config.js`, or the frontend operates natively assuming both are hosted via a unified reverse proxy. 

Run the Frontend Dev Server:
```bash
npm run dev
```

Open your browser to the local Vite URL (e.g., `http://localhost:5173/`).

### 3. Demo Login

If you ran the backend `seed.js` script, you can log into the Teacher Dashboard with the following details:

- **Email**: `teacher@tutortrack.com`
- **Password**: `12345678`

## Features list
- Progressive Web App ready (Cache & Installable).
- JWT Authentication System.
- Dashboard with top-level analytics mapping.
- CRUD mechanisms for **Classes**, **Students**, **Announcements**, **Materials**, **Fees** and **Marks/Exams.**
- Secure profile password management.

## Application Architecture Highlights

- Structured with discrete models, routes and controllers (`backend/controllers`).
- High-order middleware intercepts JSON Web Tokens for securely protected routes.
- Tailwind v4 is leveraged for zero-config intuitive utility styling.
- Extensible API design natively prepared for the forthcoming Student Web portal.

## PWA Capabilities

To utilize PWA offline mechanisms and test installation banners, build and serve the production version locally. Manifests icon mappings (`pwa-192x192.png`) belong inside the `frontend/public` directory.

```bash
npm run build
npm run preview
```
