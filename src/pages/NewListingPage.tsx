import { Link, useNavigate } from 'react-router-dom';
import { ListingForm } from '../components/property/ListingForm';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertiesContext';
import type { ListingInput } from '../lib/validation';
import { repository } from '../repositories';

export default function NewListingPage() {
  const { user } = useAuth();
  const { refresh } = useProperties();
  const navigate = useNavigate();

  async function create(data: ListingInput) {
    if (!user) throw new Error('Please sign in again.');
    const created = await repository.create(data);
    await refresh();
    navigate(`/properties/${created.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/dashboard" className="text-sm text-brand underline">My listings</Link>
      <h1 className="mb-6 mt-2 text-3xl font-bold">Add a listing</h1>
      <ListingForm onSubmit={create} />
    </div>
  );
}
