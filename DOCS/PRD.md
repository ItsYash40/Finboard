# Product Requirements Document: Mutual Fund Investor Onboarding & KYC Platform

## Version: 1.0
## Status: Draft
## Date: 2026-06-21

---

## 1. Executive Summary

A fully digital Mutual Fund investor onboarding and KYC verification platform built on a **microservices architecture**. The platform handles the complete lifecycle — from user registration through document submission, OCR-based data extraction, admin verification, and status notification — mirroring production-grade systems used by RTAs (Registrar & Transfer Agents) and AMCs (Asset Management Companies) across India.

---

## 2. Architecture Overview

### 2.1 Microservices Breakdown

```
┌─────────────────────────────────────────────────────────┐
│                     API Gateway                         │
│              (Express - Reverse Proxy)                   │
└──┬──────┬──────┬──────┬──────┬──────┬──────────────────┘
   │      │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼      ▼
┌─────┐┌─────┐┌─────┐┌──────┐┌─────┐┌──────────┐
│Auth ││ KYC ││Admin││Notif ││Audit││ Document │
│Svc  ││ Svc ││ Svc ││ Svc  ││ Svc ││ Svc      │
└─────┘└─────┘└─────┘└──────┘└─────┘└──────────┘
   │      │      │       │       │       │
   └──────┴──────┴───────┴───────┴───────┘
                    │
                    ▼
            ┌──────────────┐
            │   MongoDB    │
            │  (per-svc    │
            │   or shared) │
            └──────────────┘
```

### 2.2 Service Definitions

| Service | Responsibility | Database | Port |
|---------|---------------|----------|------|
| **API Gateway** | Route requests, rate-limit, authenticate tokens | None | 4000 |
| **Auth Service** | Register, login, JWT issue/verify, user CRUD | `auth-db` | 4001 |
| **KYC Service** | PAN validation, eKYC initiation, OCR pipeline | `kyc-db` | 4002 |
| **Document Service** | File upload to S3, retrieval, image processing | `doc-db` | 4003 |
| **Admin Service** | Review queue, approve/reject, dashboard data | `admin-db` | 4004 |
| **Notification Service** | In-app + email notifications | `notif-db` | 4005 |
| **Audit Service** | Immutable audit trail for all actions | `audit-db` | 4006 |

---

## 3. Functional Requirements

### 3.1 Auth Service

| ID | Requirement | Priority |
|----|------------|----------|
| AUTH-01 | User shall register with name, email, phone, password | P0 |
| AUTH-02 | User shall log in with email + password | P0 |
| AUTH-03 | System shall issue JWT access tokens on login | P0 |
| AUTH-04 | System shall verify JWT on protected routes | P0 |
| AUTH-05 | User shall reset password via email OTP | P1 |
| AUTH-06 | Admin users shall be seeded with a special role | P0 |

### 3.2 KYC Service

| ID | Requirement | Priority |
|----|------------|----------|
| KYC-01 | User shall submit PAN number; system shall validate format (5 chars + 4 digits + 1 char) | P0 |
| KYC-02 | System shall verify PAN against a checksum algorithm | P0 |
| KYC-03 | User shall upload PAN card image (JPG/PNG, max 5MB) | P0 |
| KYC-04 | User shall upload Aadhaar card image (JPG/PNG, max 5MB) | P0 |
| KYC-05 | System shall extract PAN text from image using OCR (Tesseract.js) | P1 |
| KYC-06 | System shall compare OCR-extracted PAN with user-entered PAN and flag mismatches | P1 |
| KYC-07 | User shall complete eKYC via OTP simulation (mock Aadhaar OTP) | P1 |
| KYC-08 | KYC submission shall be a single atomic transaction | P0 |

### 3.3 Document Service

| ID | Requirement | Priority |
|----|------------|----------|
| DOC-01 | System shall upload files to AWS S3 with UUID-based keys | P0 |
| DOC-02 | System shall generate pre-signed URLs for secure document viewing | P0 |
| DOC-03 | System shall validate file type and size before upload | P0 |
| DOC-04 | System shall compress images >2MB before upload | P1 |
| DOC-05 | System shall store document metadata (original name, size, type, S3 key) | P0 |
| DOC-06 | Admin shall be able to view document thumbnails | P1 |

### 3.4 Admin Service

| ID | Requirement | Priority |
|----|------------|----------|
| ADM-01 | Admin dashboard shall display all KYC applications paginated | P0 |
| ADM-02 | Admin shall filter by status: pending, approved, rejected | P0 |
| ADM-03 | Admin shall view user details + uploaded documents side by side | P0 |
| ADM-04 | Admin shall approve a KYC application with one click | P0 |
| ADM-05 | Admin shall reject with a mandatory reason/remarks | P0 |
| ADM-06 | Admin dashboard shall show real-time stats (total, pending, approved, rejected) | P1 |
| ADM-07 | Admin shall view OCR extraction results alongside document | P1 |

### 3.5 Notification Service

| ID | Requirement | Priority |
|----|------------|----------|
| NOT-01 | User shall receive an in-app notification when KYC is approved | P0 |
| NOT-02 | User shall receive an in-app notification when KYC is rejected (with reason) | P0 |
| NOT-03 | User shall receive an email notification on status change | P1 |
| NOT-04 | User shall see a notification history on their dashboard | P1 |

### 3.6 Audit Service

| ID | Requirement | Priority |
|----|------------|----------|
| AUD-01 | Every state change shall be logged with actor, action, timestamp | P0 |
| AUD-02 | Audit log shall be append-only and immutable | P0 |
| AUD-03 | Admin shall view audit trail for any user's KYC journey | P0 |
| AUD-04 | Audit entries shall include IP address and user-agent | P1 |

---

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|----|------------|--------|
| NFR-01 | API response time (p95) | < 500ms |
| NFR-02 | Document upload time (p95, <5MB) | < 3s |
| NFR-03 | System uptime | 99.5% |
| NFR-04 | Concurrent users supported | 1000 |
| NFR-05 | Each service shall be independently deployable | Yes |
| NFR-06 | Inter-service communication via HTTP REST (synchronous) + message queue (async) | Yes |
| NFR-07 | All secrets in environment variables, never in code | Yes |
| NFR-08 | Containerized via Docker, orchestrated via Docker Compose | Yes |

---

## 5. Data Models

### 5.1 Auth Service — User

```json
{
  "id": "ObjectId",
  "name": "string",
  "email": "string (unique, indexed)",
  "phone": "string",
  "password": "string (bcrypt hashed)",
  "role": "enum: user | admin",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 5.2 KYC Service — KYC Application

```json
{
  "id": "ObjectId",
  "userId": "ObjectId (ref Auth User)",
  "pan": "string (10 chars)",
  "panVerified": "boolean",
  "aadhaarLast4": "string",
  "ocrData": {
    "extractedPan": "string",
    "extractedName": "string",
    "confidence": "number",
    "rawText": "string"
  },
  "status": "enum: draft | pending | approved | rejected",
  "adminId": "ObjectId (nullable)",
  "adminRemarks": "string",
  "submittedAt": "ISODate",
  "reviewedAt": "ISODate"
}
```

### 5.3 Document Service — Document Metadata

```json
{
  "id": "ObjectId",
  "userId": "ObjectId",
  "kycId": "ObjectId",
  "type": "enum: pan_card | aadhaar_card | signature | photo",
  "originalName": "string",
  "mimeType": "string",
  "sizeBytes": "number",
  "s3Key": "string",
  "thumbnailS3Key": "string (nullable)",
  "uploadedAt": "ISODate"
}
```

### 5.4 Audit Service — Audit Entry

```json
{
  "id": "ObjectId",
  "actorId": "ObjectId",
  "actorRole": "enum: user | admin | system",
  "action": "string",
  "resourceType": "string",
  "resourceId": "string",
  "details": "object",
  "ipAddress": "string",
  "userAgent": "string",
  "timestamp": "ISODate (indexed)"
}
```

### 5.5 Notification Service — Notification

```json
{
  "id": "ObjectId",
  "userId": "ObjectId (indexed)",
  "type": "enum: kyc_approved | kyc_rejected | kyc_pending | general",
  "title": "string",
  "message": "string",
  "read": "boolean (default false)",
  "createdAt": "ISODate"
}
```

---

## 6. API Contracts

### 6.1 Auth Service Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login, returns JWT | No |
| GET | `/api/auth/me` | Get current user profile | JWT |
| PUT | `/api/auth/me` | Update profile | JWT |

### 6.2 KYC Service Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/kyc/submit` | Submit PAN + initiate KYC | JWT |
| GET | `/api/kyc/status` | Get user's KYC status | JWT |
| POST | `/api/kyc/verify-otp` | Submit eKYC OTP (simulated) | JWT |

### 6.3 Document Service Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/documents/upload` | Upload a document to S3 | JWT |
| GET | `/api/documents/:kycId` | List documents for a KYC | JWT/Admin |
| GET | `/api/documents/view/:docId` | Get pre-signed URL to view | JWT/Admin |

### 6.4 Admin Service Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/admin/kyc` | List all KYC applications | Admin |
| GET | `/api/admin/kyc/:id` | Get KYC detail + docs | Admin |
| POST | `/api/admin/kyc/:id/approve` | Approve KYC | Admin |
| POST | `/api/admin/kyc/:id/reject` | Reject KYC with remarks | Admin |
| GET | `/api/admin/stats` | Dashboard statistics | Admin |

### 6.5 Notification Service Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/notifications` | Get user's notifications | JWT |
| PUT | `/api/notifications/:id/read` | Mark as read | JWT |
| GET | `/api/notifications/unread-count` | Unread count | JWT |

### 6.6 Audit Service Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/audit/:resourceType/:resourceId` | Get audit trail | Admin |

### 6.7 API Gateway Routes

| Path | Target |
|------|--------|
| `/api/auth/*` | Auth Service:4001 |
| `/api/kyc/*` | KYC Service:4002 |
| `/api/documents/*` | Document Service:4003 |
| `/api/admin/*` | Admin Service:4004 |
| `/api/notifications/*` | Notification Service:4005 |
| `/api/audit/*` | Audit Service:4006 |

---

## 7. Inter-Service Communication

### 7.1 Synchronous (HTTP/REST)

```
API Gateway ──> Auth Service      (JWT verification)
            ──> KYC Service       (KYC CRUD)
            ──> Document Service  (upload/view)
            ──> Admin Service     (review actions)
            ──> Notification Svc  (fetch notifications)
            ──> Audit Service     (read audit trail)
```

### 7.2 Asynchronous (Event-Driven via Apache Kafka)

```
KYC Service ──(kyc.submitted) ──> Kafka Topic ──> Audit Service
                                                   Notification Svc
Admin Svc   ──(kyc.approved) ──> Kafka Topic ──> Notification Svc
Admin Svc   ──(kyc.rejected) ──> Kafka Topic ──> Notification Svc
Admin Svc   ──(kyc.*)        ──> Kafka Topic ──> Audit Service
```

### 7.3 Event Payload Schema

```json
{
  "eventType": "kyc.approved",
  "source": "admin-service",
  "timestamp": "2026-06-21T10:30:00Z",
  "data": {
    "kycId": "ObjectId",
    "userId": "ObjectId",
    "adminId": "ObjectId",
    "remarks": "Documents verified successfully"
  }
}
```

---

## 8. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 (App Router) | SSR + SPA UI |
| State Mgmt | Redux Toolkit + TanStack Query | Global state + server state caching |
| Styling | Tailwind CSS 4 | Utility-first styling |
| Backend | Node.js + Express 5 | REST API per service |
| Database | MongoDB 8 + Mongoose 9 | Document store |
| File Storage | AWS S3 (Prod) / MinIO (Dev) | Document storage |
| Message Queue | Apache Kafka (kafkajs) | Async events |
| OCR | Tesseract.js | PAN card text extraction |
| Auth | JWT (jsonwebtoken + bcryptjs) | Authentication |
| API Gateway | Express HTTP proxy | Routing |
| Containerization | Docker + Docker Compose | Deployment |
| Image Processing | Sharp | Thumbnail generation |
| Validation | Zod | Input validation |
| Testing | Jest + Supertest | Unit & integration testing |

---

## 9. Project Structure (Microservices)

```
kfintech-mf-platform/
├── api-gateway/          # Express reverse proxy
│   ├── src/
│   │   ├── middleware/   # Rate-limit, CORS, auth passthrough
│   │   ├── routes/       # Proxy route definitions
│   │   └── server.js
│   ├── __tests__/        # Gateway integration tests
│   ├── Dockerfile
│   └── package.json
├── services/
│   ├── auth-service/     # Registration, login, JWT
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   └── app.js
│   │   ├── __tests__/    # Auth unit + integration tests
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── kyc-service/      # PAN validation, OCR, eKYC
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   │   ├── panOcr.js
│   │   │   │   └── ekYC.js
│   │   │   └── app.js
│   │   ├── __tests__/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── document-service/ # S3 upload, retrieval, thumbnails
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   └── app.js
│   │   ├── __tests__/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── admin-service/    # Review dashboard, approve/reject
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   └── app.js
│   │   ├── __tests__/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── notification-service/ # In-app + email notifications
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── consumers/   # Kafka listeners
│   │   │   └── app.js
│   │   ├── __tests__/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── audit-service/   # Immutable audit log
│       ├── src/
│       │   ├── config/
│       │   ├── models/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── consumers/
│       │   └── app.js
│       ├── __tests__/
│       ├── Dockerfile
│       └── package.json
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.js
│   │   │   └── register/
│   │   │       └── page.js
│   │   ├── (dashboard)/
│   │   │   ├── page.js          # User KYC status dashboard
│   │   │   └── layout.js
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   │   └── page.js
│   │   │   ├── kyc/
│   │   │   │   └── [id]/
│   │   │   │       └── page.js
│   │   │   └── layout.js
│   │   ├── layout.js            # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # Reusable UI primitives
│   │   ├── forms/               # KYC form, upload form
│   │   ├── layout/              # Navbar, Sidebar, Footer
│   │   └── admin/               # Admin-specific components
│   ├── lib/
│   │   ├── store/                  # Redux Toolkit store
│   │   │   ├── store.js           # configureStore
│   │   │   ├── authSlice.js       # Auth state slice
│   │   │   └── appSlice.js        # App config slice
│   │   ├── api.js                 # Axios instance + interceptors
│   │   ├── queries/               # TanStack Query hooks
│   │   │   ├── useKyc.js
│   │   │   ├── useDocuments.js
│   │   │   ├── useNotifications.js
│   │   │   └── useAdmin.js
│   │   └── utils.js               # Helpers
│   ├── __tests__/               # Component + page tests
│   ├── public/
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── jest.config.js
│   └── package.json
├── docker-compose.yml
└── PRD.md
```

---

## 10. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| JWT security | Short expiry (7d), stored in HttpOnly cookie + Authorization header |
| Password storage | bcryptjs with salt rounds = 12 |
| Document access | Pre-signed S3 URLs with 5-minute expiry |
| Admin-only routes | Role-based middleware check on each admin endpoint |
| Rate limiting | API Gateway enforces 100 req/min per IP |
| Input validation | Zod schemas on every POST/PUT endpoint |
| No secrets in code | All config via environment variables |
| CORS | Whitelist only frontend origin |

---

## 11. Deployment

```yaml
# docker-compose.yml services
services:
  api-gateway:     # port 4000
  auth-service:    # port 4001
  kyc-service:     # port 4002
  document-service:# port 4003
  admin-service:   # port 4004
  notification-svc:# port 4005
  audit-service:   # port 4006
  mongodb:         # port 27017
  kafka:           # port 9092
  frontend:        # port 3000
```

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| KYC submission success rate | > 95% |
| OCR accuracy for PAN | > 90% |
| Admin review time per KYC | < 2 min |
| End-to-end KYC completion time | < 5 min |
| System availability | > 99.5% |

---

## 13. Future Scope (Post-MVP)

- Video KYC (VideoKYC as per SEBI guidelines)
- UPI-based identity verification
- FATCA/CRS declaration management
- SIP registration + nomination integration
- WhatsApp/Telegram notification channels
- Kubernetes deployment with Helm charts