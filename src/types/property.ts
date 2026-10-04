export type PropertyType = 'house' | 'apartment' | 'condo' | 'villa' | 'land' | 'commercial';
export type ListingStatus = 'for-sale' | 'for-rent';
export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'area-desc';

export interface PropertyImage {
  src: string;
  alt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  status: ListingStatus;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  address: { street: string; city: string; state: string; zip: string };
  images: PropertyImage[];
  amenities: string[];
  listedAt: string;
  featured?: boolean;
  ownerId?: string | null;
  /** True for built-in demonstration listings (never stored in the database). */
  sample?: boolean;
}

export interface PropertyFilters {
  query: string;
  status: ListingStatus | 'all';
  types: PropertyType[];
  minPrice: number | null;
  maxPrice: number | null;
  minBedrooms: number | null;
  city: string;
  minArea: number | null;
  maxArea: number | null;
  amenities: string[];
  postedWithin: number | null;
  sort: SortOption;
}
