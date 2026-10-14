// Vercel serverless function: GET /api/healthz
import { loadConfig } from '../src/server/config.mjs';
import { sendJson } from '../src/server/http.mjs';

const config = loadConfig();

export default function handler(req, res) {
  sendJson(res, config, 200, { ok: true });
}
