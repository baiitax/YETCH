// Vercel serverless function: POST /api/enquiry
// No local disk storage on Vercel, so the notification destination must accept the record
// (NOTIFY_WEBHOOK_URL). Without it, the function returns 503 and reports nothing as received.
import { createEnquiryHandler } from '../src/server/enquiry.mjs';
import { createRateLimiter } from '../src/server/submissions.mjs';
import { loadConfig } from '../src/server/config.mjs';

const config = loadConfig();
const limiter = createRateLimiter({ max: config.rateLimitMax, windowMs: config.rateLimitWindowMs });

export default createEnquiryHandler({ store: null, limiter, config });
