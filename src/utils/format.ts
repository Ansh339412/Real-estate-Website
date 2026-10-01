import type { ListingStatus } from '../types/property';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatPrice = (n: number): string => inr.format(n);
export const formatArea = (sqft: number): string => `${sqft.toLocaleString('en-IN')} sq ft`;
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

/** Lakh / Crore style used on Indian property portals, e.g. 4850000 -> ₹48.5 Lac. */
export function formatShortPrice(n: number): string {
  if (n >= 1e7) return `₹${Number((n / 1e7).toFixed(2))} Cr`;
  if (n >= 1e5) return `₹${Number((n / 1e5).toFixed(2))} Lac`;
  if (n >= 1e3) return `₹${Number((n / 1e3).toFixed(1))}K`;
  return `₹${n}`;
}
export const budgetStops = (status: ListingStatus | 'all'): number[] =>
  status === 'for-rent' ? [5000, 10000, 15000, 25000, 40000, 60000, 100000] : [2500000, 5000000, 7500000, 10000000, 20000000, 50000000, 100000000];
export const pricePerSqFt = (price: number, area: number): number => (area > 0 ? Math.round(price / area) : 0);
export function timeAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d <= 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 30) return `${d} days ago`;
  const m = Math.floor(d / 30);
  return m === 1 ? '1 month ago' : `${m} months ago`;
}
