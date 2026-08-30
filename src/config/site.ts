const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://aureviajewels.example';

export const siteConfig = {
  /** Demo storefront flag. Keep true until real business channels are configured. */
  isDemo: true,

  /** Brand name displayed throughout the site */
  name: 'Aurevia Jewels',

  /** Brand tagline */
  tagline: 'Timeless Elegance, Made to Shine.',

  /** Main market */
  market: 'Bangladesh',

  /**
   * WhatsApp business number for order placement.
   * Replace with your real WhatsApp number (country code + number, no + or spaces).
   * Example: '8801712345678'
   */
  whatsappNumber: '8801XXXXXXXXX',

  /** Site URL for SEO and canonical links */
  url: siteUrl,

  /** Business contact details shown in demo mode */
  contact: {
    email: 'contact@aureviajewels.example',
    phone: 'Demo contact — WhatsApp/phone number not configured',
    address: 'Gulshan, Dhaka, Bangladesh',
    serviceHours: 'Saturday – Thursday: 10:00 AM – 8:00 PM',
  },

  /** Demo social profile URLs */
  socialProfiles: [
    { label: 'Facebook', href: 'https://example.com/aurevia-jewels/facebook' },
    { label: 'Instagram', href: 'https://example.com/aurevia-jewels/instagram' },
    { label: 'Pinterest', href: 'https://example.com/aurevia-jewels/pinterest' },
  ],

  /** Currency settings */
  currency: 'BDT',
  currencySymbol: '৳',

  /** Demo storefront notice used on contact/footer surfaces */
  demoNotice:
    'Aurevia Jewels is currently presented as a demonstration storefront. Contact and social details shown in demo mode are not live business channels.',

  /** Delivery policy */
  delivery: {
    coverage: 'Nationwide Bangladesh',
    insideDhakaCharge: 70,
    outsideDhakaCharge: 120,
    insideDhakaEstimate: 'Estimated delivery within 2 business days after order confirmation.',
    outsideDhakaEstimate: 'Estimated delivery within 4 business days after order confirmation.',
    timingNote:
      'Delivery starts after order confirmation. Courier disruption, public holidays, weather, remote delivery areas, or circumstances outside our reasonable control can occasionally affect delivery time.',
    cashOnDelivery:
      'Cash on Delivery is available for eligible orders across Bangladesh.',
    advancePayment:
      'Advance payment may be required for selected orders, including made-to-order, specially reserved, customized, or higher-value pieces. Any advance requirement and amount will be clearly confirmed with the customer through WhatsApp before the order is finalized.',
    orderConfirmation:
      'A WhatsApp message is an enquiry only. An order is confirmed only after Aurevia Jewels confirms product availability, product details, delivery destination, delivery charge, payment method, any required advance, and the estimated delivery window.',
  },

  /** Returns / exchange policy */
  returns: {
    exchangeWindow: '3 calendar days after delivery',
    exchangeSummary:
      'Eligible unused products may be requested for exchange within 3 calendar days after delivery, subject to the conditions below.',
    exchangeConditions: [
      'Product must be unused and unworn.',
      'Product must remain in original condition.',
      'Original packaging should be retained.',
      'Any included tags or accessories should remain intact.',
      'Product must not show wear, damage, alteration, perfume/cosmetic marks, or misuse.',
      'Exchange remains subject to product availability.',
      'Any price difference for the replacement product must be settled before dispatch.',
    ],
    excludedItems: [
      'Worn jewelry.',
      'Pierced earrings once worn or opened for use.',
      'Customized items.',
      'Personalized items.',
      'Altered items.',
      'Made-to-order pieces produced specifically for the customer.',
    ],
    damagedOrWrongItems:
      'If the wrong product was delivered, the product arrived damaged, an item is missing from the confirmed order, or there is an obvious material defect attributable to the supplied product, please contact us through WhatsApp within 48 hours of receiving the parcel and share helpful photographs or video where available.',
    sellerResponsibility:
      'When Aurevia Jewels confirms a wrong, damaged, or materially defective item attributable to the seller, reasonable return and re-delivery courier charges will be borne by Aurevia Jewels, and the appropriate remedy will be offered depending on the circumstances.',
    refundPolicy:
      'Change-of-mind exchanges do not automatically qualify for a cash refund. Refunds primarily apply where a prepaid order cannot be fulfilled, a confirmed wrong or damaged order cannot reasonably be replaced, another refund is mutually agreed, or applicable consumer law requires a remedy.',
    consumerRights:
      'Nothing in this policy is intended to limit any rights available to customers under applicable consumer protection law.',
  },

  /** Main navigation items */
  navigation: [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Collections', href: '/collections' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
  ],

  /** Footer navigation groups */
  footerNavigation: {
    quickLinks: [
      { name: 'Home', href: '/' },
      { name: 'Shop', href: '/shop' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
    ],
    collections: [
      { name: 'Necklaces', href: '/collections/necklaces' },
      { name: 'Earrings', href: '/collections/earrings' },
      { name: 'Rings', href: '/collections/rings' },
      { name: 'Bangles', href: '/collections/bangles' },
      { name: 'Bridal', href: '/collections/bridal' },
      { name: 'Jewelry Sets', href: '/collections/jewelry-sets' },
    ],
    support: [
      { name: 'Order Information', href: '/delivery' },
      { name: 'Delivery Information', href: '/delivery' },
      { name: 'Returns Policy', href: '/returns' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
    ],
  },
};

export type SiteConfig = typeof siteConfig;