import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { DEFAULT_FILTERS, FilterProvider } from '../src/context/FilterContext';
import { PropertiesProvider } from '../src/context/PropertiesContext';
import { art } from '../src/data/art';
import { sampleListings } from '../src/data/sampleListings';
import { Header } from '../src/components/layout/Header';
import { Footer } from '../src/components/layout/Footer';
import HomePage from '../src/pages/HomePage';
import { filterProperties } from '../src/utils/filterProperties';
import { listingSchema } from '../src/lib/validation';

beforeAll(() => {
  // jsdom has no layout engine: stub what framer-motion and the page expect from a browser.
  class IO { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
  Object.assign(globalThis, { IntersectionObserver: IO, ResizeObserver: IO });
  window.matchMedia = window.matchMedia ?? ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false }) as MediaQueryList);
  Element.prototype.scrollIntoView = () => {};
});
afterEach(cleanup);

function App({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider><PropertiesProvider><FavoritesProvider><FilterProvider>{children}</FilterProvider></FavoritesProvider></PropertiesProvider></AuthProvider>
    </MemoryRouter>
  );
}

describe('sample listings', () => {
  const list = sampleListings();
  it('are plentiful, varied and well-formed', () => {
    expect(list.length).toBeGreaterThanOrEqual(12);
    expect(new Set(list.map((p) => p.type))).toEqual(new Set(['apartment', 'villa', 'house', 'land', 'commercial']));
    expect(list.some((p) => p.status === 'for-rent')).toBe(true);
    for (const p of list) {
      expect(p.sample).toBe(true);
      expect(p.address.zip).toMatch(/^\d{6}$/);
      expect(p.images.length).toBe(3);
      expect(p.images.every((i) => i.alt.length > 10 && i.src.startsWith('data:image/svg+xml'))).toBe(true);
    }
  });
  it('give every category card at least one result', () => {
    const f = (patch: object) => filterProperties(list, { ...DEFAULT_FILTERS, ...patch }).length;
    expect(f({ types: ['apartment'] })).toBeGreaterThan(0);
    expect(f({ types: ['villa', 'house'] })).toBeGreaterThan(0);
    expect(f({ types: ['land'] })).toBeGreaterThan(0);
    expect(f({ status: 'for-rent' })).toBeGreaterThan(0);
    expect(f({ types: ['commercial'] })).toBeGreaterThan(0);
  });
  it('pass the same validation real listings must pass (apart from photo hosting)', () => {
    const p = list[0];
    const ok = listingSchema.safeParse({ title: p.title, description: p.description, price: p.price, status: p.status, type: p.type, bedrooms: p.bedrooms, bathrooms: p.bathrooms, areaSqFt: p.areaSqFt, ...p.address, images: ['https://x.supabase.co/a.jpg'], amenities: p.amenities });
    expect(ok.success).toBe(true);
  });
  it('illustrations are deterministic', () => expect(art('villa', 4)).toBe(art('villa', 4)));
});

describe('home page', () => {
  it('shows listings by default, filters live from the search module, and clears', async () => {
    render(<App><HomePage /></App>);
    const grid = () => document.querySelectorAll('#properties article').length;
    await screen.findByRole('heading', { name: 'Featured properties' });
    expect(grid()).toBe(6);                                   // never an empty default state
    expect(screen.getByText(/Sample listings\./)).toBeTruthy(); // and it is clearly labelled

    const u = userEvent.setup();
    await u.click(screen.getByRole('tab', { name: 'Rent' }));
    expect(await screen.findByRole('heading', { name: /properties match your search/ })).toBeTruthy();
    // cards animate out before they leave the page, so wait for the list to settle
    await waitFor(() => expect([...document.querySelectorAll('#properties article')].every((a) => a.textContent?.includes('/month'))).toBe(true), { timeout: 4000 });

    await u.type(screen.getByLabelText('City, locality or PIN code'), 'zzzz-no-such-place');
    expect(await screen.findByText('No properties match these filters')).toBeTruthy();
    await u.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(await screen.findByRole('heading', { name: 'Featured properties' })).toBeTruthy();
  });

  it('category cards apply filters', async () => {
    render(<App><HomePage /></App>);
    await screen.findByRole('heading', { name: 'Browse by category' });
    await userEvent.click(within(document.getElementById('categories')!).getByRole('button', { name: /Commercial/ }));
    await waitFor(() => expect(document.querySelectorAll('#properties article').length).toBe(3), { timeout: 4000 });
    expect(screen.getByRole('heading', { name: '3 properties match your search' })).toBeTruthy();
  });

  it('saving a home works without an account and changes visibly', async () => {
    render(<App><Header /><HomePage /></App>);
    const save = (await screen.findAllByRole('button', { name: /^Save / }))[0];
    expect(save.getAttribute('aria-pressed')).toBe('false');
    await userEvent.click(save);
    expect(screen.getAllByRole('button', { name: /^Remove .* from saved homes/ })[0].getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(/Saved for this visit/)).toBeTruthy();
  });

  it('has one h1, labelled landmarks and no obvious accessibility violations', async () => {
    render(<App><Header /><main><HomePage /></main><Footer /></App>);
    await screen.findByRole('heading', { name: 'Featured properties' });
    expect(document.querySelectorAll('h1').length).toBe(1);
    let results!: axe.AxeResults;
    await act(async () => { results = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } }); });
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
  });
});
