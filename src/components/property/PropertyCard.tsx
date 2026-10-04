import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Property } from '../../types/property';
import { bedLabel, formatArea, formatPrice, isNewListing, typeLabel } from '../../utils/format';

export interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  className?: string;
  /** Hero and above-the-fold cards load immediately; everything else is lazy. */
  priority?: boolean;
}

export function PropertyCard({ property, isFavorite = false, onToggleFavorite, className = '', priority = false }: PropertyCardProps) {
  const { id, title, price, status, bedrooms, bathrooms, areaSqFt, address, images, type, featured, sample, listedAt } = property;
  const [index, setIndex] = useState(0);
  const shown = images[index] ?? images[0];
  const go = (e: { preventDefault(): void }, step: number) => {
    e.preventDefault();
    setIndex((i) => (i + step + images.length) % images.length);
  };
  const arrow = 'absolute top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2.5 py-1 text-lg font-bold leading-none text-ink opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100';
  const facts = [bedLabel(bedrooms), bathrooms > 0 ? `${bathrooms} Bath` : null, formatArea(areaSqFt)].filter(Boolean);

  return (
    <article className={`group overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10 ${className}`}>
      <figure className="relative overflow-hidden bg-ink/5">
        {shown && (
          <img src={shown.src} alt={shown.alt} width={800} height={600} loading={priority ? 'eager' : 'lazy'} decoding="async"
            className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        )}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/55 to-transparent" />
        <figcaption className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="glass rounded-full px-3 py-1 text-xs font-semibold text-ink">{status === 'for-sale' ? 'For sale' : 'For rent'}</span>
          {featured && <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-white">Featured</span>}
          {isNewListing(listedAt) && <span className="rounded-full bg-teal px-3 py-1 text-xs font-semibold text-white">New</span>}
        </figcaption>
        {sample && <span className="absolute bottom-3 left-3 rounded bg-ink/70 px-2 py-0.5 text-[11px] font-medium text-white">Sample listing</span>}
        {images.length > 1 && (
          <>
            <button type="button" aria-label={`Previous photo of ${title}`} onClick={(e) => go(e, -1)} className={`${arrow} left-2`}>‹</button>
            <button type="button" aria-label={`Next photo of ${title}`} onClick={(e) => go(e, 1)} className={`${arrow} right-2`}>›</button>
            <span aria-hidden="true" className="absolute bottom-3 right-3 flex gap-1">
              {images.map((_, i) => <span key={i} className={`h-1.5 rounded-full bg-white transition-all ${i === index ? 'w-4' : 'w-1.5 opacity-60'}`} />)}
            </span>
          </>
        )}
        {onToggleFavorite && (
          <button type="button" onClick={() => onToggleFavorite(id)} aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${title} from saved homes` : `Save ${title}`}
            className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full text-lg leading-none shadow transition-transform active:scale-90 ${isFavorite ? 'bg-accent text-white' : 'bg-white/90 text-ink hover:scale-105'}`}>
            {isFavorite ? '♥' : '♡'}
          </button>
        )}
      </figure>
      <div className="space-y-2 p-5">
        <p className="font-display text-2xl font-bold text-brand-dark">
          <data value={price}>{formatPrice(price)}</data>
          {status === 'for-rent' && <span className="font-sans text-sm font-normal text-ink/60"> /month</span>}
        </p>
        <h3 className="text-base font-semibold leading-snug"><Link to={`/properties/${id}`} className="hover:underline">{title}</Link></h3>
        <address className="text-sm not-italic text-ink/70">{address.street}, {address.city}, {address.state}</address>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t border-ink/10 pt-3 text-sm text-ink/80">
          {facts.map((f) => <li key={f}>{f}</li>)}
          <li className="text-ink/50">{typeLabel(type)}</li>
        </ul>
      </div>
    </article>
  );
}
