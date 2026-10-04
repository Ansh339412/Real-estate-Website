import { Link, useParams } from 'react-router-dom';
import { ErrorView } from '../components/errors/ErrorView';
import { useDocumentMeta } from '../lib/seo';

const DOCS: Record<string, { title: string; sections: [string, string][] }> = {
  privacy: { title: 'Privacy policy', sections: [
    ['What we collect', 'Account details you provide (name, phone, email), the properties you post with their photos, the homes you save, and short technical error reports that never include passwords or tokens.'],
    ['Who can see it', "A listing owner's name, phone and email are shown to signed-in visitors on that owner's listings so buyers and tenants can get in touch. Nobody can browse other people's profiles."],
    ['How it is protected', 'Data is stored with Supabase using row-level security, so people can only change what belongs to them. Forms are validated and error pages never reveal technical details.'],
    ['Your choices', 'You can edit your profile, remove your listings and photos, and sign out at any time. Contact us to delete your account.'],
  ] },
  terms: { title: 'Terms of use', sections: [
    ['Using the site', 'Post only properties you own or are authorised to advertise, with accurate prices, areas and photos.'],
    ['No advance payments', 'Visit the property and verify ownership documents before paying anything. Hearth & Key does not handle payments between users.'],
    ['Content you post', 'You keep ownership of your listing and photos and allow the site to display them. Misleading, unlawful or abusive content may be removed.'],
    ['Liability', 'Listings are provided by owners. Check details independently before making decisions.'],
  ] },
  cookies: { title: 'Cookie policy', sections: [
    ['What is stored', 'The site stores a sign-in session so you stay logged in, and a few small preferences in your browser. It does not use advertising cookies.'],
    ['Your control', 'Clearing your browser storage signs you out and resets those preferences.'],
  ] },
  grievance: { title: 'Grievance redressal', sections: [
    ['Raise a concern', 'If a listing looks wrong, misleading or unlawful, tell us through the advisor form and include the listing link.'],
    ['What happens next', 'We review reported listings and can remove content that breaks the terms. Replace this section with your named grievance officer and response times before launch.'],
  ] },
};

export default function LegalPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const doc = DOCS[slug];
  useDocumentMeta(doc ? `${doc.title} | Hearth & Key` : 'Hearth & Key');
  if (!doc) return <ErrorView code={404} />;
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold">{doc.title}</h1>
      <p className="glass-ivory mt-4 rounded-2xl p-4 text-sm text-ink/80"><strong>Template text.</strong> This is plain-language starter copy for the project. Have it reviewed and replaced with your own legal text before you launch.</p>
      {doc.sections.map(([h, p]) => (<section key={h} className="mt-8"><h2 className="text-2xl font-bold">{h}</h2><p className="mt-2 leading-relaxed text-ink/80">{p}</p></section>))}
      <p className="mt-10 text-sm"><Link to="/contact" className="font-semibold text-brand underline">Questions? Talk to us</Link></p>
    </article>
  );
}
