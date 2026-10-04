import { art, type Scene } from '../../data/art';
import { DEFAULT_FILTERS, useFilters } from '../../context/FilterContext';
import { scrollToSection } from '../../lib/scroll';
import type { Property, PropertyFilters } from '../../types/property';
import { filterProperties } from '../../utils/filterProperties';
import { Reveal } from '../ui/Reveal';

const CATEGORIES: { label: string; blurb: string; patch: Partial<PropertyFilters>; scene: Scene; seed: number }[] = [
  { label: 'Apartments', blurb: 'Flats and builder floors', patch: { status: 'for-sale', types: ['apartment'] }, scene: 'tower', seed: 21 },
  { label: 'Villas & houses', blurb: 'Independent homes with space', patch: { status: 'for-sale', types: ['villa', 'house'] }, scene: 'villa', seed: 22 },
  { label: 'Plots & land', blurb: 'Build exactly what you want', patch: { status: 'for-sale', types: ['land'] }, scene: 'plot', seed: 23 },
  { label: 'Rentals', blurb: 'Move in sooner', patch: { status: 'for-rent' }, scene: 'interior', seed: 24 },
  { label: 'Commercial', blurb: 'Offices, shops, showrooms', patch: { types: ['commercial'] }, scene: 'commercial', seed: 25 },
];
const IMAGES = CATEGORIES.map((c) => art(c.scene, c.seed));

export function CategoryCards({ properties }: { properties: Property[] }) {
  const { resetFilters, updateFilters } = useFilters();
  const apply = (patch: Partial<PropertyFilters>) => {
    resetFilters();
    updateFilters(patch);
    scrollToSection('properties');
  };
  return (
    <section id="categories" tabIndex={-1} aria-labelledby="categories-title" className="mx-auto max-w-7xl px-4 pb-16 outline-none">
      <Reveal>
        <h2 id="categories-title" className="text-3xl font-bold sm:text-4xl">Browse by category</h2>
        <p className="mt-1 text-ink/70">Pick a category to filter the properties above.</p>
      </Reveal>
      <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {CATEGORIES.map((c, i) => {
          const n = filterProperties(properties, { ...DEFAULT_FILTERS, ...c.patch }).length;
          return (
            <li key={c.label} className={i === 4 ? 'col-span-2 lg:col-span-1' : ''}>
              <Reveal delay={i * 0.07} className="h-full">
                <button type="button" onClick={() => apply(c.patch)} className="group relative block aspect-[4/3] w-full overflow-hidden rounded-3xl text-left shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/20 lg:aspect-[3/4]">
                  <img src={IMAGES[i]} alt="" width={800} height={600} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <span className="block font-display text-xl font-bold leading-tight">{c.label}</span>
                    <span className="mt-0.5 block text-xs text-white/75">{c.blurb}</span>
                    <span className="mt-2 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">{n} {n === 1 ? 'property' : 'properties'}</span>
                  </span>
                </button>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
