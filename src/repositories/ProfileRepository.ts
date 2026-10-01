import type { SupabaseClient } from '@supabase/supabase-js';
import { toAppError } from '../lib/errors';
import type { ListingContact, Profile, Role } from '../types/profile';
import type { ProfileInput } from '../lib/validation';

interface Row {
  id: string; email: string; full_name: string; phone: string; bio: string;
  avatar_url: string | null; role: Role; created_at: string;
}

const fromRow = (r: Row): Profile => ({
  id: r.id, email: r.email, fullName: r.full_name, phone: r.phone, bio: r.bio,
  avatarUrl: r.avatar_url, role: r.role, createdAt: r.created_at,
});

/** Profile data access. Who may read or change what is enforced by Row Level Security in the database. */
export class ProfileRepository {
  constructor(private readonly db: SupabaseClient) {}

  async get(userId: string): Promise<Profile | null> {
    const { data, error } = await this.db.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw toAppError(error);
    return data ? fromRow(data as Row) : null;
  }

  async update(userId: string, input: ProfileInput): Promise<Profile> {
    const { data, error } = await this.db
      .from('profiles')
      .update({ full_name: input.fullName, phone: input.phone, bio: input.bio, avatar_url: input.avatarUrl || null })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw toAppError(error);
    return fromRow(data as Row);
  }

  /** Admin only: RLS returns just the caller's own row to everyone else. */
  async listAll(): Promise<Profile[]> {
    const { data, error } = await this.db.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw toAppError(error);
    return (data as Row[]).map(fromRow);
  }

  async setRole(userId: string, role: Role): Promise<void> {
    const { error } = await this.db.from('profiles').update({ role }).eq('id', userId);
    if (error) throw toAppError(error);
  }

  /** Signed-in visitors only: the database function returns one listing's owner contact, never a profile list. */
  async contactForListing(propertyId: string): Promise<ListingContact | null> {
    if (!/^[0-9a-f-]{36}$/i.test(propertyId)) return null;
    const { data, error } = await this.db.rpc('get_listing_contact', { p_property_id: propertyId });
    if (error) throw toAppError(error);
    const row = (data as { full_name: string; phone: string; email: string; avatar_url: string | null }[] | null)?.[0];
    return row ? { fullName: row.full_name, phone: row.phone, email: row.email, avatarUrl: row.avatar_url } : null;
  }
}
