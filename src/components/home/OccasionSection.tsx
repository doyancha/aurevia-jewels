'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';

const occasions = [
  {
    id: 'wedding',
    title: 'Wedding',
    image: '/images/source/pexels-bridal-set-28347078.jpg',
    href: '/collections/bridal'
  },
  {
    id: 'engagement',
    title: 'Engagement',
    image: '/images/source/photo-1515934751635-c81c6bc9a2d8.jpg',
    href: '/collections/rings'
  },
  {
    id: 'party',
    title: 'Party',
    image: '/images/source/photo-1492707892479-7bc8d5a4ee93.jpg',
    href: '/shop'
  },
  {
    id: 'eid',
    title: 'Eid Collection',
    image: '/images/source/photo-1610694955371-d4a3e0ce4b52.jpg',
    href: '/collections/jewelry-sets'
  },
  {
    id: 'gift',
    title: 'Perfect Gifts',
    image: '/images/source/photo-1513885535751-8b9238bd345a.jpg',
    href: '/collections/bracelets'
  },
  {
    id: 'everyday',
    title: 'Everyday Elegance',
    image: '/images/source/photo-1599643478518-a784e5dc4c8f.jpg',
    href: '/collections/necklaces'
  }
];

export function OccasionSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeading title="Shop by Occasion" subtitle="Find the perfect piece for every moment" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mt-12 md:mt-16">
          {occasions.map((occasion, index) => (
            <motion.div
              key={occasion.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={occasion.href}
                className="group relative block w-full aspect-square md:aspect-[4/5] overflow-hidden rounded-sm"
              >
                <Image
                  src={occasion.image}
                  alt={`${occasion.title} jewelry inspiration`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 flex items-end p-6 md:p-8">
                  <h3 className="text-white text-xl md:text-2xl font-serif tracking-wide drop-shadow-md group-hover:translate-y-[-8px] transition-transform duration-300">
                    {occasion.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
