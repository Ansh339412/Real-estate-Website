import type { Property, PropertyType, ListingStatus } from '../types/property';
import { art, type Scene } from './art';

type Row = [title: string, type: PropertyType, status: ListingStatus, price: number, beds: number, baths: number, area: number,
  street: string, city: string, state: string, pin: string, amenities: string[], featured: boolean, daysAgo: number, scene: Scene];

const A = { lift: 'Lift', park: 'Covered parking', gym: 'Gym', power: 'Power backup', gated: 'Gated society', pool: 'Swimming pool', garden: 'Garden', sec: '24x7 security', club: 'Clubhouse', fur: 'Furnished' };

const ROWS: Row[] = [
  ['3 BHK Skyline Apartment with Balcony', 'apartment', 'for-sale', 12500000, 3, 3, 1650, 'Sector 82, JLPL Industrial Area', 'Mohali', 'Punjab', '160055', [A.lift, A.park, A.gym, A.power, A.gated], true, 2, 'tower'],
  ['Contemporary 4 BHK Villa with Private Garden', 'villa', 'for-sale', 38500000, 4, 5, 3200, 'Sector 20', 'Chandigarh', 'Chandigarh', '160020', [A.garden, A.park, A.sec, A.power, A.gated], true, 1, 'villa'],
  ['2 BHK Ready-to-Move Flat', 'apartment', 'for-sale', 4850000, 2, 2, 1050, 'Model Town Extension', 'Jalandhar', 'Punjab', '144003', [A.lift, A.park, A.power], true, 5, 'tower'],
  ['Premium 3 BHK Rental near Cyber Hub', 'apartment', 'for-rent', 65000, 3, 3, 1900, 'DLF Phase 3', 'Gurugram', 'Haryana', '122002', [A.fur, A.lift, A.gym, A.pool, A.sec], true, 3, 'tower'],
  ['Corner Residential Plot, 200 sq yd', 'land', 'for-sale', 9500000, 0, 0, 1800, 'Sector 66A', 'Mohali', 'Punjab', '160066', [A.gated, A.sec], false, 3, 'plot'],
  ['Designer 2 BHK in South Delhi', 'apartment', 'for-sale', 21500000, 2, 2, 1100, 'Greater Kailash II', 'New Delhi', 'Delhi', '110048', [A.lift, A.park, A.power, A.sec], false, 4, 'tower'],
  ['Sea-view 2 BHK in Bandra West', 'apartment', 'for-rent', 145000, 2, 2, 950, 'Carter Road, Bandra West', 'Mumbai', 'Maharashtra', '400050', [A.fur, A.lift, A.gym, A.sec], true, 2, 'tower'],
  ['Co-working Ready Office Space', 'commercial', 'for-rent', 185000, 0, 2, 2400, 'Koramangala 5th Block', 'Bengaluru', 'Karnataka', '560095', [A.park, A.power, A.lift, A.sec], true, 6, 'commercial'],
  ['Gated 3 BHK near the IT Park', 'apartment', 'for-sale', 9800000, 3, 3, 1480, 'Hinjewadi Phase 2', 'Pune', 'Maharashtra', '411057', [A.lift, A.club, A.pool, A.gated, A.park], false, 7, 'tower'],
  ['Independent 3 BHK House with Terrace', 'house', 'for-sale', 16500000, 3, 3, 2100, 'Sarabha Nagar', 'Ludhiana', 'Punjab', '141001', [A.garden, A.park, A.power], false, 8, 'villa'],
  ['Luxury 4 BHK Penthouse', 'apartment', 'for-sale', 52000000, 4, 5, 4100, 'Jubilee Hills', 'Hyderabad', 'Telangana', '500033', [A.pool, A.gym, A.club, A.lift, A.sec, A.park], true, 1, 'tower'],
  ['Ground-floor Retail Showroom', 'commercial', 'for-sale', 31000000, 0, 2, 1800, 'Sector 17 Market', 'Chandigarh', 'Chandigarh', '160017', [A.park, A.power, A.sec], false, 9, 'commercial'],
  ['1 BHK Furnished Studio', 'apartment', 'for-rent', 22000, 1, 1, 520, 'Whitefield', 'Bengaluru', 'Karnataka', '560066', [A.fur, A.lift, A.gym, A.sec], false, 3, 'tower'],
  ['Farm Plot, 1 Acre with Road Access', 'land', 'for-sale', 14500000, 0, 0, 43560, 'Kharar-Landran Road', 'Mohali', 'Punjab', '140301', [A.sec], false, 12, 'plot'],
  ['Spacious 3 BHK Family Rental', 'apartment', 'for-rent', 38000, 3, 2, 1550, 'Hitech City', 'Hyderabad', 'Telangana', '500081', [A.lift, A.park, A.club, A.power], false, 4, 'tower'],
  ['Heritage-style 5 BHK Villa', 'villa', 'for-sale', 78000000, 5, 6, 5200, 'Golf Course Road', 'Gurugram', 'Haryana', '122002', [A.pool, A.garden, A.gym, A.sec, A.power, A.gated], true, 6, 'villa'],
  ['2 BHK Builder Floor', 'apartment', 'for-sale', 7200000, 2, 2, 980, 'Rajouri Garden', 'New Delhi', 'Delhi', '110027', [A.park, A.power], false, 10, 'tower'],
  ['Boutique Office Floor, 1,200 sq ft', 'commercial', 'for-rent', 95000, 0, 1, 1200, 'Baner', 'Pune', 'Maharashtra', '411045', [A.lift, A.park, A.power], false, 5, 'commercial'],
];

const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

/** Demonstration listings, shown only while the database has no real properties yet. Never written to the database. */
export function sampleListings(): Property[] {
  return ROWS.map(([title, type, status, price, bedrooms, bathrooms, areaSqFt, street, city, state, zip, amenities, featured, daysAgo, scene], i) => ({
    id: `sample-${i + 1}`,
    title,
    description: `${title} in ${street}, ${city}. This is a sample listing used to show how Hearth & Key looks with real properties. Owners post their own listings with photos from their gallery, and signed-in visitors can contact them directly.`,
    price, status, type, bedrooms, bathrooms, areaSqFt,
    address: { street, city, state, zip },
    images: [
      { src: art(scene, i + 1), alt: `Illustration of ${title}: exterior view` },
      { src: art('interior', i + 7), alt: `Illustration of ${title}: living room` },
      { src: art(scene === 'tower' ? 'skyline' : scene, i + 13), alt: `Illustration of the neighbourhood around ${title}` },
    ],
    amenities, featured, listedAt: day(daysAgo), ownerId: null, sample: true,
  }));
}
