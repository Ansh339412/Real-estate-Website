import type { SupabaseClient } from '@supabase/supabase-js';
import { toAppError } from '../lib/errors';

const BUCKET = 'listing-images';
const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Returns a friendly problem message, or null when the file is acceptable. */
export function validateImage(file: File): string | null {
  if (!EXTENSIONS[file.type]) return `${file.name}: please choose a JPG, PNG or WebP photo.`;
  if (file.name.length > 150) return 'That file name is too long.';
  if (file.size > MAX_IMAGE_BYTES) return `${file.name} is larger than 5 MB.`;
  return null;
}

/** Reads the first bytes of the file: the browser-reported type and file name can be faked, the signature cannot. */
async function detectType(file: File): Promise<'image/jpeg' | 'image/png' | 'image/webp' | null> {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP') return 'image/webp';
  return null;
}

/** Photo uploads to Supabase Storage. The bucket rules in supabase/004_image_storage.sql are the real gatekeeper. */
export class StorageRepository {
  constructor(private readonly db: SupabaseClient) {}

  async upload(file: File, userId: string): Promise<string> {
    const problem = validateImage(file);
    if (problem) throw new Error(problem);
    const type = await detectType(file);
    if (!type) throw new Error("That file doesn't look like a valid photo. Please choose a JPG, PNG or WebP image.");
    const ext = EXTENSIONS[type];
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await this.db.storage.from(BUCKET).upload(path, file, { contentType: type, cacheControl: '31536000' });
    if (error) throw toAppError(error, 'storage');
    return this.db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  /** Best-effort cleanup of files this app uploaded; other URLs are ignored. */
  async removeByUrls(urls: string[]): Promise<void> {
    const marker = `/${BUCKET}/`;
    const paths = urls.map((u) => u.split(marker)[1]).filter((p): p is string => Boolean(p));
    if (paths.length > 0) await this.db.storage.from(BUCKET).remove(paths);
  }
}
