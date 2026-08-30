'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <section className="relative w-full h-[85vh] lg:h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/source/photo-1599643478518-a784e5dc4c8f.jpg"
          alt="Premium jewelry display for Aurevia Jewels"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 flex flex-col items-center text-center mt-16 md:mt-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto flex flex-col items-center"
        >
          {/* Decorative element */}
          <motion.div variants={itemVariants} className="w-12 h-px bg-champagne/80 mb-6" />

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-7xl font-serif text-white tracking-tight mb-6 leading-tight drop-shadow-md"
          >
            Jewelry Made for Your <br className="hidden md:block" /> Most Beautiful Moments
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-white/90 font-sans font-light mb-10 max-w-2xl drop-shadow-sm"
          >
            Discover elegant pieces selected to bring timeless beauty to celebrations, gifts, and everyday moments.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 bg-champagne text-charcoal hover:bg-champagne/90 transition-colors font-medium rounded-sm text-sm uppercase tracking-wider"
            >
              Shop Collection
            </Link>
            <WhatsAppButton
              variant="outline"
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-sm uppercase tracking-wider rounded-sm"
            >
              Order on WhatsApp
            </WhatsAppButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}