import type { Property } from '../types/property';
import type { ListingInput } from '../lib/validation';

/** The contract every data source must satisfy. Components never see which one is active. */
export interface PropertyRepository {
  list(): Promise<Property[]>;
  create(input: ListingInput): Promise<Property>;
  remove(id: string): Promise<void>;
  listFavoriteIds(userId: string): Promise<string[]>;
  setFavorite(userId: string, propertyId: string, on: boolean): Promise<void>;
}

export const toImages = (urls: string[], title: string) =>
  urls.map((src, i) => ({ src, alt: `${title}, photo ${i + 1}` }));
