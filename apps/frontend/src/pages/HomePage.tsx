import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  Sparkles,
  Twitter,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { ProductCard } from '@/components/catalog/ProductCard';
import { QuickViewModal } from '@/components/catalog/QuickViewModal';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  api,
  type BannerItem,
  type CategoryItem,
  type OfferItem,
  type ProductItem,
} from '@/lib/api';

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [activeOffers, setActiveOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const carouselRef = useRef<HTMLDivElement>(null);

  // Offer Strip Carousel State
  const [offerIndex, setOfferIndex] = useState(0);

  // Quick View modal state
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }
    setNewsletterError('');
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  // Fetch home page data
  useEffect(() => {
    let mounted = true;

    async function loadHomeData() {
      try {
        const [bannersRes, categoriesRes, productsRes, offersRes] = await Promise.allSettled([
          api.getActiveBanners(),
          api.getCategories(),
          api.getProducts({ is_featured: true, limit: 8 }),
          api.getActiveOffers(),
        ]);

        if (mounted) {
          const loadedBanners = bannersRes.status === 'fulfilled' ? bannersRes.value.data || [] : [];
          const loadedCategories = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data || [] : [];
          const loadedProducts = productsRes.status === 'fulfilled' ? productsRes.value.data || [] : [];
          const loadedOffers = offersRes.status === 'fulfilled' ? offersRes.value.data || [] : [];

          const fallbackBanners: BannerItem[] = [
            {
              id: 'fallback_01',
              title: 'Heritage Handloom Festive Edit',
              subtitle: 'Graceful emerald green suits, woven zari brocades & artisan dupattas for timeless celebrations.',
              image_url: '/images/banner_festive_trio.jpg',
              cta_text: 'Explore Collection',
              cta_link: '/catalog?occasion=Festive',
              text_alignment: 'left',
              display_order: 1,
            },
            {
              id: 'fallback_02',
              title: "Make Room For What's New",
              subtitle: 'Too Rajkunwari To Blend In. Discover our newest handcrafted arrivals & festive edits.',
              image_url: '/images/hero-timeless-elegance.jpg',
              cta_text: 'Shop New Arrivals',
              cta_link: '/catalog?sort=newest',
              text_alignment: 'right',
              display_order: 2,
            },
            {
              id: 'fallback_03',
              title: 'The Royal Anarkali & Suit Edit',
              subtitle: 'Scarlet red silk flared Anarkalis & hand-embroidered heritage couture crafted for royalty.',
              image_url: '/images/banner_scarlet_anarkali.jpg',
              cta_text: 'Shop Anarkalis & Suits',
              cta_link: '/catalog?category=anarkalis',
              text_alignment: 'right',
              display_order: 3,
            },
          ];

          setBanners(loadedBanners.length > 0 ? loadedBanners : fallbackBanners);
          setCategories(loadedCategories);
          setFeaturedProducts(loadedProducts);
          setActiveOffers(loadedOffers);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadHomeData();
    return () => {
      mounted = false;
    };
  }, []);

  const totalSlides = banners.length;

  const nextSlide = useCallback(() => {
    if (totalSlides > 0) {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides > 0) {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  }, [totalSlides]);

  // 3s auto-advance hero carousel
  useEffect(() => {
    if (prefersReducedMotion || totalSlides <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 3000);

    return () => clearInterval(timer);
  }, [prefersReducedMotion, totalSlides]);

  // Auto-scroll Category slider every 3 seconds
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion || categories.length <= 1) return;
    const interval = setInterval(() => {
      if (categoryScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          categoryScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          categoryScrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [categories, prefersReducedMotion]);

  // Auto-scroll Featured Products slider every 3 seconds
  const productScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion || featuredProducts.length <= 1) return;
    const interval = setInterval(() => {
      if (productScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = productScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          productScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          productScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [featuredProducts, prefersReducedMotion]);

  // Manual scroll controls for Category and Featured Product carousels
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollProducts = (direction: 'left' | 'right') => {
    if (productScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      productScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Announcements / Offers Carousel List
  const announcementItems = useMemo(() => {
    if (activeOffers && activeOffers.length > 0) {
      return activeOffers.map((o) => {
        const cat = o.offer_category || 'Festive Offer';
        let badge = '🪔 SPECIAL OFFER';
        if (cat === 'Clearance Sale') badge = '⚡ CLEARANCE SALE';
        else if (cat === 'Flash Deal') badge = '🔥 FLASH DEAL';
        else if (cat === 'Exclusive Offer') badge = '💎 VIP EXCLUSIVE';
        else if (cat === 'Free Shipping') badge = '🚚 FREE SHIPPING';
        else if (cat === 'First Order') badge = '🎁 WELCOME SPECIAL';
        else if (cat === 'Combo Deal') badge = '📦 COMBO SAVINGS';
        else badge = '🪔 FESTIVE OFFER';

        let discountText = '';
        if (o.type === 'percent') {
          discountText = `Enjoy ${o.value}% off`;
        } else if (o.type === 'flat') {
          discountText = `Flat ₹${o.value / 100} discount`;
        } else if (o.type === 'free_shipping') {
          discountText = `Free express doorstep shipping`;
        } else {
          discountText = `Special promotional pricing`;
        }

        const minCartText = o.min_cart_value > 0 ? ` on orders above ₹${(o.min_cart_value / 100).toLocaleString('en-IN')}` : '';

        return {
          badge,
          text: `${o.name} — ${discountText}${minCartText}!`,
          code: o.code ? `Use Code: ${o.code}` : undefined,
          link: '/catalog',
          linkText: 'Shop Special Offers',
        };
      });
    }
    return [
      {
        badge: '🪔 FESTIVE OFFER',
        text: 'Curated Heritage Edit — Enjoy 10% off on handloom Anarkalis, Suits & Rajputi Poshaks!',
        code: 'Use Code: FESTIVE10',
        link: '/catalog?occasion=Festive',
        linkText: 'Shop Collection',
      },
      {
        badge: '🚚 FREE EXPRESS SHIPPING',
        text: 'Complimentary Pan-India shipping on all orders over ₹4,999. Fast 3-5 day delivery!',
        code: undefined,
        link: '/policies/shipping',
        linkText: 'Learn More',
      },
      {
        badge: '💎 BENGALURU FLAGSHIP BOUTIQUE',
        text: 'Visit us live at 100 Feet Rd, Indiranagar. Custom bridal tailoring & styling available!',
        code: undefined,
        link: '/policies/contact',
        linkText: 'Find Boutique',
      },
    ];
  }, [activeOffers]);

  // Auto-slide offer ticker every 4 seconds
  useEffect(() => {
    if (announcementItems.length <= 1) return;
    const timer = setInterval(() => {
      setOfferIndex((prev) => (prev + 1) % announcementItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcementItems.length]);

  const currentBanner = banners[currentSlide];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── 1. Full-Bleed Hero Banner Section ─────────────────────────────────── */}
      <section
        ref={carouselRef}
        aria-label="Promotional Highlights"
        className="relative w-full overflow-hidden bg-brand-crimson aspect-[16/9] sm:aspect-[21/9] min-h-[480px] max-h-[680px] m-0 p-0 border-0"
      >
        {banners.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner?.id || currentSlide}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1.0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {/* Full-bleed Animated Background Image (Ken Burns 3s Smooth Zoom & Pan) */}
              {(() => {
                const rawUrl = currentBanner?.image_url;
                let resolvedUrl = '/images/banner_festive_trio.jpg';
                if (rawUrl) {
                  if (rawUrl.startsWith('http') || rawUrl.startsWith('/')) {
                    resolvedUrl = rawUrl;
                  } else if (rawUrl.startsWith('media_')) {
                    resolvedUrl = `/uploads/${rawUrl}`;
                  } else {
                    resolvedUrl = `/${rawUrl}`;
                  }
                }

                return (
                  <motion.img
                    key={`img-${currentBanner?.id || currentSlide}`}
                    initial={{ scale: prefersReducedMotion ? 1 : 1.12, opacity: 0.85 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 3, ease: 'easeOut' }}
                    src={resolvedUrl}
                    alt={currentBanner?.title || 'Rajkanwari House of Ethnic Wear'}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('banner_festive_trio.jpg')) {
                        target.src = '/images/banner_festive_trio.jpg';
                      }
                    }}
                    className={`h-full w-full object-cover ${
                      currentBanner?.image_url?.includes('scarlet_anarkali')
                        ? 'object-left-top'
                        : 'object-center'
                    }`}
                  />
                );
              })()}

              {/* Content Overlay with Gradient Backdrop & Animated Entrances */}
              {(() => {
                const isRightAligned = currentBanner?.text_alignment
                  ? currentBanner.text_alignment === 'right'
                  : (currentSlide % 2 === 1 ||
                     currentBanner?.image_url?.includes('scarlet_anarkali') ||
                     currentBanner?.image_url?.includes('whats_new'));

                const textColorVal = currentBanner?.text_color || 'white';
                const gradStyle = currentBanner?.gradient_style || 'dark_vignette';
                const bannerCat = currentBanner?.offer_category || 'None';

                let gradientClass = 'from-black/45 via-black/20 to-transparent';
                if (gradStyle === 'light_pearl') {
                  gradientClass = isRightAligned ? 'from-transparent via-white/30 to-white/75' : 'from-white/75 via-white/30 to-transparent';
                } else if (gradStyle === 'crimson_gold') {
                  gradientClass = isRightAligned ? 'from-transparent via-[#8E2731]/40 to-[#4A0D14]/80' : 'from-[#4A0D14]/80 via-[#8E2731]/40 to-transparent';
                } else if (gradStyle === 'emerald_velvet') {
                  gradientClass = isRightAligned ? 'from-transparent via-[#1B4332]/40 to-[#081C15]/80' : 'from-[#081C15]/80 via-[#1B4332]/40 to-transparent';
                } else if (gradStyle === 'festive_shimmer') {
                  gradientClass = isRightAligned ? 'from-transparent via-[#705510]/40 to-[#2A1F02]/80' : 'from-[#2A1F02]/80 via-[#705510]/40 to-transparent';
                } else if (gradStyle === 'sunset_amber') {
                  gradientClass = isRightAligned ? 'from-transparent via-[#7F381B]/40 to-[#381508]/80' : 'from-[#381508]/80 via-[#7F381B]/40 to-transparent';
                } else if (gradStyle === 'none' || gradStyle === 'no_overlay') {
                  gradientClass = 'hidden bg-transparent';
                } else {
                  gradientClass = isRightAligned ? 'from-transparent via-black/20 to-black/45' : 'from-black/45 via-black/20 to-transparent';
                }

                let textStyle: React.CSSProperties = { color: '#FFFFFF', textShadow: '0 2px 14px rgba(0,0,0,0.95)' };
                if (textColorVal.startsWith('#')) {
                  textStyle = { color: textColorVal, textShadow: '0 2px 12px rgba(0,0,0,0.9)' };
                } else if (textColorVal === 'dark') {
                  textStyle = { color: '#2D2A24', textShadow: '0 1px 6px rgba(255,255,255,0.85)' };
                } else if (textColorVal === 'gold') {
                  textStyle = { color: '#D4AF37', textShadow: '0 2px 12px rgba(0,0,0,0.9)' };
                }

                return (
                  <>
                    {/* Soft ambient vignette customized for text legibility */}
                    {gradStyle !== 'none' && gradStyle !== 'no_overlay' && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${gradientClass} pointer-events-none`}
                      />
                    )}

                    <div className="absolute inset-0 flex items-center z-10">
                      <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-16">
                        <div
                          className={`max-w-xl space-y-3 sm:space-y-4 flex flex-col ${
                            isRightAligned ? 'ml-auto text-right items-end' : 'mr-auto text-left items-start'
                          }`}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className={isRightAligned ? 'text-right' : 'text-left'}
                          >
                            {bannerCat !== 'None' && (
                              <span className="inline-block px-3 py-1 mb-2 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/40 text-xs font-extrabold uppercase tracking-widest shadow-sm">
                                {bannerCat === 'Clearance Sale' ? '⚡ CLEARANCE SALE' :
                                 bannerCat === 'Flash Deal' ? '🔥 FLASH DEAL' :
                                 bannerCat === 'Exclusive Offer' ? '💎 VIP EXCLUSIVE' :
                                 bannerCat === 'Free Shipping' ? '🚚 FREE SHIPPING' :
                                 bannerCat === 'First Order' ? '🎁 WELCOME SPECIAL' :
                                 bannerCat === 'Combo Deal' ? '📦 COMBO SAVINGS' :
                                 bannerCat === 'Festive Offer' ? '🪔 FESTIVE OFFER' :
                                 `✨ ${bannerCat.toUpperCase()}`}
                              </span>
                            )}
                            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-brand-gold block [text-shadow:_0_1px_8px_rgba(0,0,0,0.9)]">
                              RAJKANWARI • CURATED STYLE
                            </span>
                            <motion.h1
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: 0.25 }}
                              className="font-serif text-2xl sm:text-4xl lg:text-6xl font-normal leading-[1.15] tracking-tight mt-1.5 mb-2 sm:mb-3"
                              style={textStyle as any}
                            >
                              {currentBanner?.title || 'Timeless Elegance'}
                            </motion.h1>
                          </motion.div>

                          {currentBanner?.subtitle && (
                            <motion.p
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                              className={`text-xs sm:text-base font-sans leading-relaxed font-medium max-w-lg text-white/95 [text-shadow:_0_1px_10px_rgba(0,0,0,0.9)] ${
                                isRightAligned ? 'ml-auto text-right' : 'mr-auto text-left'
                              }`}
                            >
                              {currentBanner.subtitle}
                            </motion.p>
                          )}

                          <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.55 }}
                            className={`pt-2 sm:pt-3 w-full flex ${isRightAligned ? 'justify-end' : 'justify-start'}`}
                          >
                            <Link
                              to={currentBanner?.cta_link || '/catalog'}
                              className="inline-flex items-center gap-2 rounded-full bg-brand-crimson hover:opacity-90 text-white px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xl hover:shadow-2xl active:scale-95 border border-white/20"
                            >
                              <span>{currentBanner?.cta_text || 'Explore Collection'}</span>
                              <ArrowRight size={15} />
                            </Link>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-alt">
            <Skeleton className="h-full w-full" />
          </div>
        )}

        {/* Carousel Navigation (Arrows & Indicators) */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 hover:bg-surface text-text border border-border backdrop-blur-sm transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 hover:bg-surface text-text border border-border backdrop-blur-sm transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'w-8 bg-brand-primary' : 'w-2 bg-text/30'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── 2. Active Offer & Announcement Carousel Strip with Gold Shimmer Sweep ── */}
      <section
        aria-label="Special Offers & Announcements Carousel"
        className="gold-shimmer-sweep relative w-full bg-brand-crimson text-white py-3 px-4 border-b border-brand-gold/40 shadow-inner select-none m-0 overflow-hidden"
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-2 px-1 sm:px-4">
          <button
            type="button"
            onClick={() => setOfferIndex((prev) => (prev - 1 + announcementItems.length) % announcementItems.length)}
            aria-label="Previous announcement"
            className="hidden sm:block p-1 rounded-full text-brand-gold/80 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex-1 overflow-hidden px-1 sm:px-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={offerIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-center text-xs sm:text-sm font-medium"
              >
                <span className="font-bold text-brand-gold uppercase tracking-wider text-[11px] sm:text-xs">
                  {announcementItems[offerIndex].badge}:
                </span>
                <span className="text-[11px] sm:text-xs">{announcementItems[offerIndex].text}</span>
                {announcementItems[offerIndex].code && (
                  <span className="bg-brand-gold/20 border border-brand-gold/40 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold text-brand-gold uppercase">
                    {announcementItems[offerIndex].code}
                  </span>
                )}
                <Link
                  to={announcementItems[offerIndex].link}
                  className="ml-1 font-bold underline underline-offset-4 hover:text-brand-gold transition-colors inline-flex items-center gap-0.5 text-[11px] sm:text-xs"
                >
                  <span>{announcementItems[offerIndex].linkText}</span>
                  <ArrowRight size={12} />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setOfferIndex((prev) => (prev + 1) % announcementItems.length)}
            aria-label="Next announcement"
            className="hidden sm:block p-1 rounded-full text-brand-gold/80 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* ── 3. Shop by Category Strip (Auto-scrolls every 3s) ───────────────── */}
      <section aria-labelledby="shop-by-category-title" className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-border">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">
              Handpicked Collections
            </span>
            <h2 id="shop-by-category-title" className="font-serif text-3xl md:text-4xl text-text mt-1">
              Shop by Category
            </h2>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-4">
            <Link
              to="/catalog"
              className="text-xs font-semibold uppercase tracking-wider text-brand-crimson dark:text-brand-gold hover:underline flex items-center gap-1"
            >
              <span>View All Categories</span>
              <ArrowRight size={14} />
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 ml-1 border-l border-border pl-3">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                aria-label="Scroll categories left"
                className="p-1.5 rounded-full border border-border bg-surface text-text hover:bg-surface-alt hover:text-brand-crimson dark:hover:text-brand-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                aria-label="Scroll categories right"
                className="p-1.5 rounded-full border border-border bg-surface text-text hover:bg-surface-alt hover:text-brand-crimson dark:hover:text-brand-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Auto-scrolling Category Carousel */}
        <div
          ref={categoryScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x"
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/catalog?category=${category.slug}`}
              className="group relative flex flex-col justify-between flex-shrink-0 w-[180px] sm:w-[220px] rounded-xl overflow-hidden bg-surface border border-border transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold hover:shadow-lg snap-start"
            >
              {/* Category Image */}
              <div className="aspect-[4/5] w-full overflow-hidden bg-surface-alt">
                <img
                  src={category.image_url}
                  alt={category.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Category Card Footer */}
              <div className="p-3 text-center flex-1 flex flex-col justify-center">
                <h3 className="text-sm font-semibold text-text group-hover:text-brand-crimson dark:group-hover:text-brand-gold transition-colors">
                  {category.name}
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {category.product_count} designs
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. Featured Products Carousel (Auto-scrolls every 3s) ─────────────── */}
      <section aria-labelledby="featured-products-title" className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-border">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">
              Artisan Masterpieces
            </span>
            <h2 id="featured-products-title" className="font-serif text-3xl md:text-4xl text-text mt-1">
              Featured Creations
            </h2>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-4">
            <Link
              to="/catalog?sort=newest"
              className="text-xs font-semibold uppercase tracking-wider text-brand-crimson dark:text-brand-gold hover:underline flex items-center gap-1"
            >
              <span>Explore Entire Catalog</span>
              <ArrowRight size={14} />
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 ml-1 border-l border-border pl-3">
              <button
                type="button"
                onClick={() => scrollProducts('left')}
                aria-label="Scroll featured products left"
                className="p-1.5 rounded-full border border-border bg-surface text-text hover:bg-surface-alt hover:text-brand-crimson dark:hover:text-brand-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollProducts('right')}
                aria-label="Scroll featured products right"
                className="p-1.5 rounded-full border border-border bg-surface text-text hover:bg-surface-alt hover:text-brand-crimson dark:hover:text-brand-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Auto-scrolling Featured Products Carousel */}
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3 w-[260px] flex-shrink-0">
                <Skeleton className="aspect-[4/5] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={productScrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x"
          >
            {featuredProducts.map((product) => (
              <div key={product.id} className="w-[240px] sm:w-[280px] flex-shrink-0 snap-start">
                <ProductCard
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 5. Subscribe Newsletter Section (Matching Reference Design) ────── */}
      <section
        aria-label="Subscribe Newsletter"
        className="w-full bg-surface-alt border-t border-border py-12 lg:py-16 overflow-hidden relative mt-16 mb-0"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Decorative Floating Flat-lay Image */}
          <div className="hidden lg:block lg:w-1/4 flex-shrink-0 relative">
            {/* Animated Ambient Aura */}
            {!prefersReducedMotion && (
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.25, 0.5, 0.25],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-brand-gold/30 via-brand-crimson/20 to-brand-gold/30 blur-xl z-0"
              />
            )}

            {/* Main Floating Image Container */}
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      y: [0, -12, 0],
                      rotate: [0, 1.5, 0, -1.5, 0],
                    }
              }
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative z-10 aspect-square w-full max-w-[260px] mx-auto overflow-hidden rounded-2xl shadow-xl border border-border/80 bg-surface group"
            >
              <img
                src="/images/newsletter_ethnic_flatlay.jpg"
                alt="Rajkanwari Luxury Accessories"
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                loading="lazy"
              />

              {/* Shimmer Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 pointer-events-none" />
            </motion.div>

            {/* Floating Accessory Badge #1 */}
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      y: [0, -8, 0],
                      x: [0, 4, 0],
                    }
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4,
              }}
              className="absolute -top-3 -left-3 z-20 rounded-full bg-white/95 dark:bg-surface/95 border border-brand-gold/60 px-3 py-1 text-[10px] font-bold text-brand-crimson dark:text-brand-gold shadow-lg backdrop-blur-md flex items-center gap-1.5"
            >
              <span className="h-2 w-2 rounded-full bg-brand-gold animate-ping" />
              <span>Pure Tissue Silk</span>
            </motion.div>

            {/* Floating Accessory Badge #2 */}
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      y: [0, 8, 0],
                      x: [0, -4, 0],
                    }
              }
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute -bottom-3 -right-3 z-20 rounded-full bg-white/95 dark:bg-surface/95 border border-brand-crimson/40 px-3 py-1 text-[10px] font-bold text-brand-crimson dark:text-brand-gold shadow-lg backdrop-blur-md flex items-center gap-1.5"
            >
              <Sparkles size={12} />
              <span>Royal Accessories</span>
            </motion.div>
          </div>

          {/* Center Newsletter Form & Information */}
          <div className="w-full lg:w-2/4 text-center max-w-xl mx-auto space-y-5 relative z-10">
            {/* Envelope Badge */}
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white dark:bg-surface border border-brand-crimson/30 text-brand-crimson dark:text-brand-gold shadow-sm mx-auto">
              <Mail size={26} strokeWidth={1.5} />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold uppercase tracking-wider text-text font-sans">
                SUBSCRIBE NEWSLETTER
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans max-w-md mx-auto">
                Join our private community of Rajkanwari. We'll send you curated product updates once a month.
              </p>
            </div>

            {/* Subscription Form */}
            {newsletterSubscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Thank you for subscribing! Welcome to the Rajkanwari community.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2 max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0 rounded-md overflow-hidden border border-border bg-white dark:bg-surface shadow-sm focus-within:ring-2 focus-within:ring-brand-crimson">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterError) setNewsletterError('');
                    }}
                    placeholder="Enter Your Email Here..."
                    className="w-full px-4 py-3 text-xs sm:text-sm text-text bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-text-muted/60"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex-shrink-0 px-6 py-3 bg-brand-crimson hover:opacity-90 text-white text-xs sm:text-sm font-semibold tracking-wider transition-colors uppercase whitespace-nowrap cursor-pointer"
                  >
                    Subscribe Now
                  </button>
                </div>
                {newsletterError && (
                  <p className="text-[11px] text-brand-crimson text-left px-1 font-medium">{newsletterError}</p>
                )}
              </form>
            )}

            {/* Social Media Links */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="h-9 w-9 rounded-full bg-white dark:bg-surface text-text-muted hover:text-brand-crimson dark:hover:text-brand-gold border border-border flex items-center justify-center transition-colors shadow-sm"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="h-9 w-9 rounded-full bg-white dark:bg-surface text-text-muted hover:text-brand-crimson dark:hover:text-brand-gold border border-border flex items-center justify-center transition-colors shadow-sm"
              >
                <Twitter size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-9 w-9 rounded-full bg-white dark:bg-surface text-text-muted hover:text-brand-crimson dark:hover:text-brand-gold border border-border flex items-center justify-center transition-colors shadow-sm"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="h-9 w-9 rounded-full bg-white dark:bg-surface text-text-muted hover:text-brand-crimson dark:hover:text-brand-gold border border-border flex items-center justify-center transition-colors shadow-sm"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Right Decorative Floating Model Image */}
          <div className="hidden lg:block lg:w-1/4 flex-shrink-0 relative">
            {/* Animated Ambient Aura */}
            {!prefersReducedMotion && (
              <motion.div
                animate={{
                  scale: [1.05, 1, 1.05],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -inset-2 rounded-2xl bg-gradient-to-bl from-brand-crimson/25 via-brand-gold/25 to-brand-crimson/20 blur-xl z-0"
              />
            )}

            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      y: [-8, 8, -8],
                      rotate: [0, -1.5, 0, 1.5, 0],
                    }
              }
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="relative z-10 aspect-[3/4] w-full max-w-[240px] mx-auto overflow-hidden rounded-2xl shadow-xl border border-border/80 bg-surface group"
            >
              <img
                src="/images/newsletter_model_portrait.jpg"
                alt="Rajkanwari Brand Ambassador"
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                loading="lazy"
              />

              {/* Shimmer Overlay */}
              <div className="absolute inset-0 bg-gradient-to-bl from-black/20 via-transparent to-white/20 pointer-events-none" />
            </motion.div>

            {/* Floating Model Badge */}
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      y: [0, -6, 0],
                    }
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.8,
              }}
              className="absolute -top-3 -right-2 z-20 rounded-full bg-white/95 dark:bg-surface/95 border border-brand-crimson/50 px-3 py-1 text-[10px] font-bold text-brand-crimson dark:text-brand-gold shadow-lg backdrop-blur-md"
            >
              <span>Bridal Couture</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 6. Quick View Modal ────────────────────────────────────────────── */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
