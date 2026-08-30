'use client';

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
        <div className="relative aspect-square md:aspect-[4/5] w-full overflow-hidden rounded-lg bg-soft-gray border border-champagne-light">
          <Image
            src={images[activeIndex]}
            alt={`${productName} product view ${activeIndex + 1}`}
            fill
            priority
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

      {images.length > 1 && (
        <div className="flex overflow-x-auto gap-4 pb-2 snap-x hide-scrollbar">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-md overflow-hidden border-2 snap-center focus:outline-none transition-colors",
                activeIndex === index ? "border-champagne-dark" : "border-transparent hover:border-champagne"
              )}
              aria-label={`View image ${index + 1} of ${images.length}`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail view ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}