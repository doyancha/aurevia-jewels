import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { CollectionCategories } from '@/components/home/CollectionCategories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BridalBanner } from '@/components/home/BridalBanner';
import { NewArrivals } from '@/components/home/NewArrivals';
import { BestSellers } from '@/components/home/BestSellers';
import { OccasionSection } from '@/components/home/OccasionSection';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { Testimonials } from '@/components/home/Testimonials';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "description": "Elegant jewelry & ornaments"
  };

  return (
    <main className="flex flex-col min-h-screen">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero />
      <CollectionCategories />
      <FeaturedProducts />
      <BridalBanner />
      <NewArrivals />
      <BestSellers />
      <OccasionSection />
      <WhyChooseUs />
      <Testimonials />
    </main>
  );
}
