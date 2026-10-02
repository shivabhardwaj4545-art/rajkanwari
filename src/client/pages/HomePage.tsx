import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Sparkles, RotateCcw, ShieldCheck } from 'lucide-react';
import { Product } from '../../shared/types/index.ts';
import { ProductCard } from '../components/catalog/ProductCard.tsx';

// Fallback high quality products matching Screenshot 1 if API is loading/empty
const defaultFeaturedProducts: Product[] = [
  {
    id: 'prod_101',
    title: 'Embroidered Anarkali Suit',
    slug: 'embroidered-anarkali-suit',
    categoryId: 'cat_kurtas',
    categoryName: 'Kurtas & Tops',
    description: 'Graceful crimson silk anarkali suit with intricate zardozi embroidery.',
    pricePaise: 499900,
    gender: 'women',
    fabric: 'Silk Georgette',
    craft: 'Zardozi Hand Embroidery',
    isFeatured: true,
    isActive: true,
    images: [
      {
        id: 'img_1',
        productId: 'prod_101',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        displayOrder: 1,
      },
    ],
    variants: [{ id: 'var_1001', productId: 'prod_101', size: 'M', color: 'Crimson', stockQuantity: 10, sku: 'EAS-CRM-M' }],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_102',
    title: 'Printed Straight Suit Set',
    slug: 'printed-straight-suit-set',
    categoryId: 'cat_dresses',
    categoryName: 'Dresses',
    description: 'Magenta pink silk straight suit set with foil print detailing.',
    pricePaise: 349900,
    gender: 'women',
    fabric: 'Chanderi Silk',
    craft: 'Gold Foil Print',
    isFeatured: true,
    isActive: true,
    images: [
      {
        id: 'img_2',
        productId: 'prod_102',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        displayOrder: 1,
      },
    ],
    variants: [{ id: 'var_1002', productId: 'prod_102', size: 'M', color: 'Magenta', stockQuantity: 8, sku: 'PSS-MGT-M' }],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_103',
    title: 'Embroidered Kurta Set',
    slug: 'embroidered-kurta-set',
    categoryId: 'cat_kurtas',
    categoryName: 'Kurtas & Tops',
    description: 'Royal emerald green kurta set with gota patti neck embroidery.',
    pricePaise: 399900,
    gender: 'women',
    fabric: 'Raw Silk',
    craft: 'Gota Patti Work',
    isFeatured: true,
    isActive: true,
    images: [
      {
        id: 'img_3',
        productId: 'prod_103',
        imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        displayOrder: 1,
      },
    ],
    variants: [{ id: 'var_1003', productId: 'prod_103', size: 'L', color: 'Emerald Green', stockQuantity: 12, sku: 'EKS-EMG-L' }],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_104',
    title: 'Floral Printed Suit Set',
    slug: 'floral-printed-suit-set',
    categoryId: 'cat_dresses',
    categoryName: 'Dresses',
    description: 'Elegantly tailored cream floral printed suit with dupatta.',
    pricePaise: 329900,
    gender: 'women',
    fabric: 'Pure Cotton Silk',
    craft: 'Hand Block Print',
    isFeatured: true,
    isActive: true,
    images: [
      {
        id: 'img_4',
        productId: 'prod_104',
        imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf03b0?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        displayOrder: 1,
      },
    ],
    variants: [{ id: 'var_1004', productId: 'prod_104', size: 'S', color: 'Off-White', stockQuantity: 5, sku: 'FPS-OFF-S' }],
    createdAt: new Date().toISOString(),
  },
];

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const prodRes = await fetch('/api/products?isFeatured=true');
        if (prodRes.ok) {
          const pData = await prodRes.json();
          if (pData.products && pData.products.length > 0) {
            setFeaturedProducts(pData.products.slice(0, 4));
          } else {
            setFeaturedProducts(defaultFeaturedProducts);
          }
        } else {
          setFeaturedProducts(defaultFeaturedProducts);
        }
      } catch (err) {
        console.error('Failed to load homepage data, using defaults:', err);
        setFeaturedProducts(defaultFeaturedProducts);
      }
    }

    fetchData();
  }, []);

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : defaultFeaturedProducts;

  return (
    <div className="space-y-48 sm:space-y-64 pb-64 bg-bg text-text">
      {/* 1. Hero Section matching Screenshot 1 — Clean Studio Arch Backdrop (No dark/red overlays) */}
      <section className="relative overflow-hidden bg-bg border-b border-border py-40 sm:py-60 px-16 sm:px-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-32 items-center">
          {/* Left Text Column */}
          <div className="space-y-16 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-text-muted block">
              TRADITION MEETS TODAY
            </span>
            <h1 className="font-serif text-40 sm:text-56 font-bold text-text leading-[1.1]">
              Timeless <br />
              Elegance
            </h1>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed font-sans max-w-md">
              Graceful silhouettes. Rich fabrics. <br />
              For every chapter of you.
            </p>
            <div className="pt-16">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-10 bg-primary text-white text-xs font-semibold px-28 py-14 tracking-widest uppercase hover:opacity-90 transition-opacity"
              >
                EXPLORE COLLECTION <ArrowRight className="w-16 h-16" />
              </Link>
            </div>
          </div>

          {/* Right Hero Image (Clean studio arch photo without overlay) */}
          <div className="relative aspect-[4/3] sm:aspect-[14/10] overflow-hidden border border-border shadow-md">
            <img
              src="/images/hero-timeless-elegance.jpg"
              alt="Rajkanwari Timeless Elegance Collection"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* 2. Value Proposition 4-Column Bar matching Screenshot 1 */}
      <section className="max-w-7xl mx-auto px-16 sm:px-24">
        <div className="bg-surface border border-border py-24 px-16 sm:px-32 grid grid-cols-2 md:grid-cols-4 gap-24 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <div className="flex flex-col items-center text-center p-8 space-y-4">
            <Truck className="w-24 h-24 text-text stroke-[1.5]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">FREE SHIPPING</h4>
            <p className="text-[11px] text-text-muted">On orders above ₹2500</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 space-y-4 pt-16 sm:pt-8">
            <Sparkles className="w-24 h-24 text-text stroke-[1.5]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">PREMIUM QUALITY</h4>
            <p className="text-[11px] text-text-muted">Crafted with care</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 space-y-4 pt-16 sm:pt-8">
            <RotateCcw className="w-24 h-24 text-text stroke-[1.5]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">EASY RETURNS</h4>
            <p className="text-[11px] text-text-muted">Within 7 days</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 space-y-4 pt-16 sm:pt-8">
            <ShieldCheck className="w-24 h-24 text-text stroke-[1.5]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">SECURE PAYMENTS</h4>
            <p className="text-[11px] text-text-muted">Shop with confidence</p>
          </div>
        </div>
      </section>

      {/* 3. Category Department Grid matching Screenshot 1 & Image 5 */}
      <section className="max-w-7xl mx-auto px-16 sm:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          {/* Card 1: KURTAS & TOPS */}
          <div className="border border-border grid grid-cols-2 overflow-hidden aspect-[16/9] bg-surface">
            <div className="relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
                alt="Kurtas & Tops"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="bg-primary text-white p-24 sm:p-32 flex flex-col justify-center space-y-12">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold">
                KURTAS & TOPS
              </span>
              <h3 className="font-serif text-24 sm:text-32 font-bold leading-tight">
                Everyday <br /> Grace
              </h3>
              <Link
                to="/catalog?category=kurtas"
                className="inline-flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-brand-gold hover:underline pt-8"
              >
                SHOP NOW <ArrowRight className="w-14 h-14" />
              </Link>
            </div>
          </div>

          {/* Card 2: DRESSES */}
          <div className="border border-border grid grid-cols-2 overflow-hidden aspect-[16/9] bg-surface">
            <div className="relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
                alt="Dresses"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="bg-[#D8C9A9] text-text p-24 sm:p-32 flex flex-col justify-center space-y-12">
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">
                DRESSES
              </span>
              <h3 className="font-serif text-24 sm:text-32 font-bold leading-tight">
                Made for <br /> Celebrations
              </h3>
              <Link
                to="/catalog?category=dresses"
                className="inline-flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-text hover:underline pt-8"
              >
                SHOP NOW <ArrowRight className="w-14 h-14" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Collection Section matching Screenshot 1 */}
      <section className="max-w-7xl mx-auto px-16 sm:px-24 space-y-24">
        {/* Flourish Lotus Header */}
        <div className="text-center space-y-6 pt-16">
          <div className="flex items-center justify-center gap-12 text-border">
            <span className="h-[1px] w-24 bg-border"></span>
            <svg className="w-20 h-20 text-brand-gold fill-current" viewBox="0 0 24 24">
              <path d="M12 2C10.5 5 8 8 4 9c0 0 4 2 6 7 2-5 6-7 6-7-4-1-6.5-4-4-7zm0 20c-3 0-6-1.5-8-4 4 0 6.5-2 8-5 1.5 3 4 5 8 5-2 2.5-5 4-8 4z" />
            </svg>
            <span className="h-[1px] w-24 bg-border"></span>
          </div>
          <h2 className="font-serif text-32 sm:text-40 font-bold text-text">
            Featured Collection
          </h2>
          <p className="text-xs text-text-muted tracking-wide">
            Handcrafted for your most beautiful moments.
          </p>
        </div>

        {/* 4 Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-20">
          {displayProducts.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>
      </section>

      {/* 5. Festive Edit Banner matching Screenshot 1 */}
      <section className="max-w-7xl mx-auto px-16 sm:px-24">
        <div className="relative overflow-hidden border border-border aspect-[21/9] sm:aspect-[24/8] flex items-center">
          <img
            src="https://images.unsplash.com/photo-1597983073493-88cd35cf03b0?auto=format&fit=crop&w=1600&q=80"
            alt="The Festive Edit"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="relative z-10 p-24 sm:p-48 max-w-xl bg-primary/90 text-white m-16 sm:m-32 space-y-12">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-gold">
              THE FESTIVE EDIT
            </span>
            <h3 className="font-serif text-28 sm:text-36 font-bold leading-tight">
              Celebrate in Style
            </h3>
            <p className="text-xs sm:text-sm text-slate-200">
              Festive looks for every tradition.
            </p>
            <div className="pt-8">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-8 border border-white text-white text-xs font-semibold px-20 py-10 tracking-widest uppercase hover:bg-white hover:text-primary transition-colors"
              >
                EXPLORE COLLECTION <ArrowRight className="w-14 h-14" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. "Make Room For What's New — Too Rajkunwari To Blend In." Section (from Image 4) */}
      <section className="max-w-7xl mx-auto px-16 sm:px-24 py-32 text-center border-t border-b border-border bg-surface">
        <div className="max-w-2xl mx-auto space-y-16">
          <svg className="w-32 h-32 mx-auto text-brand-crimson dark:text-brand-gold fill-current" viewBox="0 0 24 24">
            <path d="M12 2C10.5 5 8 8 4 9c0 0 4 2 6 7 2-5 6-7 6-7-4-1-6.5-4-4-7zm0 20c-3 0-6-1.5-8-4 4 0 6.5-2 8-5 1.5 3 4 5 8 5-2 2.5-5 4-8 4z" />
          </svg>
          <div className="space-y-6">
            <h3 className="font-serif text-28 sm:text-36 italic text-text">
              Make Room For What's New
            </h3>
            <p className="font-serif text-36 sm:text-48 font-bold text-brand-crimson dark:text-brand-gold leading-tight">
              Too Rajkunwari To Blend In.
            </p>
          </div>
          <div className="pt-12">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-8 border border-text text-text text-xs font-semibold px-28 py-12 tracking-widest uppercase hover:bg-primary hover:text-white hover:border-primary transition-colors"
            >
              SHOP NOW <ArrowRight className="w-14 h-14" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
