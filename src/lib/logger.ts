import { supabase } from './supabase';

export type LogLevel = 'error' | 'warn' | 'security';

// Redaction: nothing that identifies a person or authenticates a request may reach a log line.
const JWT = /eyJ[\w-]+\.[\w-]+\.[\w-]+/g;
const SECRET = /(password|token|apikey|api_key|secret|authorization|cookie)\s*[=:]\s*\S+/gi;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const PHONE = /\+?\d[\d\s-]{8,}\d/g;
const LONG_ID = /\b[A-Za-z0-9_-]{32,}\b/g;
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

export function redact(input: unknown): string {
  return String(input ?? '')
    .replace(JWT, '[token]').replace(SECRET, '$1=[redacted]').replace(EMAIL, '[email]')
    .replace(UUID, '[id]').replace(LONG_ID, '[id]').replace(PHONE, '[phone]').slice(0, 300);
}

/** Short random reference shown to the user so support can find the matching log line. */
export function newReference(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
}

let recent: number[] = [];

async function persist(record: { reference: string; level: LogLevel; code: string; message: string; route: string }) {
  if (!supabase || !navigator.onLine) return;
  const now = Date.now();
  recent = recent.filter((t) => now - t < 60_000);
  if (recent.length >= 5) return; // client-side flood guard; the database enforces its own hourly cap
  recent.push(now);
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return; // only signed-in users may write logs (see supabase/007)
    await supabase.from('error_logs').insert(record);
  } catch {
    /* logging must never throw */
  }
}

export function logEvent(e: { level: LogLevel; code: string; area?: string; error?: unknown }): string {
  const reference = newReference();
  const message = redact((e.error as { message?: unknown } | null | undefined)?.message);
  const route = redact(window.location.hash.split('?')[0]).slice(0, 120);
  const line = { ts: new Date().toISOString(), level: e.level, code: e.code, area: e.area, ref: reference, route, message };
  (e.level === 'error' ? console.error : console.warn)(JSON.stringify(line));
  void persist({ reference, level: e.level, code: e.code.slice(0, 40), message, route });
  return reference;
}

export function installGlobalErrorHandlers(): void {
  window.addEventListener('error', (ev) => logEvent({ level: 'error', code: 'window_error', area: 'global', error: ev.error ?? { message: ev.message } }));
  window.addEventListener('unhandledrejection', (ev) => logEvent({ level: 'error', code: 'unhandled_rejection', area: 'global', error: ev.reason }));
}
