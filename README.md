# CSBAMS — Community Seed Bank and Agro-Biodiversity Management System

A web application that replaces paper registers, handwritten notes, and verbal agreements in rural seed banks with a record that survives damage, disputes, and lost connectivity.

Farmers can check what seed is available, borrow it, and return it. Coordinators can register varieties, manage stock, record quality tests, and produce reports. Experts can review quality results and answer questions. Administrators can manage accounts, events, and knowledge articles.

Everything runs locally: SQLite for storage, OTP codes printed to the backend console, CSV exports, and no external services of any kind.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Demo Accounts](#demo-accounts)
- [A Five-Minute Tour](#a-five-minute-tour)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [Scope and Limitations](#scope-and-limitations)

---

## Features

**Farmer**
- Register and log in with a password and a one-time code
- Browse seed varieties and check availability before requesting
- Request seed on loan and follow the status
- See how much is still outstanding on each loan
- Read published knowledge articles and browse community events
- Ask an agricultural question and read the expert's answer

**Coordinator**
- Register seed varieties with source and storage location
- Add and reduce stock, with a full movement ledger
- Record quality tests and see a derived quality status
- Validate, approve, reject, and issue loans
- Record full and partial returns
- Generate inventory, low-stock, loan, return, and event reports as CSV

**Agricultural Expert**
- Review quality test results and attach recommendations
- Recommend varieties and provide traditional farming guidance
- Respond to farmer questions
- Approve knowledge articles or send them back for revision

**Administrator**
- Manage user accounts: activate, deactivate, reactivate
- Create and update community events
- Create and manage knowledge articles
- Generate reports

**Across all roles**
- Mobile-responsive layout that works on a basic smartphone
- Offline reading of cached inventory, varieties, events, and articles
- Loan requests queued while offline and replayed exactly once when connectivity returns
- In-app notifications for loan decisions, query responses, and article reviews

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Vite, Axios |
| Backend | Node.js 18+, Express, JWT, bcrypt |
| Database | SQLite via better-sqlite3 |
| Offline | Service worker, IndexedDB |
| Reports | In-process CSV generation |
| Tests | Jest, Supertest, Vitest, React Testing Library |

No Docker, no cloud services, no paid APIs.

---

## Prerequisites

- Node.js 18 or later (20 LTS recommended)
- npm 9 or later
- Windows, macOS, or Linux

## Current local implementation

The repository now contains a runnable local implementation. To start it from this checkout:

```powershell
cd backend
npm install
npm run seed
npm start
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite, normally `http://localhost:5173`. Use the Farmer demonstration account `9000000004` with password `Farmer@123`.

Check your versions:

```bash
node -v
npm -v
