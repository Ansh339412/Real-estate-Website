import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Property } from '../types/property';
import { toAppError, type AppError } from '../lib/errors';
import { repository } from '../repositories';

interface PropertiesValue {
  properties: Property[];
  loading: boolean;
  error: string | null;
  failure: AppError | null;
  refresh: () => Promise<void>;
}

const PropertiesContext = createContext<PropertiesValue | null>(null);

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    try {
      setProperties(await repository.list());
      setFailure(null);
    } catch (e) {
      setFailure(toAppError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ properties, loading, error: failure?.message ?? null, failure, refresh }), [properties, loading, failure, refresh]);
  return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>;
}

export function useProperties(): PropertiesValue {
  const ctx = useContext(PropertiesContext);
  if (!ctx) throw new Error('useProperties must be used inside <PropertiesProvider>');
  return ctx;
}
