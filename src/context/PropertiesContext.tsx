import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Property } from '../types/property';
import { toAppError, type AppError } from '../lib/errors';
import { sampleListings } from '../data/sampleListings';
import { isSupabaseConfigured } from '../lib/supabase';
import { repository } from '../repositories';

// Set VITE_SAMPLE_DATA=off to hide the built-in demonstration listings.
const SAMPLES_ENABLED = import.meta.env.VITE_SAMPLE_DATA !== 'off';

interface PropertiesValue {
  properties: Property[];
  loading: boolean;
  error: string | null;
  failure: AppError | null;
  /** True while the sample listings are shown because there are no real properties yet. */
  usingSamples: boolean;
  refresh: () => Promise<void>;
}

const PropertiesContext = createContext<PropertiesValue | null>(null);

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingSamples, setUsingSamples] = useState(false);
  const [failure, setFailure] = useState<AppError | null>(null);

  const refresh = useCallback(async () => {
    try {
      const real = isSupabaseConfigured ? await repository.list() : [];
      const useSamples = real.length === 0 && SAMPLES_ENABLED;
      setProperties(useSamples ? sampleListings() : real);
      setUsingSamples(useSamples);
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

  const value = useMemo(() => ({ properties, loading, error: failure?.message ?? null, failure, usingSamples, refresh }), [properties, loading, failure, usingSamples, refresh]);
  return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>;
}

export function useProperties(): PropertiesValue {
  const ctx = useContext(PropertiesContext);
  if (!ctx) throw new Error('useProperties must be used inside <PropertiesProvider>');
  return ctx;
}
