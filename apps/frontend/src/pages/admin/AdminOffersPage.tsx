import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  Plus,
  Power,
  RefreshCw,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import {
  api,
  type AdminOfferItem,
  type CategoryItem,
  type ProductItem,
} from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { Portal } from '@/components/ui/Portal';

type TabStatus = 'running' | 'scheduled' | 'expired';

export const AdminOffersPage: React.FC = () => {
  const [offers, setOffers] = useState<AdminOfferItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>('running');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [offerCategory, setOfferCategory] = useState<string>('none');
  const [customOfferCategory, setCustomOfferCategory] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [type, setType] = useState<'percent' | 'flat' | 'free_shipping'>('percent');
  const [value, setValue] = useState<number>(15);
  const [maxDiscountInr, setMaxDiscountInr] = useState<number>(1500);
  const [minCartValueInr, setMinCartValueInr] = useState<number>(2999);
  const [startsAt, setStartsAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [endsAt, setEndsAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 16);
  });
  const [scope, setScope] = useState<'all' | 'category' | 'product'>('all');
  const [scopeIds, setScopeIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<number>(10);
  const [stackable, setStackable] = useState(false);
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [perUserLimit, setPerUserLimit] = useState<number>(1);
  const [bannerImageUrl, setBannerImageUrl] = useState('');

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await api.adminGetOffers();
      setOffers(res.data);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    api.getCategories().then((r) => setCategories(r.data)).catch(console.error);
    api.getProducts({ limit: 50 }).then((r) => setProducts(r.data)).catch(console.error);
  }, []);

  // Helper: normalise null/empty offer_category to 'none' for consistent filtering
  const getCat = (o: AdminOfferItem) => o.offer_category?.trim() || 'none';

  // Filter offers by derived_status and offer_category
  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const matchesStatus = o.derived_status === activeTab;
      const matchesCat = categoryFilter === 'all' || getCat(o) === categoryFilter;
      return matchesStatus && matchesCat;
    });
  }, [offers, activeTab, categoryFilter]);

  // Count per tab (unfiltered by category) — for badge totals
  const tabCounts = useMemo(() => ({
    running: offers.filter((o) => o.derived_status === 'running').length,
    scheduled: offers.filter((o) => o.derived_status === 'scheduled').length,
    expired: offers.filter((o) => o.derived_status === 'expired').length,
  }), [offers]);

  // Count per tab filtered by current category — for "x of y" badge
  const tabFilteredCounts = useMemo(() => ({
    running: offers.filter((o) => o.derived_status === 'running' && (categoryFilter === 'all' || getCat(o) === categoryFilter)).length,
    scheduled: offers.filter((o) => o.derived_status === 'scheduled' && (categoryFilter === 'all' || getCat(o) === categoryFilter)).length,
    expired: offers.filter((o) => o.derived_status === 'expired' && (categoryFilter === 'all' || getCat(o) === categoryFilter)).length,
  }), [offers, categoryFilter]);

  // Dynamically compute category filter pills (presets + custom ones found in offers)
  const categoryOptions = useMemo(() => {
    const defaultCats = [
      { id: 'all',            label: 'All Offers' },
      { id: 'none',           label: '🎯 General' },
      { id: 'Festive Offer',  label: '🪔 Festive' },
      { id: 'Clearance Sale', label: '⚡ Clearance' },
      { id: 'Flash Deal',     label: '🔥 Flash Deal' },
      { id: 'Exclusive Offer',label: '💎 VIP Exclusive' },
      { id: 'Free Shipping',  label: '🚚 Free Shipping' },
      { id: 'First Order',    label: '🎁 First Order' },
      { id: 'Combo Deal',     label: '📦 Combo Deal' },
    ];

    const knownIds = new Set(defaultCats.map((c) => c.id));
    const customCats: { id: string; label: string }[] = [];

    offers.forEach((o) => {
      const cat = o.offer_category?.trim();
      // Only add as custom if it's a non-empty, non-known category
      if (cat && !knownIds.has(cat) && !customCats.some((c) => c.id === cat)) {
        customCats.push({ id: cat, label: `✨ ${cat}` });
      }
    });

    return [...defaultCats, ...customCats];
  }, [offers]);

  const handleToggleOffer = async (id: string) => {
    try {
      const res = await api.adminToggleOffer(id);
      setOffers((prev) =>
        prev.map((o) => (o.id === id ? { ...o, is_active: res.is_active } : o))
      );
    } catch (err) {
      console.error('Failed to toggle offer:', err);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this promotion?')) return;
    try {
      await api.adminDeleteOffer(id);
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error('Failed to delete offer:', err);
    }
  };

  // Live Preview Math: "A ₹4,999 kurta becomes ₹3,749"
  const livePreviewCalculation = useMemo(() => {
    const samplePricePaise = 499900; // ₹4,999
    let discountPaise = 0;

    if (type === 'percent') {
      const computed = Math.round((samplePricePaise * value) / 100);
      const capPaise = maxDiscountInr > 0 ? maxDiscountInr * 100 : Infinity;
      discountPaise = Math.min(computed, capPaise);
    } else if (type === 'flat') {
      discountPaise = value * 100;
    } else if (type === 'free_shipping') {
      discountPaise = 15000; // standard shipping saved
    }

    const finalPricePaise = Math.max(0, samplePricePaise - discountPaise);

    return {
      original: formatPrice(samplePricePaise),
      final: formatPrice(finalPricePaise),
      saved: formatPrice(discountPaise),
    };
  }, [type, value, maxDiscountInr]);

  // Handle Create Offer with Validations
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation 1: End after start
    if (new Date(endsAt) <= new Date(startsAt)) {
      setError('Promotion end date must be strictly after the start date.');
      return;
    }

    // Validation 2: Percent 1–100
    if (type === 'percent' && (value < 1 || value > 100)) {
      setError('Percentage discount value must be between 1% and 100%.');
      return;
    }

    // Validation 3: Flat below min cart value
    if (type === 'flat' && minCartValueInr > 0 && value > minCartValueInr) {
      setError(`Flat discount (₹${value}) cannot exceed the minimum cart value (₹${minCartValueInr}).`);
      return;
    }

    setSaving(true);
    try {
      const effectiveOfferCategory =
        offerCategory === 'none'
          ? null                                              // General coupon — no category tag
          : offerCategory === 'custom'
          ? customOfferCategory.trim() || null
          : offerCategory;

      const payload = {
        name: name.trim(),
        code: code.trim() ? code.trim().toUpperCase() : null,
        offer_category: effectiveOfferCategory,
        type,
        value: type === 'percent' ? value : value * 100, // flat value stored in paise
        max_discount: type === 'percent' && maxDiscountInr > 0 ? maxDiscountInr * 100 : null,
        min_cart_value: minCartValueInr > 0 ? minCartValueInr * 100 : 0,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        is_active: true,
        stackable,
        usage_limit: typeof usageLimit === 'number' && usageLimit > 0 ? usageLimit : null,
        per_user_limit: perUserLimit,
        scope,
        scope_ids: scope === 'all' ? [] : scopeIds,
        banner_image_url: bannerImageUrl.trim() || null,
        priority,
      };

      await api.adminCreateOffer(payload);
      setModalOpen(false);
      // Reset form
      setName('');
      setCode('');
      setCustomOfferCategory('');
      await fetchOffers();
    } catch (err: any) {
      console.error('Failed to create offer:', err);
      setError(err.message || 'Failed to create promotion offer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text">Offers & Promotions</h1>
          <p className="text-xs text-text-muted mt-1">
            Build coupon codes, flash discounts, free shipping promotions, and festival campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOffers}
            className="p-2 rounded-lg border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-alt"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => {
              setError(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-crimson text-white text-xs font-semibold shadow hover:bg-brand-crimson/90 transition-colors"
          >
            <Plus size={15} />
            <span>New Promotion Offer</span>
          </button>
        </div>
      </div>

      {/* ── 3 Tabs with Animated Underline & Category Filter Strip ───────────────── */}
      <div className="space-y-4">
        <div className="border-b border-border flex items-center justify-between gap-4 overflow-x-auto pb-1">
          <div className="flex items-center gap-8">
            {(['running', 'scheduled', 'expired'] as TabStatus[]).map((tab) => {
              const total = tabCounts[tab];
              const filtered = tabFilteredCounts[tab];
              const showFiltered = categoryFilter !== 'all' && filtered !== total;
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    // Reset category filter when switching tabs to avoid stuck empty state
                    setCategoryFilter('all');
                  }}
                  className={`relative pb-3 text-xs font-semibold transition-colors flex items-center gap-2 capitalize shrink-0 ${
                    isActive ? 'text-brand-crimson dark:text-brand-gold' : 'text-text-muted hover:text-text'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-brand-crimson/15 text-brand-crimson dark:text-brand-gold font-bold'
                        : 'bg-surface-alt text-text-muted'
                    }`}
                  >
                    {showFiltered ? `${filtered}/${total}` : total}
                  </span>

                  {/* Animated sliding underline */}
                  {isActive && (
                    <motion.div
                      layoutId="offers-active-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-crimson dark:bg-brand-gold"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter by Special Offer Category */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider shrink-0 mr-1">
            Category Filter:
          </span>
          {categoryOptions.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all shrink-0 ${
                categoryFilter === cat.id
                  ? 'bg-brand-crimson text-white border-brand-crimson dark:bg-brand-gold dark:text-black dark:border-brand-gold shadow-xs'
                  : 'bg-surface border-border text-text-muted hover:text-text hover:bg-surface-alt'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Offers Grid / List ──────────────────────────────────────────────── */}
      {filteredOffers.length === 0 ? (
        <div className="p-12 rounded-xl bg-surface border border-border text-center space-y-3">
          <Tag size={32} className="mx-auto text-brand-gold opacity-50" />
          <h3 className="font-serif text-lg font-semibold text-text capitalize">
            No {activeTab} {categoryFilter !== 'all' ? `"${categoryFilter}"` : ''} Promotions
          </h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {categoryFilter !== 'all' && tabCounts[activeTab] > 0
              ? `There are ${tabCounts[activeTab]} ${activeTab} offer(s) in total — none match the selected category filter.`
              : activeTab === 'running'
              ? 'No promotions are currently active within their scheduled date window.'
              : activeTab === 'scheduled'
              ? 'No upcoming promotions scheduled for future dates.'
              : 'No expired promotions found in the archives.'}
          </p>
          {categoryFilter !== 'all' && (
            <button
              onClick={() => setCategoryFilter('all')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-alt border border-border text-xs font-semibold text-text-muted hover:text-text transition-colors"
            >
              <X size={13} />
              Clear Category Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOffers.map((offer) => {
            const catName = offer.offer_category?.trim() || 'none';
            return (
              <div
                key={offer.id}
                className="rounded-xl bg-surface border border-border p-5 flex flex-col justify-between shadow-xs hover:border-brand-gold/40 transition-colors"
              >
                <div className="space-y-3">
                  {/* Category Pill Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30 uppercase tracking-wider">
                      {catName === 'none'          ? '🎯 GENERAL OFFER' :
                       catName === 'Clearance Sale' ? '⚡ CLEARANCE' :
                       catName === 'Flash Deal'     ? '🔥 FLASH DEAL' :
                       catName === 'Exclusive Offer'? '💎 VIP EXCLUSIVE' :
                       catName === 'Free Shipping'  ? '🚚 FREE SHIPPING' :
                       catName === 'First Order'    ? '🎁 FIRST ORDER' :
                       catName === 'Combo Deal'     ? '📦 COMBO SAVINGS' :
                       catName === 'Festive Offer'  ? '🪔 FESTIVE OFFER' :
                       `✨ ${catName.toUpperCase()}`}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Active toggle */}
                      <button
                        onClick={() => handleToggleOffer(offer.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          offer.is_active
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-surface-alt border-border text-text-muted'
                        }`}
                        title={offer.is_active ? 'Active — click to pause' : 'Paused — click to activate'}
                      >
                        <Power size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-1.5 rounded-lg border border-border text-text-muted hover:text-danger hover:bg-danger/10"
                        title="Delete offer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Header */}
                  <div>
                    <h3 className="font-serif text-lg font-bold text-text line-clamp-1">{offer.name}</h3>
                    {offer.code ? (
                      <span className="inline-block mt-1 font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-alt text-brand-gold border border-border">
                        {offer.code}
                      </span>
                    ) : (
                      <span className="inline-block mt-1 text-[10px] text-text-muted font-medium italic">
                        Auto-Applied Promotion
                      </span>
                    )}
                  </div>

                  {/* Offer Formula Description */}
                  <div className="text-xs text-text font-medium flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-surface-alt text-brand-crimson font-bold">
                      {offer.type === 'percent'
                        ? `${offer.value}% OFF`
                        : offer.type === 'flat'
                        ? `${formatPrice(offer.value)} OFF`
                        : 'FREE SHIPPING'}
                    </span>
                    {offer.min_cart_value > 0 && (
                      <span className="text-[11px] text-text-muted">
                        Min: {formatPrice(offer.min_cart_value)}
                      </span>
                    )}
                  </div>

                {/* Dates */}
                <div className="text-[11px] text-text-muted space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>
                      {new Date(offer.starts_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      &rarr;{' '}
                      {new Date(offer.ends_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Redemptions & Disbursed Totals */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-text-muted block">Redemptions</span>
                  <span className="font-semibold text-text">{offer.redemption_count} orders</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-text-muted block">Disbursed Savings</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatPrice(offer.total_discount_disbursed)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* ── Offer Builder Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <Portal>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:py-8 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full max-h-[80vh] bg-surface border border-border rounded-xl shadow-2xl flex flex-col m-auto overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-border flex items-center justify-between bg-surface-alt/40 shrink-0">
                <div className="flex items-center gap-2 text-brand-crimson">
                  <Sparkles size={20} />
                  <h3 className="font-serif text-xl font-bold text-text">Promotional Offer Builder</h3>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-alt transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* Error Alert */}
                {error && (
                  <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreateOffer} className="space-y-4">
                {/* 1. Name & Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-text mb-1">
                      Promotion Name <span className="text-brand-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Festive Silk Celebration"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text focus:outline-hidden focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text mb-1">
                      Coupon Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FESTIVE20 (Leave blank for auto-applied)"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border font-mono text-text focus:outline-hidden focus:border-brand-gold"
                    />
                  </div>
                </div>

                {/* Offer Category Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-text">
                      Special Offer Category
                    </label>
                    {offerCategory === 'none' && (
                      <span className="text-[10px] text-text-muted bg-surface-alt px-2 py-0.5 rounded-full border border-border">
                        🎯 General coupon — no category tag applied
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'none',           label: '🎯 None / General' },
                      { id: 'Festive Offer',  label: '🪔 Festive Offer' },
                      { id: 'Clearance Sale', label: '⚡ Clearance Sale' },
                      { id: 'Flash Deal',     label: '🔥 Flash Deal' },
                      { id: 'Exclusive Offer',label: '💎 VIP Exclusive' },
                      { id: 'Free Shipping',  label: '🚚 Free Shipping' },
                      { id: 'First Order',    label: '🎁 First Order' },
                      { id: 'Combo Deal',     label: '📦 Combo Savings' },
                      { id: 'custom',         label: '✨ Custom Category' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setOfferCategory(cat.id)}
                        className={`py-2 px-2 rounded-lg border text-xs font-semibold transition-all text-center ${
                          offerCategory === cat.id
                            ? 'border-brand-crimson bg-brand-crimson/10 text-brand-crimson dark:text-brand-gold dark:border-brand-gold ring-1 ring-brand-crimson/30'
                            : 'border-border bg-bg text-text-muted hover:text-text'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {offerCategory === 'custom' && (
                    <div className="mt-2.5">
                      <label className="block text-[11px] font-semibold text-text-muted mb-1 uppercase tracking-wider">
                        Custom Special Category Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 🎉 Karwa Chauth Special, 🪔 Navratri Edit, 👑 Rajputi Poshaks"
                        value={customOfferCategory}
                        onChange={(e) => setCustomOfferCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text font-medium focus:outline-hidden focus:border-brand-gold"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Type & Value */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-text mb-1">Discount Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text focus:outline-hidden"
                    >
                      <option value="percent">Percentage (% OFF)</option>
                      <option value="flat">Flat Amount (₹ OFF)</option>
                      <option value="free_shipping">Free Doorstep Shipping</option>
                    </select>
                  </div>

                  {type !== 'free_shipping' && (
                    <div>
                      <label className="block font-semibold text-text mb-1">
                        Discount Value ({type === 'percent' ? '%' : '₹'})
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={type === 'percent' ? 100 : 50000}
                        required
                        value={value}
                        onChange={(e) => setValue(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text font-bold"
                      />
                    </div>
                  )}

                  {type === 'percent' && (
                    <div>
                      <label className="block font-semibold text-text mb-1">Max Cap (₹ INR)</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 1500"
                        value={maxDiscountInr}
                        onChange={(e) => setMaxDiscountInr(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text"
                      />
                    </div>
                  )}
                </div>

                {/* Live Mathematical Preview Box */}
                <div className="p-3.5 rounded-lg bg-brand-gold/10 border border-brand-gold/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-brand-gold font-semibold uppercase text-[10px] tracking-wider">
                    <Sparkles size={12} />
                    <span>Live Mathematical Calculation Preview</span>
                  </div>
                  <div className="text-text font-medium text-xs">
                    &ldquo;A <span className="price font-sans font-semibold tabular-nums">{livePreviewCalculation.original}</span> handcrafted kurta becomes{' '}
                    <strong className="price font-sans text-brand-crimson text-sm tabular-nums">{livePreviewCalculation.final}</strong>{' '}
                    (Saving <span className="price font-sans tabular-nums">{livePreviewCalculation.saved}</span>)&rdquo;
                  </div>
                </div>

                {/* 3. Dates & Minimum Cart */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-text mb-1">Minimum Cart Value (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={minCartValueInr}
                      onChange={(e) => setMinCartValueInr(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text mb-1">Starts At</label>
                    <input
                      type="datetime-local"
                      required
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text mb-1">Ends At</label>
                    <input
                      type="datetime-local"
                      required
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text"
                    />
                  </div>
                </div>

                {/* 4. Scope Selector */}
                <div>
                  <label className="block font-semibold text-text mb-1">Scope Application</label>
                  <div className="flex items-center gap-4 mb-2">
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={scope === 'all'}
                        onChange={() => setScope('all')}
                        className="accent-brand-crimson"
                      />
                      <span>Entire Store</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={scope === 'category'}
                        onChange={() => setScope('category')}
                        className="accent-brand-crimson"
                      />
                      <span>Specific Categories</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={scope === 'product'}
                        onChange={() => setScope('product')}
                        className="accent-brand-crimson"
                      />
                      <span>Specific Products</span>
                    </label>
                  </div>

                  {scope === 'category' && (
                    <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-bg border border-border">
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setScopeIds((prev) =>
                              prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                            );
                          }}
                          className={`px-2.5 py-1 rounded text-xs border ${
                            scopeIds.includes(c.id)
                              ? 'bg-brand-crimson text-white border-brand-crimson font-medium'
                              : 'bg-surface border-border text-text-muted'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {scope === 'product' && (
                    <div className="max-h-32 overflow-y-auto space-y-1 p-2 rounded-lg bg-bg border border-border">
                      {products.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={scopeIds.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) setScopeIds([...scopeIds, p.id]);
                              else setScopeIds(scopeIds.filter((id) => id !== p.id));
                            }}
                            className="accent-brand-crimson"
                          />
                          <span className="truncate">{p.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Additional Settings (Priority, Limits, Banner) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
                  <div>
                    <label className="block font-semibold text-text mb-1">Priority Rank</label>
                    <input
                      type="number"
                      value={priority}
                      onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text mb-1">Total Usage Cap</label>
                    <input
                      type="number"
                      placeholder="Unlimited"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value ? parseInt(e.target.value) || '' : '')}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text mb-1">Per User Limit</label>
                    <input
                      type="number"
                      min={1}
                      value={perUserLimit}
                      onChange={(e) => setPerUserLimit(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text mb-1">Promotional Banner Image URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://... or /uploads/banner.jpg"
                      value={bannerImageUrl}
                      onChange={(e) => setBannerImageUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="stackable-toggle"
                      checked={stackable}
                      onChange={(e) => setStackable(e.target.checked)}
                      className="accent-brand-crimson"
                    />
                    <label htmlFor="stackable-toggle" className="font-semibold text-text">
                      Stackable with auto-applied discounts
                    </label>
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-border text-text hover:bg-surface-alt font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-brand-crimson text-white font-semibold shadow hover:bg-brand-crimson/90 disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Create Promotion'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </Portal>
    )}
    </AnimatePresence>
    </div>
  );
};
