import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../../context/FilterContext';
import type { PropertyType } from '../../types/property';
import { budgetStops, formatShortPrice } from '../../utils/format';

type Tab = 'for-sale' | 'for-rent' | 'plots';
const TABS: { id: Tab; label: string }[] = [{ id: 'for-sale', label: 'Buy' }, { id: 'for-rent', label: 'Rent' }, { id: 'plots', label: 'Plots' }];
const TYPES: { value: PropertyType; label: string }[] = [{ value: 'apartment', label: 'Apartment / Flat' }, { value: 'house', label: 'House / Villa' }, { value: 'condo', label: 'Condo' }];
const field = 'w-full rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm text-ink';

/** Tabbed hero search: Buy / Rent / Plots, then location, property type, budget and BHK. */
export function SearchPanel() {
  const { resetFilters, updateFilters } = useFilters();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('for-sale');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');
  const [bhk, setBhk] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    resetFilters();
    updateFilters({
      status: tab === 'for-rent' ? 'for-rent' : 'for-sale',
      types: tab === 'plots' ? ['land'] : type ? [type as PropertyType] : [],
      query: query.trim().slice(0, 100),
      maxPrice: budget ? Number(budget) : null,
      minBedrooms: tab !== 'plots' && bhk ? Number(bhk) : null,
    });
    navigate('/listings');
  }

  return (
    <div className="glass overflow-hidden rounded-2xl text-ink shadow-2xl">
      <div role="tablist" aria-label="What are you looking for" className="flex border-b border-ink/10 bg-white/60">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${tab === t.id ? 'border-b-2 border-brand bg-white text-brand' : 'text-ink/60 hover:text-ink'}`}>{t.label}</button>
        ))}
      </div>
      <form role="tabpanel" aria-labelledby={`tab-${tab}`} onSubmit={submit} className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[2fr_1.3fr_1.2fr_1fr_auto]">
        <div>
          <label htmlFor="sp-q" className="sr-only">City, locality or PIN code</label>
          <input id="sp-q" type="search" maxLength={100} placeholder="City, locality or PIN code" value={query} onChange={(e) => setQuery(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="sp-type" className="sr-only">Property type</label>
          <select id="sp-type" value={tab === 'plots' ? '' : type} disabled={tab === 'plots'} onChange={(e) => setType(e.target.value)} className={`${field} disabled:opacity-60`}>
            <option value="">{tab === 'plots' ? 'Plot / Land' : 'All property types'}</option>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sp-budget" className="sr-only">Maximum budget</label>
          <select id="sp-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className={field}>
            <option value="">Any budget</option>
            {budgetStops(tab === 'for-rent' ? 'for-rent' : 'for-sale').map((s) => <option key={s} value={s}>Up to {formatShortPrice(s)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sp-bhk" className="sr-only">Bedrooms</label>
          <select id="sp-bhk" value={tab === 'plots' ? '' : bhk} disabled={tab === 'plots'} onChange={(e) => setBhk(e.target.value)} className={`${field} disabled:opacity-60`}>
            <option value="">Any BHK</option>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+ BHK</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary rounded-lg px-8 py-3 font-semibold shadow-md md:col-span-2 xl:col-span-1">Search</button>
      </form>
    </div>
  );
}
