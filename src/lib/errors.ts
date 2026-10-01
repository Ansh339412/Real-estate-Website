import { logEvent } from './logger';

export type ErrorKind = 'unauthorized' | 'forbidden' | 'not-found' | 'rate-limited' | 'server' | 'network' | 'unknown';

// The ONLY texts users ever see for a failed request. Raw database/auth messages never reach the screen.
const MESSAGES: Record<ErrorKind, string> = {
  unauthorized: 'Please sign in to continue.',
  forbidden: "You don't have permission to do that.",
  'not-found': "We couldn't find what you were looking for.",
  'rate-limited': 'Too many requests. Please wait a moment and try again.',
  server: "We couldn't complete your request right now. Please try again.",
  network: 'Check your internet connection and try again.',
  unknown: 'Something went wrong. Please try again.',
};

export class AppError extends Error {
  constructor(readonly kind: ErrorKind, readonly reference: string) {
    super(MESSAGES[kind]);
    this.name = 'AppError';
  }
}

interface RawError { code?: string; status?: number; statusCode?: string | number; message?: string }

function classify(raw: unknown): { kind: ErrorKind; code: string } {
  const e = (raw ?? {}) as RawError;
  const status = Number(e.status ?? e.statusCode ?? 0);
  const code = String(e.code ?? '');
  const msg = String(e.message ?? '').toLowerCase();
  if (raw instanceof TypeError || msg.includes('failed to fetch') || msg.includes('networkerror') || !navigator.onLine) return { kind: 'network', code: 'network' };
  if (status === 429 || /rate[\s_-]*limit|too many (requests|emails)/.test(msg) || /rate[\s_-]*limit/.test(code.toLowerCase())) return { kind: 'rate-limited', code: 'rate_limited' };
  if (status === 401 || code === 'PGRST301' || code === 'PGRST303' || msg.includes('jwt')) return { kind: 'unauthorized', code: 'unauthorized' };
  if (status === 403 || code === '42501' || msg.includes('row-level security') || msg.includes('permission denied')) return { kind: 'forbidden', code: 'forbidden' };
  if (code === 'PGRST116' || status === 404) return { kind: 'not-found', code: 'not_found' };
  if (status >= 500) return { kind: 'server', code: `http_${status}` };
  return { kind: 'unknown', code: code ? `db_${code}`.slice(0, 40) : 'unknown' };
}

/** Converts anything thrown by Supabase/fetch into a safe AppError and writes a redacted log entry. */
export function toAppError(raw: unknown, area = 'api'): AppError {
  if (raw instanceof AppError) return raw;
  const { kind, code } = classify(raw);
  if (kind === 'not-found') return new AppError(kind, '');
  const level = kind === 'unauthorized' || kind === 'forbidden' ? 'security' : kind === 'network' ? 'warn' : 'error';
  return new AppError(kind, logEvent({ level, code, area, error: raw }));
}

/** Auth failures: deliberately vague so the form cannot be used to discover which emails have accounts. */
export function authErrorMessage(raw: unknown, mode: 'signin' | 'signup' | 'recovery'): string {
  const { kind } = classify(raw);
  const error = (raw ?? {}) as RawError;
  const code = String(error.code ?? '');
  const message = String(error.message ?? '').toLowerCase();
  const safeCode = /^[a-z0-9_-]{1,40}$/i.test(code) ? ` (code: ${code})` : '';
  logEvent({ level: 'security', code: `auth_${mode}_${code || kind}`.slice(0, 40), area: 'auth' });
  if (kind === 'rate-limited') return MESSAGES['rate-limited'];
  if (kind === 'network') return MESSAGES.network;
  if (mode === 'recovery') {
    if (code.includes('redirect') || message.includes('redirect') || message.includes('allow list')) {
      return 'The recovery redirect is not allowed. Check Supabase Authentication URL Configuration.';
    }
    if (/sender|smtp|email/.test(code.toLowerCase()) || /sender|smtp|email/.test(message) || kind === 'server') {
      return `Supabase could not deliver the reset email. Verify the SMTP key and an approved sender address with your provider, then check its delivery logs${safeCode}.`;
    }
    return `We could not request a reset email. Check Supabase Auth settings${safeCode}.`;
  }
  if (code === 'invalid_credentials') return 'Incorrect email or password.';
  if (code === 'email_not_confirmed') return 'Please confirm your email address, then sign in.';
  if (code === 'weak_password') return 'Please choose a stronger password.';
  return mode === 'signin' ? 'We could not sign you in. Please try again.' : 'We could not create your account. Please check your details and try again.';
}
