import { z } from 'zod';

const isHttps = (v: string): boolean => {
  try {
    return new URL(v).protocol === 'https:';
  } catch {
    return false;
  }
};

const httpsUrl = z.string().trim().max(500).refine(isHttps, 'Each image must be a full https:// link');

const plain = (s: z.ZodString) => s.refine((v) => !/[<>]/.test(v), 'Please remove the < and > characters');

export const listingSchema = z.object({
  title: plain(z.string().trim().min(5, 'Title needs at least 5 characters').max(100, 'Keep the title under 100 characters')),
  description: plain(z.string().trim().min(20, 'Describe the property in at least 20 characters').max(2000)),
  price: z.coerce.number().positive('Price must be above 0').max(5_000_000_000),
  status: z.enum(['for-sale', 'for-rent']),
  type: z.enum(['house', 'apartment', 'condo', 'villa', 'land', 'commercial']),
  bedrooms: z.coerce.number().int('Whole number').min(0).max(20),
  bathrooms: z.coerce.number().min(0).max(20),
  areaSqFt: z.coerce.number().int('Whole number').positive('Area must be above 0').max(1_000_000),
  street: plain(z.string().trim().min(3, 'Enter the street address').max(120)),
  city: plain(z.string().trim().min(2, 'Enter the city').max(80)),
  state: plain(z.string().trim().min(2, 'Enter the state').max(40)),
  zip: z.string().trim().regex(/^\d{6}$/, 'Enter a 6-digit PIN code'),
  images: z.array(httpsUrl).min(1, 'Add at least one photo').max(8, 'Up to 8 photos'),
  amenities: z.array(z.string().trim().min(1).max(40)).max(12, 'Up to 12 amenities'),
});
export type ListingInput = z.infer<typeof listingSchema>;

export const emailSchema = z.string().trim().email('Enter a valid email address').max(254);
export const passwordSchema = z.string().min(8, 'Password needs at least 8 characters').max(72);

export const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/** Turns zod issues into { fieldName: message } for inline form errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const profileSchema = z.object({
  fullName: plain(z.string().trim().max(80, 'Keep the name under 80 characters')),
  phone: z.string().trim().regex(/^$|^[+\d][\d\s-]{6,18}$/, 'Enter a valid phone number'),
  bio: plain(z.string().trim().max(300, 'Keep the bio under 300 characters')),
  avatarUrl: z.string().trim().max(500).refine((v) => v === '' || isHttps(v), 'Photo must be an https:// link'),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const signUpSchema = credentialsSchema
  .extend({
    fullName: plain(z.string().trim().min(2, 'Enter your full name').max(80, 'Keep the name under 80 characters')),
    phone: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, 'Enter a valid phone number'),
    bio: plain(z.string().trim().max(300, 'Keep this under 300 characters')),
    confirmPassword: z.string().min(1, 'Type your password again'),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80).refine((v) => !/[<>]/.test(v), 'Please remove the < and > characters'),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, 'Enter a valid phone number'),
  interest: z.enum(['buy', 'rent', 'sell', 'other']),
  message: z.string().trim().max(500, 'Keep this under 500 characters').refine((v) => !/[<>]/.test(v), 'Please remove the < and > characters'),
});
