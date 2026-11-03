# CSBAMS Expected Demonstration Script

This script provides a step-by-step walkthrough of the expected demonstration as outlined in Section 16 of the project specifications.

### Preparation
1. Ensure the application is stopped.
2. From the `backend/` directory, run:
   ```bash
   npm run migrate
   npm run seed
   npm start
   ```
3. From the `frontend/` directory, run:
   ```bash
   npm run dev
   ```
4. Open the application in your browser (typically `http://localhost:5173`).

### The Demonstration

**Step 1: Farmer Loan Request**
1. Log in as the Farmer (Mobile: `9000000004`, Password: `Farmer@123`).
2. Navigate to **Seed Catalog** (`/seeds`). Observe the available varieties and their stock levels.
3. Navigate to **My Loans** (`/loans`).
4. Click **+ Request loan**, select a seed variety, enter a quantity (e.g., 5 kg), and submit.
5. Sign out.

**Step 2: Coordinator Loan Processing**
1. Log in as the Coordinator (Mobile: `9000000002`, Password: `Coord@123`).
2. Navigate to **Loan Queue**. Locate the Farmer's pending request.
3. Click **Validate**. The status changes to *Validated*.
4. Click **Approve**. The status changes to *Approved*.
5. Click **Issue**. The status changes to *Issued*.
6. Navigate to the **Stock Manager** (`/stock`) and switch to the **Stock Ledger** tab. 
7. Observe that the ledger has recorded a reduction in stock with the loan ID listed as the reason.
8. Sign out.

**Step 3: Farmer Q&A**
1. Log in as the Farmer (`9000000004`).
2. Navigate to **My Loans**. Observe that the loan status now shows *Issued*.
3. Navigate to **Ask a Question** (`/queries`).
4. Click **+ Ask a question**. Enter: *"When should I return this seed?"* and submit.
5. Sign out.

**Step 4: Expert Response**
1. Log in as the Agricultural Expert (Mobile: `9000000003`, Password: `Expert@123`).
2. Navigate to **Farmer Queries** (`/queries`).
3. Locate the open query. Click **Respond**, enter an answer (e.g., *"After the next harvest."*), and submit.
4. Sign out.

**Step 5: Coordinator Returns and Reporting**
1. Log in as the Coordinator (`9000000002`).
2. Navigate to **Returns** (`/returns`).
3. Click **+ Record return**. Select the issued loan and record a full return of the quantity issued.
4. Navigate to the **Stock Manager** and view the **Stock Ledger**. Observe the addition to the stock with the return ID as the reason.
5. Navigate to **Reports** (`/reports`).
6. Select **Loan & Return Summary** from the report type dropdown and click **Apply filters**.
7. Observe that the report reflects the completed loan and return cycle.
8. (Optional) Click **⬇ Export CSV** to download the report and verify the contents.

### Conclusion
This concludes the core workflow demonstration of the CSBAMS platform. All requirements in Section 16 have been successfully demonstrated using purely local, offline-capable technology without any manual database edits.
