'use client';

import { motion } from "framer-motion";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export function FloatingWhatsApp() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
    >
      <div className="relative group">
        <div className="absolute -top-12 right-0 bg-white text-charcoal text-sm py-1.5 px-3 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap font-medium">
          Chat with us
          <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-white transform rotate-45"></div>
        </div>
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" aria-hidden="true" />
        <WhatsAppButton
          iconOnly
          variant="primary"
          ariaLabel="Chat with Aurevia Jewels on WhatsApp"
          className="!h-12 !w-12 sm:!h-14 sm:!w-14 !rounded-full !px-0 shadow-lg hover:shadow-xl"
        />
      </div>
    </motion.div>
  );
}