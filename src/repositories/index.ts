import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { LogRepository } from './LogRepository';
import { ProfileRepository } from './ProfileRepository';
import { StorageRepository } from './StorageRepository';
import { SupabasePropertyRepository } from './SupabasePropertyRepository';

// main.tsx refuses to render the app unless Supabase is configured, so the client exists here.
const client = supabase as SupabaseClient;
export const repository = new SupabasePropertyRepository(client);
export const storage = new StorageRepository(client);
export const profiles = new ProfileRepository(client);
export const logs = new LogRepository(client);
