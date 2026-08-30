'use client';

import { Product } from '@/types';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { ProductGallery } from '@/components/ui/ProductGallery';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { formatPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { ShieldCheck, MessageCircle, Clock } from 'lucide-react';
import { StickyMobileCTA } from './StickyMobileCTA';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const getAvailabilityLabel = (status: string) => {
    switch (status) {
      case 'Made to Order':
        return {
          label: 'Made to Order',
          className: 'text-blue-700 bg-blue-50 border-blue-200',
        };
      default:
        return {
          label: 'Ask About Availability',
          className: 'text-amber-700 bg-amber-50 border-amber-200',
        };
    }
  };
  const availability = getAvailabilityLabel(product.availability);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left Column - Gallery */}
        <AnimatedSection className="w-full">
          <ProductGallery images={product.images} productName={product.name} />
        </AnimatedSection>

        {/* Right Column - Details */}
        <AnimatedSection delay={0.2} className="flex flex-col">
          <div className="mb-2">
            <span className="text-sm uppercase tracking-wider font-medium text-gray-500">
              {product.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-medium text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className={`px-3 py-1 text-xs font-medium border rounded-full ${availability.className}`}>
              {availability.label}
            </span>
            <span className="text-sm text-gray-500">
              Product Code: {product.productCode}
            </span>
          </div>

          <div className="prose prose-sm text-gray-600 mb-8">
            <p className="text-lg">{product.shortDescription}</p>
            <p className="mt-4">{product.description}</p>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-6 border-y border-gray-200 mb-8">
            {product.material && (
              <div>
                <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Material</span>
                <span className="text-gray-900 font-medium">{product.material}</span>
              </div>
            )}
            {product.color && (
              <div>
                <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Color</span>
                <span className="text-gray-900 font-medium">{product.color}</span>
              </div>
            )}
            {product.finish && (
              <div>
                <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Finish</span>
                <span className="text-gray-900 font-medium">{product.finish}</span>
              </div>
            )}
            {product.dimensions && (
              <div>
                <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Dimensions</span>
                <span className="text-gray-900 font-medium">{product.dimensions}</span>
              </div>
            )}
          </div>

          {/* Occasions / Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-8">
              <span className="block text-sm font-medium text-gray-900 mb-3">Perfect for</span>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA Desktop */}
          <div className="hidden md:block mb-10">
            <WhatsAppButton
              product={product}
              productUrl={`${siteConfig.url}/products/${product.slug}`}
              className="w-full text-lg py-4"
            />
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-5">
            <div className="flex flex-col items-center text-center gap-2">
              <MessageCircle className="w-6 h-6 text-champagne" />
              <span className="text-xs font-medium text-gray-700">Direct WhatsApp Support</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck className="w-6 h-6 text-champagne" />
              <span className="text-xs font-medium text-gray-700">Carefully Selected</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Clock className="w-6 h-6 text-champagne" />
              <span className="text-xs font-medium text-gray-700">Confirm in Chat</span>
            </div>
          </div>
        </AnimatedSection>
      </div>

      <StickyMobileCTA product={product} />
    </>
  );
}