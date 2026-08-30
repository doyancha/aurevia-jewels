'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Product } from '@/types';
import {
  buildWhatsAppInquiryMessage,
  buildWhatsAppOrderMessage,
  cn,
  generateGenericWhatsAppUrl,
  generateWhatsAppUrl,
  shouldUseDemoWhatsAppFlow,
} from '@/lib/utils';
import { useWhatsAppDemo } from './WhatsAppDemoDialog';

interface WhatsAppButtonProps {
  product?: Product;
  productName?: string;
  productCode?: string;
  productPrice?: number;
  productUrl?: string;
  text?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  ariaLabel?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function WhatsAppButton({
  product,
  productName,
  productCode,
  productPrice,
  productUrl,
  text,
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  ariaLabel,
  className,
  onClick,
  children
}: WhatsAppButtonProps) {
  const { openDemoWhatsApp } = useWhatsAppDemo();

  const resolvedProduct =
    product ??
    (productName && productCode && typeof productPrice === 'number'
      ? {
          name: productName,
          productCode,
          price: productPrice,
          slug: productUrl?.split('/products/').pop() ?? 'product',
        }
      : undefined);

  const demoMessage = resolvedProduct
    ? buildWhatsAppOrderMessage(resolvedProduct, productUrl)
    : buildWhatsAppInquiryMessage();

  const url = resolvedProduct
    ? generateWhatsAppUrl(resolvedProduct, productUrl)
    : generateGenericWhatsAppUrl();

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors gap-2';

  const variants = {
    primary: 'bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm',
    secondary: 'bg-charcoal hover:bg-black text-white',
    outline: 'border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
  };

  const label = children ?? text ?? (resolvedProduct ? 'Order on WhatsApp' : 'Chat on WhatsApp');
  const accessibleLabel = ariaLabel ?? (typeof label === 'string' ? label : 'Open WhatsApp');
  const useDemoFlow = shouldUseDemoWhatsAppFlow();
  const sizeClass = iconOnly ? 'h-11 w-11 px-0' : sizes[size];
  const sharedClassName = cn(baseStyles, variants[variant], sizeClass, className);

  if (useDemoFlow) {
    return (
      <button
        type="button"
        onClick={() => {
          openDemoWhatsApp({ title: 'WhatsApp Demo', message: demoMessage });
          onClick?.();
        }}
        className={sharedClassName}
        aria-label={accessibleLabel}
      >
        <MessageCircle className={cn(iconOnly ? 'w-5 h-5' : size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5')} />
        {!iconOnly && label}
        {iconOnly && <span className="sr-only">{accessibleLabel}</span>}
      </button>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={sharedClassName}
      aria-label={accessibleLabel}
    >
      <MessageCircle className={cn(iconOnly ? 'w-5 h-5' : size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5')} />
      {!iconOnly && label}
      {iconOnly && <span className="sr-only">{accessibleLabel}</span>}
    </a>
  );
}