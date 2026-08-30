import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Gem, MessageCircle, Truck, Sparkles } from 'lucide-react';

export function Testimonials() {
  const reasons = [
    {
      icon: <Gem className="w-7 h-7 text-champagne" />,
      title: 'Curated collections',
      description: 'Each assortment is presented to feel cohesive, polished, and easy to browse.',
    },
    {
      icon: <Sparkles className="w-7 h-7 text-champagne" />,
      title: 'Occasion-ready style',
      description: 'Pieces are grouped to help customers find looks for everyday wear or special moments.',
    },
    {
      icon: <MessageCircle className="w-7 h-7 text-champagne" />,
      title: 'WhatsApp-assisted ordering',
      description: 'The storefront keeps the enquiry flow simple and transparent through WhatsApp preview messaging.',
    },
    {
      icon: <Truck className="w-7 h-7 text-champagne" />,
      title: 'Nationwide delivery concept',
      description: 'Support pages explain the delivery and exchange flow clearly for customers browsing the demo.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-cream/30">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedSection>
          <SectionHeading
            title="Why Aurevia"
            subtitle="A polished demo storefront centered on curated jewelry, elegant presentation, and simple WhatsApp-assisted enquiries."
          />
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 mt-12 md:mt-16">
          {reasons.map((reason, index) => (
            <AnimatedSection key={reason.title} delay={0.1 * index}>
              <div className="h-full rounded-2xl border border-champagne/15 bg-white p-6 shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream">
                  {reason.icon}
                </div>
                <h3 className="mt-5 font-serif text-xl text-charcoal">{reason.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                  {reason.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
