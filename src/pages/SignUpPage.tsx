import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FormField } from '../components/ui/FormField';
import { PasswordField } from '../components/ui/PasswordField';
import { ease } from '../components/ui/motion';
import { useAuth } from '../context/AuthContext';
import { fieldErrors, signUpSchema } from '../lib/validation';

const input = 'w-full rounded-md border border-ink/20 bg-white px-3 py-2.5';
const PERKS = ['Save homes and come back to them anytime', 'List your own property with photos in minutes', 'Keep your details in one place'];
const EMPTY = { fullName: '', phone: '', bio: '', email: '', password: '', confirmPassword: '' };

export default function SignUpPage() {
  const { user, signUp } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  if (user && !busy && !awaitingConfirmation) return <Navigate to="/" replace />;

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const bad = (k: string) => ({ 'aria-invalid': Boolean(errors[k]), 'aria-describedby': errors[k] ? `${k}-err` : undefined });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setMessage(null);
    setBusy(true);
    const { fullName, phone, bio, email, password } = parsed.data;
    const result = await signUp({ fullName, phone, bio, email, password });
    setBusy(false);
    if (result.error) setMessage(result.error);
    else if (result.needsConfirmation) setAwaitingConfirmation(true);
  }

  if (awaitingConfirmation) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Check your email</h1>
        <p className="mt-3 text-ink/80">We sent a confirmation link to <strong>{form.email}</strong>. Open it, then sign in to start using your account.</p>
        <p className="mt-2 text-sm text-ink/60">Once you are signed in, we will invite you to add a profile photo.</p>
        <Link to="/login" className="mt-6 inline-block rounded-full btn-primary px-6 py-3 font-semibold text-white hover:bg-brand-dark">Go to sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_1.3fr]">
      <aside className="surface-hero relative hidden overflow-hidden rounded-3xl p-8 text-white lg:block">
        <h2 className="text-3xl font-bold leading-tight">Your next home starts here.</h2>
        <ul className="mt-6 space-y-4">
          {PERKS.map((perk, i) => (
            <motion.li key={perk} className="flex gap-3 text-white/85" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease }}>
              <span aria-hidden="true" className="mt-0.5 text-accent">✓</span>{perk}
            </motion.li>
          ))}
        </ul>
      </aside>

      <section aria-labelledby="signup-title" className="rounded-3xl border border-ink/10 bg-white p-6 sm:p-8">
        <h1 id="signup-title" className="text-3xl font-bold">Create your account</h1>
        <p className="mt-1 text-ink/70">Tell us about yourself once. You can change it anytime, and you can add a photo right after you sign in.</p>

        <form onSubmit={submit} noValidate className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="fullName" label="Full name" error={errors.fullName}>
              <input id="fullName" autoComplete="name" className={input} value={form.fullName} onChange={set('fullName')} maxLength={80} {...bad('fullName')} />
            </FormField>
            <FormField id="phone" label="Phone number" error={errors.phone}>
              <input id="phone" type="tel" autoComplete="tel" className={input} value={form.phone} onChange={set('phone')} maxLength={20} {...bad('phone')} />
            </FormField>
          </div>
          <FormField id="email" label="Email" error={errors.email}>
            <input id="email" type="email" autoComplete="email" className={input} value={form.email} onChange={set('email')} {...bad('email')} />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <PasswordField id="password" label="Password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} autoComplete="new-password" error={errors.password} hint="At least 8 characters" />
            <PasswordField id="confirmPassword" label="Confirm password" value={form.confirmPassword} onChange={(v) => setForm((f) => ({ ...f, confirmPassword: v }))} autoComplete="new-password" error={errors.confirmPassword} />
          </div>
          <FormField id="bio" label="About you (optional)" error={errors.bio} hint="A line or two for buyers or tenants who contact you.">
            <textarea id="bio" rows={3} className={input} value={form.bio} onChange={set('bio')} maxLength={300} {...bad('bio')} />
          </FormField>

          <p className="text-xs text-ink/60">Your name, phone number and email are shown to signed-in visitors on any property you post, so buyers and tenants can contact you.</p>
          {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
          <motion.button type="submit" disabled={busy} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-full btn-primary px-6 py-3.5 text-base font-semibold text-white shadow-md transition-shadow hover:shadow-lg disabled:opacity-70">
            {busy ? (<><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Creating your account…</>) : 'Create account'}
          </motion.button>
        </form>
        <p className="mt-5 text-center text-sm">Already have an account? <Link to="/login" className="font-semibold text-brand underline">Sign in</Link></p>
      </section>
    </div>
  );
}
