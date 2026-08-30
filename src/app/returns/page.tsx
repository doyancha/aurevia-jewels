import { Metadata } from 'next';
import type { ElementType, ReactNode } from 'react';
import { BadgeCheck, RotateCcw, ShieldAlert, Truck } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Returns & Exchange | Aurevia Jewels',
  description:
    'Exchange, damaged-item, refund, and consumer-rights guidance for Aurevia Jewels demo storefront orders.',
};

function PolicyCard({
  icon: Icon,
  title,
  children,
}: {
  icon: ElementType;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-champagne/15 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-champagne-dark">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-serif text-gray-900 mb-2">{title}</h2>
          <div className="space-y-2 text-gray-600 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function ReturnsPage() {
  return (
    <main className="min-h-screen py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Returns & Exchange', href: '/returns' },
          ]}
          className="mb-8"
        />

        <div className="mb-10 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-champagne-dark font-medium mb-4">
            Exchange & defect policy
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 mb-5">
            Returns & Exchange
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Aurevia Jewels supports a restrained exchange policy for unused items and a customer-friendly process for wrong or damaged products. Please confirm the order details carefully on WhatsApp before finalizing your purchase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <PolicyCard icon={RotateCcw} title="Voluntary exchange window">
            <p>{siteConfig.returns.exchangeSummary}</p>
            <p>
              {`Requests should be made within ${siteConfig.returns.exchangeWindow}.`}
            </p>
            <p>Customer is responsible for applicable return and re-delivery courier charges for a voluntary change-of-mind exchange.</p>
          </PolicyCard>

          <PolicyCard icon={ShieldAlert} title="Eligibility and exclusions">
            <p>Eligible items should be unused, unworn, in original condition, and returned with packaging and tags intact where applicable.</p>
            <p>Exchange remains subject to product availability, and any price difference for the replacement item must be settled before dispatch.</p>
            <p>Non-exchangeable change-of-mind items include worn jewelry, pierced earrings once worn or opened for use, customized items, personalized items, altered items, and made-to-order pieces produced specifically for the customer.</p>
          </PolicyCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <PolicyCard icon={Truck} title="Wrong or damaged items">
            <p>{siteConfig.returns.damagedOrWrongItems}</p>
            <p>{siteConfig.returns.sellerResponsibility}</p>
          </PolicyCard>

          <PolicyCard icon={BadgeCheck} title="Refunds and consumer rights">
            <p>{siteConfig.returns.refundPolicy}</p>
            <p>{siteConfig.returns.consumerRights}</p>
          </PolicyCard>
        </div>

        <div className="rounded-3xl border border-soft-gray/30 bg-gradient-to-br from-white to-cream/50 p-8 sm:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4">
                Need help with an order?
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Please message us with your product code, parcel condition, and a few clear photos if you believe a wrong, damaged, or defective item was received. Supporting evidence helps us review the case quickly, but it is not intended to be an unreasonable barrier to support.
              </p>
            </div>

            <div className="flex-shrink-0">
              <WhatsAppButton className="w-full lg:w-auto" ariaLabel="Open WhatsApp returns inquiry demo">
                Contact Support on WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}