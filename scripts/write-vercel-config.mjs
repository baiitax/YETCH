// Writes vercel.json: static output from dist/, the Content-Security-Policy and security
// headers (with the current inline-script hashes), and trailing-slash behaviour that matches
// the local server. Run after changing src/inline.mjs or the headers: npm run vercel:config
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { staticSecurityHeaders } from '../src/server/headers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function vercelConfig() {
  const headers = Object.entries(staticSecurityHeaders({ frameAncestors: "'self' https:" })).map(([key, value]) => ({ key, value }));
  return {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    framework: null,
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    trailingSlash: true,
    // The only rewrite: the health check. Everything else is static or api/*.js.
    rewrites: [{ source: '/healthz', destination: '/api/healthz' }],
    headers: [
      { source: '/(.*)', headers },
    ],
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await writeFile(path.join(ROOT, 'vercel.json'), JSON.stringify(vercelConfig(), null, 2) + '\n', 'utf8');
  console.log('Wrote vercel.json');
}
