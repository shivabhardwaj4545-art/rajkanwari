import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import React from 'react';

import type { CategoryItem } from '@/lib/api';

export interface FilterState {
  category?: string | undefined;
  gender?: string | undefined;
  occasion?: string | undefined;
  min_price?: number | undefined;
  max_price?: number | undefined;
  min_discount?: number | undefined;
  in_stock?: boolean | undefined;
}

interface FilterSidebarProps {
  categories: CategoryItem[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  activeFilterCount: number;
}

const GENDERS = [
  { label: 'All Genders', value: 'all' },
  { label: 'Women', value: 'women' },
  { label: 'Men', value: 'men' },
  { label: 'Unisex', value: 'unisex' },
];

const OCCASIONS = [
  'Bridal & Festive',
  'Weddings',
  'Cocktail & Party',
  'Sangeet & Mehendi',
  'Haldi',
  'Casual & Office',
];

const PRICE_RANGES = [
  { label: 'Under ₹5,000', min: undefined, max: 500000 },
  { label: '₹5,000 – ₹15,000', min: 500000, max: 1500000 },
  { label: '₹15,000 – ₹35,000', min: 1500000, max: 3500000 },
  { label: 'Above ₹35,000', min: 3500000, max: undefined },
];

const DISCOUNT_RANGES = [
  { label: '10% and above', value: 10 },
  { label: '15% and above', value: 15 },
  { label: '20% and above', value: 20 },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  filters,
  onFilterChange,
  onReset,
  activeFilterCount,
}) => {
  return (
    <aside className="w-64 flex-shrink-0 space-y-5 rounded-2xl border border-border/80 bg-surface/80 backdrop-blur-sm p-5 shadow-xs">
      {/* Header with active count & Reset button */}
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-brand-gold" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-text">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-crimson text-[10px] font-bold text-white shadow-xs">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-medium text-brand-crimson dark:text-brand-gold hover:underline cursor-pointer"
          >
            <RotateCcw size={11} />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* In-Stock Toggle Switch */}
      <div className="pb-4 border-b border-border/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text">
            In-Stock Only
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(filters.in_stock)}
            onClick={() => onFilterChange({ ...filters, in_stock: !filters.in_stock })}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
              filters.in_stock ? 'bg-brand-gold' : 'bg-surface-alt border-border'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                filters.in_stock ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Categories — Clean display of all 8 items without scrollbars */}
      <div className="pb-5 border-b border-border/80">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Categories
          </h3>
          {filters.category && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, category: undefined })}
              className="text-[10px] text-brand-crimson dark:text-brand-gold hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, category: undefined })}
            className={`flex w-full items-center justify-between py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
              !filters.category
                ? 'bg-brand-crimson/10 text-brand-crimson dark:text-brand-gold dark:bg-brand-gold/10 font-semibold'
                : 'text-text hover:bg-surface-alt'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((c) => {
            const isSelected = filters.category === c.slug;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    category: isSelected ? undefined : c.slug,
                  })
                }
                className={`flex w-full items-center justify-between py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-brand-crimson/10 text-brand-crimson dark:text-brand-gold dark:bg-brand-gold/10 font-semibold'
                    : 'text-text hover:bg-surface-alt'
                }`}
              >
                <span className="truncate">{c.name}</span>
                <span className="text-[10px] text-text-muted ml-2 font-mono">({c.product_count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gender */}
      <div className="pb-5 border-b border-border/80">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2.5">
          Gender
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {GENDERS.map((g) => {
            const isSelected =
              (g.value === 'all' && !filters.gender) || filters.gender === g.value;
            return (
              <button
                key={g.value}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    gender: g.value === 'all' ? undefined : g.value,
                  })
                }
                className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-brand-crimson bg-brand-crimson/10 text-brand-crimson dark:border-brand-gold dark:text-brand-gold dark:bg-brand-gold/10 font-semibold shadow-xs'
                    : 'border-border/80 bg-surface text-text hover:border-brand-gold/60 hover:bg-surface-alt'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="pb-5 border-b border-border/80">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2.5">
          Price Range
        </h3>
        <div className="space-y-1">
          {PRICE_RANGES.map((pr, idx) => {
            const isSelected =
              filters.min_price === pr.min && filters.max_price === pr.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    min_price: isSelected ? undefined : pr.min,
                    max_price: isSelected ? undefined : pr.max,
                  })
                }
                className={`flex w-full items-center justify-between py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-brand-gold/15 text-brand-crimson dark:text-brand-gold font-semibold'
                    : 'text-text hover:bg-surface-alt'
                }`}
              >
                <span>{pr.label}</span>
                {isSelected && <span className="text-brand-gold font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Occasion */}
      <div className="pb-5 border-b border-border/80">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2.5">
          Occasion
        </h3>
        <div className="space-y-1">
          {OCCASIONS.map((occ) => {
            const isSelected = filters.occasion === occ;
            return (
              <button
                key={occ}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    occasion: isSelected ? undefined : occ,
                  })
                }
                className={`flex w-full items-center justify-between py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-brand-crimson/10 text-brand-crimson dark:text-brand-gold font-semibold'
                    : 'text-text hover:bg-surface-alt'
                }`}
              >
                <span>{occ}</span>
                {isSelected && <span className="text-brand-crimson dark:text-brand-gold font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Discount */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2.5">
          Discounts
        </h3>
        <div className="space-y-1">
          {DISCOUNT_RANGES.map((d) => {
            const isSelected = filters.min_discount === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    min_discount: isSelected ? undefined : d.value,
                  })
                }
                className={`flex w-full items-center justify-between py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-brand-crimson/10 text-brand-crimson dark:text-brand-gold font-semibold'
                    : 'text-text hover:bg-surface-alt'
                }`}
              >
                <span>{d.label}</span>
                {isSelected && <span className="text-brand-crimson dark:text-brand-gold font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
