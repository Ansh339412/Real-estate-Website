import { Link } from 'react-router-dom';
import type { Property } from '../../types/property';
import { formatArea, formatPrice } from '../../utils/format';

export interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  className?: string;
}

export function PropertyCard({ property, isFavorite = false, onToggleFavorite, className = '' }: PropertyCardProps) {
  const { id, title, price, status, bedrooms, bathrooms, areaSqFt, address, images } = property;
  const cover = images[0];

  return (
    <article className={`group overflow-hidden rounded-2xl border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/15 ${className}`}>
      <figure className="relative overflow-hidden">
        {cover && (
          <img src={cover.src} alt={cover.alt} loading="lazy"
            className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        )}
        <figcaption className="absolute left-3 top-3 glass rounded-full px-3 py-1 text-xs font-semibold text-ink">
          {status === 'for-sale' ? 'For sale' : 'For rent'}
        </figcaption>
        {onToggleFavorite && (
          <button type="button" onClick={() => onToggleFavorite(id)} aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${title} from saved homes` : `Save ${title}`}
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1.5 text-lg leading-none transition-colors ${isFavorite ? 'bg-accent text-white' : 'bg-white/90 text-ink'}`}>
            {isFavorite ? '♥' : '♡'}
          </button>
        )}
      </figure>
      <div className="space-y-2 p-4">
        <p className="font-display text-2xl font-bold text-brand-dark">
          <data value={price}>{formatPrice(price)}</data>
          {status === 'for-rent' && <span className="font-sans text-sm font-normal text-ink/60"> /month</span>}
        </p>
        <h3 className="text-base font-semibold"><Link to={`/properties/${id}`} className="hover:underline">{title}</Link></h3>
        <address className="text-sm not-italic text-ink/70">{address.street}, {address.city}, {address.state} {address.zip}</address>
        <ul className="flex gap-4 border-t border-ink/10 pt-3 text-sm">
          <li>{bedrooms} bd</li><li>{bathrooms} ba</li><li>{formatArea(areaSqFt)}</li>
        </ul>
      </div>
    </article>
  );
}
