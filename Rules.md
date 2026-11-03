# CSBAMS — Rules

| Field | Value |
|---|---|
| Product | Community Seed Bank and Agro-Biodiversity Management System (CSBAMS) |
| Version | 1.0 (Draft) |
| Date | 10 October 2026 |
| Related documents | PRD.md, architecture.md |
| Status | Rules marked ASSUMPTION need confirmation |

---

## 1. Purpose

This file is the single source of truth for what the system must and must not allow. Every rule has an identifier, a statement, and the place in the code where it is enforced, so a rule cannot quietly disappear during implementation.

Rule families:

| Prefix | Family |
|---|---|
| BR | Business rules |
| VR | Validation rules |
| SR | State transition rules |
| PR | Permission rules |
| DR | Data integrity rules |
| OR | Offline and sync rules |
| SEC | Security rules |
| DEV | Development rules |

Priority is either **MUST** (the system is incorrect without it) or **SHOULD** (expected, may be deferred with a note).

---

## 2. Business Rules

### 2.1 Accounts

| ID | Rule | Priority | Enforced in |
|---|---|---|---|
| BR-A-01 | Every user has exactly one role: Farmer, Coordinator, Agricultural Expert, or Administrator. | MUST | users table, roleMiddleware |
| BR-A-02 | A mobile number uniquely identifies a user and cannot be reused. | MUST | users table unique constraint, userController |
| BR-A-03 | A new account begins in the Registered state and cannot log in until an administrator activates it. | MUST | userController, authController |
| BR-A-04 | A deactivated account cannot authenticate and cannot use an existing token. | MUST | authMiddleware, userController |
| BR-A-05 | An administrator cannot deactivate their own account. | MUST | userController |
| BR-A-06 | A user cannot change their own role. | MUST | userController, roleMiddleware |
| BR-A-07 | Only one account may hold the Administrator role in the demo dataset. | SHOULD | seed_data.sql |

### 2.2 Seed Varieties

| ID | Rule | Priority | Enforced in |
|---|---|---|---|
| BR-V-01 | A variety requires a name, a source, and a storage location. | MUST | validateMiddleware, seedController |
| BR-V-02 | Two varieties may share a name only if source or storage location differs. | MUST | seed_varieties unique index on name, source, location |
| BR-V-03 | A variety cannot be deleted while any loan or return row references it. | MUST | seedController, foreign key restriction |
| BR-V-04 | Deleting a variety deletes its inventory record. | MUST | schema cascade |
| BR-V-05 | An initial quantity is required when a variety is created. | MUST | seedController |

### 2.3 Inventory

| ID | Rule | Priority | Enforced in |
|---|---|---|---|
| BR-I-01 | Available quantity is never negative. | MUST | models/seedInventory.js, DB CHECK constraint |
| BR-I-02 | Reducing stock by more than the available quantity is refused and changes nothing. | MUST | inventoryController, seedInventory model |
| BR-I-03 | Adding or reducing stock is permitted only for a Coordinator. | MUST | roleMiddleware |
| BR-I-04 | Every stock change writes a stock_ledger row in the same transaction as the quantity change. | MUST | inventoryController, loanController, returnController |
| BR-I-05 | A ledger row records variety, delta, resulting balance, reason, actor, and timestamp. | MUST | stock_ledger table |
| BR-I-06 | Inventory status derives from quantity and threshold: Available at or above the threshold, LowStock below it but above zero, OutOfStock at zero. | MUST | models/seedInventory.js |
| BR-I-07 | Each variety has exactly one inventory record. | MUST | seed_varieties to seed_inventories one-to-one |
| BR-I-08 | The low-stock threshold defaults to 5 units and may be set per variety. | ASSUMPTION | inventoryController |

### 2.4 Quality

| ID | Rule | Priority | Enforced in |
|---|---|---|---|
| BR-Q-01 | A test records germination percentage, purity percentage, moisture percentage, and test date. | MUST | qualityTest model, validateMiddleware |
| BR-Q-02 | Recording a test always triggers evaluation and stores a status. | MUST | qualityController |
| BR-Q-03 | Derived status uses the thresholds in section 2.4.1. | ASSUMPTION | models/qualityTest.js |
| BR-Q-04 | An expert may override a derived status, and the previous value is retained in history. | SHOULD | expertController |
| BR-Q-05 | Only an Agricultural Expert can review a test or attach a recommendation. | MUST | roleMiddleware |
| BR-Q-06 | A published recommendation is visible to farmers for that variety. | MUST | qualityController read rules |
| BR-Q-07 | Quality history is append-only; tests are never edited after review. | SHOULD | qualityTest model |

#### 2.4.1 Quality Thresholds (defaults, configurable)

| Parameter | Good | Average | Poor |
|---|---|---|---|
| Germination | 85% and above | 70% to 84% | below 70% |
| Purity | 98% and above | 95% to 97% | below 95% |
| Moisture | 12% and below | above 12% to 14% | above 14% |

A test takes the lowest status across its parameters. If germination is Average and purity is Good, the test is Average.

### 2.5 Loans

| ID | Rule | Priority | Enforced in |
|---|---|---|---|
| BR-L-01 | A loan requires a variety and a requested quantity greater than zero. | MUST | loanController, validateMiddleware |
| BR-L-02 | Every new request checks availability before the loan record is created. | MUST | loanController |
| BR-L-03 | A request exceeding available quantity is refused and no loan row is written. | MUST | loanController |
| BR-L-04 | A new loan starts in Pending. | MUST | loanTransaction model |
| BR-L-05 | A farmer sees only their own loans. | MUST | loanController scoping |
| BR-L-06 | Only a Coordinator can validate, approve, reject, or issue. | MUST | roleMiddleware |
| BR-L-07 | Validation is required before approval. | MUST | loanController |
| BR-L-08 | Rejection requires a reason and is terminal. | MUST | loanController |
| BR-L-09 | Issuing sets the loan to Issued, reduces inventory by the issued quantity, stamps the issue date, and sets the outstanding quantity to the issued amount. | MUST | loanController, single transaction |
| BR-L-10 | Issued quantity may not exceed requested quantity. | MUST | loanController |
| BR-L-11 | Issue is refused if current availability is below the issued quantity, even if it was sufficient at request time. | MUST | loanController |
| BR-L-12 | A loan is terminal in Rejected or Returned and cannot change afterwards. | MUST | loanController |
| BR-L-13 | Every decision, issue, and full return creates a notification for the farmer. | MUST | notificationService |

### 2.6 Returns

| ID | Rule | Priority | Enforced in |
|---|---|---|---|
| BR-R-01 | A return is always against a specific issued loan. | MUST | returnController |
| BR-R-02 | Return quantity must be greater than zero. | MUST | validateMiddleware |
| BR-R-03 | Return quantity may not exceed the outstanding quantity. | MUST | returnController |
| BR-R-04 | A partial return increases inventory, reduces the outstanding quantity, and keeps the loan in PartiallyReturned. | MUST | returnController, single transaction |
| BR-R-05 | A return that clears the outstanding quantity sets the loan to Returned. | MUST | returnController |
| BR-R-06 | Multiple partial returns are allowed until the outstanding quantity is zero. | MUST | loanTransaction state rules |
| BR-R-07 | Total returned quantity across a loan never exceeds the issued quantity. | MUST | returnController |
| BR-R-08 | A return on a loan that is not Issued or PartiallyReturned is refused. | MUST | returnController |

### 2.7 Queries

| ID | Rule | Priority | Enforced in |
|---|---|---|---|
| BR-QY-01 | A query requires question text of at least 10 characters. | MUST | validateMiddleware |
| BR-QY-02 | A new query starts in Open. | MUST | agriculturalQuery model |
| BR-QY-03 | Only an Agricultural Expert can respond. | MUST | roleMiddleware |
| BR-QY-04 | A response requires at least 10 characters. | MUST | validateMiddleware |
| BR-QY-05 | Responding sets the query to Answered and records the response date. | MUST | queryController |
| BR-QY-06 | Only the farmer who submitted a query can close it. | MUST | queryController |
| BR-QY-07 | A farmer may close a query only after it is Answered. | MUST | queryController |
| BR-QY-08 | A farmer sees only their own queries; an expert sees all queries. | MUST | queryController scoping |

### 2.8 Knowledge Articles

| ID | Rule | Priority | Enforced in |
|---|---|---|---|
| BR-K-01 | An article requires a title, content, and category. | MUST | validateMiddleware |
| BR-K-02 | A new article starts in Draft and is not visible to farmers. | MUST | knowledgeController |
| BR-K-03 | Only an administrator creates or edits articles; an expert contributes by creating a Draft. | ASSUMPTION | knowledgeController, roleMiddleware |
| BR-K-04 | Only an expert may approve or request revision. | MUST | roleMiddleware |
| BR-K-05 | Approval publishes the article and makes it visible to all roles. | MUST | knowledgeController |
| BR-K-06 | A revision request returns the article to Draft for editing. | MUST | knowledgeController |
| BR-K-07 | Editing a published article returns it to UnderReview. | SHOULD | knowledgeController |
| BR-K-08 | Only Published articles appear in farmer searches and filters. | MUST | knowledgeController |
| BR-K-09 | Categories come from a fixed list: seeds, traditional knowledge, pest control, soil, climate, general. | ASSUMPTION | constants.js |

### 2.9 Events

| ID | Rule | Priority | Enforced in |
|---|---|---|---|
| BR-E-01 | An event requires a title, date, location, and description. | MUST | validateMiddleware |
| BR-E-02 | An event date may not be in the past at creation time. | MUST | eventController |
| BR-E-03 | Only an administrator creates, updates, or deletes events. | MUST | roleMiddleware |
| BR-E-04 | A farmer can register participation once per event. | MUST | eventController, unique index |
| BR-E-05 | Deleting an event with registrations requires confirmation and removes those registrations. | SHOULD | eventController |
| BR-E-06 | Past events remain visible and are labelled as past. | SHOULD | eventController |

### 2.10 Reporting

| ID | Rule | Priority | Enforced in |
|---|---|---|---|
| BR-RP-01 | Reports reflect live data at the moment of generation. | MUST | reportService |
| BR-RP-02 | Only Coordinators and Administrators may generate or export reports. | MUST | roleMiddleware |
| BR-RP-03 | Every report supports a date range filter, defaulting to the current month. | MUST | reportService |
| BR-RP-04 | Exports are CSV and echo the filters applied on screen. | MUST | csvExport |
| BR-RP-05 | A report with no matching rows still exports with headers and a zero-row count. | SHOULD | reportService |

### 2.11 Notifications

| ID | Rule | Priority | Enforced in |
|---|---|---|---|
| BR-N-01 | Notifications are created for loan rejection, issue, and full return. | MUST | notificationService |
| BR-N-02 | Notifications are created when a query is answered. | SHOULD | notificationService |
| BR-N-03 | Notifications are created when an article is published or needs revision. | SHOULD | notificationService |
| BR-N-04 | A user sees only their own notifications. | MUST | notificationController |
| BR-N-05 | A notification can be marked read once and stays in the list. | MUST | notificationController |
| BR-N-06 | Notifications older than 90 days are purged. | ASSUMPTION | scheduled cleanup |

---

## 3. Validation Rules

| ID | Field | Rule |
|---|---|---|
| VR-01 | Name | 2 to 100 characters, letters and spaces only |
| VR-02 | Mobile | Exactly 10 digits, first digit 6 to 9 |
| VR-03 | Password | 8 to 64 characters, at least one letter and one digit |
| VR-04 | Confirm password | Must equal password |
| VR-05 | Role | One of Farmer, Coordinator, Agricultural Expert, Administrator |
| VR-06 | OTP | Exactly 6 digits, numeric |
| VR-07 | Variety name | 2 to 100 characters |
| VR-08 | Source | 2 to 150 characters |
| VR-09 | Storage location | 2 to 150 characters |
| VR-10 | Quantity | Integer, greater than zero, maximum 100000 |
| VR-11 | Germination | Number, 0 to 100 |
| VR-12 | Purity | Number, 0 to 100 |
| VR-13 | Moisture | Number, 0 to 100 |
| VR-14 | Test date | Valid date, not in the future |
| VR-15 | Article title | 5 to 150 characters |
| VR-16 | Article content | 50 to 20000 characters |
| VR-17 | Category | Must be one of the fixed list |
| VR-18 | Event date | Valid date, today or later at creation |
| VR-19 | Query question | 10 to 2000 characters |
| VR-20 | Query response | 10 to 5000 characters |
| VR-21 | Rejection reason | 5 to 500 characters |
| VR-22 | Report date range | Start not after end, range not more than 5 years |

All field validation returns the standard error envelope with a field-level map so the form can mark the exact input.

---

## 4. State Transition Rules

Only the transitions below are legal. Any other transition is rejected with a domain error, never silently ignored.

### 4.1 LoanTransaction

| From | To | Trigger | Allowed role |
|---|---|---|---|
| — | Pending | Request created | Farmer |
| Pending | Validated | Request validated | Coordinator |
| Pending | Rejected | Invalid request rejected | Coordinator |
| Validated | Approved | Approval granted | Coordinator |
| Validated | Rejected | Approval denied | Coordinator |
| Approved | Issued | Seed issued | Coordinator |
| Issued | PartiallyReturned | Partial return recorded | Coordinator |
| Issued | Returned | Full return recorded | Coordinator |
| PartiallyReturned | PartiallyReturned | Further partial return | Coordinator |
| PartiallyReturned | Returned | Outstanding quantity reaches zero | Coordinator |
| Rejected | terminal | — | — |
| Returned | terminal | — | — |

### 4.2 SeedInventory

| From | To | Trigger |
|---|---|---|
| — | Available | Initial stock recorded |
| Available | LowStock | Stock falls below threshold |
| Available | OutOfStock | Stock reaches zero |
| LowStock | Available | Stock reaches or passes threshold |
| LowStock | OutOfStock | Stock reaches zero |
| OutOfStock | LowStock | Stock added but still below threshold |
| OutOfStock | Available | Stock added and reaches threshold |

Note that the original state diagram omitted OutOfStock to LowStock and threshold crossings caused by returns. These are included here so a small restock or a small return is representable.

### 4.3 QualityTest

| From | To | Trigger |
|---|---|---|
| — | TestRecorded | Results recorded |
| TestRecorded | UnderEvaluation | Evaluation starts |
| UnderEvaluation | Good, Average, or Poor | Threshold result |
| Good, Average, or Poor | ExpertReviewed | Expert recommendation attached |
| ExpertReviewed | terminal | — |

Expert review is mandatory in the state diagram and optional in the activity and sequence diagrams. This file follows the activity diagram: review is optional, and ExpertReviewed is reached only when an expert acts. Confirm before implementation.

### 4.4 AgriculturalQuery

| From | To | Trigger | Allowed role |
|---|---|---|---|
| — | Open | Query submitted | Farmer |
| Open | UnderReview | Expert opens it | Expert |
| UnderReview | Answered | Expert responds | Expert |
| Answered | Closed | Farmer closes | Farmer |

### 4.5 KnowledgeArticle

| From | To | Trigger |
|---|---|---|
| — | Draft | Article created |
| Draft | UnderReview | Submitted for review |
| UnderReview | Published | Expert approves |
| UnderReview | NeedsRevision | Expert requests changes |
| NeedsRevision | Draft | Author revises |
| Published | Updated | Published article edited |
| Updated | UnderReview | Resubmitted |
| Published | terminal | Withdrawn |

### 4.6 UserAccount

| From | To | Trigger |
|---|---|---|
| — | Registered | Registration submitted |
| Registered | Active | Administrator activates |
| Active | Active | Profile updated or password changed |
| Active | Inactive | Administrator deactivates |
| Inactive | Active | Administrator reactivates |
| Active | terminal | Account deleted |

---

## 5. Permission Rules

| ID | Rule |
|---|---|
| PR-01 | Every route except register, login, and OTP request requires a valid token. |
| PR-02 | Role is read from the token and checked against the route allow list. |
| PR-03 | A farmer may read varieties, inventory, quality information, events, and published articles, and may write only loan requests, queries, and event participation. |
| PR-04 | A coordinator may write varieties, inventory, quality tests, loan decisions, and returns, and may read all operational data. |
| PR-05 | An expert may write recommendations, guidance, query responses, and article review decisions, and may read quality and article data. |
| PR-06 | An administrator may write user accounts, events, and articles, and may read user and report data. |
| PR-07 | Clients never decide authorization; the server re-checks every request. |
| PR-08 | A user may read and modify only their own profile, password, loans, and queries. |
| PR-09 | Development routes are unavailable when the OTP dev flag is off. |
| PR-10 | A failed authorization returns 403 with a stable error code and does not reveal whether the resource exists. |

---

## 6. Data Integrity Rules

| ID | Rule |
|---|---|
| DR-01 | Foreign keys are enforced on every connection. |
| DR-02 | Quantities are stored as integers; percentages as decimals. |
| DR-03 | All dates are stored in ISO 8601 UTC. |
| DR-04 | Identifiers are prefixed strings, one prefix per entity: USR, VAR, INV, TST, REC, LN, RET, QRY, EVT, ART, NTF. |
| DR-05 | Multi-table operations run inside a transaction and roll back completely on failure. |
| DR-06 | Inventory quantity and its ledger row are written in the same transaction. |
| DR-07 | Deletes use cascade only where the child cannot exist alone, such as seed_returns under a loan. |
| DR-08 | Historical rows in stock_ledger, seed_returns, and notifications are never updated, only inserted. |
| DR-09 | Status columns store only values defined in section 4. |
| DR-10 | The database file lives under backend/data, is gitignored, and is rebuilt by seed scripts. |

---

## 7. Offline and Sync Rules

| ID | Rule |
|---|---|
| OR-01 | Only loan requests are queued for offline write; stock, quality, returns, and approvals require connectivity. |
| OR-02 | Every queued write carries a client-generated idempotency key. |
| OR-03 | The server ignores a replayed write whose key was already processed. |
| OR-04 | Availability is re-checked at replay time, not trusted from the offline client. |
| OR-05 | A queued write that fails validation is removed from the queue and surfaced to the user as a failed action. |
| OR-06 | Cached reads cover inventory, varieties, events, and published articles only. |
| OR-07 | The UI shows offline status and pending write count at all times. |
| OR-08 | Conflicts resolve last-write-wins, and the losing value is recorded in the server log. |
| OR-09 | The queue survives page reloads and browser restarts. |

---

## 8. Security Rules

| ID | Rule |
|---|---|
| SEC-01 | Passwords are hashed with bcrypt and never logged or returned in any response. |
| SEC-02 | OTP codes are stored hashed with an expiry and a maximum of 3 verification attempts. |
| SEC-03 | A mobile number may request at most 5 OTPs per hour. |
| SEC-04 | `.env` is never committed; only `.env.example` is tracked. |
| SEC-05 | Development-only routes are disabled by a flag before any demonstration outside the development machine. |
| SEC-06 | Stack traces are returned only when the environment is development. |
| SEC-07 | Every response that could leak existence returns a generic message for unauthorized users. |
| SEC-08 | No third-party scripts are loaded into the client. |

---

## 9. Development Rules

| ID | Rule |
|---|---|
| DEV-01 | One model file per table; models hold persistence and entity shape only. |
| DEV-02 | Controllers never contain raw SQL and never send a response without the standard envelope. |
| DEV-03 | Routes declare endpoints and middleware only, with no branching logic. |
| DEV-04 | Business rules from this file reference their ID in a code comment at the enforcement point. |
| DEV-05 | Components are PascalCase; modules and utilities are camelCase. |
| DEV-06 | Every controller and service has at least one test; every state transition table has a test for each legal and illegal transition. |
| DEV-07 | New endpoints are added to docs/api-endpoints.md in the same change. |
| DEV-08 | No feature is implemented that appears in the out-of-scope list without updating the PRD first. |
| DEV-09 | Shared constants such as categories, roles, and statuses live in one module and are imported, never duplicated. |
| DEV-10 | Any rule here marked ASSUMPTION must be confirmed before the matching feature is built. |

---

## 10. Rule Conflicts Awaiting Decision

These are the places where the existing diagrams disagree. Each one blocks a rule above.

| Conflict | Options | Blocks |
|---|---|---|
| OTP mandatory or optional after password | Mandatory for all, or optional as an «extend» | BR-A-03, SD-02 |
| Expert review mandatory or optional | Mandatory review, or review only when flagged | Section 4.3 |
| Validation state before approval | Require Validated, or allow direct approval | Section 4.1 |
| Account activation before login | Gate login on Active, or allow immediate use | BR-A-03 |
| Query closing actor | Farmer acknowledges, or expert closes, or auto-close | Section 4.4 |
| Article authorship | Administrator only, or experts contribute drafts | BR-K-03 |
| Knowledge vs expert components | One article form shared, or separate expert guidance entry | BR-K-03, DEV-09 |
| Reporting documentation | Add a reporting sequence diagram, or document as derived | PRD section 14 |
| Inventory granularity | One inventory per variety, or per batch and location | BR-I-07 |
| Notification scope | In-app only, or include email or SMS later | Section 2.11 |