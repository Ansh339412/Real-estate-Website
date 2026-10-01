import { motion } from 'framer-motion';
import type { PointerEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchPanel } from '../components/filters/SearchPanel';
import { PropertyGrid } from '../components/property/PropertyGrid';
import { Reveal } from '../components/ui/Reveal';
import { ease } from '../components/ui/motion';
import { useFilters } from '../context/FilterContext';
import { useProperties } from '../context/PropertiesContext';
import { useMemo } from 'react';
import type { PropertyType } from '../types/property';

const CATEGORIES: { type: PropertyType; label: string }[] = [
  { type: 'apartment', label: 'Apartments & Flats' }, { type: 'house', label: 'Houses & Villas' },
  { type: 'condo', label: 'Condos' }, { type: 'land', label: 'Plots & Land' },
];
const FEATURES = [
  { title: 'Talk to owners directly', text: 'Sign in to see the owner\'s phone number and email on every listing. No middlemen.' },
  { title: 'Smart search and filters', text: 'Filter by budget in Lac and Crore, BHK, area, city and amenities.' },
  { title: 'Plan your budget', text: 'Use the built-in EMI calculator on every property for sale.' },
  { title: 'Save and revisit', text: 'Shortlist homes with one tap and find them again in your saved list.' },
];

export default function HomePage() {
  const { properties, loading, error } = useProperties();
  const { resetFilters, updateFilters } = useFilters();
  const navigate = useNavigate();
  const sorted = useMemo(() => [...properties].sort((a, b) => b.listedAt.localeCompare(a.listedAt)), [properties]);
  const latest = sorted.slice(0, 6);
  const counts = useMemo(() => {
    const byType: Record<string, number> = {};
    const byCity: Record<string, number> = {};
    for (const p of properties) {
      byType[p.type] = (byType[p.type] ?? 0) + 1;
      byCity[p.address.city] = (byCity[p.address.city] ?? 0) + 1;
    }
    return { byType, topCities: Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 8) };
  }, [properties]);
  const headline = 'Homes worth coming back to.'.split(' ');

  const browse = (patch: Parameters<typeof updateFilters>[0]) => {
    resetFilters();
    updateFilters(patch);
    navigate('/listings');
  };
  const spotlight = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <>
      <section aria-labelledby="hero-title" onPointerMove={spotlight} className="surface-hero relative overflow-hidden text-white">
        <div aria-hidden="true" className="blob -left-24 top-10 h-72 w-72 bg-brand" />
        <div aria-hidden="true" className="blob right-0 top-44 h-80 w-80 bg-teal" style={{ animationDelay: '-7s' }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <p className="glass-dark inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white/90">Homes for sale and rent</p>
            <h1 id="hero-title" className="mt-5 text-5xl font-bold leading-[1.05] sm:text-6xl">
              {headline.map((w, i) => (
                <span key={i} className="mr-[0.25em] inline-block overflow-hidden pb-1 align-bottom">
                  <motion.span className={`inline-block ${i >= 2 ? 'text-shine' : ''}`} initial={{ y: '105%' }} animate={{ y: 0 }}
                    transition={{ delay: 0.1 + i * 0.09, duration: 0.7, ease }}>{w}</motion.span>
                </span>
              ))}
            </h1>
            <motion.p className="mt-5 max-w-md text-lg text-white/75" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}>
              Search apartments, houses and plots for sale or rent across India, and talk to owners directly.
            </motion.p>
          </div>

          <div className="grid h-[380px] grid-cols-3 gap-3 sm:h-[460px]" aria-hidden="true">
            {[0, 1, 2].map((i) => {
              const p = latest[i];
              return (
                <motion.div key={p?.id ?? i} className={`glass-dark overflow-hidden rounded-2xl ${i === 1 ? 'mt-10' : i === 2 ? 'mt-20' : ''}`}
                  initial={{ clipPath: 'inset(100% 0 0 0)' }} animate={{ clipPath: 'inset(0% 0 0 0)' }} transition={{ delay: 0.3 + i * 0.15, duration: 0.9, ease }}>
                  {p && <img src={p.images[0]?.src} alt="" className="h-full w-full object-cover" />}
                </motion.div>
              );
            })}
          </div>
        </div>
        <motion.div className="relative mx-auto max-w-6xl px-4 pb-14" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.6, ease }}>
          <SearchPanel />
        </motion.div>
      </section>

      <section aria-labelledby="types-title" className="mx-auto max-w-7xl px-4 pt-14">
        <Reveal><h2 id="types-title" className="text-3xl font-bold">Explore by property type</h2></Reveal>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(({ type, label }, i) => {
            const n = counts.byType[type] ?? 0;
            return (
              <li key={type}>
                <Reveal delay={i * 0.08}>
                  <button type="button" onClick={() => browse({ types: [type] })}
                    className="glass group flex w-full items-center gap-4 rounded-2xl p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <span aria-hidden="true" className="btn-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9h13v-9" /></svg>
                    </span>
                    <span>
                      <span className="block font-semibold group-hover:text-brand">{label}</span>
                      <span className="text-sm text-ink/60">{n} {n === 1 ? 'property' : 'properties'}</span>
                    </span>
                  </button>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </section>

      {counts.topCities.length > 0 && (
        <section aria-labelledby="cities-title" className="mx-auto max-w-7xl px-4 pt-12">
          <Reveal>
            <h2 id="cities-title" className="text-3xl font-bold">Popular cities</h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {counts.topCities.map(([city, n]) => (
                <li key={city}>
                  <button type="button" onClick={() => browse({ city })} className="glass rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:text-brand hover:shadow-md">
                    {city} <span className="font-normal text-ink/50">({n})</span>
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}

      <section aria-labelledby="latest-title" className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 id="latest-title" className="text-3xl font-bold">Recently added</h2>
          <Link to="/listings" className="font-semibold text-brand underline">See all properties</Link>
        </div>
        {loading && <p role="status">Loading homes…</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {!loading && !error && latest.length === 0 && (
          <p className="glass rounded-2xl p-6">No properties yet. <Link to="/dashboard/new" className="font-semibold text-brand underline">Post the first one for free</Link></p>
        )}
        <PropertyGrid properties={latest} />
      </section>

      <section aria-labelledby="why-title" className="mx-auto max-w-7xl px-4 pb-12">
        <Reveal><h2 id="why-title" className="text-3xl font-bold">Why Hearth &amp; Key</h2></Reveal>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <li key={f.title}>
              <Reveal delay={i * 0.1} className="glass h-full rounded-2xl p-6 shadow-sm">
                <span aria-hidden="true" className="btn-primary flex h-10 w-10 items-center justify-center rounded-full font-display font-bold">{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-ink/70">{f.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cta-title" className="mx-auto max-w-7xl px-4 pb-16">
        <Reveal className="surface-hero relative overflow-hidden rounded-3xl p-8 text-white sm:p-12">
          <div aria-hidden="true" className="blob -right-10 -top-16 h-56 w-56 bg-brand" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 id="cta-title" className="text-3xl font-bold">Selling or renting out a property?</h2>
              <p className="mt-2 max-w-lg text-white/75">Post it free, add photos from your gallery, and let serious buyers contact you directly.</p>
            </div>
            <Link to="/dashboard/new" className="rounded-full bg-white px-7 py-3 font-semibold text-ink shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">Post property free</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
