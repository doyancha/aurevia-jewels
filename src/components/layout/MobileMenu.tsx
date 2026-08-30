'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuVariants = {
    closed: {
      x: '100%',
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    closed: { x: 50, opacity: 0 },
    open: { x: 0, opacity: 1 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100]"
            aria-hidden="true"
          />
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-y-0 right-0 z-[101] w-full max-w-sm bg-ivory shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-soft-gray/20">
              <Link href="/" onClick={onClose} className="font-serif text-2xl text-charcoal">
                {siteConfig.name}
              </Link>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-charcoal hover:bg-black/5 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {siteConfig.navigation.map((item) => (
                <motion.div key={item.name} variants={itemVariants}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="text-2xl font-serif text-charcoal hover:text-champagne transition-colors"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div variants={itemVariants} className="p-6 border-t border-soft-gray/20">
              <WhatsAppButton
                variant="secondary"
                className="w-full rounded-none"
                ariaLabel="Open WhatsApp ordering demo"
                onClick={onClose}
              >
                Order via WhatsApp
              </WhatsAppButton>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}