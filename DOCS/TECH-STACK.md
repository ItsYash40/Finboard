# Technology Stack

## Mutual Fund Investor Onboarding & KYC Platform

---

## 1. Overview

| Layer | Technology | Version (Latest) | Purpose |
|-------|-----------|:----------------:|---------|
| Frontend | Next.js | 16.2.9 | Full-stack React framework (App Router) |
| Routing | Next.js App Router | Built-in | File-system based routing |
| State Mgmt | Redux Toolkit | 2.12.0 | Global state (auth, app config) |
| Data Fetching | TanStack Query | 5.101.0 | Server state caching & sync |
| Styling | Tailwind CSS | 4.3.1 | Utility-first CSS framework |
| Backend | Node.js | 24 LTS (24.16.0) | JavaScript runtime |
| API Framework | Express | 5.2.1 | REST API framework per service |
| Database | MongoDB | 8.3.4 | Document store (per service) |
| ODM | Mongoose | 9.7.1 | MongoDB object modeling |
| File Storage | AWS S3 (Prod) / MinIO (Dev) | - | Document & image storage |
| Message Queue | Apache Kafka (kafkajs) | 4.1.0 | Async inter-service events |
| OCR Engine | Tesseract.js | 7.0.0 | PAN card text extraction |
| Auth Tokens | JWT (jsonwebtoken) | 9.0.3 | Stateless authentication |
| Password Hashing | bcryptjs | 3.0.3 | Secure password storage |
| Image Processing | Sharp | 0.35.1 | Thumbnail & compression |
| Testing | Jest | 30.0.0 | Unit & integration testing |
| Containerization | Docker Engine | 29.5.2 | Service packaging |
| Orchestration | Docker Compose | 5.1.4 | Local multi-service setup |

---

## 2. Frontend

```
Next.js 16 (App Router) + Tailwind CSS v4
            │
    ┌───────┴───────┐
    │               │
 Server Components  Client Components
 (data fetching,    (forms, interactivity,
  layout, SEO)       uploads, charts)
    │               │
    └───────┬───────┘
            │
   ┌────────┴────────┐
   │                 │
Redux Toolkit    TanStack Query
(auth slice,     (KYC data, docs,
 app config)      notifications, admin)
   │                 │
   └────────┬────────┘
            │
      API Gateway (port 4000)
```

**Key Packages (latest versions as of June 2026):**
| Package | Version | Purpose |
|---------|:-------:|---------|
| `next` | 16.2.9 | Full-stack React framework (App Router) |
| `react` | 19.2.7 | UI library (bundled with Next.js) |
| `@reduxjs/toolkit` | 2.12.0 | Global state management (slices, store) |
| `react-redux` | 9.2.0 | React bindings for Redux |
| `@tanstack/react-query` | 5.101.0 | Server state fetching, caching, mutations |
| `axios` | 1.18.0 | HTTP client with JWT interceptor |
| `tailwindcss` | 4.3.1 | Utility-first CSS framework |
| `react-dropzone` | 14.3.5 | File upload drag-and-drop |
| `react-hot-toast` | 2.5.2 | Toast notifications |
| `date-fns` | 4.1.0 | Date formatting |
| `react-icons` | 5.5.0 | Icon library |
| `recharts` | 2.15.1 | Admin dashboard charts |
| `jest` | 30.0.0 | Test runner & assertions |
| `@testing-library/react` | 16.3.0 | React component testing |

---

## 3. Backend (per microservice)

```
Node.js 24 LTS + Express 5
      │
  ┌───┴───┐
  │       │
Models  Routes
(Mongo) (REST)
  │       │
  └───┬───┘
      │
  Services
(OCR / S3 / eKYC logic)
      │
 Middleware
(JWT verify / role check / validate)
      │
 Jest tests
(unit + integration)
```

**Key Packages (shared across services) — latest as of June 2026:**

| Package | Version | Purpose |
|---------|:-------:|---------|
| `express` | 5.2.1 | HTTP framework |
| `mongoose` | 9.7.1 | MongoDB ODM |
| `jsonwebtoken` | 9.0.3 | JWT sign/verify |
| `bcryptjs` | 3.0.3 | Password hashing |
| `zod` | 3.24.4 | Schema validation |
| `dotenv` | 16.4.7 | Environment variables |
| `cors` | 2.8.5 | Cross-origin support |
| `kafkajs` | 2.2.4 | Kafka client |
| `helmet` | 8.0.0 | Security headers |
| `morgan` | 1.10.0 | HTTP request logging |
| `uuid` | 11.1.0 | Unique IDs |

**Dev packages (shared across services):**

| Package | Version | Purpose |
|---------|:-------:|---------|
| `jest` | 30.0.0 | Test runner & assertions |
| `supertest` | 7.1.0 | HTTP integration testing |
| `nodemon` | 3.1.9 | Hot reload in development |

**Service-specific packages (latest as of June 2026):**

| Service | Packages | Versions |
|---------|----------|:--------:|
| KYC Service | `tesseract.js`, `validator` | 7.0.0, 13.15.0 |
| Document Service | `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `multer`, `multer-s3`, `sharp` | 3.1069.0, 3.1069.0, 2.2.0, 3.0.1, 0.35.1 |
| Dev Storage | `MinIO` (Docker) | RELEASE.2026-06-11T22-06-02Z | S3-compatible local storage |
| Notification Service | `nodemailer`, `kafkajs` | 9.0.1, 2.2.4 |
| Audit Service | `kafkajs` | 2.2.4 |

---

## 4. Infrastructure

```
┌─────────────────────┐
│  Docker Engine      │  Container runtime (v29.5.2)
│  Docker Compose     │  Multi-service orchestration (v5.1.4)
├─────────────────────┤
│  Apache Kafka 4.1.0 │  Event streaming & messaging
│                     │  Topics: kyc.submitted, kyc.approved, kyc.rejected
├─────────────────────┤
│  MinIO (Dev)        │  S3-compatible object storage
│  AWS S3 (Prod)      │  Same SDK, swap endpoint only
├─────────────────────┤
│  MongoDB 8.3.4      │  6 separate databases (one per service)
│                     │  auth-db, kyc-db, doc-db, admin-db, notif-db, audit-db
└─────────────────────┘
```

---

## 5. Data Flow Examples

### 5.1 KYC Submission

```
User ──POST /api/kyc/submit──> Gateway ──> KYC Service
                                               │
                                    ┌──────────┼──────────┐
                                    │          │          │
                                    ▼          ▼          ▼
                               Validate    Trigger    Produce
                               PAN +      OCR       kyc.submitted
                               Store KYC  (async)   event to Kafka
                                    │          │          │
                                    ▼          ▼          ▼
                               MongoDB   Tesseract   Kafka Topic
                                            (PAN text) (kyc.submitted)
```

### 5.2 Admin Approval

```
Admin ──POST /api/admin/kyc/:id/approve──> Gateway ──> Admin Service
                                                          │
                                               ┌──────────┼──────────┐
                                               │          │          │
                                               ▼          ▼          ▼
                                          Update     Produce    Produce
                                          KYC to    kyc.approved audit event
                                          approved  to Kafka   to Kafka
                                               │          │          │
                                               ▼          ▼          ▼
                                           MongoDB    Kafka      Kafka
                                                       Topic      Topic
                                                       │
                                                       ▼
                                                Notification Svc
                                                (consumer, creates
                                                 in-app notification)
```

---

## 6. Development Tools

| Tool | Version | Usage |
|------|:-------:|-------|
| VS Code | latest | Primary IDE |
| Postman / Bruno | latest | API testing |
| MongoDB Compass | latest | Database GUI |
| Docker Desktop | 4.78.0 | Container management |
| Git + GitHub | latest | Version control |
| ESLint + Prettier | latest | Code quality |
| Jest | 30.0.0 | Test runner |
| Nodemon | 3.1.9 | Hot reload in development |

---

## 7. Environment Variables

### 7.1 Shared (all services)

```
NODE_ENV=development|production
PORT=4001-4006
MONGODB_URI=mongodb://mongodb:27017/{service-db}
KAFKA_BROKER=kafka:9092
JWT_SECRET=<secret>
JWT_EXPIRES_IN=7d
```

### 7.2 Service-specific

| Service | Variables |
|---------|-----------|
| Document Service | `S3_ENDPOINT` (MinIO URL in dev, AWS default in prod), `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` |
| Auth Service | `JWT_SECRET`, `JWT_EXPIRES_IN` |
| Notification Service | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`, `KAFKA_BROKER` |
| Audit Service | `KAFKA_BROKER` |
| KYC Service | `OCR_LANG=eng`, `PAN_REGEX_PATTERN`, `KAFKA_BROKER` |

---

## 8. Port Mapping

| Service | Internal Port | Exposed Port |
|---------|:------------:|:------------:|
| API Gateway | 4000 | 4000 |
| Auth Service | 4001 | - |
| KYC Service | 4002 | - |
| Document Service | 4003 | - |
| Admin Service | 4004 | - |
| Notification Service | 4005 | - |
| Audit Service | 4006 | - |
| MongoDB | 27017 | 27017 |
| Kafka | 9092 / 9093 | 9092 / 9093 |
| MinIO (Dev) | 9000 / 9001 | 9000 / 9001 |
| Frontend (Next.js) | 3000 | 3000 |

---

## 9. Justification

### Why MongoDB?
- Schema-flexible documents suit variable KYC data (PAN card vs Aadhaar vs passport)
- Embedded documents reduce joins for audit trails
- Native JSON support aligns with Node.js/Express
- Easy horizontal scaling via sharding later

### Why Kafka over RabbitMQ?
- **Event replay** — Consumers can rewind and replay from any offset, essential for audit recovery
- **Higher throughput** — Handles millions of events/sec vs RabbitMQ's tens of thousands
- **Durable log** — Append-only log is naturally immutable, perfect for audit trails
- **Consumer groups** — Multiple services (Notification, Audit) can independently consume the same event
- **Exactly-once semantics** — Built-in idempotent producer + transactional guarantees
- **Ecosystem fit** — Kafka's log-based model aligns better with event-driven microservices

### Why Tesseract.js over cloud OCR (AWS Textract)?
- Zero cost, runs locally in the container
- Sufficient accuracy for printed PAN card text
- No external API calls mean lower latency
- Can be swapped for Textract later if needed

### Why Next.js over React SPA?
- **SSR by default** — Server-side rendering for faster initial page loads and better SEO
- **App Router** — Server Components reduce client JS bundle, data fetching on the server
- **File-system routing** — No need for react-router config; routes match directory structure
- **Built-in optimizations** — Image optimization, font loading, code splitting out of the box
- **API route integration** — Can co-locate lightweight BFF (Backend-for-Frontend) routes if needed
- **Same React ecosystem** — All existing React components, hooks, and Context work unchanged

### Why Redux Toolkit + TanStack Query over React Context?
- **Separation of concerns** — Redux Toolkit for global UI state (auth, theme), TanStack Query for server state (KYC, docs, notifications)
- **No boilerplate** — Redux Toolkit slices replace hand-written reducers/actions; TanStack Query replaces manual loading/error/caching state
- **Automatic caching** — TanStack Query caches API responses, avoids redundant fetches, supports stale-while-revalidate
- **DevTools** — Redux DevTools for state debugging, TanStack Query DevTools for cache inspection
- **Performance** — No unnecessary re-renders (Context causes whole-tree re-renders on any update)
- **Mutations** — TanStack Query mutations with automatic cache invalidation after approve/reject actions

### Why Express over Fastify/NestJS?
- Largest ecosystem and community
- Simplest learning curve
- Lightweight — no unnecessary abstractions
- Most middleware available (multer, helmet, cors, etc.)

### Why MinIO over AWS S3 for development?
- **Identical SDK** — Use `@aws-sdk/client-s3` in both dev and prod; just change `S3_ENDPOINT`
- **Zero cost** — Runs locally via Docker, no AWS account needed during development
- **Same API** — 100% S3-compatible (bucket operations, pre-signed URLs, ACLs)
- **Web UI** — Built-in browser console at port 9001 for debugging
- **Offline-friendly** — No internet dependency for development work

### Why AWS SDK v3 over v2?
- v2 reached end-of-support on September 8, 2025
- v3 is modular — import only `@aws-sdk/client-s3` instead of the entire SDK
- Built-in TypeScript support
- Tree-shakeable for smaller bundle sizes
- Latest version: 3.1069.0 (June 2026)

---

## 10. Version Verification

All versions in this document were verified on **June 21, 2026** from the following sources:
| Source | URL |
|--------|-----|
| NPM Registry | https://www.npmjs.com |
| GitHub Releases | https://github.com/{owner}/{repo}/releases |
| Node.js Releases | https://nodejs.org/en/blog/release |
| MongoDB Releases | https://www.mongodb.com/docs/manual/release-notes |
| Docker Releases | https://docs.docker.com/engine/release-notes |
| Kafka Releases | https://kafka.apache.org/downloads |
| endoflife.date | https://endoflife.date |

To update versions, run:
```bash
npm view <package-name> version          # Single package
npm outdated                              # All outdated packages
node --version                            # Node.js
mongod --version                          # MongoDB
docker --version                          # Docker Engine
docker compose version                    # Docker Compose
kafka-topics --version                    # Kafka
```