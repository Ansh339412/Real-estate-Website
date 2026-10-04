import { Link, useParams } from 'react-router-dom';
import { ErrorView } from '../components/errors/ErrorView';
import { useDocumentMeta } from '../lib/seo';

type LegalSection = {
  heading: string;
  content: string[];
};

const DOCS: Record<string, { title: string; lastUpdated: string; intro?: string; sections: LegalSection[] }> = {
  privacy: {
    title: 'Privacy policy',
    lastUpdated: '4 October 2026',
    intro:
      'Hearth and Key ("Hearth and Key", "we", "us", or "our") respects your privacy and is committed to protecting the personal information you provide while using our website.',
    sections: [
      {
        heading: '1. Information We Collect',
        content: [
          'Depending on how you use Hearth and Key, we may collect information including:\n• Name\n• Email address\n• Phone number, where provided\n• Account and authentication information\n• Property search preferences\n• Property listing information submitted by users\n• Enquiry information\n• Messages and communications submitted through the website\n• Feedback submitted by users\n• IP address and basic technical information\n• Browser and device information\n• Website usage information\n• Information collected through cookies or similar technologies',
          'We only request information that is reasonably necessary for providing and improving our services.',
        ],
      },
      {
        heading: '2. How We Use Your Information',
        content: [
          'We may use your information to:\n• Create and manage user accounts\n• Authenticate users\n• Provide property search and listing functionality\n• Respond to property enquiries\n• Respond to support requests\n• Send account-related and service-related emails\n• Process password-reset and authentication emails\n• Communicate important information about the website\n• Improve website functionality and user experience\n• Maintain website security\n• Detect and prevent fraudulent or abusive activity\n• Maintain and troubleshoot our services\n• Comply with applicable legal obligations',
          'We may also use your email address for promotional communications where you have appropriately opted in. You may unsubscribe from promotional communications where an unsubscribe mechanism is provided.',
        ],
      },
      {
        heading: '3. Supabase',
        content: [
          'Hearth and Key uses Supabase for certain backend functions, which may include authentication, database storage, and related application infrastructure.',
          'Information submitted through Hearth and Key may therefore be processed or stored using Supabase infrastructure.',
          'Supabase provides security and data-processing controls for applications using its services. Supabase\'s current documentation states that, under its DPA, it may act as a processor/service provider for customer data.',
          'For more information, users may review Supabase\'s privacy documentation.',
        ],
      },
      {
        heading: '4. Brevo',
        content: [
          'Hearth and Key uses Brevo for email-related services, including transactional or service-related email communications where applicable.',
          'This may include emails such as:\n• Account verification\n• Password recovery\n• Website notifications\n• Contact/enquiry communications\n• Other service-related communications',
          'Where email information is processed through Brevo, it may be processed in accordance with Brevo\'s applicable privacy and data-processing terms.',
          'Brevo provides mechanisms for consent management and data-processing arrangements for customers using its email services.',
        ],
      },
      {
        heading: '5. Sharing of Information',
        content: [
          'We may share personal information with service providers that help us operate Hearth and Key, including infrastructure, authentication, database, email, security, and hosting providers.',
          'We may also disclose information:\n• When required by law\n• In response to valid legal requests\n• To protect the security of Hearth and Key\n• To prevent fraud or abuse\n• To protect the rights and safety of users or others\n• With your consent or at your direction',
          'We do not intend to sell your personal information as a standalone commercial product.',
        ],
      },
      {
        heading: '6. Property Listings',
        content: [
          'Property information submitted by users may be displayed publicly on Hearth and Key depending on the functionality of the website.',
          'Users should not submit personal information, documents, photographs, or property information that they do not have permission to publish.',
          'Hearth and Key does not guarantee that every user-submitted property listing is accurate, complete, current, or independently verified.',
        ],
      },
      {
        heading: '7. Data Security',
        content: [
          'We take reasonable technical and organizational measures to protect personal information against unauthorized access, alteration, disclosure, loss, or misuse.',
          'However, no internet-based system can guarantee absolute security.',
          'Users are responsible for maintaining the confidentiality of their account credentials and should notify us if they believe their account has been compromised.',
        ],
      },
      {
        heading: '8. Data Retention',
        content: [
          'We retain personal information for as long as reasonably necessary to:\n• Provide our services\n• Maintain accounts\n• Respond to enquiries\n• Maintain security\n• Resolve disputes\n• Comply with legal obligations\n• Maintain appropriate business records',
          'When information is no longer reasonably required, we may delete or anonymize it, subject to applicable legal or operational requirements.',
        ],
      },
      {
        heading: '9. Your Privacy Requests',
        content: [
          'You may contact us regarding your personal information, including requests to:\n• Correct inaccurate information\n• Update your information\n• Request deletion where applicable\n• Ask questions about how your information is used\n• Raise a privacy-related concern',
          'Requests can be submitted to:\nEmail: hakikatsingh099@gmail.com',
          'We may need to verify your identity before processing certain requests.',
        ],
      },
      {
        heading: '10. Third-Party Websites',
        content: [
          'Hearth and Key may contain links to third-party websites or services.',
          'We are not responsible for the privacy practices, content, security, or policies of third-party websites.',
          'Users should review the privacy policies of those websites before providing personal information.',
        ],
      },
      {
        heading: '11. Children\'s Privacy',
        content: [
          'Hearth and Key is not intentionally designed to collect personal information from children.',
          'If we become aware that personal information has been collected from a child in circumstances where such collection is not permitted, we may take reasonable steps to delete it.',
        ],
      },
      {
        heading: '12. Changes to This Privacy Policy',
        content: [
          'We may update this Privacy Policy from time to time.',
          'Any updated version will be published on this page with a revised "Last Updated" date.',
        ],
      },
      {
        heading: '13. Contact Us',
        content: [
          'For privacy questions, requests, or concerns:\nHearth and Key\nOwner: Anshpreet Singh\nEmail: hakikatsingh099@gmail.com\nWebsite: https://ansh339412.github.io/Real-estate-Website/',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    lastUpdated: '4 October 2026',
    intro:
      'Welcome to Hearth and Key. These Terms of Use govern your access to and use of the Hearth and Key website at https://ansh339412.github.io/Real-estate-Website/. By accessing or using the website, you agree to comply with these Terms of Use. If you do not agree with these terms, please discontinue use of the website.',
    sections: [
      {
        heading: '1. About Hearth and Key',
        content: [
          'Hearth and Key is an online real-estate platform designed to help users discover, browse, and enquire about properties.',
          'Unless explicitly stated otherwise, Hearth and Key does not represent that it owns every property displayed on the website.',
          'Property information may be provided by property owners, agents, developers, or other users.',
        ],
      },
      {
        heading: '2. Property Information',
        content: [
          'Property information displayed on Hearth and Key may include:\n• Property prices\n• Property descriptions\n• Images\n• Locations\n• Property sizes\n• Amenities\n• Availability information\n• Contact information\n• Other property-related details',
          'Such information may be supplied by third parties and may change without notice.',
          'Although we may attempt to maintain useful and accurate information, Hearth and Key does not guarantee that every listing is accurate, complete, current, authentic, or independently verified.',
        ],
      },
      {
        heading: '3. Independent Verification',
        content: [
          'Users should independently verify important property information before making any financial, contractual, legal, rental, purchase, or investment decision.',
          'This may include verifying:\n• Property ownership\n• Title documents\n• Legal permissions\n• Property measurements\n• Property availability\n• Pricing\n• Taxes and charges\n• RERA or other applicable registration\n• Seller/agent identity\n• Agreements and contractual terms',
          'Hearth and Key should not be considered a substitute for professional legal, financial, property, or regulatory advice.',
        ],
      },
      {
        heading: '4. User Accounts',
        content: [
          'If account functionality is available, users are responsible for:\n• Providing accurate information\n• Maintaining account security\n• Protecting their password\n• Not sharing their login credentials\n• Informing Hearth and Key about suspected unauthorized access',
          'Users must not create accounts using false or misleading information.',
        ],
      },
      {
        heading: '5. User-Submitted Listings',
        content: [
          'Users submitting property listings represent that:\n• The information submitted is accurate to the best of their knowledge\n• They have the necessary rights or authority to submit the listing\n• Uploaded photographs and materials may legally be used\n• The listing does not intentionally mislead other users',
          'Hearth and Key may remove, restrict, or modify listings that appear to violate these Terms or applicable law.',
        ],
      },
      {
        heading: '6. Prohibited Activities',
        content: [
          'Users must not:\n• Submit fraudulent property listings\n• Publish knowingly false information\n• Impersonate another individual or organization\n• Upload malicious software\n• Attempt unauthorized access to the website\n• Interfere with website security\n• Scrape or systematically copy website content without permission\n• Use the website for spam\n• Harass other users\n• Use the website for unlawful purposes\n• Upload content that infringes another person\'s intellectual property or privacy rights',
        ],
      },
      {
        heading: '7. Intellectual Property',
        content: [
          'Unless otherwise stated, the Hearth and Key name, branding, logo, website design, original text, graphics, software, and other original materials are owned by or licensed to Hearth and Key.',
          'You may not reproduce, modify, distribute, commercially exploit, or republish our protected materials without appropriate permission.',
        ],
      },
      {
        heading: '8. Third-Party Services',
        content: [
          'Hearth and Key may rely on third-party services, including hosting, authentication, database, email, security, analytics, or other technology providers.',
          'Third-party services may have their own terms and privacy policies.',
        ],
      },
      {
        heading: '9. No Guarantee of Transactions',
        content: [
          'Hearth and Key does not guarantee that:\n• A property will remain available\n• A property will be sold or rented\n• A displayed price will remain unchanged\n• A property owner or agent will respond\n• A user or advertiser is genuine\n• A transaction between users will be completed',
          'Users are responsible for conducting appropriate due diligence.',
        ],
      },
      {
        heading: '10. Disclaimer',
        content: [
          'The website is provided on an "as available" basis.',
          'We do not guarantee that the website will always be uninterrupted, error-free, secure, or available.',
        ],
      },
      {
        heading: '11. Limitation of Liability',
        content: [
          'To the extent permitted by applicable law, Hearth and Key and its owner shall not be responsible for losses arising from:\n• User-to-user transactions\n• Incorrect third-party property information\n• Fraud committed by independent users\n• Property disputes\n• Changes in property availability\n• Third-party service interruptions\n• Unauthorized actions by users',
          'Nothing in these Terms is intended to exclude liability that cannot legally be excluded.',
        ],
      },
      {
        heading: '12. Suspension or Termination',
        content: [
          'Hearth and Key may suspend or terminate access to accounts, listings, or website features where reasonably necessary because of:\n• Violation of these Terms\n• Fraudulent activity\n• Abuse of the platform\n• Security concerns\n• Illegal activity\n• Requests from competent authorities',
        ],
      },
      {
        heading: '13. Changes to These Terms',
        content: [
          'We may modify these Terms of Use from time to time.',
          'The updated version will be published on this page with a revised "Last Updated" date.',
        ],
      },
      {
        heading: '14. Contact',
        content: [
          'Hearth and Key\nOwner: Anshpreet Singh\nEmail: hakikatsingh099@gmail.com\nWebsite: https://ansh339412.github.io/Real-estate-Website/',
        ],
      },
    ],
  },
  cookies: {
    title: 'Cookie policy',
    lastUpdated: '4 October 2026',
    intro:
      'This Cookie Policy explains how Hearth and Key uses cookies and similar technologies on https://ansh339412.github.io/Real-estate-Website/.',
    sections: [
      {
        heading: '1. What Are Cookies?',
        content: [
          'Cookies are small files or similar technologies that may be stored on your device when you visit a website.',
          'They can help websites remember information, maintain sessions, improve functionality, and understand how users interact with a website.',
        ],
      },
      {
        heading: '2. How Hearth and Key May Use Cookies',
        content: [
          'Cookies or similar technologies may be used for:\nEssential Functionality\n• User authentication\n• Maintaining login sessions\n• Account security\n• Website functionality\n• Preventing abuse',
          'Preference Cookies\nThese may remember user-selected settings or preferences.',
          'Analytics\nIf analytics services are enabled on Hearth and Key, cookies or similar technologies may be used to understand:\n• Website traffic\n• Popular pages\n• User interactions\n• Website performance\n• General usage patterns',
          'Email and Communication Technologies\nEmail services such as Brevo may use technologies associated with email delivery and communication. The use of such technologies may depend on how our email services are configured.',
        ],
      },
      {
        heading: '3. Supabase Technologies',
        content: [
          'Hearth and Key uses Supabase for backend functionality such as authentication and database services.',
          'Some authentication or session-related information may be stored or processed as part of providing these services.',
          'Supabase\'s documentation describes security controls and configuration options for protecting application data.',
        ],
      },
      {
        heading: '4. Brevo Technologies',
        content: [
          'Hearth and Key uses Brevo for email communications.',
          'Depending on the configuration of our Brevo services, email-related technologies may be used to support delivery, communication management, or measurement.',
          'Brevo provides tools for managing subscriber consent and email preferences.',
        ],
      },
      {
        heading: '5. Managing Cookies',
        content: [
          'You may be able to control or delete cookies through your browser settings.',
          'Please note that disabling essential cookies may affect website functionality, including login or other account-related features.',
          'Where applicable, Hearth and Key may provide additional controls for managing non-essential cookies.',
        ],
      },
      {
        heading: '6. Third-Party Technologies',
        content: [
          'Third-party services integrated into Hearth and Key may use their own technologies subject to their respective privacy policies.',
          'These services may include infrastructure, authentication, email, analytics, maps, security, or other technology providers.',
        ],
      },
      {
        heading: '7. Changes to This Policy',
        content: [
          'We may update this Cookie Policy when our technology, services, or legal requirements change.',
          'The latest version will always be published on this page.',
        ],
      },
      {
        heading: '8. Contact',
        content: [
          'For questions about cookies or similar technologies:\nHearth and Key\nOwner: Anshpreet Singh\nEmail: hakikatsingh099@gmail.com',
        ],
      },
    ],
  },
  grievance: {
    title: 'Grievance redressal',
    lastUpdated: '4 October 2026',
    intro:
      'Hearth and Key is committed to providing a safe, transparent, and reliable experience for users of our real-estate platform. If you have a complaint, concern, or grievance regarding our website, property listings, privacy practices, account, communications, or services, you may contact us using the details below.',
    sections: [
      {
        heading: 'Grievance Contact',
        content: [
          'Name: Anshpreet Singh\nDesignation: Owner / Grievance Contact\nOrganization: Hearth and Key\nEmail: hakikatsingh099@gmail.com\nWebsite: https://ansh339412.github.io/Real-estate-Website/',
        ],
      },
      {
        heading: '1. How to Submit a Grievance',
        content: [
          'You may submit a grievance by sending an email to: hakikatsingh099@gmail.com',
          'Please provide, where applicable:\n• Your name\n• Contact information\n• Property/listing URL or reference\n• Description of the issue\n• Date and time of the relevant incident\n• Screenshots or supporting information\n• The resolution you are seeking',
          'Providing sufficient information can help us investigate the matter efficiently.',
        ],
      },
      {
        heading: '2. Types of Complaints',
        content: [
          'You may contact us regarding issues such as:\n• Incorrect or misleading property information\n• Suspicious or potentially fraudulent listings\n• Unauthorized use of your information\n• Privacy concerns\n• Account-related issues\n• Unwanted communications\n• Inappropriate user content\n• Copyright or intellectual-property concerns\n• Security concerns\n• Website functionality\n• Other concerns relating to Hearth and Key',
        ],
      },
      {
        heading: '3. Acknowledgement',
        content: [
          'We will make reasonable efforts to acknowledge complaints and respond within a reasonable period, subject to the nature and complexity of the complaint and any applicable legal requirements.',
        ],
      },
      {
        heading: '4. Investigation',
        content: [
          'Where appropriate, we may:\n• Review the relevant listing\n• Examine account information\n• Review submitted evidence\n• Contact relevant parties\n• Request additional information\n• Restrict or remove content\n• Suspend an account or listing\n• Take other reasonable corrective measures',
        ],
      },
      {
        heading: '5. Fraudulent or Misleading Listings',
        content: [
          'If a property listing is reported as fraudulent, misleading, or unauthorized, Hearth and Key may review the listing and take appropriate action.',
          'Possible actions may include:\n• Temporarily restricting the listing\n• Removing the listing\n• Requesting additional information\n• Suspending the relevant account\n• Referring the matter to an appropriate authority where required',
        ],
      },
      {
        heading: '6. Property and Transaction Disputes',
        content: [
          'Hearth and Key is an online platform and is not necessarily a party to transactions between property owners, buyers, tenants, agents, or other users.',
          'Disputes involving matters such as:\n• Property ownership\n• Title\n• Sale agreements\n• Rental agreements\n• Payments\n• Possession\n• Brokerage\n• Property construction\n• Legal permissions',
          'may need to be resolved between the relevant parties or before an appropriate legal, regulatory, or governmental authority.',
          'Users should obtain appropriate professional advice where necessary.',
        ],
      },
      {
        heading: '7. Privacy Complaints',
        content: [
          'Privacy-related requests or complaints may be submitted to: hakikatsingh099@gmail.com',
          'We may request reasonable information to verify the identity of the person making a privacy request.',
        ],
      },
      {
        heading: '8. Security Reports',
        content: [
          'If you discover a potential security vulnerability or unauthorized access affecting Hearth and Key, please report it promptly to: hakikatsingh099@gmail.com',
          'Please do not intentionally exploit a security vulnerability, access another user\'s account, or obtain information that you are not authorized to access.',
        ],
      },
      {
        heading: '9. False or Malicious Complaints',
        content: [
          'Users should provide truthful and accurate information when submitting grievances.',
          'Knowingly submitting false, fraudulent, or malicious complaints may result in appropriate action.',
        ],
      },
      {
        heading: '10. Policy Updates',
        content: [
          'Hearth and Key may update this Grievance Redressal Policy when necessary to reflect changes to our services, procedures, or applicable requirements.',
        ],
      },
      {
        heading: '11. Contact Details',
        content: [
          'Hearth and Key\nOwner: Anshpreet Singh\nEmail: hakikatsingh099@gmail.com\nWebsite: https://ansh339412.github.io/Real-estate-Website/',
        ],
      },
    ],
  },
};

export default function LegalPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const doc = DOCS[slug];
  useDocumentMeta(doc ? `${doc.title} | Hearth & Key` : 'Hearth & Key');

  if (!doc) return <ErrorView code={404} />;

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">Legal information</p>
        <h1 className="mt-3 text-4xl font-bold">{doc.title}</h1>
        <p className="mt-3 text-sm text-ink/70">Last Updated: {doc.lastUpdated}</p>
        {doc.intro ? <p className="mt-5 leading-relaxed text-ink/80">{doc.intro}</p> : null}
      </header>

      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="text-2xl font-bold">{section.heading}</h2>
          {section.content.map((paragraph, index) => (
            <p key={`${section.heading}-${index}`} className="mt-3 whitespace-pre-line leading-relaxed text-ink/80">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <p className="mt-10 text-sm">
        <Link to="/contact" className="font-semibold text-brand underline">Questions? Talk to us</Link>
      </p>
    </article>
  );
}
