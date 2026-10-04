import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useFilters } from '../../context/FilterContext';
import { scrollToSection } from '../../lib/scroll';
import type { PropertyFilters } from '../../types/property';
import { ease } from '../ui/motion';
import { Logo } from '../ui/Logo';

type Item = { label: string; filters?: Partial<PropertyFilters>; section?: string };
const NAV: Item[] = [
  { label: 'Buy', filters: { status: 'for-sale' } },
  { label: 'Rent', filters: { status: 'for-rent' } },
  { label: 'Plots', filters: { status: 'for-sale', types: ['land'] } },
  { label: 'Cities', section: 'cities' },
  { label: 'How it works', section: 'how-it-works' },
];

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-brand/10 text-brand-dark' : 'hover:bg-brand/10'}`;

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { ids } = useFavorites();
  const { resetFilters, updateFilters } = useFilters();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const run = (item: Item) => {
    setOpen(false);
    if (item.filters) {
      resetFilters();
      updateFilters(item.filters);
      navigate('/listings');
    } else if (item.section) {
      if (location.pathname === '/') setTimeout(() => scrollToSection(item.section!), 0);
      else navigate('/', { state: { scrollTo: item.section } });
    }
  };

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // keep the page from scrolling behind the drawer
    panel.current?.querySelector<HTMLElement>('button, a')?.focus();
    return () => {
      document.body.style.overflow = previous;
      menuBtn.current?.focus();
    };
  }, [open]);

  const onPanelKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') return setOpen(false);
    if (e.key !== 'Tab' || !panel.current) return;
    const f = [...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
    if (f.length === 0) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const logout = () => { setOpen(false); void signOut().then(() => navigate('/')); };
  const row = 'flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium hover:bg-brand/10';

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-mist/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link to="/" aria-label="Hearth & Key, home"><Logo /></Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => <li key={n.label}><button type="button" onClick={() => run(n)} className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-brand/10">{n.label}</button></li>)}
            <li>
              <NavLink to="/saved" className={link}>Saved{ids.length > 0 && <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-xs text-white">{ids.length}</span>}</NavLink>
            </li>
            {user && <li><NavLink to="/dashboard" className={link}>My listings</NavLink></li>}
            {user && <li><NavLink to="/profile" className={link}>Profile</NavLink></li>}
            {isAdmin && <li><NavLink to="/admin" className={link}>Admin</NavLink></li>}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <button type="button" onClick={logout} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand/10">Sign out</button>
          ) : (
            <NavLink to="/login" className={link}>Sign in</NavLink>
          )}
          <Link to="/dashboard/new" className="btn-primary flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-sm hover:-translate-y-0.5">
            Post property<span className="rounded bg-white/25 px-1.5 text-[10px] font-bold uppercase">Free</span>
          </Link>
        </div>

        <button ref={menuBtn} type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu"
          className="grid h-11 w-11 place-items-center rounded-xl border border-ink/15 bg-white lg:hidden">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>

      {/* Portalled to <body>: the header's backdrop blur would otherwise trap this fixed drawer inside the 64px bar. */}
      {createPortal(
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" tabIndex={-1} aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
            <motion.div ref={panel} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" onKeyDown={onPanelKey}
              className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col overflow-y-auto bg-mist p-4 shadow-2xl"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.35, ease }}>
              <div className="mb-3 flex items-center justify-between">
                <Logo />
                <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-xl border border-ink/15 bg-white">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>
              </div>
              <nav aria-label="Mobile">
                <ul className="space-y-1">
                  {NAV.map((n) => <li key={n.label}><button type="button" onClick={() => run(n)} className={row}>{n.label}</button></li>)}
                  <li><Link to="/saved" className={row}>Saved homes{ids.length > 0 && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-white">{ids.length}</span>}</Link></li>
                  {user && <li><Link to="/dashboard" className={row}>My listings</Link></li>}
                  {user && <li><Link to="/profile" className={row}>Profile</Link></li>}
                  {isAdmin && <li><Link to="/admin" className={row}>Admin</Link></li>}
                  <li><Link to="/contact" className={row}>Talk to an advisor</Link></li>
                </ul>
              </nav>
              <div className="mt-auto space-y-2 pt-6">
                <Link to="/dashboard/new" className="btn-primary flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold">Post property <span className="rounded bg-white/25 px-1.5 text-[10px] font-bold uppercase">Free</span></Link>
                {user ? (
                  <button type="button" onClick={logout} className="w-full rounded-full border border-ink/20 bg-white px-5 py-3 font-semibold">Sign out</button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/login" className="rounded-full border border-ink/20 bg-white px-5 py-3 text-center font-semibold">Sign in</Link>
                    <Link to="/signup" className="rounded-full border border-ink/20 bg-white px-5 py-3 text-center font-semibold">Sign up</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </header>
  );
}
