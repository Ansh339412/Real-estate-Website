import { Link } from 'react-router-dom';
import { Reveal } from '../ui/Reveal';

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-7xl px-4 pb-20">
      <Reveal className="surface-hero relative overflow-hidden rounded-[2rem] p-8 text-white sm:p-14">
        <div aria-hidden="true" className="blob -right-10 -top-16 h-64 w-64 bg-brand" />
        <div aria-hidden="true" className="blob -bottom-24 left-10 h-56 w-56 bg-teal" style={{ animationDelay: '-8s' }} />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 id="cta-title" className="text-3xl font-bold sm:text-5xl">Selling, renting out, or still deciding?</h2>
            <p className="mt-3 max-w-xl text-white/75">Post your property free and let serious buyers reach you directly, or talk to an advisor about your next move.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link to="/dashboard/new" className="rounded-full bg-white px-7 py-3.5 text-center font-semibold text-ink shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">Post property free</Link>
            <Link to="/contact" className="rounded-full border border-white/40 px-7 py-3.5 text-center font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10">Talk to an advisor</Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
