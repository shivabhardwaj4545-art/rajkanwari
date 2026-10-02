import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Layers,
  MoveDown,
  MoveUp,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { api, type AdminBannerItem } from '@/lib/api';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<AdminBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBannerItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('Explore Collection');
  const [ctaLink, setCtaLink] = useState('/catalog');
  const [textAlignment, setTextAlignment] = useState<'left' | 'right'>('left');
  const [textColor, setTextColor] = useState<string>('white');
  const [customTextColor, setCustomTextColor] = useState<string>('#D4AF37');
  const [bannerOfferCategory, setBannerOfferCategory] = useState<string>('None');
  const [customBannerOfferCategory, setCustomBannerOfferCategory] = useState<string>('');
  const [gradientStyle, setGradientStyle] = useState<string>('dark_vignette');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const STANDARD_BANNER_CATEGORIES = [
    'None',
    'Festive Offer',
    'Clearance Sale',
    'Flash Deal',
    'Exclusive Offer',
    'Free Shipping',
    'First Order',
    'Combo Deal',
  ];

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.adminGetBanners();
      setBanners(res.data);
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setCtaText('Explore Collection');
    setCtaLink('/catalog');
    setTextAlignment('left');
    setTextColor('white');
    setCustomTextColor('#D4AF37');
    setBannerOfferCategory('None');
    setCustomBannerOfferCategory('');
    setGradientStyle('dark_vignette');
    setStartsAt('');
    setEndsAt('');
    setIsActive(true);
    setError(null);
    setEditingBanner(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (banner: AdminBannerItem) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setImageUrl(banner.image_url);
    setCtaText(banner.cta_text || 'Explore Collection');
    setCtaLink(banner.cta_link || '/catalog');
    setTextAlignment(banner.text_alignment || 'left');
    const colorVal = banner.text_color || 'white';
    if (colorVal.startsWith('#')) {
      setTextColor('custom');
      setCustomTextColor(colorVal);
    } else {
      setTextColor(colorVal);
    }
    const catVal = banner.offer_category || 'None';
    if (STANDARD_BANNER_CATEGORIES.includes(catVal)) {
      setBannerOfferCategory(catVal);
      setCustomBannerOfferCategory('');
    } else {
      setBannerOfferCategory('custom');
      setCustomBannerOfferCategory(catVal);
    }
    setGradientStyle(banner.gradient_style || 'dark_vignette');
    setStartsAt(banner.starts_at ? banner.starts_at.slice(0, 16) : '');
    setEndsAt(banner.ends_at ? banner.ends_at.slice(0, 16) : '');
    setIsActive(banner.is_active);
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const moveBanner = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;

    const copy = [...banners];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);

    const updated = copy.map((b, i) => ({ ...b, display_order: i + 1 }));
    setBanners(updated);

    try {
      await api.adminReorderBanners(
        updated.map((b) => ({ id: b.id, display_order: b.display_order }))
      );
    } catch (err) {
      console.error('Failed to save banner reorder:', err);
      fetchBanners();
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Delete this carousel banner?')) return;
    try {
      await api.adminDeleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Failed to delete banner:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.adminUploadImage(file);
      setImageUrl(res.url);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      setError('Title and image URL are required.');
      return;
    }

    const effectiveTextColor = textColor === 'custom' ? customTextColor : textColor;
    const effectiveOfferCategory =
      bannerOfferCategory === 'custom'
        ? customBannerOfferCategory.trim() || 'Custom Offer'
        : bannerOfferCategory;

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      image_url: imageUrl.trim(),
      cta_text: ctaText.trim() || 'Explore Collection',
      cta_link: ctaLink.trim() || '/catalog',
      text_alignment: textAlignment,
      text_color: effectiveTextColor,
      offer_category: effectiveOfferCategory,
      gradient_style: gradientStyle,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      is_active: isActive,
    };

    setSaving(true);
    setError(null);
    try {
      if (editingBanner) {
        await api.adminUpdateBanner(editingBanner.id, payload);
      } else {
        await api.adminCreateBanner(payload);
      }
      closeModal();
      await fetchBanners();
    } catch (err: any) {
      console.error('Failed to save banner:', err);
      setError(err.message || 'Failed to save banner.');
    } finally {
      setSaving(false);
    }
  };

  const activeBanner = banners[previewIndex] || banners[0];
  const isPreviewRight = activeBanner?.text_alignment === 'right';

  const getBannerGradientClass = (style: string = 'dark_vignette', isRight: boolean) => {
    switch (style) {
      case 'light_pearl':
        return isRight ? 'from-transparent via-white/30 to-white/75' : 'from-white/75 via-white/30 to-transparent';
      case 'crimson_gold':
        return isRight
          ? 'from-transparent via-[#8E2731]/40 to-[#4A0D14]/80'
          : 'from-[#4A0D14]/80 via-[#8E2731]/40 to-transparent';
      case 'emerald_velvet':
        return isRight
          ? 'from-transparent via-[#1B4332]/40 to-[#081C15]/80'
          : 'from-[#081C15]/80 via-[#1B4332]/40 to-transparent';
      case 'festive_shimmer':
        return isRight
          ? 'from-transparent via-[#705510]/40 to-[#2A1F02]/80'
          : 'from-[#2A1F02]/80 via-[#705510]/40 to-transparent';
      case 'sunset_amber':
        return isRight
          ? 'from-transparent via-[#7F381B]/40 to-[#381508]/80'
          : 'from-[#381508]/80 via-[#7F381B]/40 to-transparent';
      case 'none':
      case 'no_overlay':
        return 'hidden bg-transparent';
      case 'dark_vignette':
      default:
        return isRight ? 'from-transparent via-black/20 to-black/45' : 'from-black/45 via-black/20 to-transparent';
    }
  };

  const getBannerTextStyle = (colorVal: string = 'white') => {
    if (colorVal.startsWith('#')) {
      return { color: colorVal, textShadow: '0 2px 10px rgba(0,0,0,0.85)' };
    }
    if (colorVal === 'dark') {
      return { color: '#2D2A24', textShadow: '0 1px 6px rgba(255,255,255,0.85)' };
    }
    if (colorVal === 'gold') {
      return { color: '#D4AF37', textShadow: '0 2px 12px rgba(0,0,0,0.9)' };
    }
    if (colorVal === 'crimson') {
      return { color: '#8E2731', textShadow: '0 2px 10px rgba(255,255,255,0.9)' };
    }
    if (colorVal === 'emerald') {
      return { color: '#2D6A4F', textShadow: '0 2px 10px rgba(255,255,255,0.9)' };
    }
    return { color: '#FFFFFF', textShadow: '0 2px 14px rgba(0,0,0,0.95)' };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text">Hero Carousel Banners</h1>
          <p className="text-xs text-text-muted mt-1">
            Configure full-bleed hero slides, choose Left / Right alignment, custom gradient backdrops, text colors, and Special Offer categories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBanners}
            className="p-2 rounded-lg border border-border bg-surface text-text-muted hover:text-text"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-crimson text-white text-xs font-semibold shadow hover:bg-brand-crimson/90 transition-colors"
          >
            <Plus size={15} />
            <span>Add New Banner</span>
          </button>
        </div>
      </div>

      {activeBanner && (() => {
        const textColorMode = activeBanner.text_color || 'white';
        const gradStyle = activeBanner.gradient_style || 'dark_vignette';
        const offerCat = activeBanner.offer_category || 'None';
        const gradientClass = getBannerGradientClass(gradStyle, isPreviewRight);
        const textStyle = getBannerTextStyle(textColorMode);

        return (
          <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-lg">
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface-alt/40">
              <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} />
                <span>
                  Live Storefront Preview (Align: {activeBanner.text_alignment === 'right' ? 'Right ➡️' : 'Left ⬅️'} &bull; Overlay: {gradStyle.toUpperCase()} &bull; Category: {offerCat})
                </span>
              </span>
              <div className="flex items-center gap-1.5">
                {banners.map((b, idx) => (
                  <button
                    key={b.id}
                    onClick={() => setPreviewIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      previewIndex === idx ? 'bg-brand-gold w-6' : 'bg-border hover:bg-text-muted'
                    }`}
                    title={b.title}
                  />
                ))}
              </div>
            </div>
            <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-bg flex items-center">
              <img
                src={activeBanner.image_url}
                alt={activeBanner.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass}`} />
              <div
                className={`relative z-10 max-w-xl px-8 sm:px-12 space-y-3 flex flex-col ${
                  isPreviewRight ? 'ml-auto text-right items-end' : 'mr-auto text-left items-start'
                }`}
              >
                {offerCat !== 'None' && (
                  <span className="inline-block px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/40 text-[10px] font-extrabold uppercase tracking-widest shadow-xs">
                    {offerCat === 'Clearance Sale' ? '⚡ CLEARANCE SALE' :
                     offerCat === 'Flash Deal' ? '🔥 FLASH DEAL' :
                     offerCat === 'Exclusive Offer' ? '💎 VIP EXCLUSIVE' :
                     offerCat === 'Free Shipping' ? '🚚 FREE SHIPPING' :
                     offerCat === 'First Order' ? '🎁 WELCOME SPECIAL' :
                     offerCat === 'Combo Deal' ? '📦 COMBO SAVINGS' :
                     '🪔 FESTIVE OFFER'}
                  </span>
                )}
                <span className="inline-block font-serif tracking-widest text-[11px] uppercase font-extrabold text-brand-gold [text-shadow:_0_1px_8px_rgba(0,0,0,0.9)]">
                  RAJKANWARI &bull; CURATED STYLE
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-normal leading-tight" style={textStyle}>
                  {activeBanner.title}
                </h2>
                {activeBanner.subtitle && (
                  <p className="text-xs sm:text-sm font-medium line-clamp-2 text-white/95 [text-shadow:_0_1px_10px_rgba(0,0,0,0.9)]">
                    {activeBanner.subtitle}
                  </p>
                )}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-crimson hover:opacity-90 text-white text-xs font-semibold shadow-lg">
                    {activeBanner.cta_text || 'Explore Collection'} &rarr;
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-text flex items-center gap-2">
          <Layers size={17} className="text-brand-crimson" />
          <span>Active Carousel Sequence (Drag or Click to Reorder)</span>
        </h2>

        {banners.length === 0 ? (
          <div className="p-8 rounded-xl bg-surface border border-border text-center text-xs text-text-muted">
            {loading ? 'Loading carousel banners...' : 'No banners created yet. Click "Add New Banner" above.'}
          </div>
        ) : (
          <div className="space-y-2">
            {banners.map((banner, index) => (
              <motion.div
                layout
                key={banner.id}
                className={`p-4 rounded-xl bg-surface border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                  previewIndex === index ? 'border-brand-gold' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1 text-text-muted">
                    <button
                      disabled={index === 0}
                      onClick={() => moveBanner(index, 'up')}
                      className="p-1 rounded hover:bg-surface-alt disabled:opacity-30"
                      title="Move up"
                    >
                      <MoveUp size={14} />
                    </button>
                    <button
                      disabled={index === banners.length - 1}
                      onClick={() => moveBanner(index, 'down')}
                      className="p-1 rounded hover:bg-surface-alt disabled:opacity-30"
                      title="Move down"
                    >
                      <MoveDown size={14} />
                    </button>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-surface-alt border border-border font-mono text-xs font-bold text-text flex items-center justify-center">
                    {index + 1}
                  </div>

                  <div className="w-24 h-14 rounded-lg overflow-hidden bg-surface-alt border border-border shrink-0">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-bold text-text line-clamp-1">{banner.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-surface-alt border border-border text-[10px] font-semibold text-text-muted uppercase">
                        {banner.text_alignment === 'right' ? 'Right ➡️' : 'Left ⬅️'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-alt border border-border text-[10px] font-semibold text-text-muted uppercase capitalize">
                        🎨 {banner.text_color || 'white'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                      <span>CTA: {banner.cta_text}</span>
                      <span>&bull;</span>
                      <span className="font-mono">{banner.cta_link}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setPreviewIndex(index)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-text hover:bg-surface-alt"
                  >
                    Preview in Hero
                  </button>

                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-2 rounded-lg border border-border text-text-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-colors"
                    title="Edit banner"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="p-2 rounded-lg border border-border text-text-muted hover:text-danger hover:bg-danger/10"
                    title="Delete banner"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:py-8 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-xl w-full max-h-[80vh] bg-surface border border-border rounded-xl shadow-2xl flex flex-col m-auto overflow-hidden"
            >
              {/* Fixed Header */}
              <div className="p-5 border-b border-border flex items-center justify-between bg-surface-alt/40 shrink-0">
                <h3 className="font-serif text-xl font-bold text-text">
                  {editingBanner ? 'Edit Carousel Banner' : 'Create Carousel Banner'}
                </h3>
                <button onClick={closeModal} className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-alt transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                {error && (
                  <div className="p-3 rounded-lg bg-danger/10 text-danger text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form id="banner-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-text mb-1">Banner Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Heritage Scarlet Red Bridal Lehenga"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text mb-1">Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. Handcrafted Varanasi Silk Zari Brocade"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text mb-1">Banner Image *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="/uploads/banner.jpg or https://..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-bg border border-border text-text font-mono text-[11px]"
                    />
                    <label className="cursor-pointer px-3 py-2 rounded-lg border border-border bg-surface-alt hover:bg-surface text-text font-medium text-[11px]">
                      <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {imageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-border h-20 bg-surface-alt">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover object-top" />
                    </div>
                  )}
                </div>

                {/* Special Offer Category Selection for Banner */}
                <div>
                  <label className="block font-semibold text-text mb-1">Associated Special Offer Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'None', label: 'None / General Hero' },
                      { id: 'Festive Offer', label: '🪔 Festive Offer' },
                      { id: 'Clearance Sale', label: '⚡ Clearance Sale' },
                      { id: 'Flash Deal', label: '🔥 Flash Deal' },
                      { id: 'Exclusive Offer', label: '💎 VIP Exclusive' },
                      { id: 'Free Shipping', label: '🚚 Free Shipping' },
                      { id: 'First Order', label: '🎁 Welcome Special' },
                      { id: 'Combo Deal', label: '📦 Combo Savings' },
                      { id: 'custom', label: '✨ Custom Category' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setBannerOfferCategory(cat.id)}
                        className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all text-center ${
                          bannerOfferCategory === cat.id
                            ? 'border-brand-crimson bg-brand-crimson/10 text-brand-crimson dark:text-brand-gold dark:border-brand-gold ring-1 ring-brand-crimson/30'
                            : 'border-border bg-bg text-text-muted hover:text-text'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {bannerOfferCategory === 'custom' && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-bg border border-border">
                      <label className="block text-[11px] font-bold text-text-muted uppercase mb-1">
                        Custom Special Offer Category Name
                      </label>
                      <input
                        type="text"
                        value={customBannerOfferCategory}
                        onChange={(e) => setCustomBannerOfferCategory(e.target.value)}
                        placeholder="e.g. 🎉 Karwa Chauth Special, 🪔 Navratri Edit, 👑 Royal Rajputi Poshaks"
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text font-medium text-xs focus:outline-hidden focus:border-brand-gold"
                      />
                    </div>
                  )}
                </div>

                {/* Text Alignment Selection (Left vs Right) */}
                <div>
                  <label className="block font-semibold text-text mb-1">Text Alignment on Hero Slide</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTextAlignment('left')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        textAlignment === 'left'
                          ? 'border-brand-crimson bg-brand-crimson/10 text-brand-crimson dark:text-brand-gold dark:border-brand-gold ring-1 ring-brand-crimson/30'
                          : 'border-border bg-bg text-text-muted hover:text-text'
                      }`}
                    >
                      <span>⬅️ Left Aligned</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextAlignment('right')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        textAlignment === 'right'
                          ? 'border-brand-crimson bg-brand-crimson/10 text-brand-crimson dark:text-brand-gold dark:border-brand-gold ring-1 ring-brand-crimson/30'
                          : 'border-border bg-bg text-text-muted hover:text-text'
                      }`}
                    >
                      <span>Right Aligned ➡️</span>
                    </button>
                  </div>
                </div>

                {/* Gradient Backdrop Overlay Selector */}
                <div>
                  <label className="block font-semibold text-text mb-1">Gradient Backdrop Overlay Field</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'dark_vignette', label: '🌑 Dark Vignette' },
                      { id: 'light_pearl', label: '⚪ Light Pearl' },
                      { id: 'crimson_gold', label: '🍷 Crimson & Gold' },
                      { id: 'emerald_velvet', label: '🌲 Emerald Velvet' },
                      { id: 'festive_shimmer', label: '✨ Gold Shimmer' },
                      { id: 'sunset_amber', label: '☀️ Sunset Amber' },
                      { id: 'none', label: '🚫 No Overlay' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGradientStyle(g.id)}
                        className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all text-center ${
                          gradientStyle === g.id
                            ? 'border-brand-crimson bg-brand-crimson/10 text-brand-crimson dark:text-brand-gold dark:border-brand-gold ring-1 ring-brand-crimson/30'
                            : 'border-border bg-bg text-text-muted hover:text-text'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner Text Color Mode & Custom Hex Color Field */}
                <div>
                  <label className="block font-semibold text-text mb-1">Banner Text Color & Custom Color Field</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setTextColor('white')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border text-xs font-semibold transition-all ${
                        textColor === 'white'
                          ? 'border-brand-crimson bg-brand-crimson/10 text-brand-crimson dark:text-brand-gold dark:border-brand-gold ring-1 ring-brand-crimson/30'
                          : 'border-border bg-bg text-text-muted hover:text-text'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-white border border-gray-400 inline-block shrink-0 shadow-xs" />
                      <span>Crisp White</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextColor('dark')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border text-xs font-semibold transition-all ${
                        textColor === 'dark'
                          ? 'border-brand-crimson bg-brand-crimson/10 text-brand-crimson dark:text-brand-gold dark:border-brand-gold ring-1 ring-brand-crimson/30'
                          : 'border-border bg-bg text-text-muted hover:text-text'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-[#2D2A24] border border-gray-600 inline-block shrink-0 shadow-xs" />
                      <span>Deep Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextColor('gold')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border text-xs font-semibold transition-all ${
                        textColor === 'gold'
                          ? 'border-brand-crimson bg-brand-crimson/10 text-brand-crimson dark:text-brand-gold dark:border-brand-gold ring-1 ring-brand-crimson/30'
                          : 'border-border bg-bg text-text-muted hover:text-text'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-[#D4AF37] border border-amber-600 inline-block shrink-0 shadow-xs" />
                      <span>Festive Gold</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextColor('custom')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border text-xs font-semibold transition-all ${
                        textColor === 'custom'
                          ? 'border-brand-crimson bg-brand-crimson/10 text-brand-crimson dark:text-brand-gold dark:border-brand-gold ring-1 ring-brand-crimson/30'
                          : 'border-border bg-bg text-text-muted hover:text-text'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-gray-400 inline-block shrink-0 shadow-xs"
                        style={{ backgroundColor: customTextColor }}
                      />
                      <span>Custom Color</span>
                    </button>
                  </div>

                  {textColor === 'custom' && (
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-bg border border-border mt-2">
                      <input
                        type="color"
                        value={customTextColor}
                        onChange={(e) => setCustomTextColor(e.target.value)}
                        className="w-9 h-9 rounded cursor-pointer border border-border bg-transparent p-0"
                      />
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-text-muted uppercase">
                          Custom Hex Color Code
                        </label>
                        <input
                          type="text"
                          value={customTextColor}
                          onChange={(e) => setCustomTextColor(e.target.value)}
                          placeholder="#D4AF37"
                          className="w-full px-2.5 py-1 rounded border border-border bg-surface font-mono text-xs font-semibold text-text uppercase"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text mb-1">Button Text</label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text mb-1">Button Link</label>
                    <input
                      type="text"
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text mb-1">Schedule Start (Optional)</label>
                    <input
                      type="datetime-local"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text mb-1">Schedule End (Optional)</label>
                    <input
                      type="datetime-local"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="banner-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-brand-crimson"
                  />
                  <label htmlFor="banner-active" className="font-semibold text-text">
                    Active immediately upon saving
                  </label>
                </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-lg border border-border text-text hover:bg-surface-alt font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-lg bg-brand-crimson text-white font-semibold shadow hover:bg-brand-crimson/90 disabled:opacity-50"
                    >
                      {saving
                        ? editingBanner ? 'Saving...' : 'Publishing...'
                        : editingBanner ? 'Save Changes' : 'Publish Banner'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
