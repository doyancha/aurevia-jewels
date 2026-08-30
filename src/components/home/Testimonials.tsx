import { testimonials } from '@/data/testimonials';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-cream/30">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedSection>
          <SectionHeading
            title="Customer Feedback"
            subtitle="Demo testimonial slots for future verified customer quotes"
          />
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={testimonial.id} delay={0.1 * index}>
              <TestimonialCard testimonial={testimonial} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}