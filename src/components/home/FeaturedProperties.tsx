import { Link, useNavigate } from 'react-router-dom';
import { DEFAULT_FILTERS, useFilters } from '../../context/FilterContext';
import type { Property } from '../../types/property';
import { ActiveFilters } from '../filters/ActiveFilters';
import { PropertyGrid } from '../property/PropertyGrid';
import { Reveal } from '../ui/Reveal';

interface Props { all: Property[]; results: Property[]; loading: boolean; error: string | null; usingSamples: boolean }

function Skeletons() {
  return (
    <ul aria-hidden="true" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <li key={i} className="animate-pulse overflow-hidden rounded-3xl border border-ink/10 bg-white">
          <div className="aspect-[4/3] bg-ink/10" />
          <div className="space-y-3 p-5"><div className="h-6 w-1/3 rounded bg-ink/10" /><div className="h-4 w-4/5 rounded bg-ink/10" /><div className="h-4 w-2/3 rounded bg-ink/10" /></div>
        </li>
      ))}
    </ul>
  );
}

export function FeaturedProperties({ all, results, loading, error, usingSamples }: Props) {
  const { filters, updateFilters, resetFilters } = useFilters();
  const navigate = useNavigate();
  const filtered = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
  const featured = all.filter((p) => p.featured);
  const base = filtered ? results : (featured.length >= 3 ? featured : [...all].sort((a, b) => b.listedAt.localeCompare(a.listedAt)));
  const shown = base.slice(0, 6);

  return (
    <section id="properties" tabIndex={-1} aria-labelledby="featured-title" className="mx-auto max-w-7xl px-4 py-16 outline-none">
      <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="featured-title" className="text-3xl font-bold sm:text-4xl">{filtered ? `${results.length} ${results.length === 1 ? 'property matches' : 'properties match'} your search` : 'Featured properties'}</h2>
          <p className="mt-1 text-ink/70">{filtered ? 'Change the search above to refine these results.' : 'Hand-picked homes, plots and workspaces. Tap the heart to save one.'}</p>
        </div>
        <button type="button" onClick={() => navigate('/listings')} className="rounded-full border border-ink/20 bg-white px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-brand hover:text-brand">
          {filtered && results.length > shown.length ? `See all ${results.length} results` : 'Open full search'}
        </button>
      </Reveal>

      {usingSamples && (
        <p className="mb-5 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink/80">
          <strong>Sample listings.</strong> These properties are for demonstration with illustrated photos. Real listings replace them as soon as owners <Link to="/dashboard/new" className="font-semibold text-brand underline">post a property</Link>.
        </p>
      )}
      {filtered && <ActiveFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />}

      {loading ? (
        <Skeletons />
      ) : error ? (
        <p role="alert" className="rounded-2xl border border-accent/30 bg-accent/10 p-6 text-accent">{error}</p>
      ) : all.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center">
          <h3 className="text-xl font-bold">No properties have been posted yet</h3>
          <p className="mt-2 text-ink/70">Be the first to list a home, plot or office.</p>
          <Link to="/dashboard/new" className="btn-primary mt-5 inline-block rounded-full px-6 py-3 font-semibold">Post a property free</Link>
        </div>
      ) : shown.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center">
          <h3 className="text-xl font-bold">No properties match these filters</h3>
          <p className="mt-2 text-ink/70">Try a higher budget, fewer filters or a different city.</p>
          <button type="button" onClick={resetFilters} className="btn-primary mt-5 rounded-full px-6 py-3 font-semibold">Clear all filters</button>
        </div>
      ) : (
        <PropertyGrid properties={shown} priorityCount={0} />
      )}
    </section>
  );
}
