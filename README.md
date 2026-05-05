# HSBP — Hyperlocal Service Booking Platform

A full-stack MERN application where users can book local home services (plumbing, electrical, cleaning, etc.), service providers can list their offerings, and admins manage the entire platform.

> Built as a Major Project · MERN Stack (MongoDB, Express, React, Node.js)

---

## Features

### Customer
- Register / Login
- Browse and search services by category
- Book a service with address and schedule
- Pay securely during booking (Razorpay)
- View and cancel bookings from dashboard

### Service Provider
- Register and wait for admin approval
- Add services with title, category, and price
- View assigned bookings and update status (Accept / Complete / Decline)

### Admin
- View all users and providers
- Approve or reject service providers
- View all bookings across the platform

---

## Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Frontend   | React 19, Vite, React Router   |
| Backend    | Node.js, Express.js            |
| Database   | MongoDB, Mongoose              |
| Auth       | JWT (JSON Web Tokens), bcryptjs |

---

## Project Structure

```
HSBP/
├── backend/
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/      # Auth & role guards
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   ├── server.js       # Express app entry point
│   │   └── seed.js         # Admin user seeder
│   └── .env
└── frontend/
    └── src/
        ├── api/            # Axios instance
        ├── components/     # Navbar
        ├── context/        # Auth context
        └── pages/          # All page components
```

---

## Setup & Run

### Prerequisites
- Node.js (v18+)
- MongoDB installed locally

### 1. Start MongoDB
```powershell
mongod --dbpath "$env:USERPROFILE\HSBP\data" --wiredTigerCacheSizeGB 0.25 --setParameter diagnosticDataCollectionEnabled=false
```

### 2. Start Backend
```powershell
cd backend
copy .env.example .env      # edit MONGO_URI, JWT_SECRET, RAZORPAY keys
npm install
npm run dev                 # runs on http://localhost:5000
```

### 3. Seed Admin User
```powershell
npm run seed:admin
# Admin: admin@hsbp.com / admin123
```

### 4. Start Frontend
```powershell
cd frontend
npm install
npm run dev                 # runs on http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint                              | Role     |
|--------|---------------------------------------|----------|
| POST   | /api/auth/register                    | Public   |
| POST   | /api/auth/login                       | Public   |
| GET    | /api/services                         | Public   |
| POST   | /api/services                         | Provider |
| POST   | /api/bookings                         | User     |
| GET    | /api/bookings/my                      | User     |
| PATCH  | /api/bookings/:id/status              | User/Provider |
| GET    | /api/bookings/provider                | Provider |
| GET    | /api/admin/users                      | Admin    |
| PATCH  | /api/admin/providers/:id/approval     | Admin    |
| GET    | /api/admin/bookings                   | Admin    |

---

## Additional Documentation

- Technical details: `docs/TECHNICAL_DOCUMENTATION.md`
- Non-technical explanation: `docs/NON_TECHNICAL_DOCUMENTATION.md`
