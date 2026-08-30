'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, X } from 'lucide-react';

type DemoPayload = {
  title: string;
  message: string;
};

type WhatsAppDemoContextValue = {
  openDemoWhatsApp: (payload: DemoPayload) => void;
  closeDemoWhatsApp: () => void;
};

const WhatsAppDemoContext = createContext<WhatsAppDemoContextValue | null>(null);

export function WhatsAppDemoProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<DemoPayload | null>(null);
  const [copied, setCopied] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const closeDemoWhatsApp = useCallback(() => {
    setIsOpen(false);
    setPayload(null);
  }, []);

  const openDemoWhatsApp = useCallback((nextPayload: DemoPayload) => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    setPayload(nextPayload);
    setCopied(false);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const focusTarget = closeButtonRef.current ?? dialogRef.current;
      focusTarget?.focus();

      return () => {
        document.body.style.overflow = previous;
      };
    }

    document.body.style.overflow = '';

    if (lastFocusedRef.current) {
      lastFocusedRef.current.focus();
      lastFocusedRef.current = null;
    }

    return undefined;
  }, [isOpen]);

  const handleCopy = useCallback(async () => {
    if (!payload) {
      return;
    }

    try {
      await navigator.clipboard.writeText(payload.message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [payload]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeDemoWhatsApp();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const container = dialogRef.current;
    if (!container) {
      return;
    }

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [href], textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hasAttribute('disabled'));

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }, [closeDemoWhatsApp]);

  const contextValue = useMemo<WhatsAppDemoContextValue>(
    () => ({
      openDemoWhatsApp,
      closeDemoWhatsApp,
    }),
    [closeDemoWhatsApp, openDemoWhatsApp]
  );

  return (
    <WhatsAppDemoContext.Provider value={contextValue}>
      {children}

      <AnimatePresence>
        {isOpen && payload && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-4 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDemoWhatsApp}
            aria-hidden="true"
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="whatsapp-demo-title"
              aria-describedby="whatsapp-demo-description"
              tabIndex={-1}
              className="w-full max-w-2xl rounded-3xl border border-champagne/20 bg-ivory p-5 sm:p-6 text-charcoal shadow-[0_30px_90px_rgba(0,0,0,0.25)]"
              initial={{ scale: 0.96, y: 18, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 12, opacity: 0 }}
              transition={{ duration: 0.24 }}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={handleKeyDown}
              aria-hidden={false}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-champagne-dark font-medium">
                    WhatsApp Demo
                  </p>
                  <h2 id="whatsapp-demo-title" className="mt-2 text-2xl sm:text-3xl font-serif">
                    {payload.title}
                  </h2>
                  <p id="whatsapp-demo-description" className="mt-3 max-w-xl text-sm sm:text-base text-charcoal/70">
                    Demo storefront preview. Connect a real WhatsApp Business number to enable direct ordering.
                  </p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeDemoWhatsApp}
                  className="rounded-full p-2 text-charcoal/60 transition-colors hover:bg-black/5 hover:text-charcoal focus:outline-none focus:ring-2 focus:ring-champagne"
                  aria-label="Close WhatsApp demo dialog"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-warm-beige/80 bg-white p-4 sm:p-5">
                <p className="mb-3 text-sm font-medium text-charcoal">
                  Message preview
                </p>
                <textarea
                  readOnly
                  value={payload.message}
                  className="min-h-[220px] w-full resize-none rounded-xl border border-light-gray bg-cream/40 p-4 text-sm leading-6 text-charcoal outline-none"
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-charcoal/65">
                  Demo storefront, not a live ordering channel.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-charcoal/15 bg-white px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-charcoal/5 focus:outline-none focus:ring-2 focus:ring-champagne"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy Message'}
                  </button>
                  <button
                    type="button"
                    onClick={closeDemoWhatsApp}
                    className="inline-flex items-center justify-center rounded-md bg-charcoal px-4 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-champagne"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </WhatsAppDemoContext.Provider>
  );
}

export function useWhatsAppDemo() {
  const context = useContext(WhatsAppDemoContext);

  if (!context) {
    throw new Error('useWhatsAppDemo must be used within a WhatsAppDemoProvider');
  }

  return context;
}