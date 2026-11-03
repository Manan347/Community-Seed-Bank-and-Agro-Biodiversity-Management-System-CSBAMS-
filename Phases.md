# CSBAMS — Build Phases

| Field | Value |
|---|---|
| Product | Community Seed Bank and Agro-Biodiversity Management System (CSBAMS) |
| Version | 1.0 (Draft) |
| Date | 10 October 2026 |
| Related documents | PRD.md, architecture.md, Rules.md |

---

## 1. Purpose

This file turns the PRD milestones into a working order of operations. Each phase names what is built, which files it touches, how it is proven done, and what it depends on. A phase is complete only when its exit criteria pass; nothing carries a known-broken piece into the next phase.

---

## 2. Working Principles

1. **Vertical slice per phase.** Every phase delivers something a user can actually do, not just a layer of code.
2. **Exit criteria gate progress.** Passing tests and a working demo, or the phase isn't done.
3. **Decisions before code.** Any rule marked ASSUMPTION in Rules.md must be settled before the phase that depends on it starts.
4. **Tests with the feature.** Controller and state-transition tests are written in the same phase as the feature.
5. **Docs follow the code.** New endpoints and tables are recorded in the docs in the same phase.
6. **Local everything.** SQLite, console OTP, CSV export. No external services until the project is handed over.

---

## 3. Phase Overview

| Phase | Name | PRD milestone | Depends on | Ideal days | Status |
|---|---|---|---|---|---|
| P0 | Setup and decisions | — | — | 1 | Not started |
| P1 | Foundation | M1 | P0 | 4 | Not started |
| P2 | Seed varieties and inventory | M2 | P1 | 3 | Not started |
| P3 | Quality testing | M3 | P2 | 2 | Not started |
| P4 | Loans | M4 | P3 | 3 | Not started |
| P5 | Returns | M4 | P4 | 2 | Not started |
| P6 | Expert support and queries | M5 | P5 | 3 | Not started |
| P7 | Knowledge and events | M6 | P6 | 3 | Not started |
| P8 | Reporting and notifications | M7 | P7 | 3 | Not started |
| P9 | Offline and polish | M8 | P8 | 3 | Not started |
| P10 | Verification | M9 | P9 | 2 | Not started |

Total: about 29 ideal days. Real time will be longer; treat the numbers as relative weight, not a schedule.

### 3.1 Sequencing

```mermaid
graph LR
    P0[P0 Setup] --> P1[P1 Foundation]
    P1 --> P2[P2 Seed and Inventory]
    P2 --> P3[P3 Quality]
    P3 --> P4[P4 Loans]
    P4 --> P5[P5 Returns]
    P5 --> P6[P6 Expert and Queries]
    P6 --> P7[P7 Knowledge and Events]
    P7 --> P8[P8 Reporting and Notifications]
    P8 --> P9[P9 Offline and Polish]
    P9 --> P10[P10 Verification]