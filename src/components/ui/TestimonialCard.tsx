'use client';

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Testimonial } from "@/types";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  testimonial: Testimonial;
  index?: number;
  className?: string;
}

export function TestimonialCard({ testimonial, index = 0, className }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "bg-white p-8 rounded-xl shadow-sm border border-champagne-light flex flex-col h-full",
        className
      )}
    >
      <Quote size={32} className="text-champagne-light mb-4 opacity-50" />

      <p className="font-sans text-charcoal flex-grow italic mb-6 leading-relaxed text-sm md:text-base">
        &ldquo;{testimonial.text}&rdquo;
      </p>

      <div>
        <h4 className="font-serif font-medium text-charcoal">{testimonial.name}</h4>
        {testimonial.location && (
          <p className="text-xs text-charcoal-light mt-1">{testimonial.location}</p>
        )}
      </div>
    </motion.div>
  );
}
