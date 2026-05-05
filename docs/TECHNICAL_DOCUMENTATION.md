# HSBP Technical Documentation

## 1) Project Overview
HSBP (Hyperlocal Service Booking Platform) is a full-stack MERN application that connects:
- Customers who need home services
- Service providers who offer services
- Admin who controls approvals and platform operations

The project follows role-based access control and supports the complete booking lifecycle from service creation to completion/cancellation.

---

## 2) Technology Stack
- Frontend: React (Vite), React Router, Axios
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT + bcryptjs
- State Handling: React Context API (`AuthContext`, `ToastContext`)
- Styling: Inline style objects + centralized theme (`theme.js`) + global CSS

---

## 3) High-Level Architecture
- Client (React) sends HTTP requests to REST APIs
- Server (Express) validates token and role permissions
- Controllers handle business logic
- Mongoose models perform database operations in MongoDB

Flow:
1. User logs in -> JWT token generated
2. Token stored in browser local storage
3. Axios interceptor sends token in `Authorization` header
4. Backend middleware verifies token and loads user identity
5. Role middleware allows/denies endpoint access

---

## 4) Folder Structure
```text
HSBP/
  backend/
    src/
      config/       # DB connection
      controllers/  # Core business logic
      middleware/   # JWT auth + role guard
      models/       # User, Service, Booking schemas
      routes/       # API route mapping
      server.js     # App bootstrap
      seed.js       # Admin seed script
  frontend/
    src/
      api/          # Axios config
      components/   # Shared UI (Layout, PublicNav, Toast)
      context/      # Auth context provider
      pages/        # Route-level pages
      theme.js      # Colors/tokens helpers
```

---

## 5) Backend Design

### 5.1 Models
- `User`
  - Fields: name, email, password, role, isApproved
  - Additional reset fields: resetToken, resetTokenExpiry
- `Service`
  - Fields: title, category, description, price, provider (ref User)
- `Booking`
  - Fields: user, service, provider, address, scheduledAt, status
  - Status enum: pending, accepted, completed, cancelled

### 5.2 Middleware
- `protect`: verifies JWT and attaches `req.user`
- `allowRoles(...roles)`: role-based authorization check

### 5.3 Controllers by Domain
- Auth Controller:
  - register, login, me, updateProfile
  - forgotPassword, resetPassword
- Service Controller:
  - getAllServices, createService, getMyServices, deleteService
- Booking Controller:
  - createBooking, getMyBookings, getProviderBookings, updateBookingStatus
- Admin Controller:
  - getAllUsers, setProviderApproval, getAllBookings, changeUserPassword

### 5.4 API Route Groups
- `/api/auth/*`
- `/api/services/*`
- `/api/bookings/*`
- `/api/admin/*`

---

## 6) Frontend Design

### 6.1 Routing and Protection
- Public pages: Home, Services, Login, Register, Forgot Password, Reset Password
- Protected pages: Dashboard, Book Service, Provider pages, Admin panel, Profile
- `ProtectedRoute` checks:
  - Auth loading state
  - Authenticated user existence
  - Allowed role list

### 6.2 Shared Components
- `Layout`: authenticated shell with sidebar and top bar
- `PublicNav`: navbar for public pages
- `Toast`: centralized notification system for success/error/info/warning

### 6.3 Data Access
- `api/axios.js` sets API base URL
- Axios request interceptor injects JWT token automatically

### 6.4 Auth State
- `AuthContext`:
  - Keeps `user`, `loading`
  - Provides `login`, `logout`
  - On app load, fetches `/auth/me` if token exists

---

## 7) End-to-End Functional Flows

### 7.1 Customer Flow
1. Register/Login as user
2. Browse/search services
3. Book service with address and schedule
4. View bookings in dashboard
5. Cancel pending booking if needed

### 7.2 Provider Flow
1. Register as provider
2. Wait for admin approval
3. Add/manage own services
4. Receive booking requests
5. Accept/decline/complete bookings
6. Can also book other providers' services (dual-use behavior)

### 7.3 Admin Flow
1. Login as admin
2. Approve/reject providers
3. View all users and all bookings
4. Reset password for user/provider accounts
5. Monitor stats (pending/completed booking counts)

---

## 8) Security and Validation
- Passwords hashed with bcrypt before storing
- JWT signed with secret key and expiration
- Route-level authorization by role
- Prevent self-booking (provider cannot book own service)
- Booking status transitions restricted by booking ownership/provider assignment
- Password reset uses token with expiry

---

## 9) Setup to Execution (Local)
1. Install Node.js and MongoDB
2. Start MongoDB with db path
3. Backend:
   - create `.env` from `.env.example`
   - install dependencies
   - run dev server
4. Run seed script for admin user
5. Frontend:
   - install dependencies
   - run Vite dev server
6. Access:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

---

## 10) Important Features Implemented
- Responsive app shell for authenticated pages
- Search + filtering for services
- Toast notifications replacing browser alerts
- Provider booking status actions
- User booking cancellation
- Provider service deletion
- Profile edit page
- Forgot/reset password workflow
- Admin password change tool
- Improved duplicate-email feedback and role clarity

---

## 11) Known Constraints / Future Scope
- No payment gateway integration yet
- No real email provider (reset token shown directly for demo)
- No advanced analytics dashboard (can be added)
- No automated test suite yet (recommended next step)

---

## 12) Suggested PPT (Technical) Slide Order
1. Problem + Goal
2. Tech Stack
3. Architecture Diagram
4. Database Schema
5. API Design
6. Frontend Routing and Role Protection
7. Core Workflows (User/Provider/Admin)
8. Security Controls
9. Challenges and Fixes
10. Future Enhancements

