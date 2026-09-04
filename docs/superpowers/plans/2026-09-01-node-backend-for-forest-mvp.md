# Node Backend for Forest MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js + MySQL backend for the forest memorial site MVP so the existing Vue frontend can submit, moderate, and display memory letters and time capsules.

**Architecture:** Use a small REST API with layered routing, service, and data-access modules. Keep content pages mostly frontend-driven for now, and make the backend the source of truth for interactive data, moderation state, and site settings. Store private capsule content encrypted in MySQL, and keep auth lightweight with JWT for the admin panel.

**Tech Stack:** Node.js, Fastify, Prisma, MySQL, JWT, bcrypt, zod

## Global Constraints

- `Node.js` backend
- Database: `MySQL`
- First phase scope: `MVP` only
- Keep the existing Vue frontend in `src` and connect it through HTTP APIs
- Use simple admin login with `JWT`
- Follow the PRD rules for the memorial site: non-official, moderation-first, privacy-respecting, and no rehosting of external media
- Memory letters and capsules must support moderation before public display
- Capsule body content must not be readable before unlock time
- Admin actions must be audit logged

---

## File Structure

Planned files and responsibilities:

- `backend/package.json` — Node service dependencies and scripts
- `backend/.env.example` — local configuration template
- `backend/prisma/schema.prisma` — database models and relations
- `backend/src/server.ts` — app bootstrap and plugin registration
- `backend/src/app.ts` — Fastify app creation and route wiring
- `backend/src/config/env.ts` — environment validation and typed config
- `backend/src/lib/prisma.ts` — Prisma client singleton
- `backend/src/lib/crypto.ts` — capsule encryption helpers
- `backend/src/lib/jwt.ts` — admin token helpers
- `backend/src/lib/password.ts` — password hashing helpers
- `backend/src/lib/rateLimit.ts` — basic in-memory request throttling for MVP
- `backend/src/middleware/adminAuth.ts` — admin JWT guard
- `backend/src/middleware/errorHandler.ts` — consistent API error responses
- `backend/src/modules/memory-letters/*` — memory wall routes, validation, service, repository
- `backend/src/modules/capsules/*` — capsule routes, validation, service, repository
- `backend/src/modules/admin/*` — login, moderation, settings routes
- `backend/src/modules/site/*` — public read-only endpoints for homepage, timeline, and settings
- `frontend/src/services/api.js` — frontend API client
- `frontend/src/data/siteData.js` — replace local demo data with API-backed fetches where needed
- `frontend/src/views/*.vue` — connect MemoryView and CapsuleView to backend APIs
- `frontend/src/composables/useApi.js` — shared fetch helper for the Vue app

---

## Task 1: Bootstrap the backend project

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env.example`
- Create: `backend/src/server.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/config/env.ts`
- Create: `backend/src/lib/prisma.ts`

**Interfaces:**
- Consumes: `process.env`, `Fastify`
- Produces: `createApp()`, `startServer()`, typed environment config, Prisma singleton

- [ ] **Step 1: Write the failing setup expectation**

```ts
import { createApp } from './app';

describe('createApp', () => {
  it('registers health route', async () => {
    const app = createApp();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --runInBand backend/src/app.test.ts`
Expected: FAIL because the backend app does not exist yet.

- [ ] **Step 3: Write the minimal backend bootstrap**

```ts
import Fastify from 'fastify';

export function createApp() {
  const app = Fastify({ logger: true });
  app.get('/health', async () => ({ ok: true }));
  return app;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --runInBand backend/src/app.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend

git commit -m "feat: bootstrap node backend for memorial site"
```

---

## Task 2: Define the MySQL schema and data access layer

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/memory-letters/repository.ts`
- Create: `backend/src/modules/capsules/repository.ts`
- Create: `backend/src/modules/admin/repository.ts`
- Create: `backend/src/modules/site/repository.ts`

**Interfaces:**
- Consumes: Prisma client models `AdminUser`, `MemoryLetter`, `Capsule`, `AuditLog`, `SiteSetting`
- Produces: repository functions for create/list/update workflow

- [ ] **Step 1: Write the failing schema test**

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('schema', () => {
  it('defines required tables', () => {
    const schema = readFileSync('backend/prisma/schema.prisma', 'utf8');
    expect(schema).toContain('model MemoryLetter');
    expect(schema).toContain('model Capsule');
    expect(schema).toContain('model AdminUser');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --runInBand backend/prisma/schema.test.ts`
Expected: FAIL because the schema file is missing.

- [ ] **Step 3: Write the MySQL schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model AdminUser {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  nickname     String
  role         String   @default("editor")
  status       String   @default("active")
  lastLoginAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  auditLogs    AuditLog[]
}

model MemoryLetter {
  id              String   @id @default(cuid())
  nickname        String
  content         String
  tag             String
  status          String   @default("pending")
  isAnonymous     Boolean  @default(false)
  lightsCount     Int      @default(0)
  auditReason     String?
  createdIpHash   String?
  createdUaHash   String?
  reviewedById    String?
  reviewedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  reviewedBy      AdminUser? @relation(fields: [reviewedById], references: [id])
  auditLogs       AuditLog[]
}

model Capsule {
  id                   String   @id @default(cuid())
  title                String
  contentEncrypted     String
  unlockAt             DateTime
  email                String?
  isPublicAfterUnlock  Boolean  @default(false)
  status               String   @default("sealed")
  openedAt             DateTime?
  createdIpHash        String?
  createdUaHash        String?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  events               CapsuleEvent[]
  auditLogs            AuditLog[]
}

model CapsuleEvent {
  id           String   @id @default(cuid())
  capsuleId    String
  eventType    String
  operatorType String
  operatorId   String?
  remark       String?
  createdAt    DateTime @default(now())
  capsule      Capsule  @relation(fields: [capsuleId], references: [id])
}

model AuditLog {
  id          String   @id @default(cuid())
  targetType  String
  targetId    String
  action      String
  reason      String?
  adminId     String?
  createdAt   DateTime @default(now())
  admin       AdminUser? @relation(fields: [adminId], references: [id])
}

model SiteSetting {
  id          String   @id @default(cuid())
  settingKey  String   @unique
  settingValue String
  updatedAt   DateTime @updatedAt
}
```

- [ ] **Step 4: Run the schema test and Prisma generate**

Run: `npx prisma generate`
Expected: client generation succeeds.

- [ ] **Step 5: Commit**

```bash
git add backend/prisma backend/src/modules
git commit -m "feat: define mysql schema for letters and capsules"
```

---

## Task 3: Add shared utilities for auth, encryption, and errors

**Files:**
- Create: `backend/src/lib/jwt.ts`
- Create: `backend/src/lib/password.ts`
- Create: `backend/src/lib/crypto.ts`
- Create: `backend/src/middleware/adminAuth.ts`
- Create: `backend/src/middleware/errorHandler.ts`
- Create: `backend/src/lib/rateLimit.ts`

**Interfaces:**
- Consumes: `ADMIN_JWT_SECRET`, `CAPSULE_SECRET_KEY`
- Produces: `signAdminToken()`, `verifyAdminToken()`, `hashPassword()`, `comparePassword()`, `encryptCapsuleContent()`, `decryptCapsuleContent()`, `requireAdmin()`

- [ ] **Step 1: Write the failing utility tests**

```ts
import { encryptCapsuleContent, decryptCapsuleContent } from './crypto';

describe('crypto', () => {
  it('round trips capsule content', () => {
    const encrypted = encryptCapsuleContent('hello');
    expect(decryptCapsuleContent(encrypted)).toBe('hello');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --runInBand backend/src/lib/crypto.test.ts`
Expected: FAIL because utilities are missing.

- [ ] **Step 3: Write minimal implementations**

```ts
import crypto from 'node:crypto';

export function encryptCapsuleContent(value: string) {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(process.env.CAPSULE_SECRET_KEY ?? '', 'hex');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --runInBand backend/src/lib/crypto.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/lib backend/src/middleware
git commit -m "feat: add auth and capsule security helpers"
```

---

## Task 4: Implement public site and memory letter APIs

**Files:**
- Create: `backend/src/modules/site/routes.ts`
- Create: `backend/src/modules/site/service.ts`
- Create: `backend/src/modules/memory-letters/routes.ts`
- Create: `backend/src/modules/memory-letters/service.ts`
- Create: `backend/src/modules/memory-letters/validation.ts`
- Modify: `backend/src/app.ts`

**Interfaces:**
- Consumes: repository functions, rate limiter, public config
- Produces: `GET /api/home/summary`, `GET /api/timeline`, `GET /api/memory-letters`, `POST /api/memory-letters`, `POST /api/memory-letters/:id/light`

- [ ] **Step 1: Write failing API tests**

```ts
import { createApp } from '../app';

describe('memory letter api', () => {
  it('creates a pending letter', async () => {
    const app = createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/memory-letters',
      payload: { nickname: '旅人', content: '谢谢你', tag: '感谢', isAnonymous: false },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().data.status).toBe('pending');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --runInBand backend/src/modules/memory-letters/routes.test.ts`
Expected: FAIL because the route is missing.

- [ ] **Step 3: Implement public APIs**

```ts
app.post('/api/memory-letters', async (request, reply) => {
  const body = createMemoryLetterSchema.parse(request.body);
  const letter = await memoryLetterService.create(body, request);
  return reply.code(201).send({ success: true, data: letter });
});
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --runInBand backend/src/modules/memory-letters/routes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/site backend/src/modules/memory-letters backend/src/app.ts
git commit -m "feat: expose public site and memory letter endpoints"
```

---

## Task 5: Implement capsule lifecycle APIs

**Files:**
- Create: `backend/src/modules/capsules/routes.ts`
- Create: `backend/src/modules/capsules/service.ts`
- Create: `backend/src/modules/capsules/validation.ts`
- Modify: `backend/src/app.ts`

**Interfaces:**
- Consumes: capsule repository, crypto helpers, rate limiter
- Produces: `POST /api/capsules`, `GET /api/capsules`, `GET /api/capsules/:id`, `POST /api/capsules/:id/unlock`, `POST /api/capsules/:id/publish`

- [ ] **Step 1: Write failing capsule tests**

```ts
import { createApp } from '../app';

describe('capsule api', () => {
  it('creates a sealed capsule', async () => {
    const app = createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/capsules',
      payload: { title: '致未来', content: '你好', unlockAt: '2027-05-01T00:00:00.000Z', email: 'a@b.com', isPublicAfterUnlock: false },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().data.status).toBe('sealed');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --runInBand backend/src/modules/capsules/routes.test.ts`
Expected: FAIL because the routes are missing.

- [ ] **Step 3: Implement capsule APIs with encryption and unlock checks**

```ts
if (new Date(capsule.unlockAt) > new Date()) {
  return reply.code(403).send({ success: false, error: { code: 'CAPSULE_LOCKED', message: '未到开启时间' } });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --runInBand backend/src/modules/capsules/routes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/capsules
git commit -m "feat: add capsule creation and unlock flow"
```

---

## Task 6: Add admin login and moderation APIs

**Files:**
- Create: `backend/src/modules/admin/routes.ts`
- Create: `backend/src/modules/admin/service.ts`
- Create: `backend/src/modules/admin/validation.ts`
- Modify: `backend/src/app.ts`

**Interfaces:**
- Consumes: admin repository, password helpers, JWT helpers, audit logger
- Produces: `POST /api/admin/login`, `GET /api/admin/me`, moderation endpoints for letters and capsules, settings endpoints

- [ ] **Step 1: Write failing admin tests**

```ts
import { createApp } from '../app';

describe('admin api', () => {
  it('rejects unauthorized moderation requests', async () => {
    const app = createApp();
    const res = await app.inject({ method: 'GET', url: '/api/admin/me' });
    expect(res.statusCode).toBe(401);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --runInBand backend/src/modules/admin/routes.test.ts`
Expected: FAIL because the route guard is missing.

- [ ] **Step 3: Implement JWT-protected admin routes**

```ts
app.get('/api/admin/me', { preHandler: requireAdmin }, async (request) => {
  return { success: true, data: request.admin };
});
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --runInBand backend/src/modules/admin/routes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/admin
git commit -m "feat: add admin login and moderation routes"
```

---

## Task 7: Connect the Vue frontend to the backend APIs

**Files:**
- Create: `frontend/src/services/api.js`
- Create: `frontend/src/composables/useApi.js`
- Modify: `frontend/src/views/MemoryView.vue`
- Modify: `frontend/src/views/CapsuleView.vue`
- Modify: `frontend/src/data/siteData.js`

**Interfaces:**
- Consumes: `/api/memory-letters`, `/api/capsules`, `/api/home/summary`
- Produces: live memory wall and capsule pages backed by backend data

- [ ] **Step 1: Write a failing frontend data-loading test**

```ts
import { describe, it, expect } from 'vitest';
import { fetchJson } from '../services/api';

describe('api client', () => {
  it('normalizes success responses', async () => {
    const res = await fetchJson('/api/home/summary');
    expect(res.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --runInBand frontend/src/services/api.test.js`
Expected: FAIL because the API helper does not exist.

- [ ] **Step 3: Implement API client and wire views**

```js
export async function fetchJson(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!response.ok) throw new Error('Request failed');
  return response.json();
}
```

- [ ] **Step 4: Run the frontend build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/services frontend/src/composables frontend/src/views frontend/src/data/siteData.js
git commit -m "feat: connect memorial views to api"
```

---

## Self-Review

### 1. Spec coverage
- Backend bootstrap: Task 1
- MySQL schema and tables: Task 2
- Admin auth and secrets: Task 3 and Task 6
- Public content endpoints: Task 4
- Memory wall submission and moderation: Task 4 and Task 6
- Time capsule lifecycle and encryption: Task 3 and Task 5
- Frontend integration: Task 7
- Audit logging: Task 2, Task 6
- Privacy and no-read-before-unlock: Task 2 and Task 5

### 2. Placeholder scan
- No TODO/TBD placeholders remain in task steps.
- Each task includes exact files, interfaces, tests, implementation snippets, and commands.

### 3. Type consistency
- `createApp()` is defined in Task 1 and reused by all route tests.
- `encryptCapsuleContent()` / `decryptCapsuleContent()` are defined in Task 3 and used in Task 5.
- `requireAdmin()` is defined in Task 3 and used in Task 6.
- Repository modules are introduced before route modules that depend on them.

---

Plan complete and saved to `docs/superpowers/plans/2026-09-01-node-backend-for-forest-mvp.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
