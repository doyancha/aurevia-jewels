import { getFeaturedProducts } from '@/data/products';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import Link from 'next/link';

export function FeaturedProducts() {
  const products = getFeaturedProducts();
  const displayProducts = products.slice(0, 8); // Max 8 featured products

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14">
            <SectionHeading
              title="Featured Collection"
              subtitle="Handpicked pieces that define elegance"
              className="mb-0"
            />
            <Link
              href="/shop"
              className="mt-4 md:mt-0 text-sm font-medium uppercase tracking-wider text-charcoal/70 hover:text-charcoal transition-colors border-b border-transparent hover:border-charcoal pb-0.5 inline-block"
            >
              View All
            </Link>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <ProductGrid products={displayProducts} columns={4} />
        </AnimatedSection>
      </div>
    </section>
  );
}