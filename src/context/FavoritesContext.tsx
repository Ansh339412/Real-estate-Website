import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { repository } from '../repositories';
import { useAuth } from './AuthContext';

interface FavoritesValue {
  ids: string[];
  isFavorite: (id: string) => boolean;
  /** Saving works for everyone. Signed-in users are stored in the database; visitors keep them for this visit only. */
  toggle: (id: string) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);
const isSample = (id: string) => id.startsWith('sample-');

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [ids, setIds] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let cancelled = false;
    setIds([]);
    if (!userId) return;
    repository.listFavoriteIds(userId).then((list) => !cancelled && setIds(list)).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const say = (text: string) => {
    setToast(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2800);
  };

  const toggle = useCallback(
    async (id: string) => {
      const on = !ids.includes(id);
      setIds((prev) => (on ? [...prev, id] : prev.filter((x) => x !== id)));
      say(on ? (userId ? 'Saved to your homes' : 'Saved for this visit. Sign in to keep your saved homes.') : 'Removed from saved homes');
      if (userId && !isSample(id)) {
        try {
          await repository.setFavorite(userId, id, on);
        } catch {
          setIds((prev) => (on ? prev.filter((x) => x !== id) : [...prev, id]));
          say('We could not update your saved homes. Please try again.');
        }
      }
      return true;
    },
    [userId, ids],
  );

  const value = useMemo(() => ({ ids, isFavorite: (id: string) => ids.includes(id), toggle }), [ids, toggle]);
  return (
    <FavoritesContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[65] flex justify-center px-4">
        {toast && <p className="pointer-events-auto rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-xl">{toast}</p>}
      </div>
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
}
