# BYNDIO Marketplace

Frontend: React + Vite  
Backend: Node.js + Express (`server/`)

## Run

Install:

```bash
npm install
```

Start frontend:

```bash
npm run dev
```

Start backend API:

```bash
npm run dev:api
```

Build frontend:

```bash
npm run build
```

Backend base URL: `http://localhost:4000/api`

## Seed Accounts

- Admin: `admin@byndio.local` / `Admin@123`
- Seller (Hyderabad): `seller-hyd@byndio.local` / `Seller@123`
- Seller (Mumbai): `seller-mum@byndio.local` / `Seller@123`
- Seller (Pune): `seller-pune@byndio.local` / `Seller@123`

## Backend Coverage (Requirements)

### 1) Location-Based Delivery

- `GET /location/resolve?lat=...&lng=...` (auto detect)
- `GET /location/search?q=...` and `POST /location/manual` (manual fallback)
- `POST /location/serviceability` (city/pincode service check)

### 2) Catalog + Dynamic Homepage Feed

- `GET /catalog/categories` (root + subcategory structure)
- `GET /catalog/products` (category, subcategory, location, tag, local-only, price, sort)
- `GET /catalog/feed` (top menu, active categories, active offers, active drops)
- `GET /catalog/offers`, `GET /catalog/drop-schedules`

### 3) Rewards + Referral Engine

- `GET /rewards/wallet`, `GET /rewards/history`, `GET /rewards/referral`
- `POST /rewards/daily-login`, `POST /rewards/profile-complete`
- `POST /rewards/redeem-preview`
- Signup/first purchase referral bonuses with anti-abuse checks

### 4) Email Verification / OTP

- `POST /verification/otp/request`
- `POST /verification/otp/verify`
- `GET /verification/otp/history`

### 5) Payments + Checkout

- `POST /payments/intents`
- `POST /payments/intents/:intentId/confirm`
- `GET /payments/intents/mine`
- `POST /orders/preview`
- `POST /orders` (supports payment intent for non-COD)

### 6) Seller Flow (Phase 1)

- Draft save: `POST /seller/onboarding/draft`
- Final submit: `POST /seller/onboarding/submit` (and legacy `POST /seller/onboarding`)
- View onboarding: `GET /seller/onboarding/me`
- Seller docs / verification uploads: `POST /seller/documents`, `GET /seller/documents`
- Seller dashboard with RTO metrics: `GET /seller/dashboard`

### 7) Seller Operations + Returns/Refunds

- Seller pre-shipping verification image: `POST /orders/:orderId/seller-verification`
- Seller/admin order status update: `PATCH /orders/:orderId/status`
- Buyer return request: `POST /returns/request`, `GET /returns/mine`
- Seller/admin return handling: `GET /returns/seller`, `PATCH /returns/:returnId/status`
- Buyer refund visibility: `GET /returns/refunds/mine`

### 8) Seller Training + Support

- Courses: `GET /training/courses`
- Subscribe/cancel/list subscriptions:
  - `POST /training/subscriptions`
  - `POST /training/subscriptions/:subscriptionId/cancel`
  - `GET /training/subscriptions/me`
- Support tickets:
  - `POST /support/tickets`
  - `GET /support/tickets/mine`
  - `GET /support/tickets` (seller/admin)
  - `PATCH /support/tickets/:ticketId` (seller/admin)

### 9) Admin Content + Compliance Ops

- Category CRUD:
  - `GET /admin/categories`
  - `POST /admin/categories`
  - `PATCH /admin/categories/:categoryId`
  - `DELETE /admin/categories/:categoryId`
- Offer CRUD:
  - `GET /admin/offers`
  - `POST /admin/offers`
  - `PATCH /admin/offers/:offerId`
  - `DELETE /admin/offers/:offerId`
- Drop schedule CRUD:
  - `GET /admin/drop-schedules`
  - `POST /admin/drop-schedules`
  - `PATCH /admin/drop-schedules/:dropId`
  - `DELETE /admin/drop-schedules/:dropId`
- Fraud + audit + jobs:
  - `GET /admin/fraud-flags`
  - `POST /admin/fraud-flags/:flagId/resolve`
  - `GET /admin/audit-logs`
  - `POST /admin/jobs/run` (`points_expiry`, `offer_activation`, `drop_scheduler`, `referral_fraud_scan`, `all`)
  - `GET /admin/jobs/status`

## Business Rules Enforced

- Rewards:
  - `1 point / Rs 50` purchase
  - Signup bonus `+50`
  - Profile completion `+5` one-time
  - Daily login `+1` max once/day
- Redemption:
  - `100 points = Rs 10`
  - Minimum redeem `100 points`
  - Max redeem `15%` of order value
  - Points expiry scheduler (30-day window)
- Referrals:
  - Signup rewards processed after email verification
  - First purchase bonus supported
  - Device/IP anti-abuse checks + fraud flagging
- Seller onboarding:
  - Non-GST -> state-only
  - GST format validation + all-India eligibility
  - Legal declaration + responsibilities acceptance mandatory
- Returns/refunds:
  - Request window limited to 7 days
  - Allowed reasons only: damaged / wrong item / quality issue
  - Lifecycle includes pickup -> seller verification -> refund initiation/completion

## Notes

- DB auto-migrates to schema v2 on startup (`server/data/migrate.js`).
- Runtime DB file: `server/data/db.json` (gitignored).
