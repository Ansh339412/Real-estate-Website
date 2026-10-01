import { Link } from 'react-router-dom';
import type { Property } from '../../types/property';
import { formatArea, formatPrice, pricePerSqFt, timeAgo } from '../../utils/format';

interface Props {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

/** Wide, information-dense card used in the results list (photo left, facts and actions right). */
export function ListingCard({ property: p, isFavorite = false, onToggleFavorite }: Props) {
  const cover = p.images[0];
  const rent = p.status === 'for-rent';
  return (
    <article className="group grid overflow-hidden rounded-2xl border border-ink/10 bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/10 md:grid-cols-[300px_1fr]">
      <figure className="relative overflow-hidden bg-ink/5">
        {cover && <img src={cover.src} alt={cover.alt} loading="lazy" className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
        <figcaption className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold">{rent ? 'For rent' : 'For sale'}</figcaption>
        {p.images.length > 1 && <span className="absolute bottom-3 left-3 rounded bg-ink/75 px-2 py-0.5 text-xs text-white">{p.images.length} photos</span>}
        {onToggleFavorite && (
          <button type="button" onClick={() => onToggleFavorite(p.id)} aria-pressed={isFavorite} aria-label={isFavorite ? `Remove ${p.title} from saved homes` : `Save ${p.title}`}
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1.5 text-lg leading-none ${isFavorite ? 'bg-accent text-white' : 'bg-white/90'}`}>{isFavorite ? '♥' : '♡'}</button>
        )}
      </figure>
      <div className="flex flex-col p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-display text-2xl font-bold text-brand-dark">
            <data value={p.price}>{formatPrice(p.price)}</data>{rent && <span className="font-sans text-sm font-normal text-ink/60"> /month</span>}
          </p>
          {!rent && <p className="text-sm text-ink/60">{formatPrice(pricePerSqFt(p.price, p.areaSqFt))} / sq ft</p>}
        </div>
        <h3 className="mt-1 text-lg font-semibold"><Link to={`/properties/${p.id}`} className="hover:underline">{p.title}</Link></h3>
        <address className="text-sm not-italic text-ink/70">{p.address.street}, {p.address.city}, {p.address.state} {p.address.zip}</address>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {[`${p.bedrooms} BHK`, `${p.bathrooms} Bath`, formatArea(p.areaSqFt), p.type].map((t) => (
            <li key={t} className="rounded-full bg-mist px-3 py-1 font-medium capitalize">{t}</li>
          ))}
        </ul>
        {p.amenities.length > 0 && <p className="mt-3 line-clamp-1 text-sm text-ink/60">{p.amenities.slice(0, 5).join(' · ')}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <p className="text-xs text-ink/50">Posted {timeAgo(p.listedAt)} · by Owner</p>
          <div className="flex gap-2">
            <Link to={`/properties/${p.id}`} className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold hover:border-brand hover:text-brand">View details</Link>
            <Link to={`/properties/${p.id}`} state={{ focus: 'contact' }} className="btn-primary rounded-full px-4 py-2 text-sm font-semibold shadow">Contact owner</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
