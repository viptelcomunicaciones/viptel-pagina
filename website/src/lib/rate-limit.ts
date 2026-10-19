const requestCounts = new Map<string, { count: number; resetTime: number }>();

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000;
const MAX_MAP_SIZE = 5_000;

function pruneExpired(now: number): void {
  for (const [key, entry] of requestCounts.entries()) {
    if (now > entry.resetTime) {
      requestCounts.delete(key);
    }
  }
  if (requestCounts.size > MAX_MAP_SIZE) {
    const oldestKey = requestCounts.keys().next().value;
    if (oldestKey !== undefined) {
      requestCounts.delete(oldestKey);
    }
  }
}

export function getClientIp(request?: Request, clientAddress?: string): string {
  if (request) {
    const cfIp = request.headers.get('cf-connecting-ip')?.trim();
    if (cfIp) return cfIp;
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      const firstIp = forwardedFor.split(',')[0]?.trim();
      if (firstIp) return firstIp;
    }
    const realIp = request.headers.get('x-real-ip')?.trim();
    if (realIp) return realIp;
  }
  return clientAddress || 'unknown';
}

export function rateLimit(identifier: string): boolean {
  const now = Date.now();
  if (requestCounts.size > 200) {
    pruneExpired(now);
  }

  const entry = requestCounts.get(identifier);

  if (!entry || now > entry.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS) return true;

  return false;
}
