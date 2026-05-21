# Prowider Mini - Lead Distribution & Fair Allocation System

A production-grade lead generation and provider allocation engine with concurrent request handling, real-time updates, and webhook idempotency.

## 🎯 System Overview

This system demonstrates enterprise-level engineering for lead distribution:

- **Automatic Provider Assignment:** Each new lead is instantly assigned to exactly 3 providers based on intelligent business rules
- **Fair Allocation:** Remaining provider slots are distributed using persistent round-robin (survives server restarts)
- **Concurrent Safety:** Handles simultaneous lead submissions without race conditions using database-level row locking
- **Webhook Idempotency:** Quota reset webhooks are safely handled via transaction + unique event tracking
- **Real-Time Updates:** Provider dashboard updates automatically without page refresh
- **Quota Enforcement:** Each provider receives maximum 10 leads per month

## 📋 Features

### Feature 1: Request Service Form
**Route:** `/request-service`

Public customer form with:
- Name, Phone, City, Service Type, Description fields
- **Duplicate Prevention:** Same phone number cannot submit twice for the SAME service (database-enforced)
- Instant success notification with assigned providers
- Clean error handling for duplicates

```
Allowed: 9999999999 → Service 1, then 9999999999 → Service 2
Not Allowed: 9999999999 → Service 1, then 9999999999 → Service 1 again
```

### Feature 2: Lead Distribution (Core Logic)
**Logic:** `src/lib/leadDistribution.ts`

Every new lead is assigned to exactly 3 providers:

**Mandatory Assignment Rules:**
- Service 1 → Provider 1 (always)
- Service 2 → Provider 5 (always)
- Service 3 → Provider 1 AND Provider 4 (always)

**Fair Allocation (Round-Robin):**
After mandatory assignments, remaining slots filled from fair pools:
- Service 1 pool: Providers 2, 3, 4
- Service 2 pool: Providers 6, 7, 8
- Service 3 pool: Providers 2, 3, 5, 6, 7, 8

**Allocation Algorithm:**
1. Lock `AllocationState` row for service (serializes requests for same service)
2. Check mandatory providers for available quota
3. Fill remaining slots using round-robin pointer
4. Advance pointer to next eligible provider
5. Update all provider quotas atomically
6. Commit or rollback entire transaction

### Feature 3: Provider Dashboard
**Route:** `/dashboard`

Real-time view of all 8 providers:
- Remaining monthly quota (max 10)
- Total leads received count
- List of assigned leads with timestamps
- Auto-refreshes every 5 seconds

### Feature 4: Real-Time Updates
Dashboard uses **SWR polling** with 5-second refresh interval:
- Dedicated API endpoint returns fresh provider data
- `force-dynamic` directive prevents caching
- Efficient deduplication prevents duplicate requests
- Works on any network (no special ports needed)

### Feature 5: Webhook Simulation & Testing
**Route:** `/test-tools`

Testing panel for concurrent request handling:

**Quota Reset Button:**
- Sends idempotent webhook to reset all provider quotas to 10
- Uses `transactionId` for deduplication
- Multiple calls have no extra effect

**Concurrency Stress Test:**
- Generates 10 concurrent leads instantly
- Tests fair allocation under load
- Verifies no quota violations
- Shows per-provider assignment distribution

## 🗄️ Database Design

### PostgreSQL with Prisma ORM

**Models:**

```
Service
├─ id: UUID
├─ name: String (unique)
├─ relationships: leads[], allocationState

Provider (8 total, IDs: 1-8)
├─ id: Integer
├─ name: String
├─ maxQuota: Integer (10)
├─ currentQuota: Integer (remaining)
├─ leadsReceived: Integer (total)
└─ relationships: assignments[]

Lead
├─ id: UUID
├─ name, phone, city, description: String
├─ serviceId: FK → Service
├─ Unique: (phone, serviceId)
└─ relationships: assignments[]

LeadAssignment
├─ leadId: FK → Lead
├─ providerId: FK → Provider
├─ Unique: (leadId, providerId)

AllocationState
├─ serviceId: FK → Service (PK)
├─ currentIndex: Integer (round-robin pointer)

WebhookEvent
├─ transactionId: String (PK)
└─ processedAt: DateTime (idempotency)
```

## 🔒 Concurrency & Safety

### Row-Level Locking (FOR UPDATE)
```sql
SELECT * FROM "AllocationState" 
WHERE "serviceId" = '...' 
FOR UPDATE
```
**Effect:** Serializes all concurrent requests for the SAME service.

### Sorted Provider Locking
Providers locked in sorted ID order to prevent deadlocks.

### Atomic Transactions
Entire allocation wrapped in `prisma.$transaction()`:
- Either all updates succeed, or entire operation rolls back
- No partial states possible

### Idempotent Webhooks
```
transactionId → Check if exists → 
  If YES: Skip (already processed)
  If NO: Process + insert record
```

## ⚙️ Allocation Algorithm (Fair Distribution)

### Why Round-Robin?
- ✅ Stateful (persists in DB, survives restarts)
- ✅ Deterministic (no randomness)
- ✅ Fair over time (all providers get equal turns)
- ✅ Respects quota (skips full providers automatically)

### Example Flow:
```
Service 1 Pool: [Provider 2, Provider 3, Provider 4]
AllocationState.currentIndex = 0

Lead 1: Mandatory P1 ✓, Fill from pool → P2 (index 0) ✓ → NextIndex=1
Lead 2: Mandatory P1 ✓, Fill from pool → P3 (index 1) ✓ → NextIndex=2
Lead 3: Mandatory P1 ✓, Fill from pool → P4 (index 2) ✓ → NextIndex=0
Lead 4: Mandatory P1 ✓, Fill from pool → P2 (index 0) ✓ → NextIndex=1
...
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Local Development

**1. Install dependencies:**
```bash
npm install
```

**2. Configure database:**
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
# Edit .env and set DATABASE_URL for your PostgreSQL
```

**3. Create and seed database:**
```bash
# Run migrations and seed
npx prisma migrate dev --name init
```

**4. Start development server:**
```bash
npm run dev
```

Open http://localhost:3000

**5. Test the system:**
- `/request-service` → Submit a lead
- `/dashboard` → Watch real-time updates
- `/test-tools` → Test webhook & concurrency

---

## 📦 API Routes

### POST `/api/leads`
Create a new lead and auto-assign 3 providers.

**Request:**
```json
{
  "name": "John Doe",
  "phone": "9999999999",
  "city": "New York",
  "serviceName": "Service 1",
  "description": "Need help with..."
}
```

**Response (201):**
```json
{
  "lead": { "id": "...", "name": "John Doe", ... },
  "assignedProviders": [
    { "id": 1, "name": "Provider 1" },
    { "id": 2, "name": "Provider 2" },
    { "id": 5, "name": "Provider 5" }
  ]
}
```

**Errors:**
- `400` - Missing fields
- `409` - Duplicate lead (same phone + service)
- `400` - Cannot assign 3 providers (quota exhausted)

### GET `/api/providers`
Fetch all providers with assigned leads.

### GET `/api/services`
Fetch all available services.

### POST `/api/webhook/reset-quota`
Reset all provider quotas to 10 (idempotent).

**Request:**
```json
{ "transactionId": "payment-12345" }
```

Multiple calls with same `transactionId` = no extra effect.

### POST `/api/test/generate-leads`
Generate 10 concurrent leads for testing.

---

## 🌐 Deployment on Vercel

### Step 1: Prepare Repository
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### Step 2: Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Click "Deploy"

### Step 3: Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL = postgresql://[user]:[password]@[host]:[port]/[db]
NODE_ENV = production
```

**Recommended PostgreSQL Services:**
- **Vercel Postgres** (easiest, native integration)
- **Railway** (simple setup, free tier)
- **Neon** (serverless, free tier)
- **Render** (free tier available)

### Step 4: Seed Database (One-time)
After first deployment succeeds:

```bash
# Via Vercel CLI
vercel env pull
npm run prisma:seed

# OR use Vercel CLI directly
vercel deploy --prod
```

### Step 5: Verify Live
- Visit your Vercel URL
- Test all 5 features
- Check dashboard updates

---

## ✅ Testing Checklist

**Duplicate Prevention:**
- ✓ Submit phone 9999999999 + Service 1 → Success
- ✓ Submit phone 9999999999 + Service 1 → Error 409
- ✓ Submit phone 9999999999 + Service 2 → Success (different service)

**Fair Allocation:**
- ✓ Generate 30 leads for Service 1
- ✓ Verify providers 2, 3, 4 have roughly equal counts
- ✓ Pattern shows round-robin: 2→3→4→2→3→4...

**Quota Enforcement:**
- ✓ All providers start with quota 10
- ✓ After 4 leads (12 assignments), quota decreases
- ✓ New assignments fail when no provider has quota

**Concurrency:**
- ✓ Use /test-tools → "Run Concurrency Test"
- ✓ All 10 leads assigned without errors
- ✓ No duplicate assignments

**Real-Time:**
- ✓ Keep /dashboard open
- ✓ Submit lead in another tab
- ✓ Dashboard updates within 5 seconds

**Webhook Idempotency:**
- ✓ Click "Reset Quota" 3 times rapidly
- ✓ Only first request updates quotas
- ✓ Subsequent calls return "already processed"

---

## 📝 Directory Structure

```
src/
├── app/
│   ├── page.tsx                 # Home
│   ├── layout.tsx               # Navigation
│   ├── request-service/page.tsx # Customer form
│   ├── dashboard/page.tsx       # Provider dashboard
│   ├── test-tools/page.tsx      # Testing panel
│   └── api/
│       ├── leads/route.ts       # Create lead
│       ├── providers/route.ts   # Get providers
│       ├── services/route.ts    # Get services
│       ├── webhook/reset-quota/route.ts    # Webhook
│       └── test/generate-leads/route.ts    # Stress test
├── lib/
│   ├── db.ts                    # Prisma singleton
│   └── leadDistribution.ts      # Allocation logic
└── generated/
    └── prisma/                  # Auto-generated client
```

---

## 🛠️ Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run migrations
npm run prisma:seed     # Seed database
npm run prisma:studio   # Open Prisma GUI

npm run lint            # Run ESLint
```

---

## 🔑 Key Implementation Details

**Concurrency:** PostgreSQL row-level locks (FOR UPDATE)
**Quota:** Integer counter decremented with each assignment
**Fair Distribution:** Stateful round-robin in AllocationState
**Idempotency:** Transaction + unique WebhookEvent table
**Duplication Prevention:** Unique constraint (phone, serviceId)

---

## 📞 Troubleshooting

**"Module not found: swr"**
```bash
npm install swr && npm run dev
```

**"Database connection refused"**
- Check DATABASE_URL in .env
- Verify PostgreSQL is running

**"AllocationState not found"**
```bash
npm run prisma:seed
```

**Dashboard outdated**
- Hard refresh (Ctrl+Shift+R)
- Check API has `force-dynamic` header

---

**Built with:** Next.js 16, PostgreSQL, Prisma, Tailwind CSS, SWR

This project is production-ready and designed to handle concurrent requests, enforce business rules, and maintain data consistency under all conditions.
