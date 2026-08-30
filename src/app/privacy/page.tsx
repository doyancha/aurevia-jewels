import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy | Aurevia Jewels',
  description:
    'Privacy guidance for the Aurevia Jewels demo storefront, including WhatsApp enquiries, hosting, and third-party services.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Privacy Policy', href: '/privacy' },
          ]}
          className="mb-8"
        />

        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-4">
            Aurevia Jewels is currently presented as a demonstration storefront. The site displays products online and routes order enquiries through WhatsApp when enabled, but it has no customer accounts, no on-site checkout, and no internal order database in this version.
          </p>
          <p className="text-gray-600 mb-4">
            If you contact us through WhatsApp or the listed demo contact details, we may use the information you share to respond to your enquiry and continue the conversation. Depending on your browser and the hosting environment, standard technical information such as IP address, device type, and page access data may be processed by the site host.
          </p>
          <p className="text-gray-600 mb-4">
            External image hosts and third-party services may receive basic request data when you load a page or open outbound links. If the business later adds forms, newsletters, analytics, or other services, this policy should be updated to match that setup.
          </p>
          <p className="text-gray-600">
            Contact details shown in demo mode are placeholders only and are not live business channels. Demo notice: {siteConfig.demoNotice}
          </p>
        </div>
      </div>
    </main>
  );
}