import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';

export function Footer() {
  return (
    <footer className="surface-hero text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-3 max-w-xs text-sm text-white/70">Browse homes for sale and rent, save the ones you love, and list your own property.</p>
        </div>
        <nav aria-label="Explore">
          <h2 className="font-sans text-sm font-semibold">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><Link to="/listings" className="hover:text-white hover:underline">All listings</Link></li>
            <li><Link to="/saved" className="hover:text-white hover:underline">Saved homes</Link></li>
          </ul>
        </nav>
        <nav aria-label="Account">
          <h2 className="font-sans text-sm font-semibold">Account</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><Link to="/signup" className="hover:text-white hover:underline">Create account</Link></li>
            <li><Link to="/dashboard/new" className="hover:text-white hover:underline">List your property</Link></li>
          </ul>
        </nav>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-white/60">© {new Date().getFullYear()} Hearth &amp; Key. All rights reserved.</p>
    </footer>
  );
}
