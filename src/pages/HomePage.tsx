import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { CategoryCards } from '../components/home/CategoryCards';
import { CitiesSection } from '../components/home/CitiesSection';
import { FeaturedProperties } from '../components/home/FeaturedProperties';
import { FinalCta } from '../components/home/FinalCta';
import { Hero } from '../components/home/Hero';
import { HowItWorks } from '../components/home/HowItWorks';
import { Testimonials } from '../components/home/Testimonials';
import { TrustSection } from '../components/home/TrustSection';
import { useFilters } from '../context/FilterContext';
import { useProperties } from '../context/PropertiesContext';
import { scrollToSection } from '../lib/scroll';
import { useDocumentMeta } from '../lib/seo';
import { filterProperties } from '../utils/filterProperties';

export default function HomePage() {
  const { properties, loading, error, usingSamples } = useProperties();
  const { filters } = useFilters();
  const location = useLocation();
  useDocumentMeta('Hearth & Key | Buy, Rent & Post Properties in India', 'Search apartments, villas, plots and commercial spaces for sale and rent across India. Filter by budget and BHK, plan your EMI, and contact owners directly.');

  const results = useMemo(() => filterProperties(properties, filters), [properties, filters]);

  // Links from other pages ("How it works" in the footer, for example) arrive with a section to scroll to.
  useEffect(() => {
    const id = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!id) return;
    const t = setTimeout(() => scrollToSection(id), 650);
    return () => clearTimeout(t);
  }, [location.state]);

  return (
    <>
      <Hero properties={properties} resultCount={results.length} onSearch={() => scrollToSection('properties')} />
      <FeaturedProperties all={properties} results={results} loading={loading} error={error} usingSamples={usingSamples} />
      <CategoryCards properties={properties} />
      <CitiesSection properties={properties} />
      <TrustSection properties={properties} />
      <HowItWorks />
      <Testimonials />
      <FinalCta />
    </>
  );
}
