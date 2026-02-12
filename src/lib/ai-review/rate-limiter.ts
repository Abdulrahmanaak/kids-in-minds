const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10; // Conservative for audio requests

const timestamps: number[] = [];

export function checkRateLimit(): boolean {
  const now = Date.now();
  while (timestamps.length > 0 && now - timestamps[0] >= RATE_LIMIT_WINDOW_MS) {
    timestamps.shift();
  }
  return timestamps.length < MAX_REQUESTS_PER_WINDOW;
}

export function recordRequest(): void {
  timestamps.push(Date.now());
}

export async function waitForRateLimit(): Promise<void> {
  while (!checkRateLimit()) {
    const oldest = timestamps[0];
    const waitMs = RATE_LIMIT_WINDOW_MS - (Date.now() - oldest) + 100;
    console.log(`[Rate Limiter] Waiting ${Math.round(waitMs / 1000)}s for rate limit...`);
    await new Promise((resolve) => setTimeout(resolve, Math.min(waitMs, 10000)));
  }
}
