import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { repository } from '../repositories';
import { useAuth } from './AuthContext';

interface FavoritesValue {
  ids: string[];
  isFavorite: (id: string) => boolean;
  /** Returns false when the visitor must sign in first. Updates instantly, rolls back on failure. */
  toggle: (id: string) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setIds([]);
      return;
    }
    repository.listFavoriteIds(userId).then((list) => !cancelled && setIds(list)).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggle = useCallback(
    async (id: string) => {
      if (!userId) return false;
      const on = !ids.includes(id);
      setIds((prev) => (on ? [...prev, id] : prev.filter((x) => x !== id)));
      try {
        await repository.setFavorite(userId, id, on);
      } catch {
        setIds((prev) => (on ? prev.filter((x) => x !== id) : [...prev, id]));
      }
      return true;
    },
    [userId, ids],
  );

  const value = useMemo(() => ({ ids, isFavorite: (id: string) => ids.includes(id), toggle }), [ids, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
}
