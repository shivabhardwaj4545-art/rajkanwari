import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  FolderTree,
  Image as ImageIcon,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { api, type CategoryItem } from '@/lib/api';
import { Portal } from '@/components/ui/Portal';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCategories();
      setCategories(res.data || []);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80');
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setDisplayOrder(cat.display_order || 1);
    setIsActive(cat.is_active !== false);
    setError(null);
    setModalOpen(true);
  };

  // Helper auto-slug
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().trim().replace(/\s+/g, '-'),
        description: description.trim(),
        image_url: imageUrl.trim(),
        display_order: Number(displayOrder) || 1,
        is_active: isActive ? 1 : 0,
      };

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload as any);
      } else {
        await api.createCategory(payload);
      }

      setModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      console.error('Failed to save category:', err);
      setError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setSaving(true);
      await api.deleteCategory(id);
      setDeletingId(null);
      await fetchCategories();
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      alert(err.message || 'Failed to delete category');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: CategoryItem) => {
    try {
      await api.updateCategory(cat.id, { is_active: !cat.is_active });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: !c.is_active } : c))
      );
    } catch (err: any) {
      console.error('Failed to update category status:', err);
      fetchCategories();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text flex items-center gap-2">
            <FolderTree className="text-brand-crimson dark:text-brand-gold" size={28} />
            Categories Management
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage online boutique categories shown in header navigation, filters, and product creation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCategories}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text hover:bg-surface-alt transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-crimson/90 transition-colors"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Main Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-surface border border-border shimmer" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <FolderTree className="mx-auto text-text-muted mb-3" size={40} />
          <h3 className="text-sm font-semibold text-text">No categories found</h3>
          <p className="text-xs text-text-muted mt-1">
            Get started by adding your boutique clothing categories.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus size={16} />
            Create First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`group relative flex flex-col justify-between rounded-xl border bg-surface overflow-hidden transition-all duration-200 hover:shadow-md ${
                cat.is_active !== false ? 'border-border' : 'border-border/50 opacity-60'
              }`}
            >
              {/* Category Image Header */}
              <div className="relative aspect-[16/7] w-full overflow-hidden bg-surface-alt">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-text-muted">
                    <ImageIcon size={24} />
                  </div>
                )}

                {/* Display Order Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="inline-flex items-center rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white">
                    Order #{cat.display_order}
                  </span>
                </div>

                {/* Active Toggle Badge */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(cat)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold shadow-sm transition-colors ${
                      cat.is_active !== false
                        ? 'bg-success/20 text-success border border-success/30 backdrop-blur-md'
                        : 'bg-danger/20 text-danger border border-danger/30 backdrop-blur-md'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        cat.is_active !== false ? 'bg-success' : 'bg-danger'
                      }`}
                    />
                    {cat.is_active !== false ? 'Active' : 'Hidden'}
                  </button>
                </div>
              </div>

              {/* Details Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-text uppercase tracking-wide">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] font-mono text-text-muted bg-surface-alt px-1.5 py-0.5 rounded">
                      /{cat.slug}
                    </span>
                  </div>

                  <p className="text-xs text-text-muted mt-1.5 line-clamp-2">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs font-medium text-brand-gold">
                    {cat.product_count || 0} active products
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(cat)}
                      className="p-1.5 rounded-md text-text-muted hover:text-brand-crimson dark:hover:text-brand-gold hover:bg-surface-alt transition-colors"
                      title="Edit Category"
                    >
                      <Pencil size={15} />
                    </button>

                    {deletingId === cat.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-danger text-white hover:bg-danger/90"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="p-0.5 text-text-muted hover:text-text"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingId(cat.id)}
                        className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <AnimatePresence>
        {modalOpen && (
          <Portal>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="font-serif text-lg font-bold text-text">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-1 text-text-muted hover:bg-surface-alt hover:text-text"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSave} className="p-6 space-y-4">
                {error && (
                  <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 text-xs text-danger flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Category Name <span className="text-brand-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajputi Poshak"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text focus:outline-hidden focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      URL Slug <span className="text-brand-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. rajputi-poshak"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text font-mono focus:outline-hidden focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text focus:outline-hidden focus:border-brand-gold"
                  />
                  {imageUrl && (
                    <div className="mt-2 aspect-[16/6] w-full rounded-lg overflow-hidden border border-border bg-surface-alt">
                      <img src={imageUrl} alt="Preview" className="h-full w-full object-cover object-top" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief summary of fabrics, heritage work, or style for this category..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text focus:outline-hidden focus:border-brand-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Display Order Priority
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                      className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text focus:outline-hidden focus:border-brand-gold"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-border text-brand-crimson focus:ring-brand-gold"
                      />
                      <span className="text-xs font-medium text-text">Visible in Navigation & Filters</span>
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-text hover:bg-surface-alt transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-5 py-2 text-xs font-semibold text-white hover:bg-brand-crimson/90 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
    </div>
  );
};

export default AdminCategoriesPage;
