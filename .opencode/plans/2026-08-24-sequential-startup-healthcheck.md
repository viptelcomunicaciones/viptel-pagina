# Sequential Startup with Health Check — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the 15s initial load delay by starting backend first, waiting for Payload schema to be ready via health check, then starting website — plus increase API timeout and fix module warning.

**Architecture:** Root `pnpm dev` runs a new orchestration script that starts backend, polls `/api/health` until ready (200 OK with schema loaded), then starts website. Backend exposes a lightweight health endpoint that returns 200 only after Payload initializes. Website client timeout raised from 15s to 30s as safety margin.

**Tech Stack:** Node.js orchestration script, Next.js 16 API routes, Astro 7 dev server, Payload CMS 3, PostgreSQL.

## Global Constraints

- **Monorepo root** orchestrates both packages — changes in `package.json` root scripts and a new `scripts/` folder.
- **Backend** is Payload CMS on Next.js 16 (port 3000). Health endpoint must be a Next.js route handler under `src/app/(payload)/api/health/route.ts`.
- **Website** is Astro 7 SSR (port 4321). Client timeout in `website/src/lib/payload-client.ts`.
- **Module warning** fix: add `"type": "module"` to `website/package.json`.
- **No Docker** — local dev only. Script uses cross-platform Node (no bash).
- **Backwards compatible** — existing `dev:backend` and `dev:website` still work independently.
- **Verification:** `pnpm build` from root passes; manual `pnpm dev` starts sequentially without timeout errors.

---

### Task 1: Backend Health Check Endpoint

**Files:**
- Create: `backend/src/app/(payload)/api/health/route.ts`
- Test: `backend/tests/int/health.int.spec.ts` (optional — can verify manually)

**Interfaces:**
- Produces: `GET /api/health` → `{ status: 'ok' | 'initializing' | 'error'; payloadReady: boolean; timestamp: string }`

- [ ] **Step 1: Create health endpoint**

`backend/src/app/(payload)/api/health/route.ts`:

```ts
import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'

let payloadReady = false

export async function GET() {
  if (payloadReady) {
    return NextResponse.json({
      status: 'ok',
      payloadReady: true,
      timestamp: new Date().toISOString(),
    })
  }

  try {
    const payload = await getPayload({ config })
    payloadReady = true
    return NextResponse.json({
      status: 'ok',
      payloadReady: true,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[Health] Payload not ready:', err)
    return NextResponse.json(
      {
        status: 'initializing',
        payloadReady: false,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
```

- [ ] **Step 2: Verify endpoint works**

Run: `pnpm --filter backend dev` → wait for "Ready", then `curl http://localhost:3000/api/health`

Expected: First call returns 503 with `payloadReady: false`; after ~15s (schema sync), returns 200 with `payloadReady: true`.

- [ ] **Step 3: Commit**

```bash
git add backend/src/app/\(payload\)/api/health/route.ts
git commit -m "feat(backend): add /api/health endpoint for startup readiness"
```

---

### Task 2: Increase Website Client Timeout

**Files:**
- Modify: `website/src/lib/payload-client.ts:13`

**Interfaces:**
- Changes: `DEFAULT_TIMEOUT` from `15_000` to `30_000`

- [ ] **Step 1: Update timeout constant**

```ts
const DEFAULT_TIMEOUT = 30_000; // was 15_000
```

- [ ] **Step 2: Verify no regressions**

Run: `pnpm --filter website check`

- [ ] **Step 3: Commit**

```bash
git add website/src/lib/payload-client.ts
git commit -m "fix(website): increase Payload API timeout to 30s for cold starts"
```

---

### Task 3: Fix Module Warning in Website

**Files:**
- Modify: `website/package.json`

**Interfaces:**
- Adds: `"type": "module"` to package.json root

- [ ] **Step 1: Add module type**

In `website/package.json`, after `"license": "MIT",` add:

```json
"type": "module",
```

- [ ] **Step 2: Verify warning gone**

Run: `pnpm --filter website dev` — confirm no `MODULE_TYPELESS_PACKAGE_JSON` warning.

- [ ] **Step 3: Commit**

```bash
git add website/package.json
git commit -m "chore(website): add type module to suppress ESM warning"
```

---

### Task 4: Root Orchestration Script for Sequential Startup

**Files:**
- Create: `scripts/dev-sequential.mjs`
- Modify: `package.json` (root) — add new script entry

**Interfaces:**
- Consumes: backend health endpoint (`http://localhost:3000/api/health`)
- Produces: managed child processes for backend and website

- [ ] **Step 1: Create orchestration script**

`scripts/dev-sequential.mjs`:

```js
#!/usr/bin/env node
// Sequential dev startup: backend → health check → website
// Usage: pnpm dev (from root package.json)

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const BACKEND_DIR = resolve(ROOT, 'backend')
const WEBSITE_DIR = resolve(ROOT, 'website')

const HEALTH_URL = 'http://localhost:3000/api/health'
const POLL_INTERVAL_MS = 1000
const MAX_WAIT_MS = 60_000 // 60s max wait for backend

function run(cmd, args, cwd, name) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, FORCE_COLOR: '1' },
    })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${name} exited with code ${code}`))
    })
    child.on('error', reject)
    // Store reference for cleanup
    processes.push({ child, name })
  })
}

async function waitForHealth() {
  const start = Date.now()
  console.log('[dev] Waiting for backend health check...')
  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(HEALTH_URL)
      const data = await res.json()
      if (data.payloadReady === true && res.ok) {
        console.log('[dev] Backend ready!')
        return
      }
      process.stdout.write('.')
    } catch {
      process.stdout.write('.')
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
  throw new Error(`Backend health check timed out after ${MAX_WAIT_MS}ms`)
}

const processes = []

async function main() {
  console.log('[dev] Starting backend...')
  const backendPromise = run('pnpm', ['dev'], BACKEND_DIR, 'backend')

  try {
    await waitForHealth()
  } catch (err) {
    console.error('\n[dev] Backend failed to become ready:', err.message)
    processes.forEach((p) => p.child.kill())
    process.exit(1)
  }

  console.log('[dev] Starting website...')
  const websitePromise = run('pnpm', ['dev'], WEBSITE_DIR, 'website')

  // Wait for both (they run until killed)
  await Promise.all([backendPromise, websitePromise])
}

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n[dev] Shutting down...')
  processes.forEach((p) => p.child.kill())
  process.exit(0)
})
process.on('SIGTERM', () => {
  processes.forEach((p) => p.child.kill())
  process.exit(0)
})

main().catch((err) => {
  console.error('[dev] Fatal:', err)
  processes.forEach((p) => p.child.kill())
  process.exit(1)
})
```

- [ ] **Step 2: Make script executable (Unix) / ensure works on Windows**

No chmod needed on Windows; Node runs `.mjs` directly. Verify script runs: `node scripts/dev-sequential.mjs` (will start both, Ctrl+C to stop).

- [ ] **Step 3: Update root package.json scripts**

In root `package.json`, replace `"dev"` script and add `"dev:seq"`:

```json
"scripts": {
  "dev": "node scripts/dev-sequential.mjs",
  "dev:seq": "node scripts/dev-sequential.mjs",
  "dev:backend": "pnpm --filter ./backend dev",
  "dev:website": "pnpm --filter ./website dev",
  "dev:parallel": "pnpm --parallel -r run dev",
  "build": "pnpm -r run build",
  "build:backend": "pnpm --filter ./backend build",
  "build:website": "pnpm --filter ./website build",
  "generate:types": "pnpm --filter ./backend generate:types && pnpm --filter ./website generate:types"
}
```

- [ ] **Step 4: Test sequential startup**

Run: `pnpm dev` from root

Expected:
1. Backend starts, prints "Ready in ~1400ms"
2. Script polls health endpoint (shows dots)
3. After ~15s, health returns `payloadReady: true`
4. Website starts, prints "astro ready in ~7s"
5. First page load at `http://localhost:4321` succeeds without timeout errors

- [ ] **Step 5: Verify parallel still works**

Run: `pnpm dev:parallel` — both start simultaneously (old behavior).

- [ ] **Step 6: Commit**

```bash
git add scripts/dev-sequential.mjs package.json
git commit -m "feat(root): sequential dev startup with backend health check"
```

---

### Task 5: (Optional) Pre-warm Backend Schema at Startup

**Files:**
- Modify: `backend/src/index.ts` or create `backend/src/scripts/prewarm.ts`
- Modify: `backend/package.json` — add prewarm script if separate

**Note:** This is optional. The health check in Task 1 already waits for schema. Pre-warming moves the cost earlier but doesn't reduce total time. Include only if you want backend to be "ready" before first health poll.

- [ ] **Step 1: Create prewarm script (if desired)**

`backend/src/scripts/prewarm.ts`:

```ts
import { getPayload } from 'payload'
import config from '@/payload.config'

await getPayload({ config })
console.log('[Prewarm] Payload schema loaded')
process.exit(0)
```

Add to `backend/package.json` scripts:
```json
"prewarm": "cross-env NODE_OPTIONS=--no-deprecation tsx src/scripts/prewarm.ts"
```

- [ ] **Step 2: Update orchestration script to run prewarm**

In `scripts/dev-sequential.mjs`, before polling health, run:
```js
await run('pnpm', ['prewarm'], BACKEND_DIR, 'backend-prewarm')
```
Then start backend dev server.

- [ ] **Step 3: Test and commit** (if implemented)

---

### Task 6: End-to-End Verification

**Files:** none (commands only)

- [ ] **Step 1: Clean build**

Run: `pnpm build` from root — both packages build without errors.

- [ ] **Step 2: Sequential dev startup**

Run: `pnpm dev` from root — verify:
- Backend starts first
- Health check polls and succeeds
- Website starts after backend ready
- Open `http://localhost:4321` — home page loads without "[Payload] timeout" errors
- Navigate between pages — all API calls succeed

- [ ] **Step 3: Parallel dev still works**

Run: `pnpm dev:parallel` — both start together (for comparison).

- [ ] **Step 4: Individual package dev works**

Run: `pnpm dev:backend` — only backend.
Run: `pnpm dev:website` — only website (will timeout if backend not running — expected).

- [ ] **Step 5: Report results**

Summary for user: timings, any issues, confirmation that initial load no longer times out.

---

## Execution Handoff

**Plan complete and saved to `.opencode/plans/2026-08-24-sequential-startup-healthcheck.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**