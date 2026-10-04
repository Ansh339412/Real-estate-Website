import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../components/ui/FormField';
import { authErrorMessage } from '../lib/errors';
import { recoveryLimiter } from '../lib/rateLimit';
import { supabase } from '../lib/supabase';
import { emailSchema } from '../lib/validation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter a valid email address');
      return;
    }

    if (!supabase) {
      setMessage('Password reset is not available right now.');
      return;
    }
    const wait = recoveryLimiter.retryAfterSeconds();
    if (wait > 0) {
      setMessage(`Too many requests. Please wait ${wait} seconds and try again.`);
      return;
    }
    recoveryLimiter.record();
    setError('');
    setMessage('');
    setBusy(true);
    const redirectTo = `${window.location.origin}${window.location.pathname}#/reset-password`;
    try {
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo });
      setMessage(requestError
        ? authErrorMessage(requestError, 'recovery')
        : 'If an account exists for that email, a password reset link is on its way.');
    } catch {
      setMessage('We could not reach Supabase. Check your internet connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold">Reset your password</h1>
      <p className="mt-1 text-ink/70">Enter the email address for your account.</p>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <FormField id="email" label="Email" error={error}>
          <input id="email" type="email" autoComplete="email" required value={email}
            onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(error)}
            className="w-full rounded-md border border-ink/20 bg-white px-3 py-2.5" />
        </FormField>
        {message && <p role="status" className="text-sm text-ink/80">{message}</p>}
        <button type="submit" disabled={busy}
          className="w-full rounded-md btn-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60">
          {busy ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-semibold text-brand underline">Back to sign in</Link>
      </p>
    </div>
  );
}