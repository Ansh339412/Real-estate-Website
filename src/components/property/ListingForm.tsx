import { useState, type FormEvent, type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ImageUploader } from './ImageUploader';
import { fieldErrors, listingSchema, type ListingInput } from '../../lib/validation';

interface Props {
  onSubmit: (data: ListingInput) => Promise<void>;
}

const EMPTY = {
  title: '', description: '', price: '', status: 'for-sale', type: 'house', bedrooms: '2', bathrooms: '1',
  areaSqFt: '', street: '', city: '', state: '', zip: '', amenities: '',
};

const input = 'w-full rounded-md border border-ink/20 bg-white px-3 py-2';

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

// Defined at module level on purpose: a component declared inside another component gets a new identity
// on every render, which remounts its inputs and drops keyboard focus after each character.
function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}

export function ListingForm({ onSubmit }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handle(e: FormEvent) {
    e.preventDefault();
    const parsed = listingSchema.safeParse({
      ...form,
      images,
      amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
    });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setSubmitting(true);
    setServerError(null);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not save the listing.');
      setSubmitting(false);
    }
  }

  const a11y = (id: string) => ({ 'aria-invalid': Boolean(errors[id]), 'aria-describedby': errors[id] ? `${id}-err` : undefined });

  return (
    <form onSubmit={handle} noValidate className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2"><Field id="title" error={errors.title} label="Title"><input id="title" className={input} value={form.title} onChange={set('title')} maxLength={100} {...a11y('title')} /></Field></div>
      <Field id="status" error={errors.status} label="Listing type">
        <select id="status" className={input} value={form.status} onChange={set('status')}><option value="for-sale">For sale</option><option value="for-rent">For rent (monthly)</option></select>
      </Field>
      <Field id="type" error={errors.type} label="Property type">
        <select id="type" className={input} value={form.type} onChange={set('type')}>
          {['house', 'apartment', 'condo', 'villa', 'land'].map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
      </Field>
      <Field id="price" error={errors.price} label="Price (₹)"><input id="price" type="number" min={0} className={input} value={form.price} onChange={set('price')} {...a11y('price')} /></Field>
      <Field id="areaSqFt" error={errors.areaSqFt} label="Area (sq ft)"><input id="areaSqFt" type="number" min={0} className={input} value={form.areaSqFt} onChange={set('areaSqFt')} {...a11y('areaSqFt')} /></Field>
      <Field id="bedrooms" error={errors.bedrooms} label="Bedrooms"><input id="bedrooms" type="number" min={0} className={input} value={form.bedrooms} onChange={set('bedrooms')} {...a11y('bedrooms')} /></Field>
      <Field id="bathrooms" error={errors.bathrooms} label="Bathrooms"><input id="bathrooms" type="number" min={0} step={0.5} className={input} value={form.bathrooms} onChange={set('bathrooms')} {...a11y('bathrooms')} /></Field>
      <div className="sm:col-span-2"><Field id="street" error={errors.street} label="Street address"><input id="street" className={input} value={form.street} onChange={set('street')} {...a11y('street')} /></Field></div>
      <Field id="city" error={errors.city} label="City"><input id="city" className={input} value={form.city} onChange={set('city')} {...a11y('city')} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id="state" error={errors.state} label="State"><input id="state" className={input} value={form.state} onChange={set('state')} {...a11y('state')} /></Field>
        <Field id="zip" error={errors.zip} label="PIN code"><input id="zip" className={input} value={form.zip} onChange={set('zip')} {...a11y('zip')} /></Field>
      </div>
      <div className="sm:col-span-2">
        <Field id="description" error={errors.description} label="Description"><textarea id="description" rows={4} className={input} value={form.description} onChange={set('description')} maxLength={2000} {...a11y('description')} /></Field>
      </div>
      <div className="sm:col-span-2">
        <ImageUploader value={images} onChange={setImages} onBusyChange={setUploading} userId={user?.id ?? ''} error={errors.images} />
      </div>
      <div className="sm:col-span-2">
        <Field id="amenities" error={errors.amenities} label="Amenities" hint="Separate with commas, for example: Garage, Garden, Pool">
          <input id="amenities" className={input} value={form.amenities} onChange={set('amenities')} {...a11y('amenities')} />
        </Field>
      </div>
      {serverError && <p role="alert" className="text-red-700 sm:col-span-2">{serverError}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={submitting || uploading} className="rounded-md btn-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60">
          {submitting ? 'Publishing…' : 'Publish listing'}
        </button>
      </div>
    </form>
  );
}
