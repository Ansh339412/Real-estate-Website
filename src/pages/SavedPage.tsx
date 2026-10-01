import { Link } from 'react-router-dom';
import { PropertyGrid } from '../components/property/PropertyGrid';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useProperties } from '../context/PropertiesContext';

export default function SavedPage() {
  const { user } = useAuth();
  const { ids } = useFavorites();
  const { properties } = useProperties();
  const saved = properties.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Saved homes</h1>
      {!user ? (
        <p className="mt-4"><Link to="/login" className="text-brand underline">Sign in</Link> to save homes and find them here later.</p>
      ) : saved.length === 0 ? (
        <p className="mt-4">Nothing saved yet. Tap the heart on any listing to keep it here. <Link to="/listings" className="text-brand underline">Browse listings</Link></p>
      ) : (
        <div className="mt-6"><PropertyGrid properties={saved} /></div>
      )}
    </div>
  );
}
