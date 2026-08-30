import { Metadata } from 'next';
import { collections } from '@/data/collections';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CollectionCard } from '@/components/ui/CollectionCard';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export const metadata: Metadata = {
  title: 'Collections | Aurevia Jewels',
  description: 'Explore our curated jewelry collections. Each collection is thoughtfully designed to tell a unique story and complement your personal style.',
};

export default function CollectionsPage() {
  return (
    <main className="min-h-screen py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
          ]}
          className="mb-8"
        />

        <SectionHeading
          as="h1"
          title="Collections"
          subtitle="Discover pieces grouped by inspiration, style, and occasion. Find the perfect aesthetic that resonates with your unique taste."
          centered
          className="mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <AnimatedSection key={collection.slug} delay={index * 0.1}>
              <CollectionCard collection={collection} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </main>
  );
}