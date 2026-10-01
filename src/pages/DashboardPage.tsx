import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertiesContext';
import { repository } from '../repositories';
import { formatPrice } from '../utils/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const { properties, refresh } = useProperties();
  const [error, setError] = useState<string | null>(null);
  const mine = properties.filter((p) => p.ownerId === user?.id);

  async function remove(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await repository.remove(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete the listing.');
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">My listings</h1>
        <Link to="/dashboard/new" className="rounded-md btn-primary px-5 py-2 font-semibold text-white hover:bg-brand-dark">Add a listing</Link>
      </div>
      {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
      {mine.length === 0 ? (
        <p className="mt-6 rounded-xl border border-ink/10 bg-white p-6">You have no listings yet. Add your first one to see it appear in search.</p>
      ) : (
        <ul className="mt-6 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white">
          {mine.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-4">
                <img src={p.images[0]?.src} alt="" className="h-14 w-20 rounded-md object-cover" />
                <div>
                  <Link to={`/properties/${p.id}`} className="font-semibold hover:underline">{p.title}</Link>
                  <p className="text-sm text-ink/70">{p.address.city}, {p.address.state} · {formatPrice(p.price)}</p>
                </div>
              </div>
              <button type="button" onClick={() => void remove(p.id, p.title)} className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
