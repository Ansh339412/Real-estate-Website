import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ErrorView } from '../errors/ErrorView';

/** Hides the admin screens from non-admins. The real protection is in the database (RLS + triggers). */
export function AdminRoute() {
  const { isAdmin, profileLoading } = useAuth();
  if (profileLoading) return <p className="p-10 text-center" role="status">Checking permissions…</p>;
  if (!isAdmin) return <ErrorView code={403} />;
  return <Outlet />;
}
