# Test Plan

## Automated checks

- Inventory status boundaries: available, low stock, and out of stock.
- Quality status boundaries: good, average, and poor.
- Frontend production compilation through Vite.
- JavaScript syntax checks for backend route files.

## Manual acceptance walkthrough

1. Log in as Farmer and submit a loan request.
2. Log in as Coordinator and validate, approve, then issue the request.
3. Record a partial and then full return.
4. Record a quality test and request expert review.
5. Log in as Agricultural Expert, add a recommendation, and answer a farmer question.
6. Log in as Administrator, create an event, draft an article, and manage an account.
7. Generate each report type and export it as CSV.
8. Disconnect the browser, queue a loan request, reconnect, and verify it is replayed once.
