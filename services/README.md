# Finboard Services

Each service owns its domain code under `src/modules/{domain}/`.

## Active services

| Service | Port |
|---------|------|
| api-gateway | 4000 |
| auth-service | 4001 |
| profile-service | 4002 |
| kyc-service | 4003 |
| ocr-service | 4004 |
| banking-service | 4005 |
| investment-service | 4006 |
| notification-service | 4007 |
| audit-service | 4008 |
| identity-service | 4009 |
| portfolio-service | 4011 |

## Utilities

```bash
pnpm seed:admin       # Seed admin users
pnpm seed:identity    # Seed dummy KYC identities
pnpm prisma:migrate   # Banking DB migrations
```

## Scaffold

```bash
node infrastructure/scripts/scaffold-service.mjs my-service my-module
```
