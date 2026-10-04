import type { Property, PropertyFilters } from '../types/property';

export function filterProperties(properties: Property[], f: PropertyFilters): Property[] {
  const q = f.query.trim().toLowerCase();

  const matches = properties.filter((p) => {
    if (q) {
      const haystack = `${p.title} ${p.address.street} ${p.address.city} ${p.address.state} ${p.address.zip}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.status !== 'all' && p.status !== f.status) return false;
    if (f.types.length > 0 && !f.types.includes(p.type)) return false;
    if (f.minPrice !== null && p.price < f.minPrice) return false;
    if (f.maxPrice !== null && p.price > f.maxPrice) return false;
    if (f.minBedrooms !== null && p.bedrooms < f.minBedrooms) return false;
    if (f.city && p.address.city !== f.city) return false;
    if (f.minArea !== null && p.areaSqFt < f.minArea) return false;
    if (f.maxArea !== null && p.areaSqFt > f.maxArea) return false;
    if (f.amenities.length > 0 && !f.amenities.every((a) => p.amenities.includes(a))) return false;
    if (f.postedWithin !== null && (Date.now() - new Date(p.listedAt).getTime()) / 86_400_000 > f.postedWithin) return false;
    return true;
  });

  return [...matches].sort((a, b) => {
    switch (f.sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'area-desc':
        return b.areaSqFt - a.areaSqFt;
      case 'newest':
        return b.listedAt.localeCompare(a.listedAt);
    }
  });
}
