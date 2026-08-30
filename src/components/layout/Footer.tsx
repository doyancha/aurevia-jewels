import Link from 'next/link';
import { Clock3, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { isDemoStorefront } from '@/lib/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-ivory pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="font-serif text-3xl tracking-wide text-ivory">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-ivory/80 text-sm max-w-sm leading-relaxed">
              {siteConfig.tagline}
            </p>
            <div className="space-y-3 text-sm text-ivory/75">
              <p className="flex items-center gap-2">
                <MessageCircle size={14} className="text-champagne" />
                Demo WhatsApp ordering preview
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-champagne" />
                {siteConfig.contact.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-champagne" />
                {siteConfig.contact.email}
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-champagne" />
                {siteConfig.contact.address} - Demo location
              </p>
              <p className="flex items-center gap-2">
                <Clock3 size={14} className="text-champagne" />
                {siteConfig.contact.serviceHours}
              </p>
              {isDemoStorefront() && (
                <p className="pt-2 text-xs leading-relaxed text-ivory/60">
                  {siteConfig.demoNotice}
                </p>
              )}
            </div>
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
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-ivory/60 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-ivory/60 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            {siteConfig.socialProfiles.map((profile) => (
              <span key={profile.label} className="text-ivory/50 text-sm">
                {profile.label} Demo
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}