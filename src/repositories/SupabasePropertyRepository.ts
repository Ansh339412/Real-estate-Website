import type { SupabaseClient } from '@supabase/supabase-js';
import type { Property, PropertyImage } from '../types/property';
import type { ListingInput } from '../lib/validation';
import { toAppError } from '../lib/errors';
import { toImages, type PropertyRepository } from './PropertyRepository';
import { StorageRepository } from './StorageRepository';

interface Row {
  id: string;
  owner_id: string | null;
  title: string;
  description: string;
  price: number | string;
  status: Property['status'];
  type: Property['type'];
  bedrooms: number;
  bathrooms: number | string;
  area_sqft: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  images: PropertyImage[];
  amenities: string[];
  featured: boolean;
  created_at: string;
}

const fromRow = (r: Row): Property => ({
  id: r.id,
  ownerId: r.owner_id,
  title: r.title,
  description: r.description,
  price: Number(r.price),
  status: r.status,
  type: r.type,
  bedrooms: r.bedrooms,
  bathrooms: Number(r.bathrooms),
  areaSqFt: r.area_sqft,
  address: { street: r.street, city: r.city, state: r.state, zip: r.zip },
  images: r.images,
  amenities: r.amenities,
  featured: r.featured,
  listedAt: r.created_at.slice(0, 10),
});

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw toAppError(res.error);
  return res.data as T;
}

export class SupabasePropertyRepository implements PropertyRepository {
  private readonly files: StorageRepository;

  constructor(private readonly db: SupabaseClient) {
    this.files = new StorageRepository(db);
  }

  async list(): Promise<Property[]> {
    const rows = check<Row[]>(await this.db.from('properties').select('*').order('created_at', { ascending: false }));
    return rows.map(fromRow);
  }

  // owner_id is filled by the database (default auth.uid()) and enforced by RLS, never trusted from the client.
  async create(input: ListingInput): Promise<Property> {
    const row = check<Row>(
      await this.db
        .from('properties')
        .insert({
          title: input.title, description: input.description, price: input.price, status: input.status,
          type: input.type, bedrooms: input.bedrooms, bathrooms: input.bathrooms, area_sqft: input.areaSqFt,
          street: input.street, city: input.city, state: input.state, zip: input.zip,
          images: toImages(input.images, input.title), amenities: input.amenities,
        })
        .select()
        .single(),
    );
    return fromRow(row);
  }

  async remove(id: string): Promise<void> {
    const { data } = await this.db.from('properties').select('images').eq('id', id).maybeSingle();
    check(await this.db.from('properties').delete().eq('id', id));
    const urls = ((data as { images: PropertyImage[] } | null)?.images ?? []).map((i) => i.src);
    try {
      await this.files.removeByUrls(urls); // tidy up the photos too; never block the delete
    } catch {
      /* orphaned files are harmless */
    }
  }

  async listFavoriteIds(userId: string): Promise<string[]> {
    const rows = check<{ property_id: string }[]>(await this.db.from('favorites').select('property_id').eq('user_id', userId));
    return rows.map((r) => r.property_id);
  }

  async setFavorite(userId: string, propertyId: string, on: boolean): Promise<void> {
    if (on) check(await this.db.from('favorites').insert({ user_id: userId, property_id: propertyId }));
    else check(await this.db.from('favorites').delete().eq('user_id', userId).eq('property_id', propertyId));
  }
}
