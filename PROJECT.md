# CSBAMS — Master Build Specification

| Field | Value |
|---|---|
| Project | Community Seed Bank and Agro-Biodiversity Management System |
| Short name | CSBAMS |
| Version | 1.0 |
| Date | 10 October 2026 |
| Audience | Any AI coding agent or developer building this project |
| Status | Authoritative build specification |

---

## 0. How To Use This Document

This is the single source of truth. Read it fully before writing code.

**Precedence when anything conflicts:** this document beats every other file in the repository, including PRD.md, architecture.md, Rules.md, Phases.md, and Design.md. Those files explain reasoning; this one defines the build.

**Rules for the agent:**

1. Build in the phase order in section 15. Do not skip ahead.
2. Follow the folder structure in section 10 exactly. Do not invent new top-level folders.
3. Use the database schema in section 8 verbatim. Do not rename tables or columns.
4. Use the API paths in section 9 exactly. The frontend and backend both depend on them.
5. Implement the state machines in section 7 as allow-lists. Reject illegal transitions.
6. Everything runs locally. No cloud services, no paid APIs, no Docker, no SMS provider.
7. Seed data in section 16 must exist so the app is demonstrable immediately after setup.
8. If something genuinely is not specified here, choose the simplest option that satisfies the requirements, and record the choice in a comment marked `DECISION:`.
9. Do not build anything in section 21.
10. Every multi-table write runs inside one database transaction.

**Verification command after each phase:**

```bash
cd backend && npm run migrate && npm run seed && npm test
cd ../frontend && npm test && npm run build
```

---

## 1. Project Overview

### 1.1 Problem

Rural and semi-urban seed banks run on paper registers, handwritten notes, and verbal agreements. Records are lost or become unreadable, seed loans and returns are hard to track so disputes are common, demand cannot be matched to supply, quality results are poorly documented, women farmers and youth participate less, traditional knowledge is disappearing, and preparing reports for schemes and NGOs is slow and error-prone. The result is declining agro-biodiversity and loss of indigenous seed.

### 1.2 Solution

A web application, mobile-responsive and offline-capable, that digitises the full seed bank lifecycle: register varieties, manage stock, record quality tests, request and issue loans, record returns, publish knowledge, run events, and generate reports.

### 1.3 Success Criteria

A community seed bank can run every daily operation in the app, a farmer can borrow and return seed without a paper record, and a coordinator can produce a scheme report in one click.

---

## 2. Scope

### 2.1 In Scope

User management, seed variety management, inventory management, quality management, loan management, return management, expert support, knowledge management, event management, reporting, notifications, and offline capability.

### 2.2 Out of Scope

Commercial seed sales, payment gateways, AI image recognition, blockchain traceability, government portal integration, machine-learning recommendations, multi-warehouse transfers, seed batch tracking, multilingual content, SMS or email delivery, and image upload.

---

## 3. Roles

| Role | Label in UI | Purpose |
|---|---|---|
| Farmer | Farmer | Borrows seed, returns it, reads knowledge, attends events, asks questions |
| Coordinator | Coordinator | Runs the seed bank day to day |
| Agricultural Expert | Agricultural Expert | Reviews quality, advises, answers queries, approves articles |
| Administrator | Administrator | Manages accounts, events, articles, and reports |

### 3.1 Permission Matrix

| Use case | Farmer | Coordinator | Expert | Administrator |
|---|---|---|---|---|
| Register User | Y | Y | Y | Y |
| Authenticate / Logout | Y | Y | Y | Y |
| Manage own profile | Y | Y | Y | Y |
| View own dashboard | Y | Y | Y | Y |
| Manage user accounts | — | — | — | Y |
| Register / edit seed variety | — | Y | — | — |
| Add / reduce stock, view ledger | — | Y | — | — |
| View inventory, check availability | Y | Y | — | — |
| Record quality test | — | Y | — | — |
| View quality information | Y | Y | Y | — |
| Review quality / add recommendation | — | — | Y | — |
| Request loan, view own loans | Y | — | — | — |
| Validate / approve / reject / issue loan | — | Y | — | — |
| View all loan transactions | — | Y | — | — |
| Record full / partial return | — | Y | — | — |
| Provide recommendations and guidance | — | — | Y | — |
| Respond to query | — | — | Y | — |
| Submit query, close own query | Y | — | — | — |
| Create / update event | — | — | — | Y |
| View / filter events, register participation | Y | Y | Y | Y |
| Create / update knowledge article | — | — | Y (draft) | Y |
| Approve / request revision on article | — | — | Y | — |
| View / filter published articles | Y | Y | Y | Y |
| Generate reports and export CSV | — | Y | — | Y |

---

## 4. Functional Requirements

Numbering is `FR-<AREA>-<n>`. All are MUST.

**Accounts (ACC)** — register with name, mobile, password, role; validate all fields; generate a prefixed UserID; login with password; login with OTP; view and update profile; change password; logout; administrator lists users, views details, activates, deactivates, reactivates; registration creates a `Registered` account that requires activation.

**Varieties (VAR)** — coordinator creates a variety with name, source, storage location, and initial quantity; variety name must be unique per source and location; coordinator updates details; deletion refused while loan or return history exists; users can search varieties.

**Inventory (INV)** — creating a variety creates its inventory row; add stock; reduce stock never below zero; view current inventory; check availability for a quantity; flag low stock; every movement writes a ledger row; status derives as Available, LowStock, or OutOfStock.

**Quality (QLT)** — coordinator records germination, purity, moisture, and test date; ranges validated; a derived status of Good, Average, or Poor is stored; a test can be flagged for expert review; an expert can mark it reviewed and attach a recommendation; quality history is retained per variety.

**Loans (LN)** — farmer requests a variety and quantity; availability is checked before the loan exists; insufficient requests are refused; a valid request creates a Pending loan; farmer sees only their own loans; coordinator validates, approves, rejects with a reason, or issues; issue reduces inventory and sets outstanding quantity in one transaction; Rejected and Returned are terminal.

**Returns (RT)** — a return is always against an issued loan; quantity must be positive and not exceed outstanding; partial return restores stock and reduces outstanding; the return that clears outstanding sets the loan to Returned; multiple partial returns are allowed; total returns never exceed issued quantity.

**Queries (QRY)** — farmer submits a question of at least 10 characters; it starts Open; only an expert responds; responding sets Answered with a response date; only the submitting farmer closes it, and only after it is Answered.

**Knowledge (KB)** — administrator or expert creates an article with title, content, and category; new articles start Draft and are invisible to farmers; administrator or expert submits for review; an expert approves, which publishes it, or requests revision; a revision returns it to Draft for editing; editing a published article returns it to UnderReview; only Published articles appear to farmers.

**Events (EVT)** — administrator creates, updates, and deletes events; event date cannot be in the past at creation; users view and filter; a farmer registers participation once per event; past events remain visible and labelled.

**Reports (RP)** — inventory, low stock, loan, loan-and-return summary, and event reports; filters for date range, variety, status, and location; CSV export that matches the on-screen filters; empty results still export with headers.

**Notifications (NTF)** — created on loan rejection, issue, and full return; on query answered; on article published or sent back for revision; visible to the owning user only; can be marked read; older than 90 days are purged.

**Offline (OF)** — app shell loads without network after first visit; cached reads for inventory, varieties, events, and published articles; loan requests queue while offline; queued writes replay once with an idempotency key; availability is re-checked server-side at replay; UI shows connection state and pending count.

---

## 5. Resolved Decisions

These resolve every conflict between the original diagrams. They are decided; do not re-open them. Each one lists the setting that implements it.

| # | Question | Decision | Implementation |
|---|---|---|---|
| 1 | Is OTP required after password? | Configurable, default ON. Password login then OTP. Can be disabled for demos. | `config/otp.js` → `requireOtpAfterPassword: true`. When off, password login issues the token directly. |
| 2 | Is expert review of a quality test mandatory? | Optional. Review happens only when the test is flagged. | `quality_tests.review_status` values: `NotRequired`, `Requested`, `Reviewed`. |
| 3 | Must a loan be validated before approval? | Yes. Pending → Validated → Approved → Issued. | State guard in section 7.1; coordinator queue has separate Validate then Approve actions. |
| 4 | Must an account be activated before login? | Yes. Registration creates `Registered`; administrator activates. Seed accounts are pre-activated. | `users.status` engine in section 7.6; auth checks `Active`. |
| 5 | Who closes a query? | The farmer, after it is Answered. | `PATCH /api/queries/:id/close`, farmer only. |
| 6 | Who authors knowledge articles? | Administrators and experts both create drafts. An expert approves. In a single-expert community an expert may approve their own draft (documented simplification). | `knowledge_articles.author_id`, `reviewer_id`. |
| 7 | Is a reporting sequence diagram needed? | No. Reports are derived, not stored. | `reportService` reads live tables. |
| 8 | Inventory granularity | One inventory record per variety. | `seed_inventories.variety_id` is UNIQUE. |
| 9 | Notification channel | In-app only. | `notifications` table plus a navbar bell. |
| 10 | Quality thresholds | Germination 85/70, purity 98/95, moisture 12/14. | `utils/constants.js`, section 5.1. |
| 11 | Low-stock threshold default | `max(5, 10% of initial quantity)`, editable per variety. | `seed_inventories.low_stock_threshold`. |
| 12 | Article categories | seeds, traditional knowledge, pest control, soil, climate, general. | `utils/constants.js`. |
| 13 | Notification retention | 90 days. | Cleanup on server start. |
| 14 | OTP parameters | 6 digits, 5-minute expiry, 3 verify attempts, 5 requests per mobile per hour. | `config/otp.js`. |

### 5.1 Constants (authoritative values)

```js
// backend/utils/constants.js
export const ROLES = ['Farmer', 'Coordinator', 'Agricultural Expert', 'Administrator'];

export const ACCOUNT_STATUS = ['Registered', 'Active', 'Inactive'];

export const LOAN_STATUS = ['Pending', 'Validated', 'Approved', 'Issued',
                            'PartiallyReturned', 'Returned', 'Rejected'];

export const INVENTORY_STATUS = ['Available', 'LowStock', 'OutOfStock'];

export const QUALITY_STATUS = ['Good', 'Average', 'Poor'];

export const REVIEW_STATUS = ['NotRequired', 'Requested', 'Reviewed'];

export const ARTICLE_STATUS = ['Draft', 'UnderReview', 'NeedsRevision', 'Published', 'Updated'];

export const QUERY_STATUS = ['Open', 'UnderReview', 'Answered', 'Closed'];

export const CATEGORIES = ['seeds', 'traditional knowledge', 'pest control',
                           'soil', 'climate', 'general'];

export const QUALITY_THRESHOLDS = {
  germination: { good: 85, average: 70 },
  purity:      { good: 98, average: 95 },
  moisture:    { good: 12, average: 14, inverted: true }
};

export const ID_PREFIX = {
  user: 'USR', variety: 'VAR', inventory: 'INV', qualityTest: 'TST',
  recommendation: 'REC', loan: 'LN', seedReturn: 'RET', query: 'QRY',
  event: 'EVT', article: 'ART', notification: 'NTF', ledger: 'LDG'
};
```

---

## 6. Domain Rules

**Inventory** — quantity never negative; reduce cannot exceed available; every change writes a ledger row in the same transaction; status derives from quantity and threshold.

**Loans** — availability checked at request, at approval, and at issue; issue sets outstanding to issued quantity; Rejected and Returned are terminal; farmers see only their own loans.

**Returns** — positive quantity, never above outstanding, total never above issued; the clearing return sets Returned.

**Quality** — a stored status is the worst status across the three parameters; expert override keeps history.

**Knowledge** — only Published is visible to farmers; editing published content returns it to review.

**Accounts** — mobile is unique; role cannot be self-changed; an administrator cannot deactivate their own account.

**Money and quantities** — integers only for quantities; percentages stored as decimals.

**Dates** — ISO 8601 UTC everywhere, both in the database and over the API.

---

## 7. State Machines

Implement each as a transition allow-list. Illegal transitions throw `ILLEGAL_TRANSITION` and change nothing.

### 7.1 LoanTransaction

| From | To | Actor |
|---|---|---|
| — | Pending | Farmer |
| Pending | Validated | Coordinator |
| Pending | Rejected | Coordinator |
| Validated | Approved | Coordinator |
| Validated | Rejected | Coordinator |
| Approved | Issued | Coordinator |
| Issued | PartiallyReturned | Coordinator |
| Issued | Returned | Coordinator |
| PartiallyReturned | PartiallyReturned | Coordinator |
| PartiallyReturned | Returned | Coordinator |
| Rejected | terminal | — |
| Returned | terminal | — |

### 7.2 SeedInventory

| From | To | Trigger |
|---|---|---|
| — | Available | Initial stock recorded |
| Available | LowStock | Falls below threshold |
| Available | OutOfStock | Reaches zero |
| LowStock | Available | Reaches or passes threshold |
| LowStock | OutOfStock | Reaches zero |
| OutOfStock | LowStock | Restocked below threshold |
| OutOfStock | Available | Restocked to threshold |

### 7.3 QualityTest

| From | To | Trigger |
|---|---|---|
| — | Recorded | Test saved |
| Recorded | Good / Average / Poor | Derived at save |
| any status | Reviewed | Expert attaches recommendation |

### 7.4 AgriculturalQuery

| From | To | Actor |
|---|---|---|
| — | Open | Farmer |
| Open | UnderReview | Expert opens |
| UnderReview | Answered | Expert responds |
| Answered | Closed | Farmer closes |

### 7.5 KnowledgeArticle

| From | To | Actor |
|---|---|---|
| — | Draft | Admin or Expert |
| Draft | UnderReview | Submit |
| UnderReview | Published | Expert approves |
| UnderReview | NeedsRevision | Expert requests changes |
| NeedsRevision | Draft | Author revises |
| Published | Updated | Author edits |
| Updated | UnderReview | Resubmit |

### 7.6 UserAccount

| From | To | Actor |
|---|---|---|
| — | Registered | Registration |
| Registered | Active | Administrator |
| Active | Inactive | Administrator |
| Inactive | Active | Administrator |

---

## 8. Database

SQLite. Twenty tables. Create with `database/schema.sql` and run with `database/migrate.js`.

### 8.1 Full Schema

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  user_id       TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  mobile        TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('Farmer','Coordinator','Agricultural Expert','Administrator')),
  status        TEXT NOT NULL DEFAULT 'Registered' CHECK (status IN ('Registered','Active','Inactive')),
  created_date  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS farmers (
  user_id  TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  village  TEXT,
  land_area REAL
);

CREATE TABLE IF NOT EXISTS coordinators (
  user_id   TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  bank_name TEXT,
  location  TEXT
);

CREATE TABLE IF NOT EXISTS agricultural_experts (
  user_id   TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  expertise TEXT,
  organization TEXT
);

CREATE TABLE IF NOT EXISTS administrators (
  user_id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seed_varieties (
  variety_id       TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  source           TEXT NOT NULL,
  storage_location TEXT NOT NULL,
  created_by       TEXT REFERENCES users(user_id),
  created_date     TEXT NOT NULL,
  UNIQUE (name, source, storage_location)
);

CREATE TABLE IF NOT EXISTS seed_inventories (
  inventory_id        TEXT PRIMARY KEY,
  variety_id          TEXT NOT NULL UNIQUE REFERENCES seed_varieties(variety_id) ON DELETE CASCADE,
  available_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  updated_date        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quality_tests (
  test_id       TEXT PRIMARY KEY,
  variety_id    TEXT NOT NULL REFERENCES seed_varieties(variety_id),
  test_date     TEXT NOT NULL,
  germination   REAL NOT NULL CHECK (germination BETWEEN 0 AND 100),
  purity        REAL NOT NULL CHECK (purity BETWEEN 0 AND 100),
  moisture      REAL NOT NULL CHECK (moisture BETWEEN 0 AND 100),
  status        TEXT NOT NULL CHECK (status IN ('Good','Average','Poor')),
  review_status TEXT NOT NULL DEFAULT 'NotRequired' CHECK (review_status IN ('NotRequired','Requested','Reviewed')),
  tester_id     TEXT REFERENCES users(user_id),
  created_date  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS expert_recommendations (
  recommendation_id  TEXT PRIMARY KEY,
  expert_id          TEXT NOT NULL REFERENCES users(user_id),
  test_id            TEXT REFERENCES quality_tests(test_id),
  variety_id         TEXT REFERENCES seed_varieties(variety_id),
  type               TEXT NOT NULL,
  content            TEXT NOT NULL,
  recommendation_date TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'Published'
);

CREATE TABLE IF NOT EXISTS loan_transactions (
  loan_id              TEXT PRIMARY KEY,
  farmer_id            TEXT NOT NULL REFERENCES users(user_id),
  variety_id           TEXT NOT NULL REFERENCES seed_varieties(variety_id),
  requested_quantity   INTEGER NOT NULL CHECK (requested_quantity > 0),
  issued_quantity      INTEGER,
  outstanding_quantity INTEGER NOT NULL DEFAULT 0 CHECK (outstanding_quantity >= 0),
  status               TEXT NOT NULL DEFAULT 'Pending'
                       CHECK (status IN ('Pending','Validated','Approved','Issued','PartiallyReturned','Returned','Rejected')),
  purpose              TEXT,
  request_date         TEXT NOT NULL,
  decision_date        TEXT,
  issue_date           TEXT,
  decided_by           TEXT REFERENCES users(user_id),
  rejection_reason     TEXT
);

CREATE TABLE IF NOT EXISTS seed_returns (
  return_id         TEXT PRIMARY KEY,
  loan_id           TEXT NOT NULL REFERENCES loan_transactions(loan_id) ON DELETE CASCADE,
  returned_quantity INTEGER NOT NULL CHECK (returned_quantity > 0),
  return_date       TEXT NOT NULL,
  return_type       TEXT NOT NULL CHECK (return_type IN ('Partial','Full')),
  recorded_by       TEXT REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS agricultural_queries (
  query_id      TEXT PRIMARY KEY,
  farmer_id     TEXT NOT NULL REFERENCES users(user_id),
  question      TEXT NOT NULL,
  submitted_date TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','UnderReview','Answered','Closed')),
  response      TEXT,
  response_date TEXT,
  expert_id     TEXT REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS community_events (
  event_id    TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  event_date  TEXT NOT NULL,
  location    TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by  TEXT REFERENCES users(user_id),
  created_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS knowledge_articles (
  article_id    TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  category      TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'Draft'
                CHECK (review_status IN ('Draft','UnderReview','NeedsRevision','Published','Updated')),
  author_id     TEXT REFERENCES users(user_id),
  reviewer_id   TEXT REFERENCES users(user_id),
  review_note   TEXT,
  created_date  TEXT NOT NULL,
  updated_date  TEXT
);

CREATE TABLE IF NOT EXISTS otp_codes (
  otp_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  mobile      TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  consumed    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  type            TEXT NOT NULL,
  related_id      TEXT,
  is_read         INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_ledger (
  ledger_id         TEXT PRIMARY KEY,
  variety_id        TEXT NOT NULL REFERENCES seed_varieties(variety_id),
  delta             INTEGER NOT NULL,
  resulting_balance INTEGER NOT NULL CHECK (resulting_balance >= 0),
  reason            TEXT NOT NULL,
  actor_id          TEXT REFERENCES users(user_id),
  created_at        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_participants (
  event_id      TEXT NOT NULL REFERENCES community_events(event_id) ON DELETE CASCADE,
  farmer_id     TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  registered_at TEXT NOT NULL,
  PRIMARY KEY (event_id, farmer_id)
);

CREATE TABLE IF NOT EXISTS article_views (
  article_id TEXT NOT NULL REFERENCES knowledge_articles(article_id) ON DELETE CASCADE,
  farmer_id  TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  viewed_at  TEXT NOT NULL,
  PRIMARY KEY (article_id, farmer_id)
);

CREATE TABLE IF NOT EXISTS processed_requests (
  idempotency_key TEXT PRIMARY KEY,
  endpoint        TEXT NOT NULL,
  result          TEXT NOT NULL DEFAULT 'OK',
  processed_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_loans_farmer   ON loan_transactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_loans_status   ON loan_transactions(status);
CREATE INDEX IF NOT EXISTS idx_ledger_variety ON stock_ledger(variety_id);
CREATE INDEX IF NOT EXISTS idx_notif_user     ON notifications(user_id, is_read);
```

### 8.2 Table Notes

- `processed_requests` is the twentieth table and exists only for idempotent offline replay. It was added after the original nineteen-table plan.
- Role tables share the `users` primary key, so a role detail row cannot exist without its account.
- `seed_returns` cascades from loans because a return cannot exist without its loan.
- `event_participants` and `article_views` are the join tables for the two many-to-many relationships in the class diagram.
- `stock_ledger` is append-only and is the audit trail for every quantity change.

---

## 9. API Specification

Base path `/api`. Every response uses this envelope:

```json
{ "success": true, "data": {}, "error": null, "message": "" }
{ "success": false, "data": null, "error": "VALIDATION_FAILED", "message": "Mobile number must be 10 digits" }
```

### 9.1 Error Codes

`VALIDATION_FAILED`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `DUPLICATE`, `INSUFFICIENT_STOCK`, `ILLEGAL_TRANSITION`, `INVALID_CREDENTIALS`, `OTP_INVALID`, `OTP_EXPIRED`, `ACCOUNT_INACTIVE`, `ALREADY_PROCESSED`, `INTERNAL_ERROR`.

### 9.2 Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | /auth/register | Public | Create account (status Registered) |
| POST | /auth/login | Public | Password check, then OTP if enabled |
| POST | /auth/otp/request | Public | Send OTP (console in local mode) |
| POST | /auth/otp/verify | Public | Verify OTP, issue JWT |
| POST | /auth/logout | Auth | Client-side token clear |
| GET | /auth/me | Auth | Current user and role |
| GET, PUT | /users/me | Auth | Read and update own profile |
| PUT | /users/me/password | Auth | Change password |
| GET | /users | Admin | List users with filters |
| GET | /users/:id | Admin | User details |
| PATCH | /users/:id/status | Admin | Activate, deactivate, reactivate |
| GET, POST | /seeds | Auth (POST Coordinator) | List and create varieties |
| GET, PUT, DELETE | /seeds/:id | Auth (write Coordinator) | Variety detail, update, delete |
| GET | /inventory | Farmer, Coordinator | All inventory with status |
| GET | /inventory/low-stock | Coordinator | Below threshold |
| GET | /inventory/ledger | Coordinator | Stock movement history |
| GET | /inventory/:varietyId | Farmer, Coordinator | One inventory record |
| POST | /inventory/:varietyId/stock | Coordinator | Add or reduce stock |
| POST | /inventory/:varietyId/check | Farmer, Coordinator | Availability check |
| GET, POST | /quality-tests | Coordinator (GET also Farmer, Expert) | List and record tests |
| GET | /quality-tests/:id | Farmer, Coordinator, Expert | Test detail |
| POST | /quality-tests/:id/request-review | Coordinator | Flag for expert review |
| POST | /quality-tests/:id/review | Expert | Mark reviewed and attach recommendation |
| GET | /quality-tests/variety/:varietyId | Auth | Quality history |
| GET, POST | /recommendations | Expert (GET all) | Recommendations and guidance |
| GET, POST | /loans | Farmer (POST), Auth (GET own) | My loans, create request |
| GET | /loans/:id | Farmer own, Coordinator | Loan detail with timeline |
| PATCH | /loans/:id/validate | Coordinator | Pending → Validated |
| PATCH | /loans/:id/approve | Coordinator | Validated → Approved |
| PATCH | /loans/:id/reject | Coordinator | Reject with reason |
| PATCH | /loans/:id/issue | Coordinator | Approve → Issued, reduce stock |
| GET | /loans/pending | Coordinator | Coordinator queue |
| GET, POST | /returns | Coordinator | List and record returns |
| GET | /returns/:id | Coordinator | Return detail |
| GET, POST | /queries | Farmer | Own queries, submit |
| GET | /queries/open | Expert | Open query queue |
| GET | /queries/:id | Farmer own, Expert | Query detail |
| POST | /queries/:id/response | Expert | Answer |
| PATCH | /queries/:id/close | Farmer owner | Close |
| GET, POST | /events | Auth (POST Admin) | List and create |
| GET, PUT, DELETE | /events/:id | Admin (GET Auth) | Detail, update, delete |
| POST | /events/:id/participate | Farmer | Register participation |
| GET, POST | /articles | Auth (POST Admin or Expert) | List and create |
| GET, PUT | /articles/:id | Auth (PUT author) | Detail, update |
| POST | /articles/:id/submit | Admin or Expert | Draft → UnderReview |
| POST | /articles/:id/review | Expert | Approve or request revision |
| GET | /notifications | Auth | Own notifications |
| PATCH | /notifications/:id/read | Auth | Mark read |
| GET | /reports/:type | Coordinator, Admin | inventory, low-stock, loans, loan-return-summary, events |
| GET | /reports/:type/export | Coordinator, Admin | CSV download |
| POST | /sync/replay | Auth | Replay queued writes |
| GET | /dev/otp/:mobile | Dev flag only | Read latest OTP |
| POST | /dev/reseed | Dev flag only | Reset demo data |
| GET | /health | Public | Liveness check |

### 9.3 Key Payloads

```jsonc
// POST /api/loans
{ "varietyId": "VAR-0001", "quantity": 10, "purpose": "Monsoon sowing" }

// PATCH /api/loans/LN-0001/issue
{ "issuedQuantity": 10 }

// POST /api/returns
{ "loanId": "LN-0001", "quantity": 4 }

// POST /api/inventory/VAR-0001/stock
{ "operation": "add", "quantity": 20, "reason": "New harvest" }

// POST /api/sync/replay
{ "writes": [ { "idempotencyKey": "q-8f2a...", "method": "POST",
                "path": "/api/loans",
                "body": { "varietyId": "VAR-0001", "quantity": 10 } } ] }
```

---

## 10. Folder Structure

```
Project_SE/
├─ PROJECT.md
├─ README.md
├─ .gitignore
├─ scripts/
│  └─ dev.ps1
├─ docs/
│  ├─ PRD.md
│  ├─ architecture.md
│  ├─ Rules.md
│  ├─ Phases.md
│  ├─ Design.md
│  ├─ local-setup.md
│  ├─ api-endpoints.md
│  ├─ data-model.md
│  ├─ user-stories-traceability.md
│  ├─ test-plan.md
│  └─ diagrams/
│     ├─ use-case.mmd
│     ├─ class.mmd
│     ├─ activity/   (activity-01 … activity-07)
│     ├─ sequence/   (sequence-01 … sequence-14)
│     └─ state/      (state-01 … state-06)
├─ backend/
│  ├─ server.js
│  ├─ app.js
│  ├─ package.json
│  ├─ .env.example
│  ├─ config/
│  │  ├─ db.js
│  │  ├─ auth.js
│  │  └─ otp.js
│  ├─ models/
│  │  ├─ User.js
│  │  ├─ Farmer.js
│  │  ├─ Coordinator.js
│  │  ├─ AgriculturalExpert.js
│  │  ├─ Administrator.js
│  │  ├─ SeedVariety.js
│  │  ├─ SeedInventory.js
│  │  ├─ QualityTest.js
│  │  ├─ ExpertRecommendation.js
│  │  ├─ LoanTransaction.js
│  │  ├─ SeedReturn.js
│  │  ├─ AgriculturalQuery.js
│  │  ├─ CommunityEvent.js
│  │  └─ KnowledgeArticle.js
│  ├─ controllers/
│  │  ├─ userController.js
│  │  ├─ authController.js
│  │  ├─ seedController.js
│  │  ├─ inventoryController.js
│  │  ├─ qualityController.js
│  │  ├─ loanController.js
│  │  ├─ returnController.js
│  │  ├─ expertController.js
│  │  ├─ queryController.js
│  │  ├─ eventController.js
│  │  ├─ knowledgeController.js
│  │  ├─ reportController.js
│  │  ├─ notificationController.js
│  │  ├─ syncController.js
│  │  └─ devController.js
│  ├─ routes/            (one file per controller, same names)
│  ├─ middleware/
│  │  ├─ authMiddleware.js
│  │  ├─ roleMiddleware.js
│  │  ├─ otpMiddleware.js
│  │  ├─ validateMiddleware.js
│  │  └─ errorMiddleware.js
│  ├─ services/
│  │  ├─ otpService.js
│  │  ├─ notificationService.js
│  │  └─ reportService.js
│  ├─ utils/
│  │  ├─ constants.js
│  │  ├─ logger.js
│  │  ├─ idGenerator.js
│  │  ├─ validators.js
│  │  ├─ dateUtils.js
│  │  └─ csvExport.js
│  ├─ database/
│  │  ├─ schema.sql
│  │  ├─ seed_data.sql
│  │  ├─ migrate.js
│  │  └─ seed.js
│  ├─ data/              (generated csbams.dev.sqlite, gitignored)
│  └─ tests/
│     ├─ setup.js
│     ├─ unit/
│     └─ integration/
└─ frontend/
   ├─ package.json
   ├─ vite.config.js
   ├─ index.html
   ├─ .env.example
   ├─ public/
   │  ├─ favicon.svg
   │  ├─ manifest.webmanifest
   │  ├─ sw.js
   │  └─ offline.html
   └─ src/
      ├─ main.jsx
      ├─ App.jsx
      ├─ routes.jsx
      ├─ styles/
      │  ├─ index.css
      │  └─ variables.css
      ├─ api/            (client + one module per resource)
      ├─ context/
      │  ├─ AuthContext.jsx
      │  ├─ OfflineContext.jsx
      │  └─ NotificationContext.jsx
      ├─ hooks/
      │  ├─ useAuth.js
      │  ├─ useApi.js
      │  └─ useOffline.js
      ├─ offline/
      │  ├─ localDb.js
      │  ├─ queue.js
      │  └─ syncEngine.js
      ├─ utils/
      │  ├─ formatters.js
      │  ├─ validators.js
      │  └─ constants.js
      ├─ pages/
      │  ├─ Login.jsx
      │  ├─ Register.jsx
      │  ├─ FarmerDashboard.jsx
      │  ├─ CoordinatorDashboard.jsx
      │  ├─ ExpertDashboard.jsx
      │  ├─ AdminDashboard.jsx
      │  └─ NotFound.jsx
      └─ components/
         ├─ common/    Button, Card, Table, Modal, Loader, EmptyState
         ├─ layout/    Navbar, Sidebar, Footer, OfflineBanner
         ├─ auth/      LoginForm, RegisterForm, OTPForm, ProtectedRoute
         ├─ user/      UserProfile, ChangePassword, ManageUserAccounts, UserDetails
         ├─ seed/      SeedRegistrationForm, SeedList, SeedStockManager,
         │             SeedAvailabilityCheck, SeedSearchFilter, LowStockAlert
         ├─ quality/   QualityTestForm, QualityTestList, QualityStatusView,
         │             QualityRecommendationForm, QualityHistoryView
         ├─ loan/      LoanRequestForm, LoanValidationPanel, LoanApproval,
         │             LoanManagement, LoanStatusView, LoanTransactionView
         ├─ return/    ReturnForm, PartialReturnForm, ReturnList, ReturnConfirmation
         ├─ query/     FarmerQueryForm, QueryList, QueryResponseForm, QueryDetail
         ├─ expert/    SeedVarietyRecommendation, TraditionalGuidanceForm,
         │             AgroBiodiversityForm, ExpertReviewList
         ├─ knowledge/ ArticleForm, ArticleList, ArticleView, ArticleReviewForm, FilterArticles
         ├─ events/    EventForm, EventList, FilterEvents
         ├─ reports/   InventoryReport, LowStockReport, LoanReport,
         │             LoanReturnSummary, EventReport, ReportFilter, ExportButton
         └─ notifications/ NotificationBell, NotificationList
```

---

## 11. Backend Implementation Guide

### 11.1 Dependencies

```bash
npm init -y
npm i express better-sqlite3 bcrypt jsonwebtoken dotenv cors
npm i -D jest supertest nodemon
```

### 11.2 config/db.js

```js
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const file = process.env.DB_FILE || path.join(process.cwd(), 'data', 'csbams.dev.sqlite');
fs.mkdirSync(path.dirname(file), { recursive: true });

export const db = new Database(file);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function transaction(fn) {
  return db.transaction(fn);
}
```

### 11.3 Layer Rules

| Layer | May do | May not do |
|---|---|---|
| routes | Declare paths, attach middleware | Contain logic or SQL |
| middleware | Authenticate, authorize, validate, catch errors | Decide domain outcomes |
| controllers | Orchestrate, call models and services, shape the envelope | Hold raw SQL |
| services | OTP, notifications, report assembly | Know about `req` and `res` |
| models | Persist one entity, expose entity shape | Send responses |

### 11.4 Controller Pattern

```js
import { db, transaction } from '../config/db.js';

export async function createLoan(req, res, next) {
  try {
    const { varietyId, quantity } = req.body;
    const farmerId = req.user.userId;

    const result = transaction(() => {
      const inv = db.prepare('SELECT * FROM seed_inventories WHERE variety_id = ?').get(varietyId);
      if (!inv) throw Object.assign(new Error('Variety not stocked'), { code: 'NOT_FOUND' });
      if (quantity <= 0) throw Object.assign(new Error('Quantity must be positive'), { code: 'VALIDATION_FAILED', status: 400 });
      if (quantity > inv.available_quantity)
        throw Object.assign(new Error('Insufficient stock'), { code: 'INSUFFICIENT_STOCK', status: 409 });

      const loanId = nextId('LN');                     // utils/idGenerator.js
      db.prepare(`INSERT INTO loan_transactions
        (loan_id, farmer_id, variety_id, requested_quantity, status, request_date)
        VALUES (?, ?, ?, ?, 'Pending', ?)`)
        .run(loanId, farmerId, varietyId, quantity, nowIso());

      // BR-L-13
      notify(farmerId, 'Loan request received', `Request ${loanId} is pending review`, 'loan', loanId);
      return { loanId, status: 'Pending' };
    });

    res.json({ success: true, data: result, error: null, message: '' });
  } catch (err) { next(err); }
}
```

### 11.5 Stock Change Helper (the only way quantity may change)

```js
export function applyStockChange(varietyId, delta, reason, actorId) {
  const inv = db.prepare('SELECT * FROM seed_inventories WHERE variety_id = ?').get(varietyId);
  const next = inv.available_quantity + delta;
  if (next < 0) throw Object.assign(new Error('Cannot go below zero'), { code: 'INSUFFICIENT_STOCK', status: 409 });

  db.prepare('UPDATE seed_inventories SET available_quantity = ?, updated_date = ? WHERE variety_id = ?')
    .run(next, nowIso(), varietyId);
  db.prepare(`INSERT INTO stock_ledger
      (ledger_id, variety_id, delta, resulting_balance, reason, actor_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(nextId('LDG'), varietyId, delta, next, reason, actorId, nowIso());
  return next;
}
```

`applyStockChange` must be called inside a transaction, and nothing else may write `available_quantity` directly.

### 11.6 Middleware

```js
// authMiddleware.js
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next({ code: 'UNAUTHORIZED', status: 401, message: 'Missing token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT status FROM users WHERE user_id = ?').get(req.user.userId);
    if (!user || user.status !== 'Active')
      return next({ code: 'ACCOUNT_INACTIVE', status: 403, message: 'Account is not active' });
    next();
  } catch { next({ code: 'UNAUTHORIZED', status: 401, message: 'Invalid token' }); }
}

// roleMiddleware.js
export const allow = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next({ code: 'FORBIDDEN', status: 403, message: 'Not permitted' });
```

### 11.7 Route Pattern

```js
// routes/loanRoutes.js
router.post('/',  requireAuth, allow('Farmer'), loanController.createLoan);
router.get('/pending', requireAuth, allow('Coordinator'), loanController.listPending);
router.patch('/:id/validate', requireAuth, allow('Coordinator'), loanController.validate);
router.patch('/:id/approve',  requireAuth, allow('Coordinator'), loanController.approve);
router.patch('/:id/reject',   requireAuth, allow('Coordinator'), loanController.reject);
router.patch('/:id/issue',    requireAuth, allow('Coordinator'), loanController.issue);
```

### 11.8 Error Middleware

```js
export function errorMiddleware(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  if (process.env.NODE_ENV === 'development') logger.error(err);
  res.status(status).json({
    success: false, data: null, error: code,
    message: err.message || 'Something went wrong'
  });
}
```

### 11.9 Local OTP Service

```js
// services/otpService.js
export function requestCode(mobile) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60000).toISOString();
  db.prepare(`INSERT INTO otp_codes (mobile, code_hash, expires_at, created_at) VALUES (?, ?, ?, ?)`)
    .run(mobile, bcrypt.hashSync(code, 8), expiresAt, nowIso());
  console.log(`\n[DEV OTP] ${mobile} -> ${code}\n`);   // local mode only
  return { sent: true, expiresAt };
}
```

### 11.10 JWT and Password Rules

- `bcrypt.hashSync(password, 10)`, never reversible.
- JWT payload: `{ userId, role, name }`, expiry from `config/auth.js` (default 12 hours for local use).
- Never return `password_hash` in any response. Select explicit columns.

---

## 12. Frontend Implementation Guide

### 12.1 Dependencies

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm i react-router-dom axios
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### 12.2 API Client with Offline Interception

```js
// src/api/client.js
const QUEUEABLE_WRITES = ['/api/loans'];

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('csbams.token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const isWrite = ['post', 'patch', 'put', 'delete'].includes(config.method);
  if (!navigator.onLine && isWrite) {
    if (QUEUEABLE_WRITES.some((p) => config.url.startsWith(p))) {
      return enqueue(config);            // returns a synthetic queued response
    }
    return Promise.reject({
      code: 'OFFLINE_ACTION_BLOCKED',
      message: 'This action needs a connection'
    });
  }
  return config;
});
```

### 12.3 Protected Routing

```jsx
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
```

### 12.4 Form Pattern

Every form follows this shape: controlled inputs, validate on blur, show inline errors linked with `aria-describedby`, disable submit while in flight, show a toast on success, and surface server errors in a banner above the form.

```jsx
const errors = validateLoan(form);           // shared validator, no duplication
const canSubmit = Object.keys(errors).length === 0 && !submitting && withinAvailability;
```

### 12.5 Component Rules

- One component per file, PascalCase filename.
- No data fetching inside presentational components; pages fetch and pass props.
- All API calls go through `src/api/*`, never `axios` directly from a component.
- Status is always rendered with the shared `<Badge status="LowStock" />` so colours stay consistent.
- Every list has a loading skeleton, an empty state, and an error state.

---

## 13. Offline Design

| Piece | Behaviour |
|---|---|
| public/sw.js | Cache-first for the app shell; network-first for API GETs with a cache fallback |
| offline/localDb.js | IndexedDB stores: `cache` (read snapshots) and `queue` (pending writes) |
| offline/queue.js | Append with `{ idempotencyKey, method, path, body, createdAt }`; list, remove, count |
| offline/syncEngine.js | On `online`, POST the queue to `/api/sync/replay`, remove accepted entries, mark failures |
| api/client.js | Routes queueable writes to the queue when offline |
| OfflineContext | Exposes `online`, `pendingCount`, `lastSyncedAt` |
| OfflineBanner | Amber bar when offline, count badge when writes are pending |

Queueable offline write: loan requests only. Everything else that changes stock, loan state, or quality is disabled while offline with an explanatory tooltip, because it depends on live data.

Server replay rules: check `processed_requests` first; if seen, return `ALREADY_PROCESSED`; otherwise validate, re-check availability, apply, and record the key in the same transaction.

---

## 14. Design System

### 14.1 Tokens

| Token | Value |
|---|---|
| --color-primary | #1F6B3B |
| --color-primary-dark | #14472A |
| --color-primary-soft | #E6F2EA |
| --color-accent | #B4690E |
| --color-danger | #B3261E |
| --color-warning | #8A6100 |
| --color-success | #1E7A46 |
| --color-info | #1B5E8A |
| --color-surface | #FFFFFF |
| --color-background | #F6F7F5 |
| --color-border | #D9DED7 |
| --color-text | #1B1F1C |
| --color-text-muted | #5A635B |

Spacing 4/8/12/16/24/32/48. Radius 6 inputs, 10 cards, 999 pills. Breakpoints 480/768/1024. Minimum touch target 44 px. Base font 16 px, system stack.

### 14.2 Status Colours

Available and Returned green. LowStock, Pending, PartiallyReturned amber. OutOfStock and Rejected red. Approved, Validated, Issued blue and green. Always pair colour with the status word.

### 14.3 Screens

Farmer: Dashboard, Seed Catalog, Availability Check, My Loans, Loan Detail, Knowledge list and view, Events list and register, Ask a Question, My Queries, Notifications, Profile.

Coordinator: Dashboard, Varieties, Stock Manager with ledger, Low Stock, Quality Tests, Record Test, Loans Queue, Loan Decision, Returns, Reports, Notifications, Profile.

Expert: Dashboard, Quality Review Queue, Test Detail and Recommendation, Recommendations, Queries, Article Review, Notifications, Profile.

Administrator: Dashboard, Users, User Detail, Events, Articles, Reports, Notifications, Profile.

### 14.4 Feedback Rules

Success → toast. Validation failure → inline field errors plus a summary. Server failure → banner with a retry when safe. Empty → EmptyState with one action. Loading → skeletons. Destructive → ConfirmDialog that states the effect, for example "Issue 10 units of Rajma Local to Suresh? Inventory will drop from 45 to 35."

---

## 15. Build Order

Complete each phase before starting the next. Exit criteria are gates.

**Phase 0 — Setup (1 day).** Create the folder tree from section 10, install dependencies, add `.gitignore` and `.env.example` on both sides, add `scripts/dev.ps1`, confirm the decisions in section 5 are recorded. Exit: `GET /api/health` returns 200 and the frontend placeholder renders.

**Phase 1 — Foundation (4 days).** Schema, seed data, migrate and seed scripts, User and four role models, auth and user controllers, all middleware, OTP service, Login and Register pages, four dashboards, AuthContext, api client. Exit: register → admin activates → login with console OTP → correct dashboard; deactivated account refused; role checks enforced by the server.

**Phase 2 — Varieties and Inventory (3 days).** SeedVariety and SeedInventory models, seed and inventory controllers, stock ledger, availability check, all seed and inventory components. Exit: over-reduction refused with no state change; ledger matches every movement; low stock and out of stock derive correctly.

**Phase 3 — Quality (2 days).** QualityTest model, thresholds, quality controller, minimal expert review, quality components. Exit: status derives correctly at boundaries; expert recommendation visible to farmers.

**Phase 4 — Loans (3 days).** LoanTransaction with the full transition guard, loan controller, notification service, loan components. Exit: insufficient request creates no row; validation, approval, and issue follow the state machine; issue reduces stock and writes the ledger in one transaction; illegal transitions rejected.

**Phase 5 — Returns (2 days).** SeedReturn model, return controller, return components. Exit: three partial returns then a final one close the loan; a return above outstanding is refused.

**Phase 6 — Expert and Queries (3 days).** AgriculturalQuery model with state guard, query controller, expert controller completed, query and expert components. Exit: farmer asks, expert answers, farmer is notified and closes.

**Phase 7 — Knowledge and Events (3 days).** KnowledgeArticle and CommunityEvent models, join tables, controllers, components. Exit: full article lifecycle including revision; only Published visible to farmers; event creation validates dates; duplicate participation blocked.

**Phase 8 — Reporting and Notifications (3 days).** reportService, csvExport, report controller, notifications controller and UI. Exit: five report types, filtered CSV export matching the screen, notification centre with read state.

**Phase 9 — Offline and Polish (3 days).** Service worker, manifest, localDb, queue, syncEngine, sync controller, OfflineContext, OfflineBanner, responsive pass. Exit: cached inventory readable offline; a loan request queues and replays exactly once; non-queueable actions disabled offline with an explanation.

**Phase 10 — Verification (2 days).** Tests, docs, final seed data, demo script. Exit: every acceptance criterion in section 18 passes; the suite runs green from a clean checkout after migrate and seed.

---

## 16. Seed Data

Load with `npm run seed`. Accounts use password `@123` suffix pattern shown, all with status `Active`.

| Name | Mobile | Password | Role |
|---|---|---|---|
| System Administrator | 9000000001 | Admin@123 | Administrator |
| Lakshmi Devi | 9000000002 | Coord@123 | Coordinator |
| Dr. Ravi Kumar | 9000000003 | Expert@123 | Agricultural Expert |
| Suresh Patil | 9000000004 | Farmer@123 | Farmer |
| Anita Kumari | 9000000005 | Farmer@123 | Farmer |

| Variety | Source | Location | Initial qty | Threshold |
|---|---|---|---|---|
| Rajma Local | Village A | Rack 2 | 45 | 5 |
| Maize Yellow | Village B | Rack 1 | 3 | 5 |
| Finger Millet | Village C | Rack 3 | 0 | 5 |

Additional seeded data: two quality tests on Rajma Local (one Good, one Average), one expert recommendation, one issued loan by Suresh Patil for 10 Rajma Local with one partial return of 4, one open query, two upcoming events, one published article and one draft article, and a matching set of stock ledger rows.

This dataset must produce a working demo immediately: the coordinator dashboard shows a pending queue, the farmer dashboard shows an outstanding loan, the expert dashboard shows a query awaiting response, and the admin dashboard shows five accounts.

---

## 17. Testing Requirements

| Level | Coverage |
|---|---|
| Unit — models | Quality status derivation at boundaries; inventory status derivation; ID generation |
| Unit — services | OTP generation, expiry, attempt limit; notification creation; CSV rendering |
| Unit — state guards | Every legal transition accepted and every illegal transition rejected, iterated from the tables in section 7 |
| Integration — auth | Register, duplicate mobile, wrong password, OTP valid, OTP expired, OTP attempts exceeded, inactive account refused, forbidden role |
| Integration — inventory | Add, reduce, over-reduce refused, ledger correctness after a movement sequence |
| Integration — loans | Insufficient stock, full happy path, illegal transitions, issue with stock dropped since request |
| Integration — returns | Partial returns until closure, over-outstanding refusal, return on an unissued loan refused |
| Integration — offline | Replay idempotency, replayed request failing availability, queue surviving a reload |
| Frontend | Validation messages, protected routing per role, offline banner and disabled non-queueable actions |

---

## 18. Acceptance Criteria

1. A user can register; an administrator activates them; they can log in with password and the local OTP and reach their role dashboard.
2. A deactivated user cannot log in and cannot use an existing token.
3. A coordinator can create a variety, add stock, reduce stock, and see ledger entries matching every change.
4. Reducing more than available is refused and leaves the recorded quantity unchanged.
5. Recording a quality test derives a status; an expert can attach a recommendation that the farmer can then see.
6. A loan request above availability is refused and creates no loan row.
7. A valid request moves Pending → Validated → Approved → Issued, reduces inventory, writes the ledger, and notifies the farmer.
8. A partial return reduces outstanding and restores stock; the return that clears outstanding sets the loan to Returned.
9. A query submitted by a farmer appears in the expert queue, and the response notifies the farmer, who can then close it.
10. An article is invisible to farmers until published; a revision request returns it to Draft and it can be resubmitted.
11. An administrator creates an event, a farmer registers participation, and the event appears in the farmer's list.
12. Each of the five report types generates with filters applied and exports to CSV matching the screen.
13. Offline, cached inventory is readable and a loan request queues and replays exactly once when connectivity returns.
14. Seed data produces a working demo immediately after `npm run migrate && npm run seed`.

---

## 19. Coding Conventions

- ES modules on the backend (`"type": "module"` in package.json).
- One model per table; models contain persistence only.
- Controllers always return the standard envelope and always use `try/catch` with `next(err)`.
- Controllers never contain raw SQL; models and helper functions do.
- Never write `available_quantity` outside `applyStockChange`.
- Every multi-table write is wrapped in a transaction.
- Component files are PascalCase; all other files are camelCase.
- IDs come from `nextId(prefix)`; never use raw auto-increment values in URLs.
- Dates are ISO 8601 UTC via `nowIso()`; never store local-time strings.
- Comments reference rule identifiers where they enforce a rule, for example `// BR-I-01`.
- New endpoints are added to `docs/api-endpoints.md` in the same change.

---

## 20. Local Configuration

| Item | Value |
|---|---|
| Backend port | 5000 |
| Frontend dev port | 5173 |
| Database file | backend/data/csbams.dev.sqlite |
| Node version | 18 or later |
| Backend scripts | `dev`, `start`, `migrate`, `seed`, `test` |
| Frontend scripts | `dev`, `build`, `preview`, `test` |
| Combined start | `scripts/dev.ps1` |

```env
# backend/.env.example
NODE_ENV=development
PORT=5000
DB_FILE=./data/csbams.dev.sqlite
JWT_SECRET=local-dev-secret-change-me
JWT_EXPIRES_IN=12h
OTP_LENGTH=6
OTP_TTL_MINUTES=5
OTP_MAX_ATTEMPTS=3
OTP_REQUIRE_AFTER_PASSWORD=true
OTP_DEV_MODE=true
```

```env
# frontend/.env.example
VITE_API_BASE_URL=http://localhost:5000/api
```

Security posture for this stage: passwords hashed, `.env` never committed, dev routes disabled unless `OTP_DEV_MODE=true`, no third-party scripts. Everything else — plain HTTP, console OTP, long-lived JWT — is acceptable because this runs locally.

---

## 21. Do Not Build

Commercial sales, payment gateways, AI image recognition, blockchain traceability, government portal integration, machine-learning recommendations, batch or lot tracking, multi-warehouse transfers, conflict-aware sync beyond last-write-wins, image upload, multilingual content, SMS or email delivery, Docker, CI pipelines, and any cloud service.

---

## 22. Glossary and Identifier Prefixes

| Prefix | Entity |
|---|---|
| USR | User |
| VAR | Seed variety |
| INV | Inventory record |
| TST | Quality test |
| REC | Expert recommendation |
| LN | Loan transaction |
| RET | Seed return |
| QRY | Agricultural query |
| EVT | Community event |
| ART | Knowledge article |
| NTF | Notification |
| LDG | Stock ledger entry |

Terms: **Available**, **LowStock**, **OutOfStock** are inventory statuses. **Outstanding quantity** is issued seed not yet returned. **Idempotency key** is the client-generated string that makes a replayed offline write safe. **Ledger** is the append-only record of stock movements. **Local mode** is the development configuration with SQLite, console OTP, and CSV export.

---

## 23. Final Checklist

Before declaring the project complete:

- [ ] All 14 acceptance criteria in section 18 pass with evidence.
- [ ] The test suite passes from a clean checkout after `npm run migrate && npm run seed`.
- [ ] No endpoint bypasses the role checks in section 3.1.
- [ ] Every legal and illegal state transition in section 7 is tested.
- [ ] No quantity is written outside `applyStockChange`.
- [ ] Nothing from section 21 was built.
- [ ] `README.md` explains setup in under ten commands.
- [ ] Seed data produces the demo described in section 16 without manual edits.