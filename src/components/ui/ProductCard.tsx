'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const isNew = product.newArrival || product.badges?.includes('New');
  const isBestSeller = product.bestSeller || product.badges?.includes('Best Seller');

  return (
    <motion.div
      whileHover="hover"
      className={cn("relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300", className)}
    >
      <Link href={`/products/${product.slug}`} className="group block overflow-hidden rounded-lg">
        <div className="relative aspect-[4/5] bg-soft-gray overflow-hidden">
          <motion.div
            variants={{
              hover: { scale: 1.05 }
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full relative"
          >
            <Image
              src={product.images[0]}
              alt={`${product.name} by Aurevia Jewels`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>

          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {isNew && (
              <span className="bg-ivory text-charcoal text-xs font-medium px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                New
              </span>
            )}
            {isBestSeller && (
              <span className="bg-champagne text-white text-xs font-medium px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                Best Seller
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-charcoal-light uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-serif text-lg text-charcoal truncate">{product.name}</h3>
          <p className="font-sans text-charcoal font-medium mt-1">{formatPrice(product.price)}</p>
          <p className="text-xs text-charcoal/60 mt-2 line-clamp-2">{product.shortDescription}</p>
        </div>
      </Link>

      <motion.div
        variants={{
          hover: { opacity: 1, y: 0 }
        }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-20 right-4 z-20"
      >
        <WhatsAppButton
          product={product}
          productUrl={`/products/${product.slug}`}
          iconOnly
          ariaLabel={`Order ${product.name} on WhatsApp`}
          className="!h-10 !w-10 !rounded-full !px-0 shadow-lg"
        />
      </motion.div>
    </motion.div>
  );
}