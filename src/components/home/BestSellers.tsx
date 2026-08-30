import Link from 'next/link';
import { getBestSellers } from '@/data/products';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function BestSellers() {
  const products = getBestSellers().slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-cream/30">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <SectionHeading
              title="Best Sellers"
              subtitle="A balanced selection of the most featured pieces on the homepage."
              className="mb-0"
            />
            <Link
              href="/shop"
              className="inline-flex items-center text-sm font-medium uppercase tracking-wider text-charcoal/70 hover:text-charcoal transition-colors border-b border-transparent hover:border-charcoal pb-0.5 w-fit"
            >
              View All
            </Link>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="mt-10 md:mt-14">
          <ProductGrid products={products} columns={4} />
        </AnimatedSection>
      </div>
    </section>
  );
}
