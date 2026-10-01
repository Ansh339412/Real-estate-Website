import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PasswordField } from '../components/ui/PasswordField';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { passwordSchema } from '../lib/validation';

export default function ResetPasswordPage() {
  const { user, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Choose a valid password');
      return;
    }

    setError('');
    setBusy(true);
    try {
      const { error: updateError } = await supabase!.auth.updateUser({ password: parsed.data });
      if (updateError) setError('This reset link may have expired. Request a new one and try again.');
      else setUpdated(true);
    } catch {
      setError('We could not update your password. Request a new reset link and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold">Choose a new password</h1>
      {loading ? (
        <p className="mt-4" role="status">Checking your reset link…</p>
      ) : updated ? (
        <div className="mt-4 space-y-4">
          <p role="status">Your password has been updated.</p>
          <Link to="/" className="inline-block rounded-md btn-primary px-5 py-3 font-semibold text-white">Continue</Link>
        </div>
      ) : !user ? (
        <div className="mt-4 space-y-4">
          <p role="alert">This reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="font-semibold text-brand underline">Request another reset link</Link>
        </div>
      ) : (
        <>
          <p className="mt-1 text-ink/70">Use at least 8 characters.</p>
          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            <PasswordField id="password" label="New password" value={password} onChange={setPassword}
              autoComplete="new-password" error={error} />
            <button type="submit" disabled={busy}
              className="w-full rounded-md btn-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60">
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}