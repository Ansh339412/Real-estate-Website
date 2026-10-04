import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFilters } from '../../context/FilterContext';
import { scrollToSection } from '../../lib/scroll';
import type { PropertyFilters } from '../../types/property';
import { Logo } from '../ui/Logo';

const CITIES = ['Mohali', 'Chandigarh', 'Jalandhar', 'Ludhiana', 'New Delhi', 'Gurugram', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad'];
const SOCIAL = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/', d: 'M4.5 9h3.8v11H4.5zM6.4 3.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM10.5 9h3.6v1.5h.1c.5-1 1.8-1.8 3.6-1.8 3.8 0 4.5 2.4 4.5 5.6V20h-3.8v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20h-3.8z' },
  { name: 'X', href: 'https://x.com/', d: 'M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z' },
  { name: 'Instagram', href: 'https://www.instagram.com/', d: 'M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7zM12 7.6a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8zm0 1.8a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2zm4.7-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z' },
  { name: 'YouTube', href: 'https://www.youtube.com/', d: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z' },
];
const btn = 'text-left text-sm text-white/70 transition hover:text-white hover:underline';

export function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetFilters, updateFilters } = useFilters();
  const browse = (patch: Partial<PropertyFilters>) => { resetFilters(); updateFilters(patch); navigate('/listings'); };
  const section = (id: string) => (location.pathname === '/' ? scrollToSection(id) : navigate('/', { state: { scrollTo: id } }));

  return (
    <footer className="surface-hero text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-white/70">Browse apartments, villas, plots and commercial spaces across India, and talk to owners directly.</p>
          <p className="mt-4 text-sm text-white/70">Questions? <Link to="/contact" className="font-semibold text-white underline">Talk to an advisor</Link></p>
          <ul className="mt-5 flex gap-2">
            {SOCIAL.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Hearth & Key on ${s.name} (placeholder link)`} title={`${s.name} (placeholder link)`}
                  className="glass-dark grid h-10 w-10 place-items-center rounded-full transition hover:-translate-y-0.5 hover:bg-white/20">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d={s.d} /></svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Explore">
          <h2 className="font-sans text-sm font-semibold">Explore</h2>
          <ul className="mt-4 space-y-2.5">
            <li><button type="button" className={btn} onClick={() => browse({ status: 'for-sale' })}>Properties for sale</button></li>
            <li><button type="button" className={btn} onClick={() => browse({ status: 'for-rent' })}>Properties for rent</button></li>
            <li><button type="button" className={btn} onClick={() => browse({ status: 'for-sale', types: ['land'] })}>Plots and land</button></li>
            <li><button type="button" className={btn} onClick={() => browse({ types: ['commercial'] })}>Commercial spaces</button></li>
            <li><Link to="/saved" className={btn}>Saved homes</Link></li>
          </ul>
        </nav>

        <nav aria-label="Company and legal">
          <h2 className="font-sans text-sm font-semibold">Company</h2>
          <ul className="mt-4 space-y-2.5">
            <li><button type="button" className={btn} onClick={() => section('how-it-works')}>How it works</button></li>
            <li><Link to="/dashboard/new" className={btn}>Post a property</Link></li>
            <li><Link to="/contact" className={btn}>Contact us</Link></li>
          </ul>
          <h2 className="mt-7 font-sans text-sm font-semibold">Legal</h2>
          <ul className="mt-4 space-y-2.5">
            <li><Link to="/legal/privacy" className={btn}>Privacy policy</Link></li>
            <li><Link to="/legal/terms" className={btn}>Terms of use</Link></li>
            <li><Link to="/legal/cookies" className={btn}>Cookie policy</Link></li>
            <li><Link to="/legal/grievance" className={btn}>Grievance redressal</Link></li>
          </ul>
        </nav>

        <nav aria-label="Location coverage">
          <h2 className="font-sans text-sm font-semibold">Browse by city</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {CITIES.map((c) => <li key={c}><button type="button" className={btn} onClick={() => browse({ city: c })}>{c}</button></li>)}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-white/60">© {new Date().getFullYear()} Hearth &amp; Key. All rights reserved. Sample listings and testimonials are for demonstration only.</p>
      </div>
    </footer>
  );
}
