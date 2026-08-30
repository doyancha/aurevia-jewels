'use client';

import { useState, useEffect, useRef, useCallback, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getBestSellers, searchProducts } from '@/data/products';
import { formatPrice } from '@/lib/utils';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const popularSearches = ['Necklaces', 'Rings', 'Earrings', 'Bridal Sets', 'Bangles', 'Jewelry Sets'];
  const popularProducts = getBestSellers().slice(0, 4);

  const closeOverlay = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  const getFocusableElements = useCallback(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return [];
    }

    return Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hasAttribute('disabled'));
  }, []);

  useEffect(() => {
    if (isOpen) {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';
      const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80);

      return () => {
        window.clearTimeout(focusTimer);
        document.body.style.overflow = '';
      };
    }

    document.body.style.overflow = '';
    lastFocusedRef.current?.focus();
    lastFocusedRef.current = null;
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeOverlay();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusables = getFocusableElements();
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const isWithinDialog = active ? dialogRef.current?.contains(active) : false;

      if (event.shiftKey) {
        if (!isWithinDialog || active === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (!isWithinDialog || active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [closeOverlay, getFocusableElements]
  );

  const results = query.trim().length > 1 ? searchProducts(query) : [];
  const trimmedQuery = query.trim();
  const showDiscoveryState = trimmedQuery.length < 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-[radial-gradient(circle_at_top,rgba(201,169,110,0.12),transparent_40%),linear-gradient(180deg,rgba(250,247,242,0.98),rgba(245,240,232,0.95))] flex flex-col backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-overlay-title"
          onKeyDown={handleKeyDown}
        >
          <div className="border-b border-charcoal/10 bg-ivory/80">
            <div className="w-full max-w-[92rem] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 max-w-4xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-champagne-dark font-medium">
                    Search Aurevia Jewels
                  </p>
                  <h2 id="search-overlay-title" className="mt-2 font-serif text-2xl sm:text-3xl lg:text-[2.6rem] text-charcoal">
                    Search products, collections or product codes
                  </h2>
                  <div className="relative mt-5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-gray" size={22} />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search products, collections or product codes..."
                      aria-label="Search products, collections or product codes"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full rounded-2xl border border-charcoal/10 bg-white/95 px-12 py-4 text-lg sm:text-xl lg:text-2xl font-serif text-charcoal shadow-sm focus:outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/20 placeholder:text-soft-gray transition-colors"
                    />
                  </div>
                </div>
                <button
                  onClick={closeOverlay}
                  className="p-2.5 text-charcoal hover:bg-black/5 rounded-full transition-colors flex-shrink-0"
                  aria-label="Close search"
                >
                  <X size={28} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="w-full max-w-[92rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
              {showDiscoveryState ? (
                <div className="space-y-10">
                  <div>
                    <div className="flex items-end justify-between gap-4 mb-5">
                      <h3 className="font-serif text-2xl text-charcoal">Popular searches</h3>
                      <p className="text-sm text-charcoal/55">Start with a category, style, or code</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {popularSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setQuery(term)}
                          className="rounded-full border border-charcoal/10 bg-white px-4 py-2 text-sm text-charcoal/75 transition-colors hover:border-champagne hover:text-charcoal hover:shadow-sm"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-end justify-between gap-4 mb-5">
                      <h3 className="font-serif text-2xl text-charcoal">Popular products</h3>
                      <Link
                        href="/shop"
                        onClick={closeOverlay}
                        className="text-sm font-medium uppercase tracking-wider text-charcoal/65 hover:text-charcoal"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                      {popularProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={closeOverlay}
                          className="group rounded-2xl border border-charcoal/10 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-champagne/40 hover:shadow-md"
                        >
                          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-cream">
                            <Image
                              src={product.images[0]}
                              alt={`${product.name} preview by Aurevia Jewels`}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 320px"
                            />
                          </div>
                          <div className="px-1 pb-1 pt-4">
                            <p className="text-xs uppercase tracking-wider text-charcoal/55">{product.category}</p>
                            <h4 className="mt-1 font-serif text-lg text-charcoal group-hover:text-champagne transition-colors">
                              {product.name}
                            </h4>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span className="font-medium text-charcoal">{formatPrice(product.price)}</span>
                              <span className="text-xs uppercase tracking-wider text-charcoal/50">{product.productCode}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl text-charcoal">
                        {results.length > 0 ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'No jewelry matched your search'}
                      </h3>
                      <p className="mt-2 text-sm text-charcoal/60">
                        {results.length > 0
                          ? 'Select a product to open its page.'
                          : 'Try a product name, collection, or code.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="text-sm font-medium uppercase tracking-wider text-charcoal/65 hover:text-charcoal"
                    >
                      Clear
                    </button>
                  </div>

                  {results.length === 0 ? (
                    <div className="rounded-3xl border border-charcoal/10 bg-white/90 p-8 shadow-sm">
                      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-center">
                        <div>
                          <h4 className="font-serif text-2xl text-charcoal">Try one of these popular searches</h4>
                          <div className="mt-4 flex flex-wrap gap-3">
                            {popularSearches.map((term) => (
                              <button
                                key={term}
                                type="button"
                                onClick={() => setQuery(term)}
                                className="rounded-full bg-cream px-4 py-2 text-sm text-charcoal/80 transition-colors hover:bg-champagne/15 hover:text-charcoal"
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-charcoal p-6 text-ivory">
                          <p className="text-xs uppercase tracking-[0.24em] text-champagne-light">Tip</p>
                          <p className="mt-3 text-sm leading-relaxed text-ivory/80">
                            Search by product code like AJ-N001, or use terms such as necklace, ring, bridal set, or jewelry set.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={closeOverlay}
                          className="group flex gap-4 rounded-2xl border border-charcoal/10 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-champagne/40 hover:shadow-md"
                        >
                          <div className="relative h-28 w-24 overflow-hidden rounded-xl bg-cream flex-shrink-0">
                            <Image
                              src={product.images[0]}
                              alt={`${product.name} preview by Aurevia Jewels`}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="96px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs uppercase tracking-wider text-charcoal/55">{product.category}</p>
                            <h4 className="mt-1 font-serif text-lg text-charcoal group-hover:text-champagne transition-colors line-clamp-2">
                              {product.name}
                            </h4>
                            <p className="mt-2 text-sm text-charcoal/70 line-clamp-2">
                              {product.shortDescription}
                            </p>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <span className="font-medium text-charcoal">{formatPrice(product.price)}</span>
                              <span className="text-xs uppercase tracking-wider text-charcoal/50">{product.productCode}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
