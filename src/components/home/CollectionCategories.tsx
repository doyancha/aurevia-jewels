import { collections } from '@/data/collections';
import { CollectionCard } from '@/components/ui/CollectionCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function CollectionCategories() {
  return (
    <section className="py-16 md:py-24 bg-cream/30">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedSection>
          <SectionHeading title="Browse Collections" />
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="mt-10 md:mt-14">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {collections.slice(0, 4).map((collection) => (
              <CollectionCard key={collection.slug} collection={collection} />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}