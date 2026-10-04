import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight, Heart, RefreshCw, ShoppingBag, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type { ProductItem, ProductVariant } from '@/lib/api';
import { formatDiscount, formatPrice } from '@/lib/format';
import { fadeIn, scaleIn } from '@/lib/motion';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { Portal } from '@/components/ui/Portal';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';

interface QuickViewModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const addToCart = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const isInWishlist = useWishlistStore((s) => (product ? s.isInWishlist(product.id) : false));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const modalRef = useFocusTrap<HTMLDivElement>({
    isOpen: !!product,
    onClose,
    autoFocusFirst: false,
  });

  // Initialize selected size and color when product opens
  useEffect(() => {
    if (product && product.variants.length > 0) {
      const inStockVar = product.variants.find((v) => v.stock > 0) || product.variants[0];
      setSelectedSize(inStockVar.size);
      setSelectedColor(inStockVar.color);
      setActiveImgIndex(0);
    }
  }, [product]);

  if (!product) return null;

  // Extract unique sizes and colors
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const colors = Array.from(new Set(product.variants.map((v) => v.color)));

  // Find currently matched variant
  const currentVariant: ProductVariant | undefined = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const isCurrentInStock = currentVariant ? currentVariant.stock > 0 : false;
  const currentStock = currentVariant?.stock ?? 0;

  const handleAddToCart = async () => {
    if (!currentVariant || !isCurrentInStock || addingToCart) return;
    setAddingToCart(true);
    try {
      await addToCart(currentVariant.id, 1);
      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
      }, 1800);
      openDrawer();
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist(product);
  };

  return (
    <AnimatePresence>
      <Portal>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quickview-title"
          className="relative z-10 w-full max-w-3xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden focus:outline-none"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-20 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-surface/80 hover:bg-surface border border-border text-text-muted hover:text-text transition-colors shadow-sm"
          >
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery / Images */}
            <div className="relative bg-surface-alt aspect-[3/4] flex flex-col justify-between p-4">
              <div className="relative h-full w-full overflow-hidden rounded-lg">
                <img
                  src={product.images[activeImgIndex] || product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover object-top"
                />
              </div>

              {/* Thumbnails if > 1 image */}
              {product.images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImgIndex(idx)}
                      className={`h-14 w-11 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                        activeImgIndex === idx ? 'border-brand-gold' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="h-full w-full object-cover object-top" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info and Variant Selection */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
                  {product.category_name}
                </span>

                <h2 id="quickview-title" className="font-serif text-xl font-semibold text-text mt-1">
                  {product.name}
                </h2>

                {/* Price block */}
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="font-sans text-2xl font-bold text-brand-crimson dark:text-brand-gold tracking-tight">
                    {formatPrice(product.price.final_price_paise)}
                  </span>
                  {product.price.effective_discount_percent > 0 && (
                    <>
                      <span className="font-sans text-sm text-text-muted line-through font-medium">
                        {formatPrice(product.price.mrp_paise)}
                      </span>
                      <span className="rounded bg-brand-crimson/15 text-brand-crimson dark:text-brand-gold text-xs font-semibold px-2 py-0.5">
                        {formatDiscount(product.price.effective_discount_percent)}
                      </span>
                    </>
                  )}
                </div>

                {product.price.applied_offer && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-brand-gold/15 px-2.5 py-1 text-xs font-semibold text-text border border-brand-gold/40">
                    <span>✨ {product.price.applied_offer.offer_category ? `${product.price.applied_offer.offer_category}: ` : ''}{product.price.applied_offer.name}</span>
                  </div>
                )}

                <p className="mt-3 text-xs text-text-muted line-clamp-3 leading-relaxed">
                  {product.description}
                </p>

                {/* Color Selector */}
                <div className="mt-5">
                  <label className="block text-xs font-medium text-text mb-2">
                    Colour: <span className="font-semibold text-brand-crimson dark:text-brand-gold">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => {
                      // Check if any variant with this color is in stock
                      const hasStock = product.variants.some((v) => v.color === c && v.stock > 0);
                      const isSelected = selectedColor === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          disabled={!hasStock}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                            isSelected
                              ? 'border-brand-crimson bg-brand-crimson text-white shadow-sm'
                              : hasStock
                              ? 'border-border bg-surface text-text hover:border-brand-gold'
                              : 'border-border/40 bg-surface-alt/50 text-text-muted/40 cursor-not-allowed line-through'
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="mt-4">
                  <label className="block text-xs font-medium text-text mb-2">
                    Size: <span className="font-semibold text-brand-crimson dark:text-brand-gold">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => {
                      // Check if this size + current color has stock
                      const matchingVar = product.variants.find(
                        (v) => v.size === s && v.color === selectedColor
                      );
                      const hasStock = matchingVar ? matchingVar.stock > 0 : false;
                      const isSelected = selectedSize === s;

                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={!hasStock}
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-[44px] h-9 px-3 rounded-md text-xs font-medium border transition-all ${
                            isSelected
                              ? 'border-brand-gold bg-brand-gold/15 text-text font-semibold ring-1 ring-brand-gold'
                              : hasStock
                              ? 'border-border bg-surface text-text hover:border-brand-gold'
                              : 'border-border/40 bg-surface-alt/40 text-text-muted/40 cursor-not-allowed line-through'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Stock Feedback */}
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      isCurrentInStock
                        ? currentStock <= 5
                          ? 'bg-warning animate-pulse'
                          : 'bg-success'
                        : 'bg-danger'
                    }`}
                  />
                  <span className="text-xs font-medium text-text">
                    {isCurrentInStock
                      ? currentStock <= 5
                        ? `Hurry, only ${currentStock} left in stock!`
                        : 'In stock — ready to ship'
                      : 'Selected combination is currently out of stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!isCurrentInStock || addingToCart}
                    className={`flex-1 min-h-[48px] px-6 py-3 rounded-lg text-sm font-semibold tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                      justAdded
                        ? 'bg-success text-white'
                        : isCurrentInStock
                        ? 'bg-brand-crimson hover:bg-brand-crimson/90 text-white dark:bg-brand-gold dark:text-bg dark:hover:bg-brand-gold/90 active:scale-[0.99]'
                        : 'bg-surface-alt text-text-muted cursor-not-allowed opacity-60'
                    }`}
                  >
                    {addingToCart ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : justAdded ? (
                      <>
                        <Check size={18} className="animate-in zoom-in-50 duration-200" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        <span>{isCurrentInStock ? 'Add to Shopping Bag' : 'Out of Stock'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    aria-label={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    className={`min-h-[48px] min-w-[48px] rounded-lg border flex items-center justify-center transition-all duration-200 ${
                      isInWishlist
                        ? 'border-brand-crimson bg-brand-crimson/10 text-brand-crimson dark:border-brand-gold dark:bg-brand-gold/15 dark:text-brand-gold'
                        : 'border-border bg-surface text-text-muted hover:text-brand-crimson dark:hover:text-brand-gold hover:border-brand-gold'
                    }`}
                    title={isInWishlist ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  >
                    <Heart
                      size={20}
                      className={isInWishlist ? 'fill-brand-crimson dark:fill-brand-gold text-brand-crimson dark:text-brand-gold' : ''}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    to={`/products/${product.slug}`}
                    onClick={onClose}
                    className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-text-muted hover:text-brand-crimson dark:hover:text-brand-gold transition-colors py-1.5"
                  >
                    <span>View complete specifications & styling</span>
                    <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[36px] px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text rounded-md hover:bg-surface-alt transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Portal>
  </AnimatePresence>
  );
};
