import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertiesContext';
import { logs as logRepo, profiles, repository } from '../repositories';
import type { ErrorLog } from '../repositories/LogRepository';
import type { Profile, Role } from '../types/profile';
import { formatDate, formatPrice } from '../utils/format';

export default function AdminPage() {
  const { user } = useAuth();
  const { properties, refresh } = useProperties();
  const [users, setUsers] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ErrorLog[]>([]);
  useEffect(() => {
    logRepo.recent().then(setReports).catch(() => undefined);
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await profiles.listAll());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load users.');
    }
  }, []);
  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const emailOf = (id?: string | null) => users.find((u) => u.id === id)?.email ?? 'Unknown';

  async function changeRole(u: Profile, role: Role) {
    if (!window.confirm(`${role === 'admin' ? 'Make' : 'Remove'} ${u.email} ${role === 'admin' ? 'an admin' : 'as admin'}?`)) return;
    try {
      await profiles.setRole(u.id, role);
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not change the role.');
    }
  }

  async function removeListing(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await repository.remove(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete the listing.');
    }
  }

  const stats = [
    { label: 'Users', value: users.length },
    { label: 'Admins', value: users.filter((u) => u.role === 'admin').length },
    { label: 'Listings', value: properties.length },
  ];
  const th = 'px-4 py-3 text-left text-sm font-semibold';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Admin</h1>
      {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-ink/10 bg-white p-5">
            <dt className="text-sm text-ink/60">{s.label}</dt>
            <dd className="font-display text-4xl font-bold text-brand">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="users-title" className="mt-10">
        <h2 id="users-title" className="text-xl font-bold">Users</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-ink/10 bg-mist"><tr><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Joined</th><th className={th}>Role</th><th className={th}><span className="sr-only">Actions</span></th></tr></thead>
            <tbody className="divide-y divide-ink/10">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.fullName || <span className="text-ink/50">Not set</span>}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-sm capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== user?.id && (
                      <button type="button" onClick={() => void changeRole(u, u.role === 'admin' ? 'user' : 'admin')} className="rounded-md border border-ink/20 px-3 py-1.5 text-sm font-semibold hover:border-brand">
                        {u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="listings-title" className="mt-10">
        <h2 id="listings-title" className="text-xl font-bold">All listings</h2>
        {properties.length === 0 ? (
          <p className="mt-3 rounded-xl border border-ink/10 bg-white p-6">No listings have been added yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-ink/10 bg-mist"><tr><th className={th}>Listing</th><th className={th}>Owner</th><th className={th}>Price</th><th className={th}><span className="sr-only">Actions</span></th></tr></thead>
              <tbody className="divide-y divide-ink/10">
                {properties.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3"><Link to={`/properties/${p.id}`} className="font-semibold hover:underline">{p.title}</Link><p className="text-sm text-ink/60">{p.address.city}, {p.address.state}</p></td>
                    <td className="px-4 py-3 text-sm">{emailOf(p.ownerId)}</td>
                    <td className="px-4 py-3 text-sm">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-right"><button type="button" onClick={() => void removeListing(p.id, p.title)} className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section aria-labelledby="logs-title" className="mt-10">
        <h2 id="logs-title" className="text-xl font-bold">Recent error reports</h2>
        {reports.length === 0 ? (
          <p className="mt-3 rounded-xl border border-ink/10 bg-white p-6">No errors reported.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-ink/10 bg-mist"><tr><th className={th}>Time</th><th className={th}>Reference</th><th className={th}>Level</th><th className={th}>Code</th><th className={th}>Page</th></tr></thead>
              <tbody className="divide-y divide-ink/10">
                {reports.map((r) => (
                  <tr key={r.id}><td className="px-4 py-2">{new Date(r.createdAt).toLocaleString('en-IN')}</td><td className="px-4 py-2 font-mono">{r.reference}</td><td className="px-4 py-2">{r.level}</td><td className="px-4 py-2">{r.code}</td><td className="px-4 py-2">{r.route}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
