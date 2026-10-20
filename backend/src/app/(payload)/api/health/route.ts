import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.count({ collection: 'users', overrideAccess: true })
    return NextResponse.json({
      status: 'ok',
      payloadReady: true,
      dbConnected: true,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[Health] Payload or database not ready:', err)
    return NextResponse.json(
      {
        status: 'unhealthy',
        payloadReady: false,
        dbConnected: false,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}