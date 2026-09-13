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
import { getCollections, getProducts } from '@/lib/catalog-api';

export const metadata: Metadata = {
  alternates: {
    canonical: siteConfig.url,
  },
};

export default async function Home() {
  const [collections, featured, newArrivals, bestSellers] = await Promise.all([
    getCollections(), getProducts({ featured: true }), getProducts({ new_arrival: true }), getProducts({ best_seller: true }),
  ]);
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
      <CollectionCategories collections={collections} />
      <FeaturedProducts catalog={featured} />
      <BridalBanner />
      <NewArrivals catalog={newArrivals} />
      <BestSellers catalog={bestSellers} />
      <OccasionSection />
      <WhyChooseUs />
      <Testimonials />
    </main>
  );
}
