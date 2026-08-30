import { Metadata } from 'next';
import { Mail, MapPin, MessageCircle, Phone, Clock, BadgeInfo } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact Us | Aurevia Jewels',
  description:
    'Contact Aurevia Jewels for WhatsApp order enquiries, demo storefront assistance, and business information placeholders.',
};

export default function ContactPage() {
  const socialProfiles = siteConfig.socialProfiles;

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
            Demo storefront
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600">
            Aurevia Jewels is currently configured as a presentation storefront. Contact details below are demo values and will be replaced with real business channels when available.
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
                    Order on WhatsApp
                  </WhatsAppButton>
                  <p className="mt-4 text-sm text-gray-500">
                    Demo storefront - connect a real WhatsApp Business number to enable direct ordering.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Business Details</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Phone</h3>
                    <p className="text-gray-600">{siteConfig.contact.phone}</p>
                    <p className="text-xs text-gray-500 mt-1">Demo contact - not a live telephone channel.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">{siteConfig.contact.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Demo email placeholder - not monitored as a live inbox.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Location</h3>
                    <p className="text-gray-600">{siteConfig.contact.address} - Demo location</p>
                    <p className="text-xs text-gray-500 mt-1">Shown for presentation only. No pickup service is implied.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Service Hours</h3>
                    <p className="text-gray-600">{siteConfig.contact.serviceHours}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-serif text-gray-900 mb-4">Social Profiles</h2>
              <div className="flex flex-wrap gap-3">
                {socialProfiles.map((profile) => (
                  <span
                    key={profile.label}
                    className="inline-flex items-center gap-2 rounded-full border border-champagne/20 bg-white px-4 py-2 text-sm text-gray-600"
                  >
                    {profile.label}
                    <span className="text-[10px] uppercase tracking-[0.2em] text-champagne-dark">Demo</span>
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection
            delay={0.2}
            className="h-full min-h-[420px] rounded-3xl border border-soft-gray/30 bg-gradient-to-br from-cream/80 via-white to-warm-beige/30 p-8 flex items-center justify-center"
          >
            <div className="max-w-md text-center">
              <BadgeInfo className="w-12 h-12 text-champagne-dark mx-auto mb-4" />
              <h3 className="text-2xl font-serif text-gray-900 mb-4">Demo storefront notice</h3>
              <p className="text-gray-600 leading-relaxed">
                Aurevia Jewels is currently presented as a demonstration storefront. The policies, contact points, and social profiles shown here are intentionally non-live until the business owner provides final production details.
              </p>
              <div className="mt-8 rounded-2xl border border-champagne/20 bg-white/90 p-5 text-left">
                <p className="text-sm font-medium text-gray-900 mb-2">What happens next?</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Browse a product</li>
                  <li>Review details and price</li>
                  <li>Open the WhatsApp demo preview</li>
                  <li>Replace demo contacts when business details are ready</li>
                </ul>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </main>
  );
}