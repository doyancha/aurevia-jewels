'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { FAQ } from "@/types";
import { cn } from "@/lib/utils";

interface FAQAccordionProps {
  items: FAQ[];
  className?: string;
}

export function FAQAccordion({ items, className }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto border-t border-champagne-light", className)}>
      {items.map((item, index) => (
        <div key={index} className="border-b border-champagne-light">
          <button
            onClick={() => toggleItem(index)}
            className="flex items-center justify-between w-full py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne rounded-sm"
            aria-expanded={openIndex === index}
          >
            <span className="font-serif text-lg md:text-xl text-charcoal pr-4">
              {item.question}
            </span>
            <span className="flex-shrink-0 text-champagne-dark">
              {openIndex === index ? <Minus size={24} /> : <Plus size={24} />}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pb-6 text-charcoal-light font-sans text-sm md:text-base leading-relaxed">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}