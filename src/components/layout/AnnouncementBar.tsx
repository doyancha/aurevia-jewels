'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return !window.localStorage.getItem('announcement-dismissed');
  });

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('announcement-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-[#f5f1ea] text-charcoal flex items-center justify-center py-2 px-4 relative overflow-hidden"
        >
          <p className="text-xs sm:text-sm font-medium text-center pr-8 max-w-3xl">
            Elegant pieces selected for every occasion — Order directly through WhatsApp
          </p>
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-full transition-colors"
            aria-label="Dismiss announcement"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}