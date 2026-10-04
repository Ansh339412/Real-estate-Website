import type { ChangeEvent } from 'react';
import type { ListingStatus, PropertyFilters, PropertyType } from '../../types/property';
import { budgetStops, formatShortPrice } from '../../utils/format';

export interface FilterSidebarProps {
  filters: PropertyFilters;
  onChange: (patch: Partial<PropertyFilters>) => void;
  onReset: () => void;
  resultCount?: number;
  cities?: string[];
  amenityOptions?: string[];
  className?: string;
}

const TYPES: { value: PropertyType; label: string }[] = [
  { value: 'house', label: 'House / Villa' }, { value: 'apartment', label: 'Apartment / Flat' }, { value: 'condo', label: 'Condo' },
  { value: 'villa', label: 'Villa' }, { value: 'land', label: 'Plot / Land' }, { value: 'commercial', label: 'Commercial' },
];
const MODES: { value: ListingStatus | 'all'; label: string }[] = [{ value: 'all', label: 'All' }, { value: 'for-sale', label: 'Buy' }, { value: 'for-rent', label: 'Rent' }];
const toNum = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): number | null => (e.target.value === '' ? null : Number(e.target.value));
const field = 'w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm';
const legend = 'mb-2 text-sm font-semibold';

export function FilterSidebar({ filters, onChange, onReset, resultCount, cities = [], amenityOptions = [], className = '' }: FilterSidebarProps) {
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const stops = budgetStops(filters.status);

  return (
    <aside aria-label="Filter properties" className={`h-fit rounded-2xl border border-ink/10 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-sans text-base font-bold">Filters</h2>
        <button type="button" onClick={onReset} className="text-sm font-semibold text-brand underline">Clear all</button>
      </div>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend className={legend}>I want to</legend>
          <div className="flex gap-1 rounded-full bg-mist p-1">
            {MODES.map((m) => (
              <button key={m.value} type="button" aria-pressed={filters.status === m.value} onClick={() => onChange({ status: m.value, minPrice: null, maxPrice: null })}
                className={`flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${filters.status === m.value ? 'btn-primary shadow' : 'hover:bg-white'}`}>{m.label}</button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={legend}>Budget</legend>
          <div className="flex gap-2">
            <label className="flex-1"><span className="sr-only">Minimum budget</span>
              <select className={field} value={filters.minPrice ?? ''} onChange={(e) => onChange({ minPrice: toNum(e) })}>
                <option value="">Min</option>{stops.map((s) => <option key={s} value={s}>{formatShortPrice(s)}</option>)}
              </select></label>
            <label className="flex-1"><span className="sr-only">Maximum budget</span>
              <select className={field} value={filters.maxPrice ?? ''} onChange={(e) => onChange({ maxPrice: toNum(e) })}>
                <option value="">Max</option>{stops.map((s) => <option key={s} value={s}>{formatShortPrice(s)}</option>)}
              </select></label>
          </div>
        </fieldset>

        <fieldset>
          <legend className={legend}>Bedrooms (BHK)</legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" aria-pressed={filters.minBedrooms === n} onClick={() => onChange({ minBedrooms: filters.minBedrooms === n ? null : n })}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${filters.minBedrooms === n ? 'btn-primary border-transparent' : 'border-ink/20 hover:border-brand'}`}>{n === 5 ? '5+' : n} BHK</button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={legend}>Property type</legend>
          <div className="space-y-1.5">
            {TYPES.filter((t) => t.value !== 'villa').map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-brand" checked={filters.types.includes(value)} onChange={() => onChange({ types: toggle(filters.types, value) })} />{label}
              </label>
            ))}
          </div>
        </fieldset>

        {cities.length > 0 && (
          <div>
            <label htmlFor="f-city" className={`${legend} block`}>City</label>
            <select id="f-city" className={field} value={filters.city} onChange={(e) => onChange({ city: e.target.value })}>
              <option value="">All cities</option>{cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        <fieldset>
          <legend className={legend}>Area (sq ft)</legend>
          <div className="flex gap-2">
            <label className="flex-1"><span className="sr-only">Minimum area</span><input type="number" min={0} placeholder="Min" className={field} value={filters.minArea ?? ''} onChange={(e) => onChange({ minArea: toNum(e) })} /></label>
            <label className="flex-1"><span className="sr-only">Maximum area</span><input type="number" min={0} placeholder="Max" className={field} value={filters.maxArea ?? ''} onChange={(e) => onChange({ maxArea: toNum(e) })} /></label>
          </div>
        </fieldset>

        <div>
          <label htmlFor="f-posted" className={`${legend} block`}>Posted</label>
          <select id="f-posted" className={field} value={filters.postedWithin ?? ''} onChange={(e) => onChange({ postedWithin: toNum(e) })}>
            <option value="">Any time</option><option value="1">Last 24 hours</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option>
          </select>
        </div>

        {amenityOptions.length > 0 && (
          <fieldset>
            <legend className={legend}>Amenities</legend>
            <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
              {amenityOptions.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-brand" checked={filters.amenities.includes(a)} onChange={() => onChange({ amenities: toggle(filters.amenities, a) })} />{a}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {resultCount !== undefined && <p className="border-t border-ink/10 pt-4 text-sm text-ink/70">{resultCount} properties match</p>}
      </form>
    </aside>
  );
}
