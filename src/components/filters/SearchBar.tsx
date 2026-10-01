import { useNavigate } from 'react-router-dom';
import { useFilters } from '../../context/FilterContext';

export function SearchBar({ className = '' }: { className?: string }) {
  const { filters, updateFilters } = useFilters();
  const navigate = useNavigate();

  return (
    <form
      role="search"
      className={`flex gap-2 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        navigate('/listings');
      }}
    >
      <label htmlFor="search-query" className="sr-only">Search by city, PIN code or keyword</label>
      <input
        id="search-query"
        type="search"
        value={filters.query}
        onChange={(e) => updateFilters({ query: e.target.value })}
        placeholder="City, PIN code or keyword"
        className="min-w-0 flex-1 rounded-md border border-ink/20 bg-white px-4 py-3"
      />
      <button type="submit" className="rounded-md btn-primary px-5 py-3 font-semibold text-white hover:bg-brand-dark">
        Search homes
      </button>
    </form>
  );
}
