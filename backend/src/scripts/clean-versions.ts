import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'
import { cleanVersions } from '../utilities/cleanVersions'

const payload = await getPayload({ config })
await cleanVersions(payload)
process.exit(0)