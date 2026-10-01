import type { PropertyFilters } from '../../types/property';
import { formatShortPrice } from '../../utils/format';

interface Props { filters: PropertyFilters; onChange: (patch: Partial<PropertyFilters>) => void; onReset: () => void }

/** Removable chips summarising every filter that is currently narrowing the results. */
export function ActiveFilters({ filters: f, onChange, onReset }: Props) {
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (f.query) chips.push({ key: 'q', label: `Search: ${f.query}`, clear: () => onChange({ query: '' }) });
  if (f.status !== 'all') chips.push({ key: 's', label: f.status === 'for-sale' ? 'Buy' : 'Rent', clear: () => onChange({ status: 'all' }) });
  f.types.forEach((t) => chips.push({ key: `t-${t}`, label: t, clear: () => onChange({ types: f.types.filter((x) => x !== t) }) }));
  if (f.minPrice !== null) chips.push({ key: 'minp', label: `From ${formatShortPrice(f.minPrice)}`, clear: () => onChange({ minPrice: null }) });
  if (f.maxPrice !== null) chips.push({ key: 'maxp', label: `Up to ${formatShortPrice(f.maxPrice)}`, clear: () => onChange({ maxPrice: null }) });
  if (f.minBedrooms !== null) chips.push({ key: 'bhk', label: `${f.minBedrooms}+ BHK`, clear: () => onChange({ minBedrooms: null }) });
  if (f.city) chips.push({ key: 'city', label: f.city, clear: () => onChange({ city: '' }) });
  if (f.minArea !== null || f.maxArea !== null) chips.push({ key: 'area', label: `Area ${f.minArea ?? 0}–${f.maxArea ?? '∞'} sq ft`, clear: () => onChange({ minArea: null, maxArea: null }) });
  if (f.postedWithin !== null) chips.push({ key: 'post', label: `Last ${f.postedWithin} day${f.postedWithin === 1 ? '' : 's'}`, clear: () => onChange({ postedWithin: null }) });
  f.amenities.forEach((a) => chips.push({ key: `a-${a}`, label: a, clear: () => onChange({ amenities: f.amenities.filter((x) => x !== a) }) }));
  if (chips.length === 0) return null;
  return (
    <ul aria-label="Active filters" className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <li key={c.key}>
          <button type="button" onClick={c.clear} aria-label={`Remove filter ${c.label}`} className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-sm font-medium capitalize text-brand-dark hover:bg-brand/20">
            {c.label}<span aria-hidden="true">×</span>
          </button>
        </li>
      ))}
      <li><button type="button" onClick={onReset} className="px-2 text-sm font-semibold text-ink/60 underline">Clear all</button></li>
    </ul>
  );
}
