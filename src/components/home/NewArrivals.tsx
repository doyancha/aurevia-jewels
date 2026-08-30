'use client';

import { useRef } from 'react';
import { getNewArrivals } from '@/data/products';
import { ProductCard } from '@/components/ui/ProductCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function NewArrivals() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const products = getNewArrivals();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14">
            <SectionHeading
              title="New Arrivals"
              subtitle="The latest additions to our collection"
              className="mb-0"
            />
            <div className="hidden md:flex items-center gap-2 mt-4 md:mt-0">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-charcoal hover:bg-gray-50 hover:border-gray-300 transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-charcoal hover:bg-gray-50 hover:border-gray-300 transition-all"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          {/* Mobile: horizontal scroll, Desktop: grid or flex with hidden scrollbar */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 md:gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.slice(0, 4).map((product) => (
              <div key={product.id} className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}