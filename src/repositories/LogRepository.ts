import type { SupabaseClient } from '@supabase/supabase-js';
import { toAppError } from '../lib/errors';

export interface ErrorLog {
  id: string;
  createdAt: string;
  reference: string;
  level: string;
  code: string;
  message: string;
  route: string;
}

/** Admin-only read access: row level security returns nothing to anyone else. */
export class LogRepository {
  constructor(private readonly db: SupabaseClient) {}

  async recent(limit = 25): Promise<ErrorLog[]> {
    const { data, error } = await this.db.from('error_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw toAppError(error);
    return (data as { id: string; created_at: string; reference: string; level: string; code: string; message: string; route: string }[]).map((r) => ({
      id: r.id, createdAt: r.created_at, reference: r.reference, level: r.level, code: r.code, message: r.message, route: r.route,
    }));
  }
}
