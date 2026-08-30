import { Metadata } from 'next';
import { ArrowUpRight, BadgeInfo, MessageCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact Us | Aurevia Jewels',
  description:
    'Contact Aurevia Jewels for WhatsApp order enquiries and demonstration storefront guidance.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Contact', href: '/contact' },
          ]}
          className="mb-8"
        />

        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.22em] text-champagne-dark font-medium mb-4">
            Contact
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600">
            Aurevia Jewels is currently presented as a demonstration storefront. Contact channels are not yet active, so the page focuses on the safe WhatsApp preview and general guidance.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-16">
          <AnimatedSection delay={0.1} className="space-y-10">
            <div className="rounded-3xl border border-champagne/15 bg-cream/50 p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-ivory">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-serif text-gray-900 mb-3">WhatsApp</h2>
                  <p className="text-gray-600 mb-5">
                    Order and availability inquiries are demonstrated through the WhatsApp preview.
                  </p>
                  <WhatsAppButton variant="secondary" className="w-full sm:w-auto">
                    Open WhatsApp Preview
                  </WhatsAppButton>
                  <p className="mt-4 text-sm text-gray-500">
                    The preview shows the product enquiry message that would be sent once a live number is connected.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Contact channels</h2>
              <div className="rounded-3xl border border-soft-gray/20 bg-white p-8 shadow-sm">
                <p className="text-gray-600 leading-relaxed">
                  Official contact details are not active yet. When the storefront goes live, this area can be updated with production channels instead of draft copy.
                </p>
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-champagne-dark font-medium mb-3">Social navigation</p>
                  <div className="flex flex-wrap gap-3">
                    {siteConfig.socialProfiles.map((profile) => (
                      <a
                        key={profile.label}
                        href={profile.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-champagne/20 bg-cream/30 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-champagne hover:text-gray-900"
                      >
                        {profile.label}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection
            delay={0.2}
            className="h-full min-h-[420px] rounded-3xl border border-soft-gray/30 bg-gradient-to-br from-cream/80 via-white to-warm-beige/30 p-8 flex items-center justify-center"
          >
            <div className="max-w-md text-center">
              <BadgeInfo className="w-12 h-12 text-champagne-dark mx-auto mb-4" />
              <h3 className="text-2xl font-serif text-gray-900 mb-4">Storefront notice</h3>
              <p className="text-gray-600 leading-relaxed">
                {siteConfig.demoNotice}
              </p>
              <div className="mt-8 rounded-2xl border border-champagne/20 bg-white/90 p-5 text-left">
                <p className="text-sm font-medium text-gray-900 mb-2">What happens next?</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Browse a product</li>
                  <li>Review details and price</li>
                  <li>Open the WhatsApp preview</li>
                  <li>Update the page with live business details when ready</li>
                </ul>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </main>
  );
}
