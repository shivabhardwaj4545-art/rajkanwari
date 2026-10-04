import { motion } from 'framer-motion';
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { ProductCard } from '@/components/catalog/ProductCard';
import { QuickViewModal } from '@/components/catalog/QuickViewModal';
import type { ProductItem } from '@/lib/api';
import { fadeIn, staggerContainer } from '@/lib/motion';
import { useWishlistStore } from '@/stores/wishlist.store';

export const WishlistPage: React.FC = () => {
  const items = useWishlistStore((s) => s.items);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  return (
    <div className="min-h-screen bg-bg text-text pb-16">
      {/* ── Breadcrumb & Top Bar ────────────────────────────────────────── */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs sm:text-sm">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-text-muted hover:text-brand-crimson dark:hover:text-brand-gold transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
          <span className="text-text-muted font-medium">
            {items.length} {items.length === 1 ? 'saved piece' : 'saved pieces'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl sm:text-4xl text-text font-normal">
                My Wishlist
              </h1>
              <span className="inline-flex items-center justify-center h-7 px-2.5 rounded-full text-xs font-semibold bg-brand-crimson/10 text-brand-crimson dark:bg-brand-gold/15 dark:text-brand-gold border border-brand-crimson/20 dark:border-brand-gold/30">
                {items.length}
              </span>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Curated artisanal garments and accessories saved for your royal wardrobe.
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-danger px-3 py-2 rounded-md hover:bg-surface border border-transparent hover:border-border transition-all"
            >
              <Trash2 size={14} />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        {items.length === 0 ? (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-center py-20 px-4 max-w-md mx-auto"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-surface-alt border border-border flex items-center justify-center text-brand-crimson dark:text-brand-gold mb-6 shadow-sm">
              <Heart size={36} strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-2xl text-text font-medium mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-text-muted mb-8 leading-relaxed">
              Explore our handcrafted collection of royal ethnic wear, bridal ensembles, and everyday elegance to save your favorite treasures.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-crimson hover:bg-brand-crimson/90 text-white dark:bg-brand-gold dark:text-bg dark:hover:bg-brand-gold/90 px-8 py-3.5 text-sm font-semibold tracking-wide uppercase transition-all shadow-md active:scale-95"
            >
              <ShoppingBag size={18} />
              <span>Explore Collection</span>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Quick View Modal ──────────────────────────────────────────────── */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
