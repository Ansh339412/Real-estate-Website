// Fails the build if a privileged secret could be shipped to browsers.
// Run automatically after `vite build` (see package.json). Safe to run on its own: node scripts/security-check.mjs
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const failures = [];
const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = join(dir, name);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};

const JWT = /eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{10,}/g;
const PRIVATE = [/sb_secret_[\w-]+/, /service_role['"]?\s*[:=]\s*['"]/i, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /sk_live_[\w]+/];

function scan(file, text, { strictNames }) {
  for (const token of text.match(JWT) ?? []) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
      if (payload.role && payload.role !== 'anon') failures.push(`${file}: contains a JWT whose role is "${payload.role}" (only the public "anon" key may ship to browsers)`);
      else if (strictNames) failures.push(`${file}: contains a hard-coded Supabase key. Use environment variables instead.`);
    } catch { /* not a JWT */ }
  }
  for (const re of PRIVATE) if (re.test(text)) failures.push(`${file}: matches secret pattern ${re}`);
  if (strictNames && /service[_-]?role/i.test(text)) failures.push(`${file}: mentions a service role key`);
}

for (const f of [...walk('src'), ...walk('public'), 'index.html'].filter((f) => existsSync(f))) scan(f, readFileSync(f, 'utf8'), { strictNames: true });
for (const f of walk('dist').filter((f) => /\.(js|html|css|json|map)$/.test(f))) scan(f, readFileSync(f, 'utf8'), { strictNames: false });
for (const f of ['.env', '.env.local', '.env.production']) if (existsSync(f) && /service[_-]?role/i.test(readFileSync(f, 'utf8'))) failures.push(`${f}: contains a service role key. Remove it; never put it in a Vite project.`);

if (failures.length) {
  console.error('\nSECURITY CHECK FAILED\n' + failures.map((f) => ' - ' + f).join('\n') + '\n');
  process.exit(1);
}
console.log('Security check passed: no privileged secrets found in source or build output.');
