import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FAQAccordion } from '@/components/ui/FAQAccordion';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { faqs } from '@/data/faq';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Aurevia Jewels',
  description: 'Find answers to common questions about our jewelry, ordering process, shipping, and more.',
};

export default function FAQPage() {
  return (
    <main className="min-h-screen py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'FAQ', href: '/faq' },
          ]}
          className="mb-8"
        />

        <SectionHeading
          as="h1"
          title="Frequently Asked Questions"
          subtitle="Find answers to common questions about our jewelry, ordering process, and more."
          centered
          className="mb-12"
        />

        <div className="max-w-3xl mx-auto mb-16">
          <AnimatedSection delay={0.1}>
            <FAQAccordion items={faqs} />
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.2} className="max-w-2xl mx-auto text-center bg-gray-50 rounded-3xl p-10 border border-gray-100">
           <h3 className="text-2xl font-serif text-gray-900 mb-4">Still have questions?</h3>
           <p className="text-gray-600 mb-8">
             If you couldn&apos;t find the answer you were looking for, our team is ready to help you directly.
           </p>
           <WhatsAppButton text="Chat with us on WhatsApp" />
        </AnimatedSection>
      </div>
    </main>
  );
}