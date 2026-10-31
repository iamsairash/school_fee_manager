# School Fee Manager

A full-stack web application for managing student fees. An admin logs in, sees fee totals at a glance, and can add students, record payments, edit details and delete records.

Built as a learning project, one small tested feature at a time.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [API reference](#api-reference)
- [Testing](#testing)
- [Running in production mode](#running-in-production-mode)
- [Security notes](#security-notes)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)

## Features

**Dashboard**

- Responsive layout with a sidebar (slides in on mobile)
- Stat cards: total students, fees collected, outstanding fees
- Student table with a status badge (Paid, Partial, Unpaid)
- Search by student or guardian name
- Status filter that works together with search, plus a "Clear filters" button
- Loading, error (with retry) and empty states
  **Student management**
- Add a student, with validation in both the browser and the server
- Record a payment, up to the outstanding balance
- Edit name, grade, guardian and total fee (the paid amount only changes through payments)
- Delete with a confirmation dialog
  **Authentication**
- Admin login with a bcrypt-hashed password
- Signed JWT stored in an httpOnly cookie
- All student routes require a login
- Login rate limiting and a generic error message for wrong email or password
- No public sign-up: the admin is created with a script

## Tech stack

| Layer            | Technology                                                |
| ---------------- | --------------------------------------------------------- |
| Frontend         | React, Vite, Tailwind CSS                                 |
| Backend          | Node.js, Express 5                                        |
| Database         | MongoDB (Atlas or local), Mongoose                        |
| Auth             | bcryptjs, jsonwebtoken, cookie-parser, express-rate-limit |
| Security headers | helmet                                                    |
| Tests            | Node's built-in test runner, supertest                    |

## Project structure

```
school-fee-manager/
├── client/                      React app (Vite)
│   ├── .env.production          Sets VITE_API_URL to empty (same-origin API)
│   ├── test/                    Tests for the pure logic in src/utils
│   └── src/
│       ├── api/                 http.js (shared fetch), auth.js, students.js
│       ├── components/          Reusable UI (Sidebar, StatCard, StudentTable,
│       │                        StatusBadge, SearchBar, FilterSelect, Modal,
│       │                        FormField, StudentForm, PaymentForm,
│       │                        ConfirmDialog, LoginPage, LoadingState,
│       │                        ErrorState, Alert, ClearFiltersButton)
│       ├── hooks/
│       │   └── useStudents.js   Fetching, adding, paying, editing, deleting
│       ├── utils/               fees.js, filters.js, validate.js,
│       │                        studentForm.js, paymentForm.js
│       ├── App.jsx              Login gate (checking, login page, dashboard)
│       ├── Dashboard.jsx        The main page
│       └── main.jsx             React entry point
└── server/                      Express API
    ├── app.js                   The Express app (no port, no database connection)
    ├── index.js                 Connects to MongoDB, then starts listening
    ├── db.js                    Database connection
    ├── auth.js                  Token signing, cookie helpers, requireAuth
    ├── seed.js                  Loads sample students (deletes existing ones)
    ├── create-admin.js          Creates or resets the admin user
    ├── models/                  Student.js, User.js
    ├── routes/                  auth.js, students.js
    ├── utils/                   validateStudent.js, validatePayment.js
    ├── data/students.js         Sample data used by the seed script
    └── test/                    helpers.js, validate.test.js, api.test.js
```

## Getting started

### Prerequisites

- Node.js 20.6 or newer (developed on Node 22). The server uses the `--env-file` flag.
- A MongoDB database: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, or a local MongoDB.
- Git

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure the server

Create `server/.env` (see [Environment variables](#environment-variables)):

```bash
cd server
cp .env.example .env
```

Fill in `MONGODB_URI`, then generate a signing secret and put it in `JWT_SECRET`:

```bash
openssl rand -hex 48
```

If you use Atlas, remember to allow your IP address under **Network Access** and to use a password with letters and numbers only (special characters must be URL-encoded).

### 3. Load sample data (optional)

```bash
npm run seed
```

This **deletes every student** in the database first, then inserts 10 sample students.

### 4. Create the admin user

There is no sign-up page. Create the admin with a script. `read -s` hides the password while you type:

```bash
read -p "Admin email: " ADMIN_EMAIL
read -s -p "Admin password (8 to 72 characters): " ADMIN_PASSWORD; echo
export ADMIN_EMAIL ADMIN_PASSWORD
npm run create-admin
unset ADMIN_EMAIL ADMIN_PASSWORD
```

Running it again with the same email resets that admin's password.

### 5. Run the app

Use two terminals.

```bash
# Terminal 1: API on http://localhost:5000
cd server
npm run dev

# Terminal 2: React app on http://localhost:5173
cd client
npm run dev
```

Open `http://localhost:5173` (use `localhost`, not `127.0.0.1`, so the cookie and CORS origin match) and log in.

## Environment variables

### Server (`server/.env`)

| Variable        | Required | Description                                                                                    |
| --------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `MONGODB_URI`   | Yes      | MongoDB connection string, including the database name                                         |
| `JWT_SECRET`    | Yes      | Random secret, at least 32 characters. Never share or reuse it between environments            |
| `CLIENT_ORIGIN` | No       | Allowed browser origin for CORS. Defaults to `http://localhost:5173`                           |
| `PORT`          | No       | API port. Defaults to `5000`                                                                   |
| `NODE_ENV`      | No       | Set to `production` when deployed. Turns on secure cookies and proxy trust, and blocks seeding |
| `SERVE_CLIENT`  | No       | Set to `true` to serve the built React app from Express                                        |
| `DELAY_MS`      | No       | Testing helper that slows `GET /api/students` so you can see the loading state                 |

`create-admin` also reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the environment.

### Client

| Variable       | Description                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `VITE_API_URL` | API address. Defaults to `http://localhost:5000` in development. `client/.env.production` sets it to empty so a production build calls the same origin |

> `.env` files hold secrets and are ignored by Git. Never commit them. `server/.env.example` lists the variable names without values.

## Scripts

### Server (`cd server`)

| Command                | What it does                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `npm run dev`          | Starts the API with auto-restart and loads `.env`                                     |
| `npm start`            | Starts the API without loading `.env` (for hosts that provide environment variables)  |
| `npm run start:local`  | Starts the API and loads `.env` (for testing production mode locally)                 |
| `npm run seed`         | Resets the database to the sample students. Refuses to run when `NODE_ENV=production` |
| `npm run create-admin` | Creates or resets the admin user                                                      |
| `npm test`             | Runs the server tests against the separate test database                              |

### Client (`cd client`)

| Command         | What it does                      |
| --------------- | --------------------------------- |
| `npm run dev`   | Starts the Vite dev server        |
| `npm run build` | Builds the app into `client/dist` |
| `npm test`      | Runs the logic tests              |

## API reference

All `/api/students` routes require a valid login cookie and return `401` without one. Errors are JSON: `{ "error": "message" }`, and validation errors also include `fields` with per-field messages.

| Method | Path                         | Auth | Description                                                                                                   |
| ------ | ---------------------------- | ---- | ------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/health`                | No   | Server and database status                                                                                    |
| POST   | `/api/auth/login`            | No   | Body: `{ email, password }`. Sets the login cookie. Limited to 10 failed attempts per 15 minutes per IP       |
| POST   | `/api/auth/logout`           | No   | Clears the cookie                                                                                             |
| GET    | `/api/auth/me`               | Yes  | Returns the logged-in user's email                                                                            |
| GET    | `/api/students`              | Yes  | List all students                                                                                             |
| POST   | `/api/students`              | Yes  | Add a student: `{ name, grade, guardian, totalFee, paid }`                                                    |
| PATCH  | `/api/students/:id`          | Yes  | Edit `{ name, grade, guardian, totalFee }`. Never changes `paid`. Refuses a fee below the amount already paid |
| PATCH  | `/api/students/:id/payments` | Yes  | Record a payment: `{ amount }`. Refuses more than the outstanding balance                                     |
| DELETE | `/api/students/:id`          | Yes  | Delete a student                                                                                              |

A student looks like this:

```json
{
  "id": "6650f1...",
  "name": "Sita Thapa",
  "grade": "Grade 8",
  "guardian": "Gopal Thapa",
  "totalFee": 30000,
  "paid": 15000
}
```

The status is derived, not stored: `Paid` when `paid >= totalFee`, `Partial` when `paid > 0`, otherwise `Unpaid`.

## Testing

Both folders use Node's built-in test runner.

```bash
cd client && npm test
cd server && npm test
```

**Server tests use a separate database.** They create and delete data, so they must never run against your real database.

1. Create `server/.env.test` containing only a `MONGODB_URI` line that is the same as your real one, but with the database name changed to `school_fee_manager_test`.
2. `npm test` loads `.env` first and `.env.test` second, so the test address overrides the real one.
3. A guard in `server/test/helpers.js` refuses to run if the database name does not end in `_test`.
   To confirm the guard works, run `node --test --env-file=.env test/api.test.js` without the test file. It should fail with "Refusing to run tests".

The tests cover:

- **Client:** totals, status, currency formatting, search, filters, data cleaning and form validation
- **Server:** input validation, login and logout, protected routes, forged tokens, every students route, and two simultaneous payments that cannot overpay a student

## Running in production mode

In production, one Express server serves both the API and the built React app. Because the page and the API share one origin, the login cookie works without extra CORS settings.

### Try it locally

```bash
cd client
npm run build

cd ../server
NODE_ENV=production SERVE_CLIENT=true npm run start:local
```

Open `http://localhost:5000`.

### On a host

- **Build:** install and build the client, then install the server dependencies
- **Start:** `cd server && npm start`
- **Environment variables:** `MONGODB_URI`, `JWT_SECRET` (a new one, generated for production), `NODE_ENV=production`, `SERVE_CLIENT=true`
- **Atlas Network Access:** hosts often have changing IP addresses, so you may need to allow all addresses. If you do, use a long, unique database password and a user limited to this database
- **Admin:** run `create-admin` once against the production database
- **HTTPS:** required, because the login cookie is marked `Secure` in production

## Security notes

- Passwords are stored only as bcrypt hashes
- The login token is in an httpOnly, `sameSite: lax` cookie, and is `Secure` in production
- Login gives the same error for a wrong password and an unknown email, and compares against a dummy hash to keep response times similar
- Login input must be plain strings, which blocks object-based NoSQL injection
- The server validates all input itself and copies only known fields, so extra fields from a client are ignored
- Payments use one atomic database update, so simultaneous requests cannot push `paid` above `totalFee`
- Request bodies are limited to 10 KB
- `helmet` adds standard security headers
- React escapes text, so typed HTML is shown as text and not run

## Known limitations

- **One role only.** Every logged-in user is a full admin
- **Logout only clears the cookie.** A copied token stays valid until it expires (8 hours)
- **The login rate limiter is in memory.** It resets when the server restarts
- **Deleting a student deletes their payment record.** There is no payment history or audit trail
- **No React component tests.** The tests cover logic and the API, not what appears on screen
- **API tests use a real cloud database,** so they need internet access and are slower than local tests

## Roadmap

- [x] Dashboard, search and filters
- [x] Add, edit, delete and record payments
- [x] MongoDB, authentication and automated tests
- [x] Production build served by Express
- [ ] Deploy to a hosting provider
- [ ] Payment history (a separate `payments` collection) and soft delete
- [ ] Multiple roles
- [ ] React component tests
- [ ] Run tests automatically on every push (for example with GitHub Actions)

## License

No license has been chosen yet. Add one before sharing the code publicly.
