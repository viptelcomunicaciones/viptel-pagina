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