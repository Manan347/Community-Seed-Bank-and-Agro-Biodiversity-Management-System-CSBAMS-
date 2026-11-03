# API Endpoints

All API responses use `{ success, data, error, message }` and the base path is `/api`.

| Area | Route group | Main operations |
|---|---|---|
| Authentication | `/auth` | Register, password login, OTP request and verification, current user |
| User accounts | `/users` | Profile, password, account list, activation state |
| Seeds and stock | `/seeds`, `/inventory` | Varieties, availability, stock movement, ledger |
| Quality | `/quality-tests` | Record tests, request expert review, recommendations |
| Loans and returns | `/loans`, `/returns` | Request, validate, approve, issue, return |
| Community content | `/queries`, `/events`, `/articles` | Questions, events, knowledge articles |
| Information | `/notifications`, `/reports` | Notifications, on-screen reports, CSV export |
| Offline sync | `/sync/replay` | Idempotent replay of queued loan requests |

Role checks run on the server for every protected operation. The exact endpoint contract is in `PROJECT.md`, section 9.
