'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function BridalBanner() {
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row bg-warm-beige/20 rounded-sm overflow-hidden">
          {/* Image Side */}
          <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-[500px]">
            <Image
              src="/images/source/pexels-bridal-set-28347078.jpg"
              alt="Elegant bridal jewelry by Aurevia Jewels"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Content Side */}
          <div className="w-full lg:w-1/2 p-10 md:p-16 lg:p-20 flex flex-col justify-center bg-ivory">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-charcoal mb-6 leading-tight">
                Made for the Moments You&apos;ll Remember Forever
              </h2>
              <p className="text-charcoal/70 font-sans mb-10 leading-relaxed text-lg">
                Our exclusive bridal collection features meticulously crafted pieces designed to complement your special day. From breathtaking necklaces to elegant earrings, discover jewelry that captures the essence of your love story.
              </p>
              <Link
                href="/collections/bridal"
                className="inline-block px-8 py-3.5 bg-charcoal text-white hover:bg-charcoal/90 transition-colors font-medium rounded-sm text-sm uppercase tracking-wider"
              >
                Explore Bridal Collection
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
