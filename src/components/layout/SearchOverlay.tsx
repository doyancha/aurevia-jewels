'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { searchProducts } from '@/data/products';
import { formatPrice } from '@/lib/utils';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Small delay to allow animation to start before focusing
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = query.trim().length > 1 ? searchProducts(query) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-ivory flex flex-col"
        >
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-soft-gray" size={24} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for jewelry..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-2xl sm:text-4xl font-serif text-charcoal border-b border-soft-gray/30 pb-2 pl-10 focus:outline-none focus:border-charcoal placeholder:text-soft-gray transition-colors"
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 text-charcoal hover:bg-black/5 rounded-full transition-colors flex-shrink-0"
                aria-label="Close search"
              >
                <X size={32} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {query.trim().length > 1 && results.length === 0 && (
              <p className="text-center text-soft-gray text-lg mt-8">No results found for &quot;{query}&quot;</p>
            )}

            {results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="group flex gap-4 p-4 hover:bg-cream rounded-lg transition-colors"
                  >
                    <div className="relative w-24 h-24 bg-cream rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={`${product.name} preview by Aurevia Jewels`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-serif text-charcoal text-lg group-hover:text-champagne transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-charcoal/70 font-medium mt-1">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}