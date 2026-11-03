import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'
import { cleanVersions } from '../utilities/cleanVersions'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const keepArg = args.find((a) => a.startsWith('--keep='))
const keepParsed = keepArg ? parseInt(keepArg.split('=')[1], 10) : 5
const keep = isNaN(keepParsed) || keepParsed < 1 ? 5 : keepParsed

const payload = await getPayload({ config })
await cleanVersions(payload, { dryRun, keep })
process.exit(0)
