import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { PropertyFilters } from '../types/property';

export const DEFAULT_FILTERS: PropertyFilters = {
  query: '',
  status: 'all',
  types: [],
  minPrice: null,
  maxPrice: null,
  minBedrooms: null,
  city: '',
  minArea: null,
  maxArea: null,
  amenities: [],
  postedWithin: null,
  sort: 'newest',
};

type FilterAction = { type: 'update'; patch: Partial<PropertyFilters> } | { type: 'reset' };

function filterReducer(state: PropertyFilters, action: FilterAction): PropertyFilters {
  switch (action.type) {
    case 'update':
      return { ...state, ...action.patch };
    case 'reset':
      return DEFAULT_FILTERS;
  }
}

interface FilterContextValue {
  filters: PropertyFilters;
  updateFilters: (patch: Partial<PropertyFilters>) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, dispatch] = useReducer(filterReducer, DEFAULT_FILTERS);
  const updateFilters = useCallback((patch: Partial<PropertyFilters>) => dispatch({ type: 'update', patch }), []);
  const resetFilters = useCallback(() => dispatch({ type: 'reset' }), []);
  const value = useMemo(() => ({ filters, updateFilters, resetFilters }), [filters, updateFilters, resetFilters]);
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used inside <FilterProvider>');
  return ctx;
}
