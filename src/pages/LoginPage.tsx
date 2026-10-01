import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { FormField } from '../components/ui/FormField';
import { PasswordField } from '../components/ui/PasswordField';
import { useAuth } from '../context/AuthContext';
import { credentialsSchema, fieldErrors } from '../lib/validation';

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  if (user) return <Navigate to={from} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setBusy(true);
    setMessage(await signIn(parsed.data.email, parsed.data.password));
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-1 text-ink/70">Sign in to save homes and manage your listings.</p>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <FormField id="email" label="Email" error={errors.email}>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(errors.email)}
            className="w-full rounded-md border border-ink/20 bg-white px-3 py-2.5" />
        </FormField>
        <PasswordField id="password" label="Password" value={password} onChange={setPassword} autoComplete="current-password" error={errors.password} />
        {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-md btn-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        New here? <Link to="/signup" className="font-semibold text-brand underline">Create your account</Link>
      </p>
    </div>
  );
}
