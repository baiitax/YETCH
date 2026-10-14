// Runtime configuration from environment variables. Shared by the local server
// (scripts/serve.mjs) and the Vercel functions (api/*.js). See .env.example.
export function loadConfig(env = process.env) {
  const origins = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return {
    dataDir: env.DATA_DIR || null, // null = no local disk storage (serverless)
    maintenance: env.MAINTENANCE === '1',
    trustProxy: env.TRUST_PROXY === '1',
    notifyWebhookUrl: env.NOTIFY_WEBHOOK_URL || '',
    allowedOrigins: origins,
    hsts: env.HSTS === '1',
    frameAncestors: env.FRAME_ANCESTORS || "'self' https:",
    rateLimitMax: Number(env.RATE_LIMIT_MAX || 5),
    rateLimitWindowMs: Number(env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
    logRequests: env.LOG_REQUESTS === '1',
  };
}

export const MAX_BODY_BYTES = 16 * 1024;
