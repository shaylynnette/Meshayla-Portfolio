// Build-time cache busting for meshayla.com (runs on Netlify before publish; no dependencies).
// Rewrites /assets/css/*.css and /assets/js/*.js references in every HTML file to carry a
// content hash, e.g. /assets/css/enhance.css?v=3f9a1c2b7d. Because the URL changes whenever the
// file changes, netlify.toml can serve those files as immutable for a year.
// Idempotent: any existing ?v= is replaced, so running it twice gives the same result.
// Fails loudly (non-zero exit) if a referenced file is missing, so Netlify keeps the last good deploy.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const SKIP = new Set(['.git', 'node_modules', 'netlify', 'scripts']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const hashCache = new Map();
function hashOf(urlPath) {
  if (hashCache.has(urlPath)) return hashCache.get(urlPath);
  const file = join(root, urlPath);
  if (!existsSync(file)) throw new Error(`Referenced asset not found: ${urlPath}`);
  const h = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 10);
  hashCache.set(urlPath, h);
  return h;
}

const ref = /((?:href|src)=")(\/assets\/(?:css|js)\/[A-Za-z0-9._-]+\.(?:css|js))(?:\?v=[A-Za-z0-9]+)?(")/g;
let pages = 0, refs = 0;
for (const file of walk(root)) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(ref, (_, a, path, q) => { refs++; return `${a}${path}?v=${hashOf(path)}${q}`; });
  if (after !== before) { writeFileSync(file, after); pages++; }
}
console.log(`fingerprint: ${refs} references in ${pages} pages, ${hashCache.size} unique assets`);
for (const [p, h] of hashCache) console.log(`  ${h}  ${p}`);
