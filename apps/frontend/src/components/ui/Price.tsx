import React from 'react';
import { formatPrice } from '@/lib/format';

export interface PriceProps {
  paise: number;
  className?: string;
  strikeThrough?: boolean;
}

/**
 * Universal Price Component for Rajkanwari.
 * Ensures consistent Indian Rupee (₹) symbol rendering with Inter tabular lining numbers
 * and prevents accidental font-serif / oldstyle figure inheritance.
 */
export const Price: React.FC<PriceProps> = ({
  paise,
  className = '',
  strikeThrough = false,
}) => {
  return (
    <span
      className={`price inline-block font-sans tabular-nums tracking-tight ${
        strikeThrough ? 'line-through text-text-muted font-normal' : ''
      } ${className}`}
      data-price={paise}
    >
      {formatPrice(paise)}
    </span>
  );
};

export default Price;
