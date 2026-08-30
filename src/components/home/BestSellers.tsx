import { getBestSellers } from '@/data/products';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function BestSellers() {
  const products = getBestSellers();

  return (
    <section className="py-16 md:py-24 bg-cream/30">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedSection>
          <SectionHeading
            title="Best Sellers"
            subtitle="Loved by our customers"
          />
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="mt-10 md:mt-14">
          <ProductGrid products={products.slice(0, 8)} columns={4} />
        </AnimatedSection>
      </div>
    </section>
  );
}