import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../components/ui/FormField';
import { contactSchema, fieldErrors } from '../lib/validation';
import { useDocumentMeta } from '../lib/seo';

const input = 'w-full rounded-xl border border-ink/20 bg-white px-3 py-2.5 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/20';
const EMPTY = { name: '', phone: '', interest: 'buy', message: '' };

export default function ContactPage() {
  useDocumentMeta('Talk to an advisor | Hearth & Key', 'Ask a Hearth & Key advisor about buying, renting or selling a property.');
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setSent(true); // Demonstration: nothing is sent anywhere. Connect this to your own inbox or CRM before launch.
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="text-4xl font-bold">Talk to an advisor</h1>
        <p className="mt-3 text-ink/70">Tell us what you are looking for and an advisor can suggest next steps: shortlisting, paperwork, loan planning or pricing your own property.</p>
        <p className="glass-ivory mt-6 rounded-2xl p-4 text-sm text-ink/80"><strong>Demo form.</strong> This form does not send your message anywhere yet. To contact an owner about a specific property, open it and use <em>Contact owner</em>.</p>
        <Link to="/listings" className="mt-6 inline-block font-semibold text-brand underline">Browse properties instead</Link>
      </div>
      <section aria-labelledby="advisor-form" className="glass rounded-3xl p-6 shadow-lg sm:p-8">
        {sent ? (
          <div role="status" className="py-8 text-center">
            <h2 id="advisor-form" className="text-2xl font-bold">Thanks, {form.name.split(' ')[0]}</h2>
            <p className="mt-2 text-ink/70">This is a demonstration, so no request was sent. In the live site an advisor would call you on {form.phone}.</p>
            <button type="button" onClick={() => { setSent(false); setForm(EMPTY); }} className="mt-6 font-semibold text-brand underline">Send another</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-5">
            <h2 id="advisor-form" className="sr-only">Advisor request form</h2>
            <FormField id="name" label="Your name" error={errors.name}><input id="name" autoComplete="name" className={input} value={form.name} onChange={set('name')} maxLength={80} aria-invalid={Boolean(errors.name)} /></FormField>
            <FormField id="phone" label="Phone number" error={errors.phone}><input id="phone" type="tel" autoComplete="tel" className={input} value={form.phone} onChange={set('phone')} maxLength={20} aria-invalid={Boolean(errors.phone)} /></FormField>
            <FormField id="interest" label="I want to">
              <select id="interest" className={input} value={form.interest} onChange={set('interest')}>
                <option value="buy">Buy a property</option><option value="rent">Rent a property</option><option value="sell">Sell or rent out my property</option><option value="other">Something else</option>
              </select>
            </FormField>
            <FormField id="message" label="Message (optional)" error={errors.message}><textarea id="message" rows={4} className={input} value={form.message} onChange={set('message')} maxLength={500} aria-invalid={Boolean(errors.message)} /></FormField>
            <button type="submit" className="btn-primary w-full rounded-full px-6 py-3.5 font-semibold shadow-md active:scale-[0.98]">Request a call back</button>
          </form>
        )}
      </section>
    </div>
  );
}
