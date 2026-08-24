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