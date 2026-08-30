'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { MobileMenu } from './MobileMenu';
import { SearchOverlay } from './SearchOverlay';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <>
      <motion.header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          isScrolled ? 'bg-ivory/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Toggle & Search (Left on mobile, hidden on desktop) */}
            <div className="flex items-center gap-4 md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-charcoal"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* Logo (Center on mobile, Left on desktop) */}
            <div className="flex-1 md:flex-none text-center md:text-left">
              <Link href="/" className="inline-block">
                <span className="font-serif text-2xl md:text-3xl lg:text-[2rem] tracking-wide text-charcoal font-semibold">
                  {siteConfig.name}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center flex-1 gap-8 lg:gap-10">
              {siteConfig.navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium tracking-widest uppercase text-charcoal/80 hover:text-champagne transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center justify-end gap-3 md:gap-4 lg:gap-5 md:flex-none">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-charcoal hover:text-champagne transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <WhatsAppButton
                variant="secondary"
                size="sm"
                className="hidden md:inline-flex rounded-sm"
              >
                WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
