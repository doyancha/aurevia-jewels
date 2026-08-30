import { siteConfig } from '@/config/site';
import type { Product } from '@/types';

const placeholderBusinessValues = [
  '8801XXXXXXXXX',
  'hello@aureviajewels.com',
  'contact@aureviajewels.example',
  '+880 1XXX-XXXXXX',
  'https://aureviajewels.com',
  'https://www.aureviajewels.com',
  'https://aureviajewels.example',
  'https://www.aureviajewels.example',
  'https://facebook.com/aureviajewels',
  'https://www.facebook.com/aureviajewels',
  'https://instagram.com/aureviajewels',
  'https://www.instagram.com/aureviajewels',
  'https://pinterest.com/aureviajewels',
  'https://www.pinterest.com/aureviajewels',
  'https://example.com/aurevia-jewels/facebook',
  'https://example.com/aurevia-jewels/instagram',
  'https://example.com/aurevia-jewels/pinterest',
  'saturday – thursday: 10:00 am – 8:00 pm',
  'saturday - thursday: 10:00 am - 8:00 pm',
];

/**
 * Normalize a phone number into digits only for tel:/wa.me usage.
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '');
}

/**
 * Detect whether a public contact value is still an unreplaced placeholder.
 */
export function isPlaceholderBusinessValue(value?: string | null): boolean {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();

  return placeholderBusinessValues.some((placeholder) =>
    normalized === placeholder || normalized.includes(placeholder)
  );
}

/**
 * Return a safe display string for business contact values.
 */
export function getBusinessValueDisplay(value: string, fallback = 'To be confirmed'): string {
  return isPlaceholderBusinessValue(value) ? fallback : value;
}

/**
 * Return a configured external URL only when it is not a placeholder.
 */
export function getConfiguredExternalUrl(url?: string | null): string | undefined {
  if (!url || isPlaceholderBusinessValue(url)) {
    return undefined;
  }

  return url;
}

/**
 * Determine whether the storefront is currently operating in demo mode.
 */
export function isDemoStorefront(): boolean {
  return siteConfig.isDemo;
}

/**
 * Determine whether the configured WhatsApp number is actually usable.
 */
export function hasRealWhatsAppNumber(): boolean {
  const digits = normalizePhoneNumber(siteConfig.whatsappNumber);
  return !isPlaceholderBusinessValue(siteConfig.whatsappNumber) && digits.length >= 10;
}

/**
 * Decide whether WhatsApp interactions should open a demo dialog instead of a live wa.me link.
 */
export function shouldUseDemoWhatsAppFlow(): boolean {
  return siteConfig.isDemo || !hasRealWhatsAppNumber();
}

/**
 * Format a price in Bangladeshi Taka with proper formatting.
 * Example: 2450 → ৳2,450
 */
export function formatPrice(price: number): string {
  return `${siteConfig.currencySymbol}${price.toLocaleString('en-IN')}`;
}

/**
 * Build the standard product-order WhatsApp message.
 */
export function buildWhatsAppOrderMessage(
  product: Pick<Product, 'name' | 'productCode' | 'price' | 'slug'>,
  productUrl?: string
): string {
  const resolvedUrl = productUrl ?? `${siteConfig.url}/products/${product.slug}`;

  return `Hello Aurevia Jewels,

I would like to order the following item:

Product: ${product.name}
Product Code: ${product.productCode}
Price: ${formatPrice(product.price)}

Product Link:
${resolvedUrl}

Please let me know whether this item is currently available and share the ordering details.

Thank you.`;
}

/**
 * Build the standard generic WhatsApp inquiry message.
 */
export function buildWhatsAppInquiryMessage(message?: string): string {
  return (
    message ||
    `Hello Aurevia Jewels,

I would like to know more about your jewelry collection.

Could you please assist me?`
  );
}

/**
 * Generate a WhatsApp URL with a prefilled product-specific order message.
 */
export function generateWhatsAppUrl(
  product: Pick<Product, 'name' | 'productCode' | 'price' | 'slug'>,
  productUrl?: string
): string {
  if (shouldUseDemoWhatsAppFlow()) {
    return '/contact';
  }

  const message = buildWhatsAppOrderMessage(product, productUrl);

  return `https://wa.me/${normalizePhoneNumber(siteConfig.whatsappNumber)}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a generic WhatsApp URL for general inquiries.
 */
export function generateGenericWhatsAppUrl(): string {
  if (shouldUseDemoWhatsAppFlow()) {
    return '/contact';
  }

  const message = buildWhatsAppInquiryMessage();
  return `https://wa.me/${normalizePhoneNumber(siteConfig.whatsappNumber)}?text=${encodeURIComponent(message)}`;
}

/**
 * Get the full URL for a product page.
 */
export function getProductUrl(slug: string): string {
  return `/products/${slug}`;
}

/**
 * Get the full URL for a collection page.
 */
export function getCollectionUrl(slug: string): string {
  return `/collections/${slug}`;
}

/**
 * Utility for conditionally joining class names.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}