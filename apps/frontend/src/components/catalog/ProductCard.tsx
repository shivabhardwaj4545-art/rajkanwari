import { Check, Eye, Heart, ShoppingBag } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import type { ProductItem } from '@/lib/api';
import { formatDiscount, formatPrice } from '@/lib/format';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';

interface ProductCardProps {
  product: ProductItem;
  onQuickView?: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const addToCart = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const DEFAULT_ETHNIC_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
  const primaryImg = product.images?.[0] || DEFAULT_ETHNIC_IMAGE;
  const secondaryImg = product.images?.[1];

  // Stock calculations — only show warning if low stock or out of stock
  const totalStock = product.total_stock ?? 0;
  const isOutOfStock = totalStock === 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;

  const hasDiscount = product.price.effective_discount_percent > 0;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleDirectAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    // If multiple size variants exist with stock, prompt user with Quick View for accurate fit
    const availableVariants = product.variants.filter((v) => v.stock > 0);
    if (availableVariants.length > 1 && onQuickView) {
      onQuickView(product);
      return;
    }

    const targetVariant = availableVariants[0] || product.variants[0];
    if (!targetVariant) return;

    try {
      setAddingToCart(true);
      await addToCart(targetVariant.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
      openDrawer();
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

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

        {/* Refined Luxury Badges in top-left (Clean vertical stack to avoid any horizontal collision) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start max-w-[55%] pointer-events-none">
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

          {/* Stock warning pill below promotional tags */}
          {(isOutOfStock || isLowStock) && (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-tight backdrop-blur-md shadow-xs ${
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
          )}
        </div>

        {/* Top-Right Floating Actions (Vertical dock for perfect balance and zero overlap) */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5 items-center">
          <button
            type="button"
            onClick={handleToggleWishlist}
            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-surface/95 hover:bg-surface text-text backdrop-blur-md border border-border/80 shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 hover:border-brand-gold cursor-pointer"
          >
            <Heart
              size={15}
              className={`transition-colors duration-200 ${
                isInWishlist
                  ? 'fill-brand-crimson text-brand-crimson dark:fill-brand-gold dark:text-brand-gold'
                  : 'text-text-muted hover:text-brand-crimson dark:hover:text-brand-gold'
              }`}
            />
          </button>

          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              title="Quick View"
              aria-label={`Quick view ${product.name}`}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-surface/95 hover:bg-surface text-text-muted hover:text-brand-crimson dark:hover:text-brand-gold hover:border-brand-gold backdrop-blur-md border border-border/80 shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Eye size={15} />
            </button>
          )}
        </div>
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

        {/* Price block, offer notice & direct action buttons */}
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

          {/* ── Direct Action Buttons (Positioned below image and details, not covering photo) ── */}
          {/* ── Direct Add to Bag Action (Full-width, clean, and elegant) ── */}
          <div className="mt-3.5 pt-3 border-t border-border/40">
            <button
              type="button"
              disabled={isOutOfStock || addingToCart}
              onClick={handleDirectAddToCart}
              className={`w-full min-h-[42px] flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xs cursor-pointer ${
                isOutOfStock
                  ? 'bg-surface-alt text-text-muted/60 border border-border/40 cursor-not-allowed'
                  : justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-crimson hover:bg-brand-crimson/90 text-white dark:bg-brand-gold dark:text-bg dark:hover:bg-brand-gold/90 active:scale-[0.98]'
              }`}
              aria-label={`Add ${product.name} to bag`}
            >
              {justAdded ? (
                <>
                  <Check size={15} />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={15} />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
