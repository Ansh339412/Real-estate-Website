import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profiles } from '../../repositories';
import type { ListingContact } from '../../types/profile';

interface Props { propertyId: string; ownerId?: string | null; title: string; sample?: boolean }
type State = { status: 'idle' | 'loading' | 'ready' | 'error'; contact: ListingContact | null; message: string };

const phoneDigits = (p: string) => p.replace(/[^\d+]/g, '');
const whatsappNumber = (p: string) => {
  const d = p.replace(/\D/g, '');
  return d.length === 10 ? `91${d}` : d; // assume India for bare 10-digit numbers
};
const btn = 'flex flex-1 items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold';

/** Owner contact card. Phone and email are fetched ONLY for signed-in visitors, one listing at a time. */
export function OwnerContact({ propertyId, ownerId, title, sample = false }: Props) {
  const { user } = useAuth();
  const location = useLocation();
  const userId = user?.id;
  const isOwner = Boolean(userId && ownerId && userId === ownerId);
  const [state, setState] = useState<State>({ status: 'idle', contact: null, message: '' });

  useEffect(() => {
    if (!userId || !ownerId || isOwner) return setState({ status: 'idle', contact: null, message: '' });
    let cancelled = false;
    setState({ status: 'loading', contact: null, message: '' });
    profiles
      .contactForListing(propertyId)
      .then((contact) => !cancelled && setState({ status: 'ready', contact, message: '' }))
      .catch((e: unknown) => !cancelled && setState({ status: 'error', contact: null, message: e instanceof Error ? e.message : 'Something went wrong. Please try again.' }));
    return () => {
      cancelled = true;
    };
  }, [userId, ownerId, isOwner, propertyId]);

  const c = state.contact;
  let body;
  if (sample) body = (
    <>
      <p className="text-sm text-ink/70">This is a sample listing, so there is no owner to contact. Real listings show the owner's phone and email to signed-in visitors.</p>
      <Link to="/contact" className={`${btn} btn-primary mt-4`}>Talk to an advisor</Link>
    </>
  );
  else if (!ownerId) body = <p className="text-sm text-ink/70">Contact details are not available for this listing.</p>;
  else if (!userId)
    body = (
      <>
        <p className="text-sm text-ink/70">Sign in to see the owner's phone number and email. It only takes a minute.</p>
        <div className="mt-4 flex flex-col gap-2">
          <Link to="/login" state={{ from: location.pathname }} className={`${btn} btn-primary`}>Sign in to contact owner</Link>
          <Link to="/signup" className={`${btn} border border-ink/20 hover:border-brand hover:text-brand`}>Create free account</Link>
        </div>
      </>
    );
  else if (isOwner) body = <p className="text-sm text-ink/70">This is your listing. Signed-in visitors can see your name, phone and email here.</p>;
  else if (state.status === 'loading' || state.status === 'idle') body = <p role="status" className="text-sm text-ink/70">Loading contact details…</p>;
  else if (state.status === 'error') body = <p role="alert" className="text-sm text-red-700">{state.message}</p>;
  else if (!c) body = <p className="text-sm text-ink/70">Contact details are not available for this listing.</p>;
  else
    body = (
      <>
        <div className="flex items-center gap-3">
          {c.avatarUrl ? (
            <img src={c.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div aria-hidden="true" className="btn-primary flex h-14 w-14 items-center justify-center rounded-full font-display text-xl font-bold">{(c.fullName || '?').charAt(0).toUpperCase()}</div>
          )}
          <div>
            <p className="font-semibold">{c.fullName || 'Property owner'}</p>
            <p className="text-xs text-ink/60">Owner</p>
          </div>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          {c.phone && <div><dt className="text-ink/60">Phone</dt><dd className="font-semibold"><a href={`tel:${phoneDigits(c.phone)}`} className="hover:underline">{c.phone}</a></dd></div>}
          {c.email && <div><dt className="text-ink/60">Email</dt><dd className="break-all font-semibold"><a href={`mailto:${c.email}?subject=${encodeURIComponent(`Enquiry: ${title}`.slice(0, 120))}`} className="hover:underline">{c.email}</a></dd></div>}
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          {c.phone && <a href={`tel:${phoneDigits(c.phone)}`} className={`${btn} btn-primary`}>Call</a>}
          {c.phone && <a href={`https://wa.me/${whatsappNumber(c.phone)}?text=${encodeURIComponent(`Hi, I'm interested in "${title}" on Hearth & Key.`.slice(0, 200))}`} target="_blank" rel="noopener noreferrer" className={`${btn} border border-ink/20 hover:border-brand hover:text-brand`}>WhatsApp</a>}
          {c.email && <a href={`mailto:${c.email}?subject=${encodeURIComponent(`Enquiry: ${title}`.slice(0, 120))}`} className={`${btn} border border-ink/20 hover:border-brand hover:text-brand`}>Email</a>}
        </div>
      </>
    );

  return (
    <section id="contact" aria-labelledby="contact-title" className="glass rounded-2xl p-5 shadow-lg">
      <h2 id="contact-title" className="mb-3 font-sans text-lg font-bold">Contact owner</h2>
      {body}
    </section>
  );
}
