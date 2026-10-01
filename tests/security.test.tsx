import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const h = vi.hoisted(() => ({ auth: { user: null as null | { id: string; email: string } }, contactForListing: vi.fn() }));
vi.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ ...h.auth, profile: null }) }));
vi.mock('../src/repositories', () => ({ profiles: { contactForListing: h.contactForListing }, storage: {}, logs: {}, repository: {} }));

import { redact } from '../src/lib/logger';
import { toAppError, authErrorMessage } from '../src/lib/errors';
import { createLimiter } from '../src/lib/rateLimit';
import { ErrorView } from '../src/components/errors/ErrorView';
import { OwnerContact } from '../src/components/property/OwnerContact';
import { listingSchema } from '../src/lib/validation';
import { filterProperties } from '../src/utils/filterProperties';
import { DEFAULT_FILTERS } from '../src/context/FilterContext';
import { formatPrice, formatShortPrice } from '../src/utils/format';

afterEach(cleanup);

describe('logging and errors never leak', () => {
  it('redacts emails, phones, tokens and ids', () => {
    const out = redact('fail for a@b.com phone +91 98765 43210 password=hunter2 token=abc eyJhbGciOi.eyJyb2xlIjoi.c2lnbmF0dXJl id 123e4567-e89b-12d3-a456-426614174000');
    expect(out).not.toMatch(/a@b\.com|98765|hunter2|eyJ|123e4567|426614174000/);
  });
  it('turns raw database errors into safe messages', () => {
    const e = toAppError({ code: '42501', message: 'new row violates row-level security policy for table "properties"', details: 'secret' });
    expect(e.kind).toBe('forbidden');
    expect(e.message).toBe("You don't have permission to do that.");
    expect(e.message).not.toMatch(/row-level|properties|42501/);
    expect(toAppError({ message: 'rate_limit' }).kind).toBe('rate-limited');
    expect(toAppError(new TypeError('Failed to fetch')).kind).toBe('network');
  });
  it('keeps sign-in errors vague', () => {
    expect(authErrorMessage({ code: 'invalid_credentials', message: 'Invalid login credentials' }, 'signin')).toBe('Incorrect email or password.');
    expect(authErrorMessage({ code: 'user_not_found', message: 'No user a@b.com' }, 'signin')).not.toMatch(/a@b\.com|not found/i);
  });
  it('gives actionable but safe password recovery errors', () => {
    expect(authErrorMessage({ status: 429, code: 'over_email_send_rate_limit' }, 'recovery')).toMatch(/wait/i);
    expect(authErrorMessage({ code: 'unexpected_failure', message: 'Email rate limit exceeded' }, 'recovery')).toMatch(/wait/i);
    expect(authErrorMessage({ code: 'validation_failed', message: 'redirect URL not allowed' }, 'recovery')).toMatch(/URL Configuration/i);
    expect(authErrorMessage({ status: 500, code: 'unexpected_failure', message: 'Error sending recovery email via SMTP' }, 'recovery')).toMatch(/SMTP key.*approved sender.*unexpected_failure/i);
    expect(authErrorMessage({ status: 500, code: 'unexpected_failure', message: 'Error sending to private@email.com' }, 'recovery')).not.toMatch(/private@email\.com/i);
  });
  it('rate limiter blocks after repeated failures', () => {
    const l = createLimiter('t', 3, 60000, 30000);
    l.record(); l.record(); expect(l.retryAfterSeconds()).toBe(0);
    l.record(); expect(l.retryAfterSeconds()).toBeGreaterThan(0);
    l.reset(); expect(l.retryAfterSeconds()).toBe(0);
  });
});

describe('error pages', () => {
  it.each([[401, 'Authentication required'], [403, 'Access denied'], [404, 'Page not found'], [429, 'Too many requests'], [500, 'Something went wrong'], ['network', 'Connection problem'], ['generic', 'Something unexpected happened']] as const)('renders %s', (code, title) => {
    render(<MemoryRouter><ErrorView code={code} reference="ABCD2345" /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: title })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Go home' })).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/stack|supabase|sql|exception/i);
  });
});

describe('owner contact', () => {
  beforeEach(() => { h.contactForListing.mockReset(); });
  it('asks anonymous visitors to sign in and never calls the database', () => {
    h.auth.user = null;
    render(<MemoryRouter><OwnerContact propertyId="p1" ownerId="o1" title="Nice flat" /></MemoryRouter>);
    expect(screen.getByText(/Sign in to see the owner/)).toBeTruthy();
    expect(h.contactForListing).not.toHaveBeenCalled();
  });
  it('shows call, WhatsApp and email links to a signed-in visitor', async () => {
    h.auth.user = { id: 'visitor', email: 'v@x.co' };
    h.contactForListing.mockResolvedValue({ fullName: 'Anshpreet', phone: '+91 98765 43210', email: 'owner@x.co', avatarUrl: null });
    render(<MemoryRouter><OwnerContact propertyId="p1" ownerId="o1" title="Nice flat" /></MemoryRouter>);
    const call = await screen.findByRole('link', { name: 'Call' });
    expect(call.getAttribute('href')).toBe('tel:+919876543210');
    expect(screen.getByRole('link', { name: 'WhatsApp' }).getAttribute('href')).toContain('wa.me/919876543210');
    expect(screen.getByRole('link', { name: 'Email' }).getAttribute('href')).toContain('mailto:owner@x.co');
  });
  it('does not fetch contact details for your own listing', () => {
    h.auth.user = { id: 'o1', email: 'o@x.co' };
    render(<MemoryRouter><OwnerContact propertyId="p1" ownerId="o1" title="Mine" /></MemoryRouter>);
    expect(screen.getByText(/This is your listing/)).toBeTruthy();
    expect(h.contactForListing).not.toHaveBeenCalled();
  });
  it('shows a safe message if the lookup fails', async () => {
    h.auth.user = { id: 'visitor', email: 'v@x.co' };
    h.contactForListing.mockRejectedValue(toAppError({ code: '42501', message: 'permission denied for function get_listing_contact' }));
    render(<MemoryRouter><OwnerContact propertyId="p1" ownerId="o1" title="x" /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe("You don't have permission to do that."));
  });
});

describe('validation, filters and rupees', () => {
  const base = { title: 'Sunny 3BHK flat', description: 'A bright and spacious home near the market', price: 4850000, status: 'for-sale', type: 'apartment', bedrooms: 3, bathrooms: 2, areaSqFt: 1450, street: '12 Model Town', city: 'Jalandhar', state: 'Punjab', zip: '144001', images: ['https://abc.supabase.co/storage/v1/object/public/listing-images/u/x.jpg'], amenities: ['Parking'] };
  it('rejects markup, bad PIN codes and non-https images', () => {
    expect(listingSchema.safeParse(base).success).toBe(true);
    expect(listingSchema.safeParse({ ...base, title: 'Nice <script>x</script> home' }).success).toBe(false);
    expect(listingSchema.safeParse({ ...base, zip: '1440' }).success).toBe(false);
    expect(listingSchema.safeParse({ ...base, images: ['http://x.co/a.jpg'] }).success).toBe(false);
  });
  it('filters by city, area, amenities and BHK', () => {
    const mk = (id: string, city: string, area: number, bhk: number, am: string[]) => ({ id, title: id, description: '', price: 1, status: 'for-sale', type: 'house', bedrooms: bhk, bathrooms: 1, areaSqFt: area, address: { street: 's', city, state: 'x', zip: '1' }, images: [], amenities: am, listedAt: '2026-09-01' }) as never;
    const list = [mk('a', 'Jalandhar', 1000, 2, ['Gym']), mk('b', 'Delhi', 2000, 3, ['Gym', 'Pool'])];
    expect(filterProperties(list, { ...DEFAULT_FILTERS, city: 'Delhi' }).map((p) => p.id)).toEqual(['b']);
    expect(filterProperties(list, { ...DEFAULT_FILTERS, minArea: 1500 }).map((p) => p.id)).toEqual(['b']);
    expect(filterProperties(list, { ...DEFAULT_FILTERS, amenities: ['Gym', 'Pool'] }).map((p) => p.id)).toEqual(['b']);
    expect(filterProperties(list, { ...DEFAULT_FILTERS, minBedrooms: 2 }).length).toBe(2);
  });
  it('formats rupees', () => {
    expect(formatPrice(4850000).replace(/\s/g, '')).toBe('₹48,50,000');
    expect(formatShortPrice(4850000)).toBe('₹48.5 Lac');
    expect(formatShortPrice(25000000)).toBe('₹2.5 Cr');
  });
});
