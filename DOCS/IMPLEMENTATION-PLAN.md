# Implementation Plan: Mutual Fund Investor Onboarding & KYC Platform

## Version: 1.0
## Date: 2026-06-21

---

## Phase Overview

| Phase | Name | Duration | Dependencies |
|-------|------|----------|-------------|
| 0 | Foundation & Infrastructure | - | None |
| 1 | Auth Service + API Gateway | - | Phase 0 |
| 2 | Document Service | - | Phase 1 |
| 3 | KYC Service | - | Phase 1 + 2 |
| 4 | Admin Service | - | Phase 1 + 3 |
| 5 | Notification + Audit Services (Kafka Consumers) | - | Phase 1 + 3 |
| 6 | Frontend (Next.js) | - | Phase 1-5 |
| 7 | Integration, E2E Testing & Polish | - | Phase 6 |

---

## Phase 0 — Foundation & Infrastructure

### Goal
Set up the project skeleton, Docker infrastructure, shared configs, and tooling.

### Tasks

- [ ] 0.1 Create root project directory structure
- [ ] 0.2 Create `.gitignore` (node_modules, .env, .next, dist, coverage)
- [ ] 0.3 Create `.env.example` at root with all shared variables
- [ ] 0.4 Configure Docker Compose with all infrastructure services:
  - MongoDB 8 (port 27017)
  - MinIO (ports 9000, 9001)
  - Zookeeper (port 2181)
  - Kafka (ports 9092, 9093)
- [ ] 0.5 Create `init-kafka-topics.sh` to auto-create topics on Kafka startup
- [ ] 0.6 Set up shared ESLint + Prettier config at root
- [ ] 0.7 Create Docker network `mf-network` for inter-service communication

### Completion Checks

- [ ] `docker compose up` starts MongoDB, MinIO, Zookeeper, Kafka without errors
- [ ] Kafka topics `kyc.submitted`, `kyc.approved`, `kyc.rejected` exist
- [ ] MinIO web console accessible at `http://localhost:9001`
- [ ] MongoDB accessible at `mongodb://localhost:27017`
- [ ] ESLint runs without errors on an empty project

---

## Phase 1 — Auth Service + API Gateway

### Goal
Build user authentication (register, login, JWT) and the API Gateway that routes traffic to all services.

### Tasks

#### Auth Service

- [ ] 1.1 Create `services/auth-service/package.json` with dependencies:
  - express, mongoose, bcryptjs, jsonwebtoken, zod, dotenv, cors
  - **Dev:** jest, supertest, nodemon
- [ ] 1.2 Create `src/config/env.js` — load env vars using dotenv
- [ ] 1.3 Create `src/config/db.js` — Mongoose connect to `auth-db`
- [ ] 1.4 Create `src/models/User.js` — schema: name, email (unique), phone, password (bcrypt), role (user|admin), timestamps
- [ ] 1.5 Create `src/controllers/authController.js`:
  - `register` — validate with Zod, hash password, save user, return JWT
  - `login` — find by email, compare password, return JWT
  - `getMe` — return current user from JWT payload
  - `updateMe` — update name/phone
- [ ] 1.6 Create `src/routes/authRoutes.js` — wire POST /register, POST /login, GET /me, PUT /me
- [ ] 1.7 Create `src/middleware/authMiddleware.js` — verify JWT, attach `req.user`
- [ ] 1.8 Create `src/middleware/roleMiddleware.js` — restrict to admin role
- [ ] 1.9 Create `src/middleware/validate.js` — Zod validation middleware factory
- [ ] 1.10 Create `src/app.js` — Express app with CORS, JSON, routes, error handler
- [ ] 1.11 Create `src/seed.js` — script to seed an admin user (email: admin@kfintech.com)
- [ ] 1.12 Create `Dockerfile` — multi-stage: npm install, copy src, start with nodemon
- [ ] 1.13 Create `__tests__/auth.test.js`:
  - Register new user → 201 + token
  - Register duplicate email → 409
  - Login valid credentials → 200 + token
  - Login invalid password → 401
  - GET /me with valid token → 200
  - GET /me without token → 401

#### API Gateway

- [ ] 1.14 Create `api-gateway/package.json` with: express, http-proxy-middleware, express-rate-limit, cors, helmet
- [ ] 1.15 Create `src/middleware/rateLimiter.js` — 100 req/min per IP
- [ ] 1.16 Create `src/middleware/cors.js` — whitelist frontend origin
- [ ] 1.17 Create `src/routes/proxy.js` — map paths to services:
  - `/api/auth/*` → `http://auth-service:4001`
  - `/api/kyc/*` → `http://kyc-service:4002`
  - `/api/documents/*` → `http://document-service:4003`
  - `/api/admin/*` → `http://admin-service:4004`
  - `/api/notifications/*` → `http://notification-service:4005`
  - `/api/audit/*` → `http://audit-service:4006`
- [ ] 1.18 Create `src/server.js` — apply middleware, start on port 4000
- [ ] 1.19 Create `Dockerfile`
- [ ] 1.20 Create `__tests__/gateway.test.js`:
  - Rate limiter blocks after threshold
  - CORS headers present
  - Proxy forwards to correct target

### Completion Checks

- [ ] Auth Service: POST /api/auth/register returns 201 + JWT
- [ ] Auth Service: POST /api/auth/login returns 200 + JWT
- [ ] Auth Service: GET /api/auth/me returns user profile
- [ ] Auth Service: Duplicate registration returns 409
- [ ] Auth Service: All Jest tests pass (`npm test`)
- [ ] API Gateway: Routes `/api/auth/login` to Auth Service correctly
- [ ] API Gateway: Rate limiter rejects after 100 requests/min with 429
- [ ] API Gateway: All Jest tests pass

---

## Phase 2 — Document Service

### Goal
Build file upload to MinIO/S3, pre-signed URL generation, and document metadata storage.

### Tasks

- [ ] 2.1 Create `services/document-service/package.json` with:
  - express, mongoose, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, multer, sharp, uuid, zod, dotenv, cors
  - **Dev:** jest, supertest, nodemon
- [ ] 2.2 Create `src/config/env.js` — S3_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME, AWS_REGION
- [ ] 2.3 Create `src/config/db.js` — connect to `doc-db`
- [ ] 2.4 Create `src/config/s3.js` — initialize S3 client (points to MinIO in dev)
- [ ] 2.5 Create `src/models/Document.js` — schema: userId, kycId, type (pan_card|aadhaar_card|signature|photo), originalName, mimeType, sizeBytes, s3Key, thumbnailS3Key, uploadedAt
- [ ] 2.6 Create `src/services/s3Service.js`:
  - `uploadFile(buffer, key, mimetype)` — upload to S3/MinIO
  - `getPresignedUrl(key)` — generate 5-min pre-signed GET URL
  - `deleteFile(key)` — remove from S3
- [ ] 2.7 Create `src/services/imageService.js`:
  - `compressImage(buffer)` — compress JPEG/PNG if >2MB (Sharp)
  - `generateThumbnail(buffer)` — resize to 200px width
- [ ] 2.8 Create `src/controllers/documentController.js`:
  - `upload` — validate file type (JPG/PNG/PDF, max 5MB), upload to S3, generate thumbnail, save metadata
  - `listByKyc` — return all documents for a KYC ID
  - `viewDocument` — return pre-signed URL
  - `deleteDocument` — remove from S3 and DB
- [ ] 2.9 Create `src/routes/documentRoutes.js`
- [ ] 2.10 Create `src/middleware/upload.js` — Multer config for memory storage, file filter, size limit
- [ ] 2.11 Create `src/app.js`
- [ ] 2.12 Create `Dockerfile`
- [ ] 2.13 Create `__tests__/document.test.js`:
  - Upload valid file → 201 + metadata
  - Upload oversized file → 413
  - Upload invalid type → 400
  - List documents by KYC → 200 + array
  - Get pre-signed URL → 200 + URL string

### Completion Checks

- [ ] File upload to MinIO succeeds, document metadata saved in MongoDB
- [ ] Pre-signed URL is generated and accessible for 5 minutes
- [ ] Thumbnail generated for uploaded images
- [ ] Oversized files (>5MB) rejected with 413
- [ ] Invalid file types rejected with 400
- [ ] All Jest tests pass

---

## Phase 3 — KYC Service

### Goal
Build PAN validation, OCR-based text extraction, eKYC OTP simulation, and Kafka event publishing.

### Tasks

- [ ] 3.1 Create `services/kyc-service/package.json` with:
  - express, mongoose, tesseract.js, validator, kafkajs, zod, dotenv, cors
  - **Dev:** jest, supertest, nodemon
- [ ] 3.2 Create `src/config/env.js`, `src/config/db.js` (kyc-db), `src/config/kafka.js` (producer)
- [ ] 3.3 Create `src/models/KycApplication.js` — schema: userId, pan, panVerified, aadhaarLast4, ocrData (extractedPan, extractedName, confidence, rawText), status (draft|pending|approved|rejected), adminId, adminRemarks, submittedAt, reviewedAt
- [ ] 3.4 Create `src/services/panValidator.js`:
  - `validatePanFormat(pan)` — regex check: 5 uppercase + 4 digits + 1 uppercase
  - `validatePanChecksum(pan)` — character-weighted checksum algorithm
- [ ] 3.5 Create `src/services/panOcr.js`:
  - `extractPanFromImage(imageBuffer)` — run Tesseract.js, parse PAN text
  - `comparePan(userPan, ocrPan)` — flag mismatch if confidence > threshold
- [ ] 3.6 Create `src/services/eKYC.js`:
  - `sendOtp(phone)` — mock: return static OTP `123456`
  - `verifyOtp(phone, otp)` — mock: accept `123456`
- [ ] 3.7 Create `src/services/kafkaProducer.js`:
  - `publishKycSubmitted(kycId, userId)` — produce to `kyc.submitted`
  - `publishKycApproved(kycId, userId, adminId)` — (reserved for Admin Service)
  - `publishKycRejected(kycId, userId, adminId, reason)` — (reserved for Admin Service)
- [ ] 3.8 Create `src/controllers/kycController.js`:
  - `submit` — validate PAN, store KYC as draft, trigger OCR (async), update status to pending, publish `kyc.submitted` event
  - `getStatus` — return user's KYC application with status
  - `verifyOtp` — accept mock OTP, update aadhaarLast4
- [ ] 3.9 Create `src/routes/kycRoutes.js`
- [ ] 3.10 Create `src/app.js`
- [ ] 3.11 Create `Dockerfile`
- [ ] 3.12 Create `__tests__/kyc.test.js`:
  - Submit KYC with valid PAN → 201 + pending status
  - Submit KYC with invalid PAN format → 400
  - Submit KYC with failed checksum → 400
  - Get KYC status → 200 + application data
  - Verify OTP with correct code → 200
  - Verify OTP with wrong code → 400
  - Kafka event published on submission (mock producer)

### Completion Checks

- [ ] PAN format validation passes/fails correctly
- [ ] PAN checksum algorithm validates correctly
- [ ] Tesseract.js extracts text from PAN card image
- [ ] OCR mismatches flagged when confidence is high
- [ ] KYC submission sets status to `pending`
- [ ] Kafka `kyc.submitted` event produced on submission
- [ ] Mock eKYC OTP verification works (accepts `123456`)
- [ ] All Jest tests pass

---

## Phase 4 — Admin Service

### Goal
Build admin review dashboard APIs: list KYC applications, view details, approve/reject with Kafka events.

### Tasks

- [ ] 4.1 Create `services/admin-service/package.json` with:
  - express, mongoose, kafkajs, zod, dotenv, cors
  - **Dev:** jest, supertest, nodemon
- [ ] 4.2 Create `src/config/env.js`, `src/config/db.js` (admin-db), `src/config/kafka.js`
- [ ] 4.3 Create `src/models/AdminAction.js` — schema: kycId, adminId, action (approved|rejected), remarks, createdAt
- [ ] 4.4 Create `src/services/kafkaProducer.js`:
  - `publishKycApproved(kycId, userId, adminId)`
  - `publishKycRejected(kycId, userId, adminId, reason)`
- [ ] 4.5 Create `src/controllers/adminController.js`:
  - `listKyc` — GET all KYC applications (paginated, filterable by status), fetch from KYC Service via HTTP
  - `getKycDetail` — GET single KYC + documents (call KYC + Document services)
  - `approveKyc` — POST: update status to approved, log AdminAction, publish `kyc.approved` + audit event
  - `rejectKyc` — POST: update status to rejected with remarks, log AdminAction, publish `kyc.rejected` + audit event
  - `getStats` — GET counts by status (total, pending, approved, rejected)
- [ ] 4.6 Create `src/routes/adminRoutes.js`
- [ ] 4.7 Create `src/app.js`
- [ ] 4.8 Create `Dockerfile`
- [ ] 4.9 Create `__tests__/admin.test.js`:
  - List KYC returns paginated results
  - Approve KYC changes status + produces Kafka event
  - Reject KYC with remarks changes status + produces Kafka event
  - Reject KYC without remarks → 400
  - Stats return correct counts

### Completion Checks

- [ ] Admin can list all KYC applications with pagination
- [ ] Admin can filter by status (pending, approved, rejected)
- [ ] Admin can view single KYC detail with user + documents
- [ ] Approve KYC → status changes to `approved`, Kafka `kyc.approved` produced
- [ ] Reject KYC → status changes to `rejected`, Kafka `kyc.rejected` produced
- [ ] Rejection requires mandatory reason
- [ ] Stats endpoint returns correct aggregate counts
- [ ] All Jest tests pass

---

## Phase 5 — Notification + Audit Services (Kafka Consumers)

### Goal
Build Kafka consumer services: Notification (in-app + email) and Audit (immutable log).

### Tasks

#### Notification Service

- [ ] 5.1 Create `services/notification-service/package.json` with:
  - express, mongoose, kafkajs, nodemailer, zod, dotenv, cors
  - **Dev:** jest, supertest, nodemon
- [ ] 5.2 Create `src/config/env.js`, `src/config/db.js` (notif-db), `src/config/kafka.js`
- [ ] 5.3 Create `src/models/Notification.js` — schema: userId, type (kyc_approved|kyc_rejected|kyc_pending|general), title, message, read (default false), createdAt
- [ ] 5.4 Create `src/consumers/kycConsumer.js`:
  - Subscribe to `kyc.approved`, `kyc.rejected`, `kyc.submitted`
  - On `kyc.approved` → create in-app notification + send email via nodemailer
  - On `kyc.rejected` → create in-app notification + send email with reason
  - On `kyc.submitted` → create in-app notification
- [ ] 5.5 Create `src/services/emailService.js`:
  - `sendEmail(to, subject, body)` — nodemailer transporter (SMTP env vars)
- [ ] 5.6 Create `src/controllers/notificationController.js`:
  - `listNotifications` — GET user's notifications (paginated)
  - `markAsRead` — PUT mark single notification read
  - `unreadCount` — GET count of unread
- [ ] 5.7 Create `src/routes/notificationRoutes.js`
- [ ] 5.8 Create `src/app.js`
- [ ] 5.9 Create `Dockerfile`
- [ ] 5.10 Create `__tests__/notification.test.js`:
  - Consumer creates notification on kyc.approved event
  - List notifications returns user's notifications
  - Mark as read updates the flag
  - Unread count returns correct number

#### Audit Service

- [ ] 5.11 Create `services/audit-service/package.json` with:
  - express, mongoose, kafkajs, zod, dotenv, cors
  - **Dev:** jest, supertest, nodemon
- [ ] 5.12 Create `src/config/env.js`, `src/config/db.js` (audit-db), `src/config/kafka.js`
- [ ] 5.13 Create `src/models/AuditEntry.js` — schema: actorId, actorRole (user|admin|system), action, resourceType, resourceId, details (Mixed), ipAddress, userAgent, timestamp (indexed)
- [ ] 5.14 Create `src/consumers/auditConsumer.js`:
  - Subscribe to ALL kyc.* topics
  - For each event, create an immutable AuditEntry (append-only, no delete/update)
- [ ] 5.15 Create `src/controllers/auditController.js`:
  - `getAuditTrail` — GET audit entries for resourceType + resourceId
- [ ] 5.16 Create `src/routes/auditRoutes.js`
- [ ] 5.17 Create `src/app.js`
- [ ] 5.18 Create `Dockerfile`
- [ ] 5.19 Create `__tests__/audit.test.js`:
  - Consumer creates audit entry on kyc event
  - Audit trail filterable by resourceType + resourceId
  - Audit entries are read-only (no update endpoint)

### Completion Checks

- [ ] Notification consumer creates in-app notification on Kafka events
- [ ] Email sent on approval/rejection (via nodemailer mock in tests)
- [ ] User can list, mark read, and view unread count
- [ ] Audit consumer logs every kyc event as immutable entry
- [ ] Admin can view audit trail for any KYC
- [ ] Audit entries cannot be modified or deleted (no PUT/DELETE routes)
- [ ] All Jest tests pass for both services

---

## Phase 6 — Frontend (Next.js)

### Goal
Build the Next.js application with authentication, user dashboard, document upload, and admin panel.

### Tasks

#### Project Setup

- [ ] 6.1 Initialize Next.js app in `frontend/` with App Router
- [ ] 6.2 Install dependencies: next, react, react-dom, @reduxjs/toolkit, react-redux, @tanstack/react-query, axios, tailwindcss, react-dropzone, react-hot-toast, date-fns, react-icons, recharts
- [ ] 6.3 **Dev dependencies:** jest, @testing-library/react, @testing-library/jest-dom
- [ ] 6.4 Configure `next.config.js` with API proxy rewrites to gateway at `http://localhost:4000`
- [ ] 6.5 Configure `tailwind.config.js`
- [ ] 6.6 Create `jest.config.js` for Next.js testing
- [ ] 6.7 Create root `app/layout.js` with Tailwind globals, metadata, font loading
- [ ] 6.8 Create `app/globals.css` with Tailwind directives

#### Redux Store Setup

- [ ] 6.9 Create `lib/store/store.js` — configureStore with authSlice + appSlice
- [ ] 6.10 Create `lib/store/authSlice.js` — user, token, isAuthenticated state + reducers (login, logout, setUser)
- [ ] 6.11 Create `lib/store/appSlice.js` — loading, theme, sidebar state

#### TanStack Query Setup

- [ ] 6.12 Create `lib/providers.js` — QueryClientProvider + Provider wrapper for root layout
- [ ] 6.13 Create `lib/api.js` — Axios instance with base URL, JWT interceptor (attach token from Redux store)

#### Query Hooks

- [ ] 6.14 Create `lib/queries/useAuth.js` — useMutation for login/register, useQuery for /me
- [ ] 6.15 Create `lib/queries/useKyc.js` — useQuery for KYC status, useMutation for submit + verifyOtp
- [ ] 6.16 Create `lib/queries/useDocuments.js` — useQuery for document list, useMutation for upload
- [ ] 6.17 Create `lib/queries/useNotifications.js` — useQuery for notification list, useMutation for mark read
- [ ] 6.18 Create `lib/queries/useAdmin.js` — useQuery for KYC list + stats, useMutation for approve/reject

#### Auth Pages (Client Components)

- [ ] 6.19 Create `app/(auth)/login/page.js` — login form, dispatches Redux auth action + TanStack mutation
- [ ] 6.20 Create `app/(auth)/register/page.js` — registration form, redirects to login on success
- [ ] 6.21 Create `components/layout/Navbar.js` — reads user from Redux store, logout dispatches

#### User Dashboard

- [ ] 6.22 Create `app/(dashboard)/layout.js` — authenticated layout with Navbar, reads auth from Redux store
- [ ] 6.23 Create `app/(dashboard)/page.js` — KYC status via useKyc() query, action buttons, notifications via useNotifications()
- [ ] 6.24 Create `components/forms/KycForm.js` — PAN input + document upload (react-dropzone), uses TanStack mutation
- [ ] 6.25 Create `components/forms/OtpVerification.js` — mock OTP input, uses useKyc mutation
- [ ] 6.26 Create `components/ui/StatusBadge.js` — color-coded status chip

#### Document Upload

- [ ] 6.27 Create `components/forms/FileUpload.js` — drag-and-drop zone, progress bar, file preview
- [ ] 6.28 Create `app/(dashboard)/documents/page.js` — uploaded documents list via useDocuments(), view (pre-signed URL) and delete

#### Admin Panel

- [ ] 6.29 Create `app/admin/layout.js` — admin sidebar layout, role check from Redux store
- [ ] 6.30 Create `app/admin/dashboard/page.js` — stats cards via useAdmin().stats query, chart (recharts)
- [ ] 6.31 Create `app/admin/kyc/page.js` — KYC list table via useAdmin().list query, status filter, pagination
- [ ] 6.32 Create `app/admin/kyc/[id]/page.js` — KYC detail: user info, documents side-by-side, OCR results, approve/reject via useAdmin mutation
- [ ] 6.33 Create `components/admin/ApproveModal.js` — confirmation + optional remarks
- [ ] 6.34 Create `components/admin/RejectModal.js` — mandatory reason textarea
- [ ] 6.35 Create `components/admin/KycTable.js` — sortable, filterable table

#### Testing

- [ ] 6.36 Create `__tests__/LoginPage.test.js` — renders login form, submits credentials
- [ ] 6.37 Create `__tests__/KycForm.test.js` — validates PAN input, simulates file upload
- [ ] 6.38 Create `__tests__/AdminDashboard.test.js` — renders stats, simulates approve/reject

### Completion Checks

- [ ] User can register, login, and see JWT stored in Redux store
- [ ] User can submit PAN and upload documents (TanStack mutations invalidate queries)
- [ ] User can view KYC status and notifications via TanStack queries
- [ ] Admin can log in, see dashboard stats, list KYC, approve/reject (cache auto-refreshes)
- [ ] Admin can view user documents via pre-signed URLs
- [ ] Responsive UI works on desktop and mobile
- [ ] All Jest + Testing Library tests pass

---

## Phase 7 — Integration, E2E Testing & Polish

### Goal
End-to-end testing, error handling hardening, Docker Compose integration, and production readiness.

### Tasks

- [ ] 7.1 Create end-to-end test script using Jest + Supertest:
  - Register user → login → submit KYC → upload document → admin login → review → approve/ reject → verify notification + audit trail
- [ ] 7.2 Add centralized error handling middleware to all services (consistent error response format)
- [ ] 7.3 Add request logging (morgan) to all services
- [ ] 7.4 Add health check endpoints (`GET /health`) to all services
- [ ] 7.5 Add graceful shutdown handling (SIGTERM, disconnect MongoDB, close Kafka producer/consumer)
- [ ] 7.6 Update Docker Compose to include all microservices:
  - api-gateway, auth-service, kyc-service, document-service, admin-service, notification-service, audit-service, frontend
- [ ] 7.7 Add `depends_on` with health checks for all services
- [ ] 7.8 Verify full Docker Compose startup — all services healthy
- [ ] 7.9 Verify end-to-end flow via Docker: register → login → KYC submit → admin approve → notification
- [ ] 7.10 Add `AGENTS.md` with development commands reference

### Completion Checks

- [ ] E2E test passes: full user → admin → notification flow
- [ ] All services return consistent JSON error format
- [ ] Health endpoints return 200 for every service
- [ ] Docker Compose starts all 10 services (7 backend + MongoDB + Kafka + MinIO + Frontend)
- [ ] Full flow works end-to-end in Docker
- [ ] Graceful shutdown: no connection leaks on SIGTERM

---

## Test Strategy Summary

### Unit Tests (Jest)

| Service | Test Focus | Key Files |
|---------|-----------|-----------|
| Auth Service | Registration, login, JWT, duplicate email | `__tests__/auth.test.js` |
| KYC Service | PAN validation, checksum, OCR, OTP, Kafka event | `__tests__/kyc.test.js` |
| Document Service | Upload, pre-signed URL, file validation, thumbnails | `__tests__/document.test.js` |
| Admin Service | List, approve, reject, stats, Kafka events | `__tests__/admin.test.js` |
| Notification Service | Consumer, CRUD, unread count | `__tests__/notification.test.js` |
| Audit Service | Consumer, immutable log, query | `__tests__/audit.test.js` |
| API Gateway | Rate limit, CORS, proxy routing | `__tests__/gateway.test.js` |
| Frontend | Login form, KYC form, admin dashboard | `__tests__/*.test.js` |

### Integration Tests

| Scope | What It Tests |
|-------|---------------|
| Per service | Controller → Model → DB round-trip (using in-memory MongoDB or test DB) |
| Gateway → Service | Proxy routing and header passthrough |
| Kafka pipeline | Producer → Consumer → DB for Notification and Audit |

### E2E Test (Phase 7)

Tests the complete journey: register → login → KYC submit → document upload → admin list → admin approve → notification received → audit logged.

---

## Notes

- **No coding without instruction**: Each phase is activated only when explicitly asked
- **Jest config**: Each service has its own `jest.config.js` or Jest config in `package.json`
- **Mock external services**: Kafka producer/consumer mocked in unit tests; real Kafka used in integration
- **Test DB**: Use `mongodb-memory-server` for isolated unit test databases, or a shared `test-` database

## Code Verification

After each phase is written, before marking it complete, I will ask you which verification method you prefer:

| Method | What It Checks | Requires |
|--------|---------------|----------|
| **Normal run check** | Full API tests, DB connectivity, Docker health | Free ports, running Docker |
| **Offline check (suggested)** | `node --check` (syntax), `npx eslint` (lint), `npx jest` (mocked unit tests) | No ports, no Docker |

You can also choose **both** — offline first for quick feedback, then full run check later when ports are free.
