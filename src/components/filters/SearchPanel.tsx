import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../../context/FilterContext';
import type { PropertyFilters, PropertyType } from '../../types/property';
import { budgetStops, formatShortPrice } from '../../utils/format';

type Tab = 'for-sale' | 'for-rent' | 'plots';
const TABS: { id: Tab; label: string }[] = [{ id: 'for-sale', label: 'Buy' }, { id: 'for-rent', label: 'Rent' }, { id: 'plots', label: 'Plots' }];
const TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartment / Flat' }, { value: 'house', label: 'Independent house' }, { value: 'villa', label: 'Villa' }, { value: 'commercial', label: 'Commercial' },
];
const field = 'w-full rounded-xl border border-ink/15 bg-white px-3 py-3 text-sm text-ink transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/20 disabled:opacity-50';

const QUICK: { label: string; active: (f: PropertyFilters) => boolean; patch: (f: PropertyFilters) => Partial<PropertyFilters> }[] = [
  { label: 'Under ₹50 Lac', active: (f) => f.maxPrice === 5_000_000, patch: (f) => ({ maxPrice: f.maxPrice === 5_000_000 ? null : 5_000_000, status: f.status === 'for-rent' ? 'for-sale' : f.status }) },
  { label: '2+ BHK', active: (f) => f.minBedrooms === 2, patch: (f) => ({ minBedrooms: f.minBedrooms === 2 ? null : 2 }) },
  { label: '3+ BHK', active: (f) => f.minBedrooms === 3, patch: (f) => ({ minBedrooms: f.minBedrooms === 3 ? null : 3 }) },
  { label: 'Covered parking', active: (f) => f.amenities.includes('Covered parking'), patch: (f) => ({ amenities: f.amenities.includes('Covered parking') ? f.amenities.filter((a) => a !== 'Covered parking') : [...f.amenities, 'Covered parking'] }) },
  { label: 'Gated society', active: (f) => f.amenities.includes('Gated society'), patch: (f) => ({ amenities: f.amenities.includes('Gated society') ? f.amenities.filter((a) => a !== 'Gated society') : [...f.amenities, 'Gated society'] }) },
  { label: 'New this week', active: (f) => f.postedWithin === 7, patch: (f) => ({ postedWithin: f.postedWithin === 7 ? null : 7 }) },
];

/** Hero search. It reads and writes the shared filters, so the listings below update as you change it. */
export function SearchPanel({ resultCount, onSearch }: { resultCount: number; onSearch?: () => void }) {
  const { filters, updateFilters } = useFilters();
  const navigate = useNavigate();
  const tab: Tab = filters.status === 'for-rent' ? 'for-rent' : filters.types.length === 1 && filters.types[0] === 'land' ? 'plots' : 'for-sale';
  const nonLand = filters.types.filter((t) => t !== 'land');

  const setTab = (t: Tab) =>
    updateFilters(
      t === 'for-rent' ? { status: 'for-rent', types: nonLand, minPrice: null, maxPrice: null }
      : t === 'plots' ? { status: 'for-sale', types: ['land'], minBedrooms: null, minPrice: null, maxPrice: null }
      : { status: 'for-sale', types: nonLand, minPrice: null, maxPrice: null },
    );
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
    setTab(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <div className="glass-ivory overflow-hidden rounded-3xl text-ink shadow-2xl shadow-ink/30">
      <div role="tablist" aria-label="What are you looking for" className="flex border-b border-ink/10 px-2 pt-2">
        {TABS.map((t, i) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="search-form" tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)} onKeyDown={(e) => onKey(e, i)}
            className={`relative px-6 py-3 text-sm font-semibold transition-colors ${tab === t.id ? 'text-brand-dark' : 'text-ink/60 hover:text-ink'}`}>
            {t.label}
            {tab === t.id && <motion.span layoutId="tab-indicator" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
          </button>
        ))}
      </div>

      <div id="search-form" role="tabpanel" aria-labelledby={`tab-${tab}`}>
      <form aria-label="Search properties" onSubmit={(e) => { e.preventDefault(); onSearch ? onSearch() : navigate('/listings'); }}
        className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[2fr_1.3fr_1.2fr_1fr_auto]">
        <div>
          <label htmlFor="sp-q" className="sr-only">City, locality or PIN code</label>
          <input id="sp-q" type="search" maxLength={100} placeholder="City, locality or PIN code" autoComplete="off" value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })} className={field} />
        </div>
        <div>
          <label htmlFor="sp-type" className="sr-only">Property type</label>
          <select id="sp-type" disabled={tab === 'plots'} value={tab === 'plots' ? '' : filters.types.find((t) => t !== 'land') ?? ''}
            onChange={(e) => updateFilters({ types: e.target.value ? [e.target.value as PropertyType] : [] })} className={field}>
            <option value="">{tab === 'plots' ? 'Plots / Land' : 'All property types'}</option>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sp-budget" className="sr-only">Maximum budget</label>
          <select id="sp-budget" value={filters.maxPrice ?? ''} onChange={(e) => updateFilters({ maxPrice: e.target.value ? Number(e.target.value) : null })} className={field}>
            <option value="">Any budget</option>
            {budgetStops(tab === 'for-rent' ? 'for-rent' : 'for-sale').map((s) => <option key={s} value={s}>Up to {formatShortPrice(s)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sp-bhk" className="sr-only">Bedrooms</label>
          <select id="sp-bhk" disabled={tab === 'plots'} value={tab === 'plots' ? '' : filters.minBedrooms ?? ''}
            onChange={(e) => updateFilters({ minBedrooms: e.target.value ? Number(e.target.value) : null })} className={field}>
            <option value="">Any BHK</option>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+ BHK</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary rounded-xl px-8 py-3 font-semibold shadow-md active:scale-[0.98] md:col-span-2 xl:col-span-1">Search</button>
      </form>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 px-4 py-3">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink/50">Quick filters</span>
        {QUICK.map((q) => (
          <button key={q.label} type="button" aria-pressed={q.active(filters)} onClick={() => updateFilters(q.patch(filters))}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition active:scale-95 ${q.active(filters) ? 'border-transparent bg-brand text-white' : 'border-ink/15 bg-white hover:border-brand hover:text-brand'}`}>{q.label}</button>
        ))}
        <p aria-live="polite" className="ml-auto text-xs text-ink/60">
          {resultCount} {resultCount === 1 ? 'property matches' : 'properties match'}{filters.status === 'all' && ' · sale and rent'}
        </p>
      </div>
    </div>
  );
}
