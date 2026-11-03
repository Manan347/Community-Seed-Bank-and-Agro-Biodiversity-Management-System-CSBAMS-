# CSBAMS — System Architecture

| Field | Value |
|---|---|
| Product | Community Seed Bank and Agro-Biodiversity Management System (CSBAMS) |
| Version | 1.0 (Draft) |
| Date | 10 October 2026 |
| Related documents | PRD.md, docs/data-model.md, docs/api-endpoints.md |
| Target environment | Single machine, local development |

---

## 1. Purpose

This document describes how CSBAMS is built: its layers, the responsibilities of each part, how a request travels from a tap on a phone screen to a row in the database, and how the system behaves when connectivity drops. It maps the confirmed diagrams onto code, so the use case, activity, sequence, class, and state models all have a home in the implementation.

---

## 2. Architectural Goals

| Goal | How the architecture meets it |
|---|---|
| Work on a basic smartphone | Server-rendered JSON API with a lightweight React client, responsive layout, no heavy client framework features |
| Survive poor connectivity | Service worker cache, IndexedDB read cache, queued writes, replay endpoint |
| Keep the record trustworthy | Every state change writes a ledger or audit row in the same transaction |
| Be understandable for a student project | Plain layered architecture, no microservices, no message broker, no container orchestration |
| Run with zero external services | SQLite file, console OTP, in-process notification writer, in-process CSV export |
| Be swappable later | External integrations isolated behind service modules and a single database config |

---

## 3. Architecture Style

Three-tier client-server with a layered backend.

- **Presentation tier** — React single-page application, mobile-first.
- **Application tier** — Node.js and Express, organized as routes, middleware, controllers, services, and models.
- **Data tier** — SQLite, a single file, accessed through `better-sqlite3`.

The backend follows the boundary, controller, entity pattern already used in the sequence diagrams: a page calls a controller, the controller coordinates, and entity models own persistence. No layer skips another; routes never touch the database directly and models never touch HTTP.

### 3.1 System Context

```mermaid
graph TB
    subgraph ClientTier["Presentation tier — browser"]
        UI[React UI<br/>pages and components]
        SW[Service Worker<br/>app shell cache]
        IDB[(IndexedDB<br/>read cache + write queue)]
    end

    subgraph AppTier["Application tier — Node.js / Express"]
        RT[Routes]
        MW[Middleware<br/>auth, role, otp, validate, error]
        CT[Controllers]
        SV[Services<br/>otp, notification, report]
        MD[Models<br/>14 entities]
    end

    subgraph DataTier["Data tier"]
        DB[(SQLite file<br/>csbams.dev.sqlite)]
    end

    UI -->|JSON over HTTP| RT
    UI --- SW
    SW --- IDB
    RT --> MW --> CT --> SV
    CT --> MD
    MD --> DB
    SV --> MD