import { useMemo } from 'react';
import { art, hashString } from '../../data/art';
import { useFilters } from '../../context/FilterContext';
import { scrollToSection } from '../../lib/scroll';
import type { Property, PropertyFilters } from '../../types/property';
import { formatShortPrice } from '../../utils/format';
import { Reveal } from '../ui/Reveal';

export function CitiesSection({ properties }: { properties: Property[] }) {
  const { resetFilters, updateFilters } = useFilters();
  const { cities, localities } = useMemo(() => {
    const c = new Map<string, { n: number; from: number }>();
    const l = new Map<string, number>();
    for (const p of properties) {
      const e = c.get(p.address.city) ?? { n: 0, from: Infinity };
      e.n += 1;
      if (p.status === 'for-sale') e.from = Math.min(e.from, p.price);
      c.set(p.address.city, e);
      const loc = p.address.street.split(',')[0].trim();
      l.set(loc, (l.get(loc) ?? 0) + 1);
    }
    return {
      cities: [...c.entries()].sort((a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0])).slice(0, 8),
      localities: [...l.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10),
    };
  }, [properties]);
  if (cities.length === 0) return null;

  const apply = (patch: Partial<PropertyFilters>) => {
    resetFilters();
    updateFilters(patch);
    scrollToSection('properties');
  };

  return (
    <section id="cities" tabIndex={-1} aria-labelledby="cities-title" className="mx-auto max-w-7xl px-4 pb-16 outline-none">
      <Reveal>
        <h2 id="cities-title" className="text-3xl font-bold sm:text-4xl">Popular cities</h2>
        <p className="mt-1 text-ink/70">Counts update as owners post new properties.</p>
      </Reveal>
      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cities.map(([city, info], i) => (
          <li key={city}>
            <Reveal delay={(i % 4) * 0.07}>
              <button type="button" onClick={() => apply({ city })} className="group relative block aspect-[4/5] w-full overflow-hidden rounded-3xl text-left shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/20 sm:aspect-[4/3]">
                <img src={art('skyline', hashString(city))} alt={`Illustrated skyline of ${city}`} width={800} height={600} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span className="block font-display text-xl font-bold">{city}</span>
                  <span className="text-xs text-white/80">{info.n} {info.n === 1 ? 'property' : 'properties'}{Number.isFinite(info.from) && ` · from ${formatShortPrice(info.from)}`}</span>
                </span>
              </button>
            </Reveal>
          </li>
        ))}
      </ul>
      {localities.length > 0 && (
        <Reveal className="mt-8">
          <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-ink/60">Popular localities</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {localities.map(([loc, n]) => (
              <li key={loc}><button type="button" onClick={() => apply({ query: loc })} className="glass rounded-full px-4 py-1.5 text-sm font-medium transition hover:-translate-y-0.5 hover:text-brand hover:shadow-md">{loc} <span className="text-ink/50">({n})</span></button></li>
            ))}
          </ul>
        </Reveal>
      )}
    </section>
  );
}
