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

  // Stock calculations — only show warning if low stock or out of stock
  const totalStock = product.total_stock ?? 0;
  const isOutOfStock = totalStock === 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;

  const hasDiscount = product.price.effective_discount_percent > 0;

  return (
    <article
      className="group relative flex flex-col h-full rounded-xl border border-border/80 bg-surface overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-gold/60"
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
              'group-hover:scale-[1.05]',
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
                'group-hover:scale-[1.05]',
                isHovered ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
            />
          )}
        </Link>

        {/* Refined Luxury Badges in top-left */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5 items-center">
          {product.price.applied_offer?.offer_category && (
            <span className="inline-flex items-center rounded-full bg-brand-gold text-text px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase shadow-xs">
              {product.price.applied_offer.offer_category === 'Clearance Sale' ? 'Clearance' :
               product.price.applied_offer.offer_category === 'Flash Deal' ? 'Flash Deal' :
               product.price.applied_offer.offer_category === 'Exclusive Offer' ? 'VIP Deal' :
               product.price.applied_offer.offer_category === 'Free Shipping' ? 'Free Ship' :
               product.price.applied_offer.offer_category === 'Festive Offer' ? 'Festive' :
               product.price.applied_offer.offer_category.toUpperCase()}
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center rounded-full bg-brand-crimson px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-xs">
              {formatDiscount(product.price.effective_discount_percent)}
            </span>
          )}
        </div>

        {/* Stock warning ONLY if low stock or out of stock (Never clutter with In Stock) */}
        {(isOutOfStock || isLowStock) && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-tight backdrop-blur-md ${
                isOutOfStock
                  ? 'bg-danger/20 text-danger border-danger/40'
                  : 'bg-warning/20 text-warning border-warning/40'
              }`}
            >
              <span
                className={`mr-1 h-1.5 w-1.5 rounded-full ${
                  isOutOfStock ? 'bg-danger' : 'bg-warning'
                }`}
              />
              {isOutOfStock ? 'Out of Stock' : `Only ${totalStock} left`}
            </span>
          </div>
        )}

        {/* Floating Glassmorphic Quick View Button */}
        {onQuickView && (
          <div className="absolute bottom-3 inset-x-3 z-10 transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 max-md:opacity-100 max-md:translate-y-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface/95 hover:bg-surface text-text text-xs font-semibold py-2 px-3 backdrop-blur-md border border-border/80 shadow-md hover:border-brand-gold hover:text-brand-crimson dark:hover:text-brand-gold transition-all cursor-pointer"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye size={13} className="text-brand-gold" />
              <span>Quick View</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Details ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4 bg-surface">
        <div>
          {/* Eyebrow: Category & Fabric */}
          <div className="mb-1 flex items-center justify-between text-[11px] text-text-muted">
            <span className="uppercase tracking-widest font-medium text-brand-gold text-[10px]">
              {product.category_name}
            </span>
            {product.fabric && (
              <span className="text-[11px] text-text-muted truncate max-w-[120px]">
                {product.fabric}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="line-clamp-2 text-sm font-sans font-medium leading-snug text-text transition-colors group-hover:text-brand-crimson dark:group-hover:text-brand-gold min-h-[2.5rem]">
            <Link to={`/products/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>
        </div>

        {/* Price block & offer banner */}
        <div className="mt-3 pt-2 border-t border-border/40 flex flex-col justify-end">
          <div className="flex items-baseline gap-2 flex-wrap min-h-[1.5rem]">
            {/* Final price in crimson (gold on dark) */}
            <span className="font-sans text-base font-bold text-brand-crimson dark:text-brand-gold tracking-tight">
              {formatPrice(product.price.final_price_paise)}
            </span>

            {/* Struck-through MRP */}
            {hasDiscount && (
              <span className="font-sans text-xs text-text-muted line-through font-normal">
                {formatPrice(product.price.mrp_paise)}
              </span>
            )}

            {/* Subtle discount percentage tag */}
            {hasDiscount && (
              <span className="text-[11px] font-semibold text-brand-sale">
                ({formatDiscount(product.price.effective_discount_percent)})
              </span>
            )}
          </div>

          {/* Applied active promotional offer notice */}
          {product.price.applied_offer && (
            <p className="text-[10px] font-medium text-brand-gold mt-1 truncate" title={product.price.applied_offer.name}>
              ✨ {product.price.applied_offer.name}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};
