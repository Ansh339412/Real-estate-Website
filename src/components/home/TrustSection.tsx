import { useMemo, type ReactNode } from 'react';
import type { Property } from '../../types/property';
import { Reveal } from '../ui/Reveal';

const ICON = (d: ReactNode) => <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
const POINTS = [
  { title: 'Talk to owners directly', text: "Sign in to see the owner's phone number and email on every listing, then call, WhatsApp or write.", icon: ICON(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />) },
  { title: 'Numbers you can compare', text: 'Price, price per sq ft, area, BHK and posting date are shown the same way on every property.', icon: ICON(<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />) },
  { title: 'Plan the loan first', text: 'Every property for sale has an EMI calculator with down payment, rate and tenure sliders.', icon: ICON(<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" /></>) },
  { title: 'Free to post', text: 'List a home, plot or office with photos from your phone gallery. There is no listing fee on this site.', icon: ICON(<path d="M12 5v14M5 12h14" />) },
  { title: 'Your details stay private', text: 'Contact details are shown only to signed-in visitors, one listing at a time. Profiles cannot be browsed.', icon: ICON(<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>) },
  { title: 'Protected by design', text: 'Database access rules, validated forms, a strict content policy and safe error pages protect your data.', icon: ICON(<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z" />) },
];

export function TrustSection({ properties }: { properties: Property[] }) {
  const stats = useMemo(() => [
    { label: 'Properties', value: properties.length },
    { label: 'Cities', value: new Set(properties.map((p) => p.address.city)).size },
    { label: 'Property types', value: new Set(properties.map((p) => p.type)).size },
  ], [properties]);
  return (
    <section id="why" tabIndex={-1} aria-labelledby="why-title" className="surface-hero relative overflow-hidden py-16 text-white outline-none">
      <div aria-hidden="true" className="blob -right-20 top-0 h-72 w-72 bg-brand" />
      <div className="relative mx-auto max-w-7xl px-4">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="why-title" className="text-3xl font-bold sm:text-4xl">Why Hearth &amp; Key</h2>
            <p className="mt-2 max-w-xl text-white/75">What we do, in plain words. No hidden steps between you and the owner.</p>
          </div>
          <dl className="flex gap-6">
            {stats.map((s) => <div key={s.label}><dd className="font-display text-3xl font-bold text-shine">{s.value}</dd><dt className="text-xs text-white/70">{s.label}</dt></div>)}
          </dl>
        </Reveal>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {POINTS.map((p, i) => (
            <li key={p.title}>
              <Reveal delay={(i % 3) * 0.08} className="glass-dark h-full rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/15">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-white">{p.icon}</span>
                <h3 className="mt-4 text-xl font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/75">{p.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
