# CSBAMS — Design

| Field | Value |
|---|---|
| Product | Community Seed Bank and Agro-Biodiversity Management System (CSBAMS) |
| Version | 1.0 (Draft) |
| Date | 10 October 2026 |
| Related documents | PRD.md, architecture.md, Rules.md, Phases.md |
| Scope | User interface design, screen behaviour, module design, algorithm detail |

Architecture.md describes the structure. This document describes the experience and the detailed behaviour of each module.

---

## 1. Design Goals

| Goal | Design response |
|---|---|
| Usable by someone who has never used a record system | One primary action per screen, plain labels, no jargon in the interface |
| Usable on a basic smartphone | Mobile-first layout, thumb-reachable primary buttons, 44 px minimum touch targets |
| Trustworthy where disputes happen | Every loan and stock screen shows quantities, dates, and who acted |
| Survives poor connectivity | Visible online status, queued actions labelled as pending, no silent failures |
| Low-literacy friendly | Icons paired with every label, status shown as colour plus words, never colour alone |

---

## 2. Design Principles

1. **Show the number, not the concept.** "45 kg available" beats "Sufficient stock".
2. **Every action confirms or explains.** A tap either succeeds with a confirmation or fails with a reason.
3. **Colour never carries meaning alone.** Status is always colour plus text.
4. **Destructive actions ask twice.** Reject, deactivate, delete, and delete-confirm all require explicit confirmation.
5. **Queueable and non-queueable actions are visibly different.** Offline-capable buttons stay enabled; the rest explain why they are not.
6. **The record is the truth.** No screen shows a locally computed balance that contradicts the server.

---

## 3. Design System

### 3.1 Colour Tokens

| Token | Value | Use |
|---|---|---|
| --color-primary | #1F6B3B | Primary buttons, active nav, links |
| --color-primary-dark | #14472A | Pressed state, headings |
| --color-primary-soft | #E6F2EA | Selected rows, soft badges |
| --color-accent | #B4690E | Highlights, low-stock emphasis |
| --color-danger | #B3261E | Errors, rejection, destructive buttons |
| --color-warning | #8A6100 | Warnings, offline banner |
| --color-success | #1E7A46 | Confirmation, available status |
| --color-info | #1B5E8A | Informational notices |
| --color-surface | #FFFFFF | Cards, forms |
| --color-background | #F6F7F5 | Page background |
| --color-border | #D9DED7 | Dividers, input borders |
| --color-text | #1B1F1C | Body text |
| --color-text-muted | #5A635B | Labels, secondary text |

Contrast between --color-text and --color-surface is 14.5:1, and between --color-primary and white is 6.4:1, both above the 4.5:1 threshold.

Status colours are fixed so they mean the same thing everywhere:

| Status | Colour | Text |
|---|---|---|
| Available | #1E7A46 | Available |
| LowStock | #B4690E | Low stock |
| OutOfStock | #B3261E | Out of stock |
| Pending | #8A6100 | Pending |
| Validated | #1B5E8A | Validated |
| Approved | #1B5E8A | Approved |
| Issued | #1F6B3B | Issued |
| PartiallyReturned | #B4690E | Partially returned |
| Returned | #1E7A46 | Returned |
| Rejected | #B3261E | Rejected |

### 3.2 Typography

System font stack: `-apple-system, "Segoe UI", Roboto, sans-serif`.

| Token | Size / line height | Use |
|---|---|---|
| --text-xs | 12 / 16 | Badges, helper text |
| --text-sm | 14 / 20 | Labels, table cells |
| --text-base | 16 / 24 | Body, inputs |
| --text-lg | 20 / 28 | Card titles |
| --text-xl | 24 / 32 | Page titles |
| --text-2xl | 32 / 40 | Dashboard hero numbers |

### 3.3 Spacing, Radius, Elevation

- Spacing scale: 4, 8, 12, 16, 24, 32, 48.
- Radius: 6 for inputs and buttons, 10 for cards, 999 for pills.
- Elevation: one soft shadow on cards only. No shadow on flat list rows.

### 3.4 Breakpoints

| Name | Width | Layout |
|---|---|---|
| sm | up to 480 | Single column, bottom nav or hamburger sidebar |
| md | 481 to 768 | Single column with wider cards |
| lg | 769 to 1024 | Sidebar plus content |
| xl | above 1024 | Sidebar plus content, max content width 1100 |

### 3.5 Core Components

Button (primary, secondary, danger, ghost), Input (with label, helper, error), Select, NumberStepper for quantities, Badge for status, Card, Table with a card fallback below 480 px, Modal, ConfirmDialog, Loader, Skeleton, EmptyState, Toast, Pagination.

---

## 4. Information Architecture

### 4.1 Navigation Per Role

```mermaid
graph LR
    subgraph Farmer
      F1[Dashboard] --> F2[Seed Catalog]
      F2 --> F3[Availability]
      F1 --> F4[My Loans]
      F1 --> F5[Knowledge]
      F1 --> F6[Events]
      F1 --> F7[Ask a Question]
      F1 --> F8[Notifications]
      F1 --> F9[Profile]
    end