# Local Setup

## Requirements

- Node.js 18 or later
- npm 9 or later

## Start the application

From `backend`, install packages, create the local database, and start the API:

```powershell
npm install
npm run seed
npm start
```

From `frontend`, install packages and start Vite:

```powershell
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Verification

```powershell
cd backend
npm test

cd ../frontend
npm run build
```

## Demo accounts

| Role | Mobile | Password |
|---|---|---|
| Administrator | 9000000001 | Admin@123 |
| Coordinator | 9000000002 | Coord@123 |
| Agricultural Expert | 9000000003 | Expert@123 |
| Farmer | 9000000004 | Farmer@123 |
