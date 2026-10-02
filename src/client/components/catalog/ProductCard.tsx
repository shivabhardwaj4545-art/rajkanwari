import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Product } from '../../../shared/types/index.ts';
import { useCartStore } from '../../hooks/useCartStore.ts';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addItem } = useCartStore();
  const prefersReduced = useReducedMotion();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const primaryImage = product.images.find((img) => img.isPrimary)?.imageUrl || product.images[0]?.imageUrl;

  const formattedPrice = (product.pricePaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  const formattedDiscountPrice = product.discountPricePaise
    ? (product.discountPricePaise / 100).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      })
    : null;

  const staggerDelay = Math.min(index, 8) * 0.04;

  const cardVariants = prefersReduced
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants[0];
    if (defaultVariant) {
      addItem(product.id, defaultVariant.id, 1, {
        title: product.title,
        pricePaise: product.pricePaise,
        discountPricePaise: product.discountPricePaise,
        slug: product.slug,
        size: defaultVariant.size,
        color: defaultVariant.color,
        imageUrl: primaryImage,
      });
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.2, delay: staggerDelay, ease: [0.4, 0, 0.2, 1] }}
      className="group relative bg-surface border border-border rounded-none overflow-hidden flex flex-col justify-between transition-colors duration-200"
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-surface-alt">
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          <motion.img
            src={primaryImage}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.04]"
          />
        </Link>

        {/* Heart Wishlist Overlay (Top Right matching Screenshot 1) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-12 right-12 p-8 text-text/80 hover:text-brand-crimson transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart className={`w-18 h-18 ${isWishlisted ? 'fill-brand-crimson text-brand-crimson' : ''}`} />
        </button>
      </div>

      {/* Content & ADD TO BAG button matching Screenshot 1 */}
      <div className="p-16 flex flex-col gap-8 text-left bg-surface">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-serif text-16 font-medium text-text line-clamp-1 hover:text-brand-gold transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-baseline gap-8 text-sm font-semibold text-text">
          {formattedDiscountPrice ? (
            <>
              <span className="text-brand-crimson font-bold">{formattedDiscountPrice}</span>
              <span className="text-xs text-text-muted line-through">{formattedPrice}</span>
            </>
          ) : (
            <span>{formattedPrice}</span>
          )}
        </div>

        <button
          onClick={handleQuickAdd}
          className="mt-8 w-full py-10 px-16 text-xs font-semibold tracking-wider text-text uppercase border border-border hover:bg-primary hover:text-white transition-colors duration-200 rounded-none min-h-[44px]"
        >
          ADD TO BAG
        </button>
      </div>
    </motion.div>
  );
};
