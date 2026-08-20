const requestCounts = new Map<string, { count: number; resetTime: number }>();

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000;

export function rateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(identifier);

  if (!entry || now > entry.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS) return true;

  return false;
}
