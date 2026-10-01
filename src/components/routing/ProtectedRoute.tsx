import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ErrorView } from '../errors/ErrorView';

/** UI convenience only. The database re-checks identity on every request through Row Level Security. */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="p-10 text-center" role="status">Checking your session…</p>;
  if (!user) return <ErrorView code={401} signInFrom={location.pathname} />;
  return <Outlet />;
}
