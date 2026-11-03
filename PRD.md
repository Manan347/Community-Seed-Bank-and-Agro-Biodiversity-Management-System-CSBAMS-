# CSBAMS — Product Requirements Document

| Field | Value |
|---|---|
| Product | Community Seed Bank and Agro-Biodiversity Management System (CSBAMS) |
| Version | 1.0 (Draft) |
| Date | 10 October 2026 |
| Status | Draft for review |
| Deployment target | Local development on a single machine |
| Source artifacts | Use case, activity, sequence, class, and state diagrams; project structure |

---

## 1. Introduction

### 1.1 Purpose

This document defines what CSBAMS must do, who it serves, and how success is judged. It is the reference for design, implementation, and testing, and it replaces the scattered notes, diagrams, and folder lists that currently describe the system.

### 1.2 Problem Statement

In rural and semi-urban communities, seed banks are managed with paper registers, handwritten notes, and verbal agreements. Records are lost or become unreadable, seed loans and returns are hard to track and disputes are common, there is no reliable way to match demand with available supply, quality test results are poorly documented, women farmers and youth participate less than they could, traditional knowledge about local varieties is disappearing, and preparing reports for schemes or NGOs is slow and error-prone.

The result is declining agro-biodiversity, reduced crop resilience against climate variability, and permanent loss of indigenous genetic resources.

### 1.3 Intended Audience

Project team, academic supervisor or evaluator, and any future maintainer. The document assumes the diagrams are already understood; it explains intent and requirements rather than redrawing them.

### 1.4 Definitions

| Term | Meaning |
|---|---|
| CSBAMS | Community Seed Bank and Agro-Biodiversity Management System |
| Seed variety | A named local crop variety with a source and storage location |
| Inventory | The recorded available quantity of a variety, with a low-stock threshold |
| Quality test | A germination, purity, and moisture measurement with a derived quality status |
| Loan | A request, approval, and issuance of seed to a farmer, tracked to full return |
| Outstanding quantity | Seed issued to a farmer that has not yet been returned |
| Stakeholder roles | Farmer, Coordinator, Agricultural Expert, Administrator |
| Local mode | Development configuration with no external services or paid infrastructure |

---

## 2. Product Overview

### 2.1 Vision

A seed bank that a first-time smartphone user can operate. Any transaction that today lives in a notebook should be recordable, findable, and reportable from a phone, with the record surviving loss of connectivity and loss of paper.

### 2.2 Goals

- G1 — Replace paper registers with a durable record of varieties, stock, quality, loans, returns, events, and knowledge.
- G2 — Make seed loan and return tracking unambiguous, so outstanding quantities and disputes can be resolved from the record.
- G3 — Match demand with supply by making availability visible before a loan is requested or approved.
- G4 — Capture germination, purity, and moisture consistently and make results shareable with the community and with experts.
- G5 — Preserve traditional knowledge as articles that experts can review.
- G6 — Produce scheme and NGO reports without manual compilation.
- G7 — Work on a basic smartphone with intermittent connectivity.

### 2.3 Non-Goals

- Selling seeds or taking online payments.
- AI-based seed or pest image recognition.
- Blockchain-based traceability.
- Full integration with government agriculture portals.
- Advanced analytics or machine-learning recommendations.
- Production-grade hosting, SMS delivery, or security hardening.

### 2.4 Target Users

| User | Description | Primary needs |
|---|---|---|
| Farmer / community member | Borrows seed, returns it, reads quality information and articles | Check availability, request loans, track status, learn |
| Community seed bank coordinator | Runs day-to-day operations | Register varieties, manage stock, record tests, validate and issue loans, record returns, generate reports |
| Agricultural expert | Provides technical judgement | Review quality results, recommend varieties and practices, answer queries, review articles |
| System administrator | Keeps accounts and community content in order | Manage user accounts, run events, manage articles, generate reports |

### 2.5 Operating Environment

Web application, mobile-responsive, usable on a basic Android smartphone browser. Development and demonstration run entirely on one machine with no external dependencies.

---

## 3. Scope

### 3.1 In Scope

- User management: registration, authentication, OTP login, profile management, role-based dashboards, account administration.
- Seed variety management: register and maintain varieties with source and storage location.
- Inventory management: add and reduce stock, view inventory, check availability, flag low stock, keep a stock movement ledger.
- Seed quality management: record germination, purity, and moisture; derive quality status; support expert review and recommendations.
- Seed loan management: request, validate, approve, reject, issue, and track loans.
- Seed return management: record full and partial returns, update inventory, update loan status.
- Agricultural knowledge management: add, update, review, view, and filter articles.
- Agricultural expert support: seed variety recommendations, quality recommendations, traditional farming guidance, biodiversity recommendations, query responses.
- Community event management: create, update, display, and filter events.
- Information tracking: inventory ledger, loan history, return history, notifications.
- Reporting: inventory, low stock, loan, loan-and-return summary, event reports with filtering and CSV export.
- Offline capability: cached reads and queued writes that replay when connectivity returns.

### 3.2 Out of Scope

As listed in section 2.3. Also out of scope for this release: seed batch or lot-level tracking, multi-warehouse storage, multilingual content, and public sign-up without coordinator or administrator involvement.

---

## 4. Functional Requirements

Priority uses MoSCoW: M = must, S = should, C = could.

### 4.1 User Management

| ID | Requirement | Priority |
|---|---|---|
| FR-UM-01 | A user can register with name, mobile number, password, and role. | M |
| FR-UM-02 | Registration validates required fields, mobile format, and password rules, and returns field-level errors. | M |
| FR-UM-03 | The system generates a unique UserID on successful registration. | M |
| FR-UM-04 | A user can authenticate with mobile number and password. | M |
| FR-UM-05 | A user can authenticate with an OTP sent to their mobile number. | M |
| FR-UM-06 | A user can view and update their profile. | M |
| FR-UM-07 | A user can change their password. | M |
| FR-UM-08 | A user can log out, which clears the local session. | M |
| FR-UM-09 | After login the user lands on the dashboard for their role. | M |
| FR-UM-10 | An administrator can list users, view user details, and activate, deactivate, or reactivate accounts. | M |
| FR-UM-11 | Coordinators and administrators can register users on behalf of others. | S |

### 4.2 Seed Variety Management

| ID | Requirement | Priority |
|---|---|---|
| FR-SV-01 | A coordinator can register a variety with name, source, and storage location. | M |
| FR-SV-02 | A variation of the same name from a different source or location is stored as a distinct entry. | S |
| FR-SV-03 | A coordinator can update variety details. | M |
| FR-SV-04 | A coordinator can delete a variety only when it has no loan or return history. | S |
| FR-SV-05 | Users with visibility can search varieties by name, source, or location. | S |

### 4.3 Inventory Management

| ID | Requirement | Priority |
|---|---|---|
| FR-INV-01 | Registering a variety creates its inventory record with an initial quantity. | M |
| FR-INV-02 | A coordinator can add stock to a variety. | M |
| FR-INV-03 | A coordinator can reduce stock, and the reduction can never exceed available quantity. | M |
| FR-INV-04 | Available quantity is never negative under any operation. | M |
| FR-INV-05 | A coordinator can view current inventory for all varieties. | M |
| FR-INV-06 | Any permitted user can check availability for a variety and quantity. | M |
| FR-INV-07 | The system flags varieties at or below the low-stock threshold. | M |
| FR-INV-08 | Every stock movement is written to a ledger with timestamp, actor, quantity, reason, and resulting balance. | M |
| FR-INV-09 | Inventory state derives from quantity and threshold: Available, LowStock, or OutOfStock. | M |

### 4.4 Seed Quality Management

| ID | Requirement | Priority |
|---|---|---|
| FR-QL-01 | A coordinator can record a quality test with germination percentage, purity, moisture, and test date. | M |
| FR-QL-02 | Test data is validated for plausible ranges before saving. | M |
| FR-QL-03 | Recording a test triggers quality evaluation and sets a status of Good, Average, or Poor. | M |
| FR-QL-04 | Users can view quality information for a variety. | M |
| FR-QL-05 | A test can be flagged for expert review, and the expert can mark it reviewed. | M |
| FR-QL-06 | An expert can attach a recommendation to a test, and it becomes visible to the community. | M |
| FR-QL-07 | Quality history for a variety is retained and viewable. | S |

### 4.5 Seed Loan Management

| ID | Requirement | Priority |
|---|---|---|
| FR-LN-01 | A farmer can request seed by selecting a variety and quantity. | M |
| FR-LN-02 | Every request checks availability before the loan is created. | M |
| FR-LN-03 | A request for more than the available quantity is refused with a clear message. | M |
| FR-LN-04 | A valid request creates a loan with status Pending. | M |
| FR-LN-05 | A farmer can view the status of their own loans. | M |
| FR-LN-06 | A coordinator can validate a pending request, moving it to Validated. | M |
| FR-LN-07 | A coordinator can approve a validated request. | M |
| FR-LN-08 | A coordinator can reject a pending or validated request with a reason. | M |
| FR-LN-09 | Approving a loan issues the seed, reduces inventory, sets the issue date, and sets the outstanding quantity. | M |
| FR-LN-10 | A coordinator can view loan transactions, including decision and issue dates. | M |
| FR-LN-11 | A rejected or returned loan is terminal. | M |

### 4.6 Seed Return Management

| ID | Requirement | Priority |
|---|---|---|
| FR-RT-01 | A coordinator can record a return against a specific issued loan. | M |
| FR-RT-02 | Return quantity must be greater than zero and not exceed the outstanding quantity. | M |
| FR-RT-03 | A partial return creates a return record, increases inventory, and reduces the outstanding quantity. | M |
| FR-RT-04 | A full return creates a return record, increases inventory, and sets the loan status to Returned. | M |
| FR-RT-05 | Multiple partial returns are allowed until the outstanding quantity reaches zero. | M |
| FR-RT-06 | Return history is viewable per loan and per variety. | S |

### 4.7 Agricultural Expert Support

| ID | Requirement | Priority |
|---|---|---|
| FR-EX-01 | An expert can review quality test results. | M |
| FR-EX-02 | An expert can provide a quality recommendation for a test. | M |
| FR-EX-03 | An expert can recommend a suitable seed variety. | M |
| FR-EX-04 | An expert can provide traditional farming guidance. | M |
| FR-EX-05 | An expert can provide an agro-biodiversity recommendation. | M |
| FR-EX-06 | An expert can review knowledge articles and approve them or request revision. | M |
| FR-EX-07 | An expert can contribute traditional knowledge. | M |
| FR-EX-08 | An expert can view open farmer queries and respond to them. | M |

### 4.8 Agricultural Knowledge Management

| ID | Requirement | Priority |
|---|---|---|
| FR-KB-01 | An administrator can add an article with title, content, and category. | M |
| FR-KB-02 | A new article starts in Draft. | M |
| FR-KB-03 | An administrator can submit an article for expert review. | M |
| FR-KB-04 | An expert can approve an article, which publishes it, or request revision. | M |
| FR-KB-05 | An article needing revision can be edited and resubmitted. | M |
| FR-KB-06 | Users can view and filter articles by category. | M |
| FR-KB-07 | Updating a published article returns it to review. | S |

### 4.9 Community Event Management

| ID | Requirement | Priority |
|---|---|---|
| FR-EV-01 | An administrator can create an event with title, date, location, and description. | M |
| FR-EV-02 | Event data is validated, including a date that is not in the past. | M |
| FR-EV-03 | An administrator can update an event. | M |
| FR-EV-04 | Users can view and filter events. | M |
| FR-EV-05 | A farmer can register participation in an event. | S |

### 4.10 Reporting

| ID | Requirement | Priority |
|---|---|---|
| FR-RP-01 | Generate an inventory report showing quantity and status per variety. | M |
| FR-RP-02 | Generate a low-stock report. | M |
| FR-RP-03 | Generate a loan report showing requests, decisions, and issues. | M |
| FR-RP-04 | Generate a loan-and-return summary showing outstanding quantities. | M |
| FR-RP-05 | Generate an event report. | M |
| FR-RP-06 | Apply filters such as date range, variety, status, and location. | M |
| FR-RP-07 | Export a generated report as CSV. | M |

### 4.11 Notifications

| ID | Requirement | Priority |
|---|---|---|
| FR-NT-01 | The system creates an in-app notification when a loan is rejected, issued, or fully returned. | M |
| FR-NT-02 | The system creates an in-app notification when a query is answered. | S |
| FR-NT-03 | The system creates an in-app notification when an article is published or needs revision. | S |
| FR-NT-04 | Notifications are listed in the UI and can be marked as read. | M |

### 4.12 Offline and Sync

| ID | Requirement | Priority |
|---|---|---|
| FR-OF-01 | The application shell loads without connectivity after first use. | M |
| FR-OF-02 | Previously loaded inventory, varieties, events, and articles are readable offline. | M |
| FR-OF-03 | Writes attempted offline are stored in a local queue. | M |
| FR-OF-04 | Queued writes replay automatically when connectivity returns. | M |
| FR-OF-05 | The UI shows online or offline status and pending write count. | M |
| FR-OF-06 | Conflicting replays resolve as last-write-wins, with the outcome logged. | S |

---

## 5. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | Mobile-responsive layout usable at 360 px width and above. |
| NFR-02 | Any screen reachable within three taps from the role dashboard. |
| NFR-03 | Inventory and availability responses under one second on a local machine. |
| NFR-04 | Passwords stored hashed, never in plain text. |
| NFR-05 | Role checks enforced on the server, not only in the UI. |
| NFR-06 | All validation errors returned as field-level messages. |
| NFR-07 | Data persists across restarts in a local database file. |
| NFR-08 | Seed data loads a demonstrable dataset for all four roles. |
| NFR-09 | Runs on Windows with Node.js only, no additional services required. |
| NFR-10 | Code organized so storey and controller layers can be unit tested without a live server. |

---

## 6. Roles and Permissions

| Use Case | Farmer | Coordinator | Expert | Administrator |
|---|---|---|---|---|
| UC1 Register User | Y | Y | Y | Y |
| UC2 Authenticate User | Y | Y | Y | Y |
| UC3 Log In Using OTP | Y | Y | Y | Y |
| UC4 Manage User Profile | Y | Y | Y | Y |
| UC5 View Role-Based Dashboard | Y | Y | Y | Y |
| UC6 Manage User Accounts | — | — | — | Y |
| UC7 Register Seed Variety | — | Y | — | — |
| UC8 Manage Seed Stock | — | Y | — | — |
| UC9 View Seed Inventory | Y | Y | — | — |
| UC10 Check Seed Availability | Y | Y | — | — |
| UC11 Record Seed Quality Test | — | Y | — | — |
| UC12 Evaluate Seed Quality | — | Y | — | — |
| UC13 View Seed Quality Information | Y | Y | — | — |
| UC14 Review Seed Quality Information | — | — | Y | — |
| UC15 Request Seed Loan | Y | — | — | — |
| UC16 View Loan Status | Y | — | — | — |
| UC17 Validate Loan Request | — | Y | — | — |
| UC18 Approve Seed Loan | — | Y | — | — |
| UC19 Reject Seed Loan | — | Y | — | — |
| UC20 Issue Approved Seeds | — | Y | — | — |
| UC21 View Loan Transaction | — | Y | — | — |
| UC22 Record Seed Return | — | Y | — | — |
| UC23 Record Partial Seed Return | — | Y | — | — |
| UC24 Recommend Seed Variety | — | — | Y | — |
| UC25 Provide Quality Recommendation | — | — | Y | — |
| UC26 Provide Traditional Farming Guidance | — | — | Y | — |
| UC27 Review Knowledge Article | — | — | Y | — |
| UC28 Contribute Traditional Knowledge | — | — | Y | — |
| UC29 Provide Biodiversity Recommendation | — | — | Y | — |
| UC30 Respond to Farmer Query | — | — | Y | — |
| UC31 Manage Community Events | — | — | — | Y |
| UC32 View / Filter Events | Y | — | — | — |
| UC33 Manage Knowledge Articles | — | — | — | Y |
| UC34 View / Filter Articles | Y | — | — | — |
| UC35 Generate Reports | — | Y | — | Y |

---

## 7. Data Model

Nineteen tables. The first fourteen mirror the class diagram; the last five support requirements added during review.

| Table | Purpose | Key relationships |
|---|---|---|
| users | Base account record, one row per person | Parent of the four role tables |
| farmers | Farmer-specific row | users, loan_transactions, agricultural_queries |
| coordinators | Coordinator-specific row | users, seed_varieties, quality_tests, loan_transactions, seed_returns |
| agricultural_experts | Expert-specific row | users, expert_recommendations, quality_tests, knowledge_articles, agricultural_queries |
| administrators | Administrator-specific row | users, community_events, knowledge_articles |
| seed_varieties | Variety name, source, storage location | seed_inventories, quality_tests, expert_recommendations, loan_transactions |
| seed_inventories | Current available quantity and low-stock threshold | seed_varieties |
| quality_tests | Germination, purity, moisture, status, test date | seed_varieties, expert_recommendations |
| expert_recommendations | Recommendation type, content, date, status | quality_tests, seed_varieties, agricultural_experts |
| loan_transactions | Requested, issued, and outstanding quantities with dates and status | farmers, coordinators, seed_varieties |
| seed_returns | Returned quantity, date, and type | loan_transactions, coordinators |
| agricultural_queries | Question, response, status, and dates | farmers, agricultural_experts |
| community_events | Title, date, location, description | administrators |
| knowledge_articles | Title, content, category, review status, dates | administrators, agricultural_experts |
| otp_codes | Locally generated login codes with expiry | users |
| notifications | In-app notifications with read state | users |
| stock_ledger | Every stock movement with resulting balance | seed_varieties, users |
| event_participants | Join table for farmer participation in events | farmers, community_events |
| article_views | Join table for farmer views of articles | farmers, knowledge_articles |

Note that the class diagram modelled Farmer attends CommunityEvent and Farmer views KnowledgeArticle as many-to-many associations, which is why the two join tables exist rather than a foreign key on either side.

### 7.1 Key Business Rules

- BR-01 — Available quantity can never be negative.
- BR-02 — Stock reduction requires quantity less than or equal to availability.
- BR-03 — Issuing a loan reduces inventory and sets the outstanding quantity to the issued amount.
- BR-04 — Total returned quantity across all returns for a loan can never exceed the issued quantity.
- BR-05 — A partial return reduces the outstanding quantity; reaching zero sets the loan to Returned.
- BR-06 — Quality status is derived at recording time and can be overwritten only by an expert review.
- BR-07 — An article is visible to the community only when Published.
- BR-08 — Every state change writes a stock ledger or notification row where applicable.
- BR-09 — A mobile number uniquely identifies a user.

---

## 8. State Models

| Entity | States | Terminal |
|---|---|---|
| LoanTransaction | Pending, Validated, Approved, Issued, PartiallyReturned, Returned, Rejected | Rejected, Returned |
| SeedInventory | Available, LowStock, OutOfStock | none while the variety exists |
| QualityTest | TestRecorded, UnderEvaluation, Good, Average, Poor, ExpertReviewed | ExpertReviewed |
| AgriculturalQuery | Open, UnderReview, Answered, Closed | Closed |
| KnowledgeArticle | Draft, UnderReview, Published, NeedsRevision, Updated | none until withdrawn |
| UserAccount | Registered, Active, Inactive | none until deleted |

Transitions follow the six state diagrams. The one deliberate change from those diagrams is that SeedInventory, KnowledgeArticle, and UserAccount are long-lived, so they carry no hard terminal state; a variety or article ends only through an explicit delete or withdraw action.

---

## 9. Interface Requirements

### 9.1 Pages

Login, Register, and one dashboard per role. Each dashboard surfaces only that role's modules and shows the notification bell and offline status.

### 9.2 Component Groups

Auth (login, register, OTP, protected route), user (profile, password, account administration), seed (registration, list, stock manager, availability check, low-stock alert, search), quality (test form, test list, status view, recommendation form, history), loan (request form, validation panel, approval, management, status view, transaction view), return (return form, partial return form, list, confirmation), query (farmer submission, list, response form, detail), expert (variety recommendation, traditional guidance, biodiversity form, review list), knowledge (article form, list, view, review form, filter), events (form, list, filter), reports (five report views, filter, export), notifications (bell, list), plus shared layout and common components.

### 9.3 API Surface

| Method | Path | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| POST | /api/auth/otp/request | Public |
| POST | /api/auth/otp/verify | Public |
| POST | /api/auth/logout | Authenticated |
| GET | /api/auth/me | Authenticated |
| GET, PUT | /api/users/me | Authenticated |
| PUT | /api/users/me/password | Authenticated |
| GET | /api/users | Administrator |
| GET | /api/users/:id | Administrator |
| PATCH | /api/users/:id/status | Administrator |
| GET, POST | /api/seeds | Coordinator, Farmer for GET |
| GET, PUT, DELETE | /api/seeds/:id | Coordinator |
| GET | /api/inventory | Farmer, Coordinator |
| GET | /api/inventory/:varietyId | Farmer, Coordinator |
| POST | /api/inventory/:varietyId/stock | Coordinator |
| POST | /api/inventory/:varietyId/check | Farmer, Coordinator |
| GET | /api/inventory/ledger | Coordinator |
| GET, POST | /api/quality-tests | Coordinator |
| GET | /api/quality-tests/:id | Farmer, Coordinator, Expert |
| POST | /api/quality-tests/:id/review | Expert |
| GET, POST | /api/recommendations | Expert |
| GET, POST | /api/loans | Farmer |
| GET | /api/loans/:id | Farmer own, Coordinator |
| PATCH | /api/loans/:id/validate | Coordinator |
| PATCH | /api/loans/:id/approve | Coordinator |
| PATCH | /api/loans/:id/reject | Coordinator |
| PATCH | /api/loans/:id/issue | Coordinator |
| GET, POST | /api/returns | Coordinator |
| GET | /api/returns/:id | Coordinator |
| GET, POST | /api/queries | Farmer |
| GET | /api/queries/open | Expert |
| POST | /api/queries/:id/response | Expert |
| PATCH | /api/queries/:id/close | Farmer |
| GET, POST | /api/events | Administrator, all for GET |
| GET, PUT, DELETE | /api/events/:id | Administrator |
| POST | /api/events/:id/participate | Farmer |
| GET, POST | /api/articles | Administrator, all for GET |
| GET, PUT | /api/articles/:id | Administrator |
| POST | /api/articles/:id/review | Expert |
| POST | /api/articles/:id/publish | Expert |
| GET | /api/reports/:type | Coordinator, Administrator |
| GET | /api/reports/:type/export | Coordinator, Administrator |
| GET | /api/notifications | Authenticated |
| PATCH | /api/notifications/:id/read | Authenticated |
| POST | /api/sync/replay | Authenticated |
| GET | /api/dev/otp/:mobile | Development only |
| POST | /api/dev/reseed | Development only |

---

## 10. Local Development Constraints

These choices keep the whole system runnable on one machine with no external services. They are deliberate and temporary.

| Area | Local approach | Production path |
|---|---|---|
| Database | SQLite file at backend/data/csbams.dev.sqlite | MySQL or PostgreSQL, changed in config/db.js |
| OTP | Generated locally, stored in otp_codes, printed to the backend console, readable through the dev route | SMS gateway |
| Auth | JWT with a plain local secret in .env | Managed secret, refresh tokens |
| Notifications | Database rows plus console log | Email or SMS provider |
| Reports | CSV generated in-process | PDF rendering or scheduled delivery |
| Offline | Service worker, IndexedDB cache, write queue, replay endpoint | Conflict-aware sync protocol |
| Transport | HTTP on localhost | HTTPS |

---

## 11. Acceptance Criteria

- AC-01 — A new user can register, log in with password, receive a local OTP, and reach the dashboard for their role.
- AC-02 — An administrator can deactivate a user, and that user cannot log in while inactive.
- AC-03 — A coordinator can register a variety, add stock, reduce stock, and see the resulting status and ledger entries.
- AC-04 — Reducing stock below zero is refused with a clear message, and the recorded quantity is unchanged.
- AC-05 — Recording a quality test derives a status, and an expert can attach a recommendation that a farmer can then view.
- AC-06 — A farmer requesting more seed than is available is refused and no loan record is created.
- AC-07 — A valid request moves Pending to Validated to Approved to Issued, reduces inventory by the issued quantity, and notifies the farmer.
- AC-08 — A partial return updates the outstanding quantity, and the final return sets the loan to Returned and restores stock.
- AC-09 — A query submitted by a farmer appears in the expert's open list, and the expert's response notifies the farmer.
- AC-10 — An article created by an administrator cannot be seen by farmers until an expert publishes it, and a revision request sends it back for editing.
- AC-11 — An event created by an administrator appears in the farmer's event list, and the farmer can register participation.
- AC-12 — Each report type generates with the applied filters and exports to CSV.
- AC-13 — With the network disabled, a farmer can still read cached inventory and submit a loan request, and the queued request replays once connectivity returns.
- AC-14 — Seed data loads accounts for all four roles so the whole flow is demonstrable end to end.

---

## 12. Release Plan

| Milestone | Contents |
|---|---|
| M1 Foundation | Project structure, database schema and seed data, auth, user management, dashboards |
| M2 Seed and Inventory | Variety registration, stock add and reduce, availability check, low stock, ledger |
| M3 Quality | Test recording, evaluation, status, expert review and recommendation |
| M4 Loans and Returns | Request, validate, approve or reject, issue, full and partial returns, state transitions |
| M5 Expert and Queries | Variety recommendation, guidance, biodiversity recommendation, query flow |
| M6 Knowledge and Events | Article lifecycle, event lifecycle, participation |
| M7 Reporting and Notifications | Five reports, filters, CSV export, notification centre |
| M8 Offline and Polish | Service worker, cache, queue, replay, responsive pass |
| M9 Verification | Unit and integration tests, seed data validation, acceptance walkthrough |

---

## 13. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Offline queue replays a write twice | Duplicate loans or stock changes | Idempotency key per queued write, replay log |
| SQLite write contention during demos | Failed writes | Single-writer discipline, short transactions |
| Role checks present only in the UI | Unauthorized access | Server-side role middleware on every protected route |
| Stock and ledger drift apart | Wrong availability | Ledger written in the same transaction as the quantity change |
| Quality thresholds unspecified | Inconsistent statuses | Define thresholds in the seed data and document them |
| Knowledge contribution ownership unclear | Duplicate or missing articles | Decide whether experts create articles directly or only review |
| Scope creep into out-of-scope features | Slipped schedule | Enforce section 3.2 at review |

---

## 14. Open Questions

These come from inconsistencies between the existing diagrams and need a decision before implementation.

1. Should OTP be mandatory after password entry, or optional as the use case diagram's «extend» suggests? The sequence diagram currently makes it mandatory.
2. Is expert review of a quality test mandatory or optional? The state diagram makes it mandatory; the activity diagram and sequence diagram make it optional.
3. Does a loan always pass through Validated before Approved? The state diagram requires it; the approval sequence diagram skips it.
4. Does a newly registered account require administrator activation before login? The account state diagram says yes; the authentication sequence diagram never checks status.
5. Who acknowledges a query response so it can reach Closed, and where is that screen?
6. Where is the article revision and resubmission screen, given no sequence diagram implements the loop?
7. Reporting has controller, routes, and components but no sequence diagram. Is a reporting sequence diagram required for the submission?
8. Are knowledge articles authored by administrators only, or can experts contribute directly as UC28 suggests?
9. Should notifications be in-app only for this release?
10. Should inventory aggregate per variety, as the class diagram's one-to-one composition implies, or per batch and location?

---

## 15. Traceability

| Module | Use cases | Activity diagram | Sequence diagrams | State machine |
|---|---|---|---|---|
| User Management | UC1–UC6 | 1 | SD-01, SD-02 | UserAccount |
| Seed Inventory | UC7–UC10 | 2 | SD-03, SD-04 | SeedInventory |
| Quality Testing | UC11–UC14 | 3 | SD-05, SD-09 | QualityTest |
| Loan | UC15–UC21 | 4 | SD-06, SD-07 | LoanTransaction |
| Return | UC22, UC23 | 5 | SD-08 | LoanTransaction |
| Expert Support | UC24–UC30 | 6 | SD-09, SD-10B | AgriculturalQuery |
| Knowledge and Events | UC27, UC31–UC34 | 7 | SD-11, SD-12A, SD-12B | KnowledgeArticle |
| Reporting | UC35 | 7 | none | none |

---

## 16. Glossary

| Term | Meaning |
|---|---|
| Available | Inventory status at or above the low-stock threshold |
| LowStock | Inventory status below the threshold but above zero |
| OutOfStock | Inventory status at zero |
| Outstanding quantity | Issued quantity not yet returned |
| Draft | Article state before submission for review |
| NeedsRevision | Article state after an expert requests changes |
| Replay | Sending a queued offline write to the server once online |
| Seed data | Demonstration records loaded for testing and review |