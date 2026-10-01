import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AvatarPicker } from '../components/ui/AvatarPicker';
import { FormField } from '../components/ui/FormField';
import { useAuth } from '../context/AuthContext';
import { fieldErrors, profileSchema } from '../lib/validation';
import { profiles, storage } from '../repositories';

const input = 'w-full rounded-md border border-ink/20 bg-white px-3 py-2.5';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ fullName: '', phone: '', bio: '', avatarUrl: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    if (profile) setForm({ fullName: profile.fullName, phone: profile.phone, bio: profile.bio, avatarUrl: profile.avatarUrl ?? '' });
  }, [profile]);

  const set = (k: 'fullName' | 'phone' | 'bio') => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function pickPhoto(file: File) {
    if (!user) return;
    setPhotoBusy(true);
    setStatus(null);
    try {
      const url = await storage.upload(file, user.id);
      setForm((f) => ({ ...f, avatarUrl: url }));
    } catch (err) {
      setStatus({ ok: false, text: err instanceof Error ? err.message : 'Could not upload the photo.' });
    }
    setPhotoBusy(false);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    if (!user) return;
    setErrors({});
    setSaving(true);
    const previous = profile?.avatarUrl;
    try {
      await profiles.update(user.id, parsed.data);
      await refreshProfile();
      if (previous && previous !== parsed.data.avatarUrl) void storage.removeByUrls([previous]).catch(() => undefined);
      setStatus({ ok: true, text: 'Profile saved.' });
    } catch (err) {
      setStatus({ ok: false, text: err instanceof Error ? err.message : 'Could not save your profile.' });
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold">Your profile</h1>
      <p className="mt-1 text-ink/70">
        {user?.email}
        {profile?.role === 'admin' && <span className="ml-2 rounded-full btn-primary px-2 py-0.5 text-xs font-semibold text-white">Admin</span>}
      </p>

      <form onSubmit={save} noValidate className="mt-8 space-y-5">
        <AvatarPicker src={form.avatarUrl || null} initial={(form.fullName || user?.email || '?').charAt(0).toUpperCase()}
          onPick={(f) => void pickPhoto(f)} onRemove={() => setForm((f) => ({ ...f, avatarUrl: '' }))} busy={photoBusy} />
        <FormField id="fullName" label="Full name" error={errors.fullName}>
          <input id="fullName" autoComplete="name" className={input} value={form.fullName} onChange={set('fullName')} maxLength={80} />
        </FormField>
        <FormField id="phone" label="Phone number" error={errors.phone} hint="Shown to signed-in visitors on your listings so they can contact you.">
          <input id="phone" type="tel" autoComplete="tel" className={input} value={form.phone} onChange={set('phone')} maxLength={20} />
        </FormField>
        <FormField id="bio" label="About you" error={errors.bio}>
          <textarea id="bio" rows={4} className={input} value={form.bio} onChange={set('bio')} maxLength={300} />
        </FormField>
        {status && <p role="status" className={status.ok ? 'text-brand' : 'text-red-700'}>{status.text}</p>}
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={saving || photoBusy} className="rounded-md btn-primary px-6 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">{saving ? 'Saving…' : 'Save profile'}</button>
          <Link to="/dashboard" className="text-sm font-semibold text-brand underline">My listings</Link>
        </div>
      </form>
    </div>
  );
}
