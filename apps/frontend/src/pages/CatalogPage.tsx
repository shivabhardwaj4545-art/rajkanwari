import { motion } from 'framer-motion';
import { ArrowUpDown, Filter, RotateCcw } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { FilterSidebar, type FilterState } from '@/components/catalog/FilterSidebar';
import { MobileFilterDrawer } from '@/components/catalog/MobileFilterDrawer';
import { ProductCard } from '@/components/catalog/ProductCard';
import { QuickViewModal } from '@/components/catalog/QuickViewModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { api, type CategoryItem, type ProductItem } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { staggerContainer, staggerItem } from '@/lib/motion';

const SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Biggest Discount', value: 'discount_desc' },
];

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeOffers, setActiveOffers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mobile bottom sheet drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Quick View modal state
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  // Extract filter values from URL search params
  const currentCategory = searchParams.get('category') || undefined;
  const currentGender = searchParams.get('gender') || undefined;
  const currentOccasion = searchParams.get('occasion') || undefined;
  const currentSort = searchParams.get('sort') || 'newest';
  const currentOfferId = searchParams.get('offer_id') || undefined;
  const currentOfferCategory = searchParams.get('offer_category') || undefined;
  const currentBannerId = searchParams.get('banner_id') || undefined;
  const currentMinPrice = searchParams.get('min_price')
    ? parseInt(searchParams.get('min_price')!, 10)
    : undefined;
  const currentMaxPrice = searchParams.get('max_price')
    ? parseInt(searchParams.get('max_price')!, 10)
    : undefined;
  const currentMinDiscount = searchParams.get('min_discount')
    ? parseInt(searchParams.get('min_discount')!, 10)
    : undefined;
  const currentInStock = searchParams.get('in_stock') === 'true';

  const filters: FilterState = useMemo(
    () => ({
      category: currentCategory,
      gender: currentGender,
      occasion: currentOccasion,
      min_price: currentMinPrice,
      max_price: currentMaxPrice,
      min_discount: currentMinDiscount,
      in_stock: currentInStock,
    }),
    [
      currentCategory,
      currentGender,
      currentOccasion,
      currentMinPrice,
      currentMaxPrice,
      currentMinDiscount,
      currentInStock,
    ]
  );

  // Count active applied filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.gender && filters.gender !== 'all') count++;
    if (filters.occasion) count++;
    if (filters.min_price || filters.max_price) count++;
    if (filters.min_discount) count++;
    if (filters.in_stock) count++;
    if (currentOfferId || currentOfferCategory) count++;
    return count;
  }, [filters, currentOfferId, currentOfferCategory]);

  // Fetch categories and active offers list on mount
  useEffect(() => {
    api
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error('Failed to load categories:', err));

    api
      .getActiveOffers()
      .then((res) => setActiveOffers(res.data || []))
      .catch((err) => console.error('Failed to load offers:', err));
  }, []);

  // Details for current promotional offer if clicked via banner or hero slide
  const activeOfferDetail = useMemo(() => {
    if (currentOfferId) {
      return activeOffers.find((o) => o.id === currentOfferId);
    }
    if (currentOfferCategory && currentOfferCategory !== 'all') {
      return activeOffers.find(
        (o) => (o.offer_category || '').toLowerCase() === currentOfferCategory.toLowerCase()
      );
    }
    return undefined;
  }, [activeOffers, currentOfferId, currentOfferCategory]);

  // Fetch products whenever filters, sort or offer params change in the URL
  useEffect(() => {
    let active = true;
    setLoading(true);

    api
      .getProducts({
        category: filters.category,
        gender: filters.gender,
        occasion: filters.occasion,
        min_price: filters.min_price,
        max_price: filters.max_price,
        min_discount: filters.min_discount,
        in_stock: filters.in_stock,
        offer_id: currentOfferId,
        offer_category: currentOfferCategory,
        banner_id: currentBannerId,
        sort: currentSort,
        limit: 36, // Show generous catalog grid
      })
      .then((res) => {
        if (active) {
          setProducts(res.data || []);
          setTotalCount(res.pagination?.total || 0);
        }
      })
      .catch((err) => {
        if (active) {
          console.error('Failed to fetch products:', err);
          setProducts([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters, currentSort, currentOfferId, currentOfferCategory]);

  const handleClearOfferFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('offer_id');
    params.delete('offer_category');
    params.delete('banner_id');
    setSearchParams(params);
  };

  // Sync filter changes to URL search params (so back button works & URLs are shareable)
  const handleFilterChange = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams);

    if (newFilters.category) params.set('category', newFilters.category);
    else params.delete('category');

    if (newFilters.gender && newFilters.gender !== 'all') params.set('gender', newFilters.gender);
    else params.delete('gender');

    if (newFilters.occasion) params.set('occasion', newFilters.occasion);
    else params.delete('occasion');

    if (newFilters.min_price !== undefined) params.set('min_price', String(newFilters.min_price));
    else params.delete('min_price');

    if (newFilters.max_price !== undefined) params.set('max_price', String(newFilters.max_price));
    else params.delete('max_price');

    if (newFilters.min_discount !== undefined)
      params.set('min_discount', String(newFilters.min_discount));
    else params.delete('min_discount');

    if (newFilters.in_stock) params.set('in_stock', 'true');
    else params.delete('in_stock');

    setSearchParams(params);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    const params = new URLSearchParams();
    if (currentSort !== 'newest') {
      params.set('sort', currentSort);
    }
    setSearchParams(params);
  };

  // Category & Gender page title heading
  const currentCategoryName = useMemo(() => {
    let title = '';
    if (filters.category) {
      const found = categories.find((c) => c.slug === filters.category);
      if (found) {
        title = found.name;
      } else {
        title = filters.category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      }
    }

    if (filters.gender === 'men') {
      title = title ? `${title} (Men's)` : "Men's Ethnic Collection";
    } else if (filters.gender === 'women') {
      title = title ? `${title} (Women's)` : "Women's Ethnic Collection";
    }

    return title || 'All Creations';
  }, [categories, filters.category, filters.gender]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* ── Active Promotional / Banner Highlight ─────────────────────────── */}
      {activeOfferDetail && (
        <div className="mb-6 rounded-xl border border-brand-gold/40 bg-gradient-to-r from-brand-crimson/15 via-surface to-brand-gold/15 p-4 sm:p-6 shadow-sm backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/40 text-[10px] font-extrabold uppercase tracking-widest">
                {activeOfferDetail.offer_category ? `⚡ ${activeOfferDetail.offer_category.toUpperCase()}` : '🪔 SPECIAL OFFER'}
              </span>
              <span className="text-xs font-semibold text-brand-gold">
                {activeOfferDetail.type === 'percent'
                  ? `${activeOfferDetail.value}% OFF Applied`
                  : activeOfferDetail.type === 'flat'
                  ? (
                    <>
                      Flat <span className="price font-sans tabular-nums font-bold">{formatPrice(activeOfferDetail.value)}</span> OFF Applied
                    </>
                  )
                  : 'Exclusive Offer Applied'}
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              {activeOfferDetail.name}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-2xl">
              Promotional products are displayed at the top of the collection with discounted prices already calculated.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearOfferFilter}
            className="self-start sm:self-center shrink-0 px-4 py-2 rounded-lg border border-border bg-surface text-xs font-semibold text-text hover:bg-surface-alt hover:border-brand-gold transition-colors shadow-sm"
          >
            Show All Products
          </button>
        </div>
      )}

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="mb-8 pb-6 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">
          Rajkanwari Collection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-text mt-1">
          {currentCategoryName}
        </h1>
        <p className="mt-2 text-sm text-text-muted max-w-2xl font-light">
          Immerse yourself in authentic Indian artisan craftsmanship, handwoven silks, and modern silhouettes.
        </p>
      </div>

      {/* ── Toolbar: Results Count + Active Filter Tags + Sort Dropdown ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface/60 backdrop-blur-xs p-3 sm:px-4 shadow-2xs">
        {/* Left: Mobile Filter Trigger + Results Count + Active Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text shadow-xs hover:border-brand-gold transition-colors cursor-pointer"
          >
            <Filter size={14} className="text-brand-gold" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-crimson text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="text-xs text-text-muted">
            Showing <strong className="font-semibold text-text">{products.length}</strong> of{' '}
            <strong className="font-semibold text-text">{totalCount}</strong> items
          </span>

          {/* Active Filter Pills for quick removal */}
          {filters.category && (
            <button
              type="button"
              onClick={() => handleFilterChange({ ...filters, category: undefined })}
              className="inline-flex items-center gap-1 rounded-full bg-surface border border-border px-2.5 py-0.5 text-[11px] text-text hover:border-brand-crimson hover:text-brand-crimson transition-colors cursor-pointer"
              title="Remove category filter"
            >
              <span>{currentCategoryName}</span>
              <span className="text-text-muted hover:text-brand-crimson font-bold text-xs">×</span>
            </button>
          )}

          {filters.gender && filters.gender !== 'all' && (
            <button
              type="button"
              onClick={() => handleFilterChange({ ...filters, gender: undefined })}
              className="inline-flex items-center gap-1 rounded-full bg-surface border border-border px-2.5 py-0.5 text-[11px] text-text hover:border-brand-crimson hover:text-brand-crimson transition-colors cursor-pointer"
              title="Remove gender filter"
            >
              <span className="capitalize">{filters.gender}</span>
              <span className="text-text-muted hover:text-brand-crimson font-bold text-xs">×</span>
            </button>
          )}

          {filters.in_stock && (
            <button
              type="button"
              onClick={() => handleFilterChange({ ...filters, in_stock: undefined })}
              className="inline-flex items-center gap-1 rounded-full bg-surface border border-border px-2.5 py-0.5 text-[11px] text-text hover:border-brand-crimson hover:text-brand-crimson transition-colors cursor-pointer"
              title="Remove in-stock filter"
            >
              <span>In-Stock Only</span>
              <span className="text-text-muted hover:text-brand-crimson font-bold text-xs">×</span>
            </button>
          )}

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-medium text-brand-crimson dark:text-brand-gold hover:underline ml-1 cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Right: Sort Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="sort-select" className="text-xs font-medium text-text-muted hidden sm:block">
            Sort by:
          </label>
          <div className="relative">
            <select
              id="sort-select"
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none rounded-lg border border-border bg-surface pl-3 pr-8 py-1.5 text-xs font-medium text-text shadow-xs focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
          </div>
        </div>
      </div>

      {/* ── Main Catalog Layout: Sidebar + Grid ───────────────────────────── */}
      <div className="flex gap-8 items-start">
        {/* Desktop Filter Sidebar (>768px) */}
        <div className="hidden md:block sticky top-24">
          <FilterSidebar
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {/* Product Grid Area */}
        <main className="flex-1 min-w-0">
          {/* Skeleton Cards on Loading (Never a spinner) */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3 rounded-xl border border-border/80 bg-surface p-3">
                  <Skeleton className="aspect-[4/5] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                  <div className="pt-2 flex justify-between">
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State with reset suggestion */
            <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-surface/40 p-8">
              <EmptyState
                title="No products match your selected criteria"
                description="Try broadening your filters or resetting to view all available collections."
                action={
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-crimson px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-brand-crimson/90 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Clear all filters</span>
                  </button>
                }
              />
            </div>
          ) : (
            /* Responsive Product Grid conforming to AGENTS.md */
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
            >
              {products.map((product) => (
                <motion.div key={product.id} variants={staggerItem} className="h-full">
                  <ProductCard
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>

      {/* ── Mobile Filter Drawer (<768px) ─────────────────────────────────── */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        categories={categories}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        activeFilterCount={activeFilterCount}
        totalProductsCount={totalCount}
      />

      {/* ── Quick View Modal ──────────────────────────────────────────────── */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
