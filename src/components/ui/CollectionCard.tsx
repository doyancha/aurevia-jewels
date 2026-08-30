'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Collection } from "@/types";
import { cn } from "@/lib/utils";

interface CollectionCardProps {
  collection: Collection;
  className?: string;
}

export function CollectionCard({ collection, className }: CollectionCardProps) {
  return (
    <Link href={`/collections/${collection.slug}`} className={cn("group block w-full relative", className)}>
      <motion.div
        whileHover="hover"
        className="relative aspect-[3/4] overflow-hidden rounded-lg bg-soft-gray"
      >
        <motion.div
          variants={{
            hover: { scale: 1.05 }
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full h-full relative"
        >
          <Image
            src={collection.image}
            alt={`${collection.name} collection preview by Aurevia Jewels`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

        <div className="absolute bottom-0 left-0 w-full p-6 text-white text-center flex flex-col items-center">
          <h3 className="font-serif text-2xl md:text-3xl mb-2">{collection.name}</h3>

          <motion.div
            variants={{
              hover: { opacity: 1, y: 0, height: "auto" }
            }}
            initial={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="font-sans text-sm text-ivory tracking-wide uppercase">
              View Collection
            </p>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}