import { Metadata } from 'next';
import type { ElementType, ReactNode } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { siteConfig } from '@/config/site';
import { formatPrice } from '@/lib/utils';
import { BadgeCheck, Clock3, Home, ShieldCheck, Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Delivery Information | Aurevia Jewels',
  description:
    'Nationwide Bangladesh delivery details, estimated timing, charges, cash on delivery, and advance-payment guidance for Aurevia Jewels.',
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

export default function DeliveryPage() {
  return (
    <main className="min-h-screen py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Delivery Information', href: '/delivery' },
          ]}
          className="mb-8"
        />

        <div className="mb-10 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-champagne-dark font-medium mb-4">
            Bangladesh delivery
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 mb-5">
            Delivery Information
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Aurevia Jewels delivers nationwide across Bangladesh. Delivery is arranged after the order is confirmed through WhatsApp, and the final charge, timing, and payment details are reconfirmed before dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-3xl bg-charcoal text-ivory p-8 shadow-sm">
            <div className="flex items-center gap-3 text-champagne">
              <Home className="h-5 w-5" />
              <p className="text-xs uppercase tracking-[0.22em]">Coverage</p>
            </div>
            <p className="mt-4 text-2xl font-serif">{siteConfig.delivery.coverage}</p>
            <p className="mt-4 text-ivory/75 leading-relaxed">
              Delivery starts only after order confirmation. A WhatsApp enquiry is not a confirmed order.
            </p>
          </div>

          <div className="rounded-3xl border border-champagne/15 bg-cream/40 p-8 shadow-sm">
            <div className="flex items-center gap-3 text-champagne-dark">
              <Truck className="h-5 w-5" />
              <p className="text-xs uppercase tracking-[0.22em]">Delivery charges</p>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-champagne/10 pb-3">
                <span className="text-gray-700">Inside Dhaka</span>
                <span className="font-medium text-gray-900">{formatPrice(siteConfig.delivery.insideDhakaCharge)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-700">Outside Dhaka</span>
                <span className="font-medium text-gray-900">{formatPrice(siteConfig.delivery.outsideDhakaCharge)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <PolicyCard icon={Clock3} title="Estimated delivery timing">
            <p>{siteConfig.delivery.insideDhakaEstimate}</p>
            <p>{siteConfig.delivery.outsideDhakaEstimate}</p>
            <p>{siteConfig.delivery.timingNote}</p>
          </PolicyCard>

          <PolicyCard icon={ShieldCheck} title="Payment guidance">
            <p>{siteConfig.delivery.cashOnDelivery}</p>
            <p>{siteConfig.delivery.advancePayment}</p>
            <p>{siteConfig.delivery.orderConfirmation}</p>
          </PolicyCard>
        </div>

        <div className="rounded-3xl border border-soft-gray/30 bg-gradient-to-br from-white to-cream/50 p-8 sm:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-champagne-dark mb-3">
                <BadgeCheck className="h-5 w-5" />
                <p className="text-xs uppercase tracking-[0.22em]">Order flow</p>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4">
                Confirmed on WhatsApp, delivered with care
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Please share the product code and delivery area when you message us. We will confirm the final charge, estimated timing, payment method, and any selected-order advance before the order is finalized.
              </p>
            </div>

            <div className="flex-shrink-0">
              <WhatsAppButton className="w-full lg:w-auto" ariaLabel="Open WhatsApp delivery inquiry demo">
                Ask About Delivery
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}