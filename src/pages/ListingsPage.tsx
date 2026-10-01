import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { ActiveFilters } from '../components/filters/ActiveFilters';
import { FilterSidebar } from '../components/filters/FilterSidebar';
import { PropertyGrid } from '../components/property/PropertyGrid';
import { ease } from '../components/ui/motion';
import { useFilters } from '../context/FilterContext';
import { useProperties } from '../context/PropertiesContext';
import type { SortOption } from '../types/property';
import { filterProperties } from '../utils/filterProperties';

const PAGE = 10;

export default function ListingsPage() {
  const { properties, loading, error } = useProperties();
  const { filters, updateFilters, resetFilters } = useFilters();
  const [drawer, setDrawer] = useState(false);
  const [layout, setLayout] = useState<'list' | 'grid'>('list');
  const [limit, setLimit] = useState(PAGE);

  const results = useMemo(() => filterProperties(properties, filters), [properties, filters]);
  const cities = useMemo(() => [...new Set(properties.map((p) => p.address.city))].sort(), [properties]);
  const amenityOptions = useMemo(() => [...new Set(properties.flatMap((p) => p.amenities))].sort().slice(0, 16), [properties]);
  useEffect(() => setLimit(PAGE), [filters]);

  const side = { filters, onChange: updateFilters, onReset: resetFilters, resultCount: results.length, cities, amenityOptions };
  const where = filters.city || 'all cities';
  const mode = filters.status === 'for-rent' ? 'for rent' : filters.status === 'for-sale' ? 'for sale' : 'for sale and rent';
  const view = (v: 'list' | 'grid', label: string) => (
    <button type="button" aria-pressed={layout === v} onClick={() => setLayout(v)} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${layout === v ? 'btn-primary' : 'hover:bg-mist'}`}>{label}</button>
  );

  return (
    <div>
      <div className="sticky top-[57px] z-30 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <label htmlFor="lp-q" className="sr-only">Search by city, locality or PIN code</label>
          <input id="lp-q" type="search" maxLength={100} value={filters.query} onChange={(e) => updateFilters({ query: e.target.value })} placeholder="City, locality or PIN code"
            className="min-w-[200px] flex-1 rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm" />
          <div className="flex items-center gap-2">
            <label htmlFor="lp-sort" className="sr-only">Sort by</label>
            <select id="lp-sort" value={filters.sort} onChange={(e) => updateFilters({ sort: e.target.value as SortOption })} className="rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm">
              <option value="newest">Newest first</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="area-desc">Largest area</option>
            </select>
            <div role="group" aria-label="Layout" className="hidden gap-1 rounded-lg border border-ink/15 bg-white p-1 sm:flex">{view('list', 'List')}{view('grid', 'Grid')}</div>
            <button type="button" onClick={() => setDrawer(true)} className="rounded-full border border-ink/20 bg-white px-4 py-2.5 text-sm font-semibold lg:hidden">Filters</button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[290px_1fr]">
        <FilterSidebar {...side} className="sticky top-32 hidden max-h-[calc(100vh-9rem)] overflow-y-auto lg:block" />

        <section aria-labelledby="results-title">
          <h1 id="results-title" className="text-2xl font-bold sm:text-3xl">Properties {mode} in {where}</h1>
          <p aria-live="polite" className="mb-4 mt-1 text-sm text-ink/70">{loading ? 'Loading…' : `${results.length} ${results.length === 1 ? 'result' : 'results'}`}</p>
          <ActiveFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />
          {error && <p role="alert" className="text-red-700">{error}</p>}
          {!loading && !error && results.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="font-semibold">{properties.length === 0 ? 'No properties have been posted yet.' : 'No properties match these filters.'}</p>
              {properties.length > 0 && <button type="button" onClick={resetFilters} className="mt-3 font-semibold text-brand underline">Clear all filters</button>}
            </div>
          )}
          <PropertyGrid properties={results.slice(0, limit)} layout={layout} />
          {results.length > limit && (
            <div className="mt-8 text-center">
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="rounded-full border border-ink/20 bg-white px-8 py-3 font-semibold hover:border-brand hover:text-brand">
                Show more ({results.length - limit} remaining)
              </button>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close filters" onClick={() => setDrawer(false)} className="absolute inset-0 bg-ink/50" />
            <motion.div role="dialog" aria-modal="true" aria-label="Filters" className="absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-mist p-4"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.35, ease }}>
              <FilterSidebar {...side} />
              <button type="button" onClick={() => setDrawer(false)} className="btn-primary mt-4 w-full rounded-full px-4 py-3 font-semibold">Show {results.length} results</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
