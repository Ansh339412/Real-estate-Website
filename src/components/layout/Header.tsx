import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { useFilters } from '../../context/FilterContext';
import { useFavorites } from '../../context/FavoritesContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-brand text-white' : 'hover:bg-brand/10'}`;

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { ids } = useFavorites();
  const navigate = useNavigate();
  const { resetFilters, updateFilters } = useFilters();
  const mode = (status: 'for-sale' | 'for-rent') => {
    resetFilters();
    updateFilters({ status });
    navigate('/listings');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" aria-label="Hearth & Key, home"><Logo /></Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap items-center gap-1">
            <li><NavLink to="/" end className={linkClass}>Home</NavLink></li>
            <li><button type="button" onClick={() => mode('for-sale')} className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-brand/10">Buy</button></li>
            <li><button type="button" onClick={() => mode('for-rent')} className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-brand/10">Rent</button></li>
            <li><NavLink to="/dashboard/new" className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium hover:bg-brand/10">Post property<span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Free</span></NavLink></li>
            <li>
              <NavLink to="/saved" className={linkClass}>
                Saved{ids.length > 0 && <span className="ml-1.5 rounded-full btn-primary px-1.5 py-0.5 text-xs text-white">{ids.length}</span>}
              </NavLink>
            </li>
            {user && <li><NavLink to="/dashboard" className={linkClass}>My listings</NavLink></li>}
            {user && <li><NavLink to="/profile" className={linkClass}>Profile</NavLink></li>}
            {isAdmin && <li><NavLink to="/admin" className={linkClass}>Admin</NavLink></li>}
            <li>
              {user ? (
                <button type="button" onClick={() => void signOut().then(() => navigate('/'))} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-brand/10">Sign out</button>
              ) : (
                <span className="flex items-center gap-2">
                  <NavLink to="/login" className={linkClass}>Sign in</NavLink>
                  <Link to="/signup" className="rounded-full btn-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0">
                    Create account
                  </Link>
                </span>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
