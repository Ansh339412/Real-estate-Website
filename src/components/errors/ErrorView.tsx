import { motion } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ErrorKind } from '../../lib/errors';
import { Logo } from '../ui/Logo';
import { ease } from '../ui/motion';

export type ErrorCode = 401 | 403 | 404 | 429 | 500 | 'network' | 'generic';
type IconName = 'lock' | 'ban' | 'compass' | 'hourglass' | 'alert' | 'wifi';

export const kindToCode = (kind: ErrorKind | null | undefined): ErrorCode =>
  ({ unauthorized: 401, forbidden: 403, 'not-found': 404, 'rate-limited': 429, server: 500, network: 'network', unknown: 'generic' } as const)[kind ?? 'unknown'];

// Plain, friendly copy only. Nothing technical ever appears on these pages.
const CONTENT: Record<ErrorCode, { label: string; title: string; text: string; icon: IconName }> = {
  401: { label: '401', title: 'Authentication required', text: 'Please sign in to view this page.', icon: 'lock' },
  403: { label: '403', title: 'Access denied', text: "You don't have permission to access this page.", icon: 'ban' },
  404: { label: '404', title: 'Page not found', text: "The page you're looking for doesn't exist or may have been moved.", icon: 'compass' },
  429: { label: '429', title: 'Too many requests', text: 'Please wait a moment and try again.', icon: 'hourglass' },
  500: { label: '500', title: 'Something went wrong', text: "We couldn't complete your request right now. Please try again.", icon: 'alert' },
  network: { label: 'Offline', title: 'Connection problem', text: 'Check your internet connection and try again.', icon: 'wifi' },
  generic: { label: 'Oops', title: 'Something unexpected happened', text: 'Please try again. If it keeps happening, come back a little later.', icon: 'alert' },
};

const ICONS: Record<IconName, ReactNode> = {
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  ban: <><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  hourglass: <path d="M7 3h10M7 21h10M8 3v3.5a4 4 0 0 0 1.5 3.1L12 12l-2.5 2.4A4 4 0 0 0 8 17.5V21M16 3v3.5a4 4 0 0 1-1.5 3.1L12 12l2.5 2.4A4 4 0 0 1 16 17.5V21" />,
  alert: <><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></>,
  wifi: <><path d="M2 8.8a15 15 0 0 1 4-2.4M22 8.8a15 15 0 0 0-8-3.6M5 12.9a10 10 0 0 1 5-2.7M19 12.9a10 10 0 0 0-2.5-1.9M8.5 16.4a5 5 0 0 1 7 0" /><circle cx="12" cy="20" r="1" /><path d="m3 3 18 18" /></>,
};

interface Props {
  code: ErrorCode;
  /** Short support reference that matches a redacted log entry. */
  reference?: string;
  onRetry?: () => void;
  signInFrom?: string;
  fullScreen?: boolean;
}

const secondary = 'rounded-full border border-ink/20 bg-white px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:border-brand hover:text-brand hover:shadow-md';

export function ErrorView({ code, reference, onRetry, signInFrom, fullScreen = false }: Props) {
  const c = CONTENT[code];
  const navigate = useNavigate();
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = `${c.title} | Hearth & Key`;
    heading.current?.focus();
  }, [c.title]);

  const action =
    code === 401 ? <Link to="/login" state={{ from: signInFrom }} className={secondary}>Sign in</Link>
    : code === 403 || code === 404 ? <button type="button" onClick={() => navigate(-1)} className={secondary}>Go back</button>
    : <button type="button" onClick={onRetry ?? (() => window.location.reload())} className={secondary}>Try again</button>;

  const body = (
    <div className={`relative flex items-center justify-center overflow-hidden px-4 py-16 ${fullScreen ? 'min-h-screen' : 'min-h-[70vh]'}`}>
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-10 h-60 w-60 rounded-full bg-teal/15 blur-3xl" />
      {fullScreen && <div className="absolute left-6 top-6"><Logo /></div>}
      <motion.section aria-labelledby="error-title" className="glass relative w-full max-w-lg rounded-3xl p-8 text-center shadow-xl sm:p-12"
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
        <div aria-hidden="true" className="btn-primary mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICONS[c.icon]}</svg>
        </div>
        <p aria-hidden="true" className="mt-5 bg-gradient-to-r from-brand to-teal bg-clip-text font-display text-6xl font-bold text-transparent">{c.label}</p>
        <h1 id="error-title" ref={heading} tabIndex={-1} className="mt-2 text-2xl font-bold outline-none sm:text-3xl">{c.title}</h1>
        <p className="mx-auto mt-3 max-w-sm text-ink/70">{c.text}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-primary rounded-full px-6 py-3 font-semibold shadow-md">Go home</Link>
          {action}
        </div>
        {reference && <p className="mt-6 text-xs text-ink/50">Reference: <code className="font-mono">{reference}</code></p>}
      </motion.section>
    </div>
  );
  return fullScreen ? <main>{body}</main> : body;
}
