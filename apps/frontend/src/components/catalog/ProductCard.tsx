import { Eye } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import type { ProductItem } from '@/lib/api';
import { formatDiscount, formatPrice } from '@/lib/format';

interface ProductCardProps {
  product: ProductItem;
  onQuickView?: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const DEFAULT_ETHNIC_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
  const primaryImg = product.images?.[0] || DEFAULT_ETHNIC_IMAGE;
  const secondaryImg = product.images?.[1];

  // Stock calculations
  const totalStock = product.total_stock ?? 0;
  let stockLabel = 'In Stock';
  let stockBadgeClass = 'bg-success/15 text-success border-success/30';

  if (totalStock === 0) {
    stockLabel = 'Out of Stock';
    stockBadgeClass = 'bg-danger/15 text-danger border-danger/30';
  } else if (totalStock <= 5) {
    stockLabel = `Only ${totalStock} left`;
    stockBadgeClass = 'bg-warning/15 text-warning border-warning/30';
  }

  const hasDiscount = product.price.effective_discount_percent > 0;

  return (
    <article
      className="group relative flex flex-col h-full rounded-lg border border-border bg-surface overflow-hidden transition-all duration-300 hover:shadow-md hover:border-brand-gold/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image Container ──────────────────────────────────────────────── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-alt flex-shrink-0">
        <Link to={`/products/${product.slug}`} className="block h-full w-full">
          {/* Primary image */}
          <ImageWithFallback
            src={primaryImg}
            fallbackSrc={DEFAULT_ETHNIC_IMAGE}
            alt={product.name}
            loading="lazy"
            className={[
              'h-full w-full object-cover object-top transition-transform duration-500 ease-out',
              'group-hover:scale-[1.04]',
              secondaryImg && isHovered ? 'opacity-0' : 'opacity-100',
            ].join(' ')}
          />

          {/* Secondary image for crossfade */}
          {secondaryImg && (
            <ImageWithFallback
              src={secondaryImg}
              fallbackSrc={DEFAULT_ETHNIC_IMAGE}
              alt={`${product.name} alternate view`}
              loading="lazy"
              className={[
                'absolute inset-0 h-full w-full object-cover object-top transition-all duration-500 ease-out',
                'group-hover:scale-[1.04]',
                isHovered ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
            />
          )}
        </Link>

        {/* Discount badge in top-left */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center rounded-sm bg-brand-crimson px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white uppercase shadow-sm">
              {formatDiscount(product.price.effective_discount_percent)}
            </span>
          </div>
        )}

        {/* Stock pill in top-right */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-tight backdrop-blur-md ${stockBadgeClass}`}
          >
            <span
              className={`mr-1 h-1.5 w-1.5 rounded-full ${
                totalStock === 0 ? 'bg-danger' : totalStock <= 5 ? 'bg-warning' : 'bg-success'
              }`}
            />
            {stockLabel}
          </span>
        </div>

        {/* Quick View Button (hover reveal on desktop, always visible on touch) */}
        {onQuickView && (
          <div className="absolute bottom-3 inset-x-3 z-10 transition-all duration-200 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 max-md:opacity-100 max-md:translate-y-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-md bg-surface/90 hover:bg-surface text-text text-xs font-medium py-2 px-3 backdrop-blur-sm border border-border shadow-sm hover:border-brand-gold hover:text-brand-crimson dark:hover:text-brand-gold transition-colors"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye size={14} />
              <span>Quick View</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Details ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          {/* Category & Fabric badge */}
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-text-muted">
            <span className="uppercase tracking-wider font-medium">{product.category_name}</span>
            <span className="truncate max-w-[110px]">{product.fabric}</span>
          </div>

          {/* Product Name */}
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-text transition-colors group-hover:text-brand-crimson dark:group-hover:text-brand-gold min-h-[2.5rem]">
            <Link to={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>

        {/* Price block & offer banner */}
        <div className="mt-3 pt-2 border-t border-border/40 flex flex-col justify-end">
          <div className="flex items-baseline gap-2 min-h-[1.5rem]">
            {/* Final price in crimson (gold on dark) */}
            <span className="font-sans text-base font-bold text-brand-crimson dark:text-brand-gold tracking-tight">
              {formatPrice(product.price.final_price_paise)}
            </span>

            {/* Struck-through MRP */}
            {hasDiscount && (
              <span className="font-sans text-xs text-text-muted line-through font-medium">
                {formatPrice(product.price.mrp_paise)}
              </span>
            )}
          </div>

          {/* Applied active promotional offer notice */}
          <div className="min-h-[1.25rem] mt-0.5">
            {product.price.applied_offer ? (
              <p className="text-[10px] font-medium text-brand-gold truncate">
                ✨ {product.price.applied_offer.name}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
};
