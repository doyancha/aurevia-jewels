'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

interface StickyMobileCTAProps {
  product: Product;
}

export function StickyMobileCTA({ product }: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down a bit, hide when near top
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] transform transition-transform duration-300 ease-in-out z-50 md:hidden",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col truncate">
          <span className="text-sm font-medium text-gray-900 truncate">{product.name}</span>
          <span className="text-sm text-gray-500 font-medium">{formatPrice(product.price)}</span>
        </div>
        <div className="flex-shrink-0">
          <WhatsAppButton
            product={product}
            productUrl={`${siteConfig.url}/products/${product.slug}`}
            className="px-6 py-2.5 text-sm"
          />
        </div>
      </div>
    </div>
  );
}