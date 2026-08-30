import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Aurevia Jewels',
  description:
    'Terms for browsing Aurevia Jewels, sending WhatsApp enquiries, and confirming delivery or exchange details before an order is finalized.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Terms & Conditions', href: '/terms' },
          ]}
          className="mb-8"
        />

        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-8">Terms & Conditions</h1>

        <div className="prose prose-gray max-w-none space-y-4 text-gray-600">
          <p>
            Aurevia Jewels is an online catalog and demo storefront. Visitors may review products on the website and continue the order conversation through WhatsApp. This version does not include an on-site cart, checkout, payment gateway, or customer account system.
          </p>
          <p>
            A WhatsApp message is an order enquiry, not an automatic purchase confirmation. An order is confirmed only after Aurevia Jewels confirms product availability, product details, delivery destination, delivery charge, payment method, any required advance, and the estimated delivery window.
          </p>
          <p>
            Delivery policy, cash on delivery, selected-order advance payment, and exchange or defect handling follow the centrally published policy information on the website and may be clarified during the WhatsApp conversation before the order is finalized.
          </p>
          <p>
            Product descriptions are provided for browsing and selection. Customers should review the product code, price, material, finish, and any available dimensions before confirming the order.
          </p>
          <p>
            Nothing in these terms is intended to limit any rights available to customers under applicable consumer protection law. {siteConfig.demoNotice}
          </p>
        </div>
      </div>
    </main>
  );
}