import { motion } from 'framer-motion';
import type { PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { art } from '../../data/art';
import type { Property } from '../../types/property';
import { bedLabel, formatShortPrice } from '../../utils/format';
import { SearchPanel } from '../filters/SearchPanel';
import { ease } from '../ui/motion';

const HEADLINE = 'Homes worth coming back to.'.split(' ');
const POINTS = ['Contact owners directly', 'Free to post', 'Built-in EMI planner'];
const FALLBACK = [art('tower', 3), art('villa', 4), art('commercial', 5)];

export function Hero({ properties, resultCount, onSearch }: { properties: Property[]; resultCount: number; onSearch: () => void }) {
  const picks = (properties.filter((p) => p.featured).length >= 3 ? properties.filter((p) => p.featured) : properties).slice(0, 3);
  const spotlight = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section aria-labelledby="hero-title" onPointerMove={spotlight} className="surface-hero relative overflow-hidden text-white">
      <div aria-hidden="true" className="blob -left-24 top-10 h-72 w-72 bg-brand" />
      <div aria-hidden="true" className="blob right-0 top-44 h-80 w-80 bg-teal" style={{ animationDelay: '-7s' }} />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-8 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pb-10 lg:pt-20">
        <div>
          <p className="glass-dark inline-block rounded-full px-4 py-1.5 text-sm font-medium text-white/90">Apartments, villas, plots and commercial spaces across India</p>
          <h1 id="hero-title" className="mt-5 text-balance text-5xl font-bold leading-[1.04] sm:text-6xl lg:text-7xl">
            {HEADLINE.map((w, i) => (
              <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-1.5 align-bottom">
                <motion.span className={`inline-block ${i >= 2 ? 'text-shine' : ''}`} initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ delay: 0.1 + i * 0.09, duration: 0.7, ease }}>{w}</motion.span>
              </span>
            ))}
          </h1>
          <motion.p className="mt-5 max-w-lg text-lg text-white/75" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}>
            Search by city, budget and BHK, compare homes side by side, and talk to the owner without a middleman.
          </motion.p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-2"><svg viewBox="0 0 24 24" className="h-4 w-4 text-teal" style={{ color: '#7fd6c8' }} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>{p}</li>
            ))}
          </ul>
        </div>

        <div className="grid h-[250px] grid-cols-2 items-start gap-3 md:h-[430px] md:grid-cols-3" role="list" aria-label="Featured properties">
          {[0, 1, 2].map((i) => {
            const p = picks[i];
            const cls = `${i === 2 ? 'hidden md:block' : ''} ${i === 1 ? 'md:mt-10' : i === 2 ? 'md:mt-20' : ''}`;
            const inner = (
              <motion.div className="animate-bob relative h-full overflow-hidden rounded-3xl bg-white/10 shadow-2xl shadow-black/30 ring-1 ring-white/20" style={{ animationDelay: `${i * -2.3}s` }}
                initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease }}>
                <img src={p?.images[0]?.src ?? FALLBACK[i]} alt={p ? p.images[0]?.alt ?? p.title : ''} width={800} height={600} loading="eager" fetchPriority={i === 0 ? 'high' : undefined} className="h-full w-full object-cover" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                {p && (
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-display text-xl font-bold">{formatShortPrice(p.price)}{p.status === 'for-rent' && <span className="font-sans text-xs font-normal text-white/70"> /mo</span>}</p>
                    <p className="text-xs text-white/80">{[bedLabel(p.bedrooms), p.address.city].filter(Boolean).join(' · ')}</p>
                  </div>
                )}
              </motion.div>
            );
            return (
              <div key={p?.id ?? i} role="listitem" className={`h-full md:h-[330px] ${cls}`}>
                {p ? <Link to={`/properties/${p.id}`} aria-label={`${p.title}, ${formatShortPrice(p.price)}`} className="block h-full">{inner}</Link> : inner}
              </div>
            );
          })}
        </div>
      </div>

      <motion.div id="search" tabIndex={-1} className="relative mx-auto max-w-6xl px-4 pb-14 outline-none" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6, ease }}>
        <SearchPanel resultCount={resultCount} onSearch={onSearch} />
      </motion.div>
    </section>
  );
}
