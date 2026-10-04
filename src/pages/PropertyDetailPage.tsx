import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ErrorView } from '../components/errors/ErrorView';
import { EmiCalculator } from '../components/property/EmiCalculator';
import { ImageCarousel } from '../components/property/ImageCarousel';
import { OwnerContact } from '../components/property/OwnerContact';
import { PropertyGrid } from '../components/property/PropertyGrid';
import { useFavorites } from '../context/FavoritesContext';
import { useProperties } from '../context/PropertiesContext';
import { useDocumentMeta, useJsonLd } from '../lib/seo';
import { formatArea, formatDate, formatPrice, pricePerSqFt, timeAgo, typeLabel } from '../utils/format';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { properties, loading, error } = useProperties();
  const { isFavorite, toggle } = useFavorites();
  const location = useLocation();
  const contactRef = useRef<HTMLDivElement>(null);
  const [shared, setShared] = useState(false);
  const property = properties.find((p) => p.id === id);

  useEffect(() => {
    if ((location.state as { focus?: string } | null)?.focus === 'contact') contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [location.state, property?.id]);
  const similar = useMemo(
    () => (property ? properties.filter((p) => p.id !== property.id && (p.address.city === property.address.city || p.type === property.type)).slice(0, 3) : []),
    [properties, property],
  );

  const ld = useMemo(() => {
    if (!property) return null;
    const p = property;
    const residence = p.type === 'apartment' || p.type === 'condo' ? 'Apartment' : p.type === 'house' || p.type === 'villa' ? 'SingleFamilyResidence' : 'Place';
    return {
      '@context': 'https://schema.org',
      '@type': [residence, 'Product'],
      name: p.title,
      description: p.description.slice(0, 300),
      image: p.images.filter((i) => i.src.startsWith('https://')).map((i) => i.src),
      address: { '@type': 'PostalAddress', streetAddress: p.address.street, addressLocality: p.address.city, addressRegion: p.address.state, postalCode: p.address.zip, addressCountry: 'IN' },
      ...(p.areaSqFt > 0 ? { floorSize: { '@type': 'QuantitativeValue', value: p.areaSqFt, unitCode: 'FTK' } } : {}),
      ...(p.bedrooms > 0 && residence !== 'Place' ? { numberOfBedrooms: p.bedrooms, numberOfBathroomsTotal: p.bathrooms } : {}),
      offers: { '@type': 'Offer', price: p.price, priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: window.location.href },
    };
  }, [property]);
  useJsonLd('listing-jsonld', ld);
  useDocumentMeta(property ? `${property.title} in ${property.address.city} | Hearth & Key` : 'Property | Hearth & Key', property ? `${typeLabel(property.type)} for ${property.status === 'for-rent' ? 'rent' : 'sale'} in ${property.address.city}, ${property.address.state}. ${formatPrice(property.price)}, ${formatArea(property.areaSqFt)}.` : undefined);

  if (loading) return <p className="p-8" role="status">Loading…</p>;
  if (error) return <p role="alert" className="p-8 text-red-700">{error}</p>;
  if (!property) return <ErrorView code={404} />;

  const { title, price, status, bedrooms, bathrooms, areaSqFt, address, images, amenities, description, listedAt, type } = property;
  const rent = status === 'for-rent';
  const saved = isFavorite(property.id);
  const save = async () => {
    await toggle(property.id);
  };
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* the visitor cancelled sharing */
    }
  };
  const facts: [string, string][] = [
    ['Bedrooms', `${bedrooms} BHK`], ['Bathrooms', String(bathrooms)], ['Area', formatArea(areaSqFt)],
    ...(rent ? [] : ([['Price per sq ft', formatPrice(pricePerSqFt(price, areaSqFt))]] as [string, string][])),
    ['Property type', typeLabel(type)], ['Listed for', rent ? 'Rent' : 'Sale'], ['Posted', timeAgo(listedAt)], ['Posted by', 'Owner'],
  ];
  const btn = 'rounded-full border px-5 py-2 text-sm font-semibold transition active:scale-95';
  const idle = 'border-ink/20 bg-white hover:border-brand hover:text-brand';

  return (
    <article className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink/60">
        <ol className="flex flex-wrap gap-2">
          <li><Link to="/" className="hover:underline">Home</Link> /</li>
          <li><Link to="/listings" className="hover:underline">Properties</Link> /</li>
          <li aria-current="page" className="text-ink">{address.city}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-8">
          <ImageCarousel images={images} />

          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <address className="mt-1 not-italic text-ink/70">{address.street}, {address.city}, {address.state} {address.zip}</address>
              <p className="mt-3 font-display text-4xl font-bold text-brand-dark">
                <data value={price}>{formatPrice(price)}</data>{rent && <span className="font-sans text-base font-normal text-ink/60"> /month</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => void share()} className={`${btn} ${idle}`}>{shared ? 'Link copied' : 'Share'}</button>
              <button type="button" onClick={() => void save()} aria-pressed={saved} className={`${btn} ${saved ? 'border-accent bg-accent text-white' : idle}`}>{saved ? '♥ Saved' : '♡ Save'}</button>
            </div>
          </header>

          <section aria-labelledby="overview" className="glass rounded-2xl p-6">
            <h2 id="overview" className="text-xl font-bold">Property overview</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {facts.map(([k, v]) => (<div key={k}><dt className="text-sm text-ink/60">{k}</dt><dd className="font-semibold">{v}</dd></div>))}
            </dl>
          </section>

          <section aria-labelledby="about">
            <h2 id="about" className="text-xl font-bold">About this property</h2>
            <p className="mt-2 max-w-prose whitespace-pre-line leading-relaxed">{description}</p>
            <p className="mt-2 text-sm text-ink/60">Listed on <time dateTime={listedAt}>{formatDate(listedAt)}</time></p>
          </section>

          {amenities.length > 0 && (
            <section aria-labelledby="amenities">
              <h2 id="amenities" className="text-xl font-bold">Amenities</h2>
              <ul className="mt-3 flex flex-wrap gap-2">{amenities.map((a) => <li key={a} className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-dark">{a}</li>)}</ul>
            </section>
          )}

          {!rent && <EmiCalculator price={price} />}
        </div>

        <aside aria-label="Contact" className="lg:sticky lg:top-24 lg:self-start">
          <div ref={contactRef} className="scroll-mt-28">
            <OwnerContact propertyId={property.id} ownerId={property.ownerId} title={title} sample={property.sample} />
          </div>
          <p className="mt-3 px-1 text-xs text-ink/50">Be careful: never pay in advance before visiting the property and verifying the owner's documents.</p>
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar" className="mt-12">
          <h2 id="similar" className="mb-5 text-2xl font-bold">Similar properties</h2>
          <PropertyGrid properties={similar} />
        </section>
      )}
    </article>
  );
}
