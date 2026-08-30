import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-ivory pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,1.92fr)_minmax(0,0.5fr)_minmax(0,0.5fr)_minmax(0,1fr)] gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="sr-only">{siteConfig.name}</span>
              <span className="relative block h-[88px] w-[132px] sm:h-[96px] sm:w-[144px] lg:h-[104px] lg:w-[156px]">
                <Image
                  src="/images/brand/aurevia-jewels-logo-gold.png"
                  alt={siteConfig.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 156px, (min-width: 640px) 144px, 132px"
                  className="object-contain object-left"
                />
              </span>
            </Link>
            <p className="text-ivory/80 text-sm max-w-sm leading-relaxed">
              {siteConfig.tagline}
            </p>
            <p className="text-xs leading-relaxed text-ivory/65 max-w-sm">
              {siteConfig.demoNotice}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg text-champagne mb-6 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-4">
              {siteConfig.footerNavigation?.quickLinks ? (
                siteConfig.footerNavigation.quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-ivory/80 hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/" className="text-ivory/80 hover:text-white transition-colors text-sm">Home</Link></li>
                  <li><Link href="/shop" className="text-ivory/80 hover:text-white transition-colors text-sm">Shop</Link></li>
                  <li><Link href="/about" className="text-ivory/80 hover:text-white transition-colors text-sm">About</Link></li>
                  <li><Link href="/contact" className="text-ivory/80 hover:text-white transition-colors text-sm">Contact</Link></li>
                  <li><Link href="/faq" className="text-ivory/80 hover:text-white transition-colors text-sm">FAQ</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h3 className="font-serif text-lg text-champagne mb-6 uppercase tracking-wider">Collections</h3>
            <ul className="space-y-4">
              {siteConfig.footerNavigation?.collections ? (
                siteConfig.footerNavigation.collections.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-ivory/80 hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/collections/necklaces" className="text-ivory/80 hover:text-white transition-colors text-sm">Necklaces</Link></li>
                  <li><Link href="/collections/earrings" className="text-ivory/80 hover:text-white transition-colors text-sm">Earrings</Link></li>
                  <li><Link href="/collections/rings" className="text-ivory/80 hover:text-white transition-colors text-sm">Rings</Link></li>
                  <li><Link href="/collections/bangles" className="text-ivory/80 hover:text-white transition-colors text-sm">Bangles</Link></li>
                  <li><Link href="/collections/bridal" className="text-ivory/80 hover:text-white transition-colors text-sm">Bridal</Link></li>
                  <li><Link href="/collections/sets" className="text-ivory/80 hover:text-white transition-colors text-sm">Jewelry Sets</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-serif text-lg text-champagne mb-6 uppercase tracking-wider">Support</h3>
            <ul className="space-y-4">
              {siteConfig.footerNavigation?.support ? (
                siteConfig.footerNavigation.support.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-ivory/80 hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/support/whatsapp" className="text-ivory/80 hover:text-white transition-colors text-sm">WhatsApp Support</Link></li>
                  <li><Link href="/support/order" className="text-ivory/80 hover:text-white transition-colors text-sm">Order Information</Link></li>
                  <li><Link href="/support/delivery" className="text-ivory/80 hover:text-white transition-colors text-sm">Delivery Information</Link></li>
                  <li><Link href="/support/returns" className="text-ivory/80 hover:text-white transition-colors text-sm">Returns Policy</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-ivory/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-ivory/60 text-sm">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/privacy" className="text-ivory/60 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-ivory/60 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            {siteConfig.socialProfiles.map((profile) => (
              <a
                key={profile.label}
                href={profile.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ivory/60 hover:text-white text-sm transition-colors"
              >
                {profile.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
