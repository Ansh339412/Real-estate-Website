import { AnimatePresence, motion } from 'framer-motion';
import { useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../../context/FilterContext';
import { scrollToSection } from '../../lib/scroll';
import { Reveal } from '../ui/Reveal';
import { ease } from '../ui/motion';

type Key = 'buyers' | 'renters' | 'owners' | 'agents';
const FLOWS: Record<Key, { label: string; steps: [string, string][]; cta: string }> = {
  buyers: { label: 'Buyers', cta: 'Start searching', steps: [['Set your budget', 'Choose Buy, then a city, budget and BHK. Results update as you type.'], ['Shortlist homes', 'Tap the heart to save favourites and review them later in Saved.'], ['Contact the owner', "Sign in to see the owner's phone and email, then call or WhatsApp."], ['Check the EMI', 'Use the calculator on the property page to see what the loan costs.']] },
  renters: { label: 'Renters', cta: 'Browse rentals', steps: [['Choose Rent', 'Switch the search to Rent and set your monthly budget.'], ['Filter what matters', 'Pick BHK and amenities such as furnished, parking or lift.'], ['Message the owner', 'Sign in and reach the owner directly to fix a visit.'], ['Visit before paying', 'See the home in person and verify documents first.']] },
  owners: { label: 'Owners', cta: 'Post your property', steps: [['Create a free account', 'Add your name, phone and email once.'], ['Add details and photos', 'Upload up to 8 photos from your gallery and fill in the facts.'], ['Go live instantly', 'Your listing appears in search straight away.'], ['Hear from buyers', 'Signed-in visitors see your contact details and reach you directly.']] },
  agents: { label: 'Agents', cta: 'Create an account', steps: [['Sign up once', 'One account can hold many listings.'], ['List your inventory', 'Post homes, plots and commercial spaces with photos.'], ['Manage everything', 'Review and remove listings from My listings.'], ['Respond quickly', 'Buyers contact you directly, so replies can be fast.']] },
};
const ORDER: Key[] = ['buyers', 'renters', 'owners', 'agents'];

export function HowItWorks() {
  const [tab, setTab] = useState<Key>('buyers');
  const { resetFilters, updateFilters } = useFilters();
  const navigate = useNavigate();
  const flow = FLOWS[tab];

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = ORDER[(i + (e.key === 'ArrowRight' ? 1 : ORDER.length - 1)) % ORDER.length];
    setTab(next);
    document.getElementById(`how-tab-${next}`)?.focus();
  };
  const act = () => {
    if (tab === 'buyers') scrollToSection('search');
    else if (tab === 'renters') { resetFilters(); updateFilters({ status: 'for-rent' }); scrollToSection('properties'); }
    else if (tab === 'owners') navigate('/dashboard/new');
    else navigate('/signup');
  };

  return (
    <section id="how-it-works" tabIndex={-1} aria-labelledby="how-title" className="mx-auto max-w-7xl px-4 py-16 outline-none">
      <Reveal>
        <h2 id="how-title" className="text-3xl font-bold sm:text-4xl">How it works</h2>
        <p className="mt-1 text-ink/70">Four simple steps, whichever side of the deal you are on.</p>
      </Reveal>
      <div role="tablist" aria-label="Choose your role" className="mt-6 inline-flex flex-wrap gap-1 rounded-full bg-ink/5 p-1">
        {ORDER.map((k, i) => (
          <button key={k} type="button" role="tab" id={`how-tab-${k}`} aria-selected={tab === k} aria-controls="how-panel" tabIndex={tab === k ? 0 : -1}
            onClick={() => setTab(k)} onKeyDown={(e) => onKey(e, i)}
            className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${tab === k ? 'text-white' : 'text-ink/70 hover:text-ink'}`}>
            {tab === k && <motion.span layoutId="how-pill" className="btn-primary absolute inset-0 rounded-full" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            <span className="relative">{FLOWS[k].label}</span>
          </button>
        ))}
      </div>
      <div id="how-panel" role="tabpanel" aria-labelledby={`how-tab-${tab}`} tabIndex={0} className="mt-8 outline-none">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease }}>
            <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {flow.steps.map(([title, text], i) => (
                <li key={title} className="glass-ivory relative rounded-3xl p-6 shadow-sm">
                  <span aria-hidden="true" className="font-display text-5xl font-bold text-brand/15">{i + 1}</span>
                  <h3 className="-mt-2 text-lg font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{text}</p>
                </li>
              ))}
            </ol>
            <button type="button" onClick={act} className="btn-primary mt-8 rounded-full px-7 py-3 font-semibold shadow-md active:scale-[0.98]">{flow.cta}</button>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
