import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profiles, storage } from '../../repositories';
import { AvatarPicker } from './AvatarPicker';
import { ease } from './motion';

const flagKey = (id: string) => `hk_photo_prompt_${id}`;
const wasSkipped = (id: string) => {
  try {
    return localStorage.getItem(flagKey(id)) === '1';
  } catch {
    return false;
  }
};

/** Shown once after the first sign-in (i.e. after email confirmation) to a user with no photo yet. */
export function PhotoPrompt() {
  const { user, profile, refreshProfile } = useAuth();
  const [skipped, setSkipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const visible = Boolean(user && profile && !profile.avatarUrl && !skipped && !wasSkipped(user.id));

  const skip = () => {
    if (user) {
      try {
        localStorage.setItem(flagKey(user.id), '1');
      } catch {
        /* ignore */
      }
    }
    setSkipped(true);
  };

  useEffect(() => {
    if (!visible) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && skip();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  async function pick(file: File) {
    if (!user || !profile) return;
    setBusy(true);
    setError(null);
    try {
      const avatarUrl = await storage.upload(file, user.id);
      await profiles.update(user.id, { fullName: profile.fullName, phone: profile.phone, bio: profile.bio, avatarUrl });
      await refreshProfile();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not upload your photo.');
    }
    setBusy(false);
  }

  return (
    <AnimatePresence>
      {visible && profile && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="photo-title"
            className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl outline-none"
            initial={{ y: 30, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.4, ease }}>
            <h2 id="photo-title" className="text-2xl font-bold">Welcome{profile.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}</h2>
            <p className="mt-2 text-ink/70">Your email is confirmed. Add a profile photo so buyers and tenants know who they are talking to.</p>
            <div className="mt-6">
              <AvatarPicker src={null} initial={(profile.fullName || profile.email || '?').charAt(0).toUpperCase()} onPick={(f) => void pick(f)} busy={busy} />
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
            <button type="button" onClick={skip} disabled={busy} className="mt-6 text-sm font-semibold text-brand underline disabled:opacity-50">Skip for now</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
