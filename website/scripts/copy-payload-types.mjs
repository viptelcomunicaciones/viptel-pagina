/**
 * Copies the backend's generated `payload-types.ts` into the website.
 * Run after `payload generate:types` in the backend — see `generate:types`
 * scripts in package.json. Prevents drift between the two packages.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(scriptDir, '../..')

const source = path.join(root, 'backend', 'src', 'payload-types.ts')
const target = path.join(root, 'website', 'src', 'lib', 'payload-types.ts')

mkdirSync(path.dirname(target), { recursive: true })

// Strip the `declare module 'payload'` augmentation: it only makes sense inside
// the backend, which has `payload` installed — the website would fail to typecheck.
const content = readFileSync(source, 'utf8').replace(/\n*declare module 'payload' \{[\s\S]*?\}\s*$/, '\n')

writeFileSync(target, content)

process.stdout.write(`[types] ${path.relative(root, source)} -> ${path.relative(root, target)}\n`)
