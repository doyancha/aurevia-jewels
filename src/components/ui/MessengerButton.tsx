'use client';

import { MessagesSquare } from 'lucide-react';
import { getConfiguredMessengerUrl, cn } from '@/lib/utils';

interface MessengerButtonProps {
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
  productCode?: string;
  showProductHint?: boolean;
}

export function MessengerButton({
  label = 'Open Messenger',
  variant = 'primary',
  size = 'md',
  className,
  ariaLabel,
  productCode,
  showProductHint = false,
}: MessengerButtonProps) {
  const url = getConfiguredMessengerUrl();
  if (!url) {
    return null;
  }

  const styles = {
    base: 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2',
    primary: 'bg-[#0084FF] text-white shadow-sm hover:bg-[#006FE6]',
    secondary: 'bg-charcoal text-white hover:bg-black',
    outline: 'border-2 border-[#0084FF] text-[#0084FF] hover:bg-[#0084FF] hover:text-white',
  };
  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
  };
  const accessibleLabel = ariaLabel ?? label;

  return (
    <div className={cn('flex flex-col items-start gap-2', className)}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={accessibleLabel}
        className={cn(styles.base, styles[variant], sizes[size], 'w-full')}
      >
        <MessagesSquare className={size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} aria-hidden="true" />
        {label}
      </a>
      {showProductHint && productCode && (
        <p className="text-xs leading-5 text-gray-500">Mention product code {productCode} when messaging us.</p>
      )}
    </div>
  );
}
