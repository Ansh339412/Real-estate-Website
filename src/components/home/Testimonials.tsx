import { Reveal } from '../ui/Reveal';

// Illustrative content: these are fictional people written for the demonstration, not real customer reviews.
const ITEMS = [
  { quote: 'I filtered by budget and BHK, saved three flats and called the owners the same evening. No agent in between.', name: 'Riya S.', role: 'Buyer, Chandigarh' },
  { quote: 'Posting my flat took ten minutes, with photos straight from my phone. I had two enquiries before the weekend.', name: 'Harpreet K.', role: 'Owner, Jalandhar' },
  { quote: 'The EMI calculator helped us decide our down payment before we even visited. Simple and honest numbers.', name: 'Aman & Neha', role: 'First-time buyers, Pune' },
];

export function Testimonials() {
  return (
    <section aria-labelledby="voices-title" className="mx-auto max-w-7xl px-4 pb-16">
      <Reveal>
        <h2 id="voices-title" className="text-3xl font-bold sm:text-4xl">What people say</h2>
        <p className="mt-1 text-sm text-ink/60">Illustrative testimonials written for this demonstration, not real customer reviews.</p>
      </Reveal>
      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {ITEMS.map((t, i) => (
          <li key={t.name}>
            <Reveal delay={i * 0.1} className="glass-ivory flex h-full flex-col rounded-3xl p-7 shadow-sm">
              <p role="img" aria-label="5 out of 5 stars" className="text-gold">★★★★★</p>
              <blockquote className="mt-3 flex-1 font-display text-lg leading-snug">“{t.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span aria-hidden="true" className="btn-primary grid h-10 w-10 place-items-center rounded-full font-display font-bold">{t.name.charAt(0)}</span>
                <span><span className="block text-sm font-semibold">{t.name}</span><span className="text-xs text-ink/60">{t.role}</span></span>
              </figcaption>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
