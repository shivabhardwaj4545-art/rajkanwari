import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LayoutDashboard, Menu, Package, ShoppingBag, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { slideInRight, useMotionSafe } from '@/lib/motion';
import { api } from '@/lib/api';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Portal } from '@/components/ui/Portal';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';

// ─── Types & Data ─────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  to: string;
  hasDropdown?: boolean;
}

interface SubCategoryItem {
  label: string;
  to: string;
}

const DEFAULT_SHOP_CATEGORIES: SubCategoryItem[] = [
  { label: 'ANARKALI', to: '/catalog?category=anarkali' },
  { label: 'CROPTOP SKIRT', to: '/catalog?category=croptop-skirt' },
  { label: 'GOWN', to: '/catalog?category=gown' },
  { label: 'INDO WESTERN', to: '/catalog?category=indo-western' },
  { label: 'LEHANGA', to: '/catalog?category=lehanga' },
  { label: 'RAJPUTI POSHAK', to: '/catalog?category=rajputi-poshak' },
  { label: 'SAREE', to: '/catalog?category=saree' },
  { label: 'SHARARA / SUITS', to: '/catalog?category=sharara-suits' },
  { label: 'TESOLS & ACCESSORIES', to: '/catalog?category=accessories' },
];

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/catalog', hasDropdown: true },
  { label: 'Women', to: '/catalog?gender=women' },
  { label: 'Men', to: '/catalog?gender=men' },
  { label: 'New Arrivals', to: '/catalog?sort=newest' },
  { label: 'Contact Us', to: '/policies/contact' },
];

// ─── Desktop Nav Components ───────────────────────────────────────────────────

const DesktopNavLink: React.FC<{ item: NavItem }> = ({ item }) => (
  <NavLink
    to={item.to}
    className={({ isActive }) =>
      [
        'relative text-sm font-semibold transition-colors duration-150 py-1 px-1 uppercase tracking-wider',
        'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-brand-gold',
        'after:transition-[width] after:duration-300',
        'hover:text-brand-gold hover:after:w-full',
        isActive
          ? 'text-brand-gold font-bold after:w-full'
          : 'text-[#F5E6D3]/90',
      ].join(' ')
    }
  >
    {item.label}
  </NavLink>
);

const DesktopNavDropdown: React.FC<{ item: NavItem; categories: SubCategoryItem[] }> = ({
  item,
  categories,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isShopActive = location.pathname.startsWith('/catalog');

  const dropdownItems = categories.length > 0 ? categories : DEFAULT_SHOP_CATEGORIES;

  return (
    <div
      className="relative py-1"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link
        to={item.to}
        className={[
          'inline-flex items-center gap-1 text-sm font-semibold transition-colors duration-150 py-1 px-1 uppercase tracking-wider',
          'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-brand-gold',
          'after:transition-[width] after:duration-300',
          'hover:text-brand-gold hover:after:w-full',
          isShopActive
            ? 'text-brand-gold font-bold after:w-full'
            : 'text-[#F5E6D3]/90',
        ].join(' ')}
      >
        <span>{item.label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-gold' : 'text-[#A8998C]'
          }`}
        />
      </Link>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-0 top-full pt-2 z-50 w-64"
          >
            <div className="rounded-xl bg-[#1A0F0A] border border-brand-gold/30 shadow-2xl py-2 px-1 text-xs space-y-0.5 backdrop-blur-md">
              <div className="px-3.5 py-1.5 border-b border-brand-gold/20 text-[10px] font-extrabold uppercase tracking-widest text-brand-gold">
                Shop By Category
              </div>
              {dropdownItems.map((cat) => (
                <Link
                  key={cat.label}
                  to={cat.to}
                  onClick={() => setIsOpen(false)}
                  className="block px-3.5 py-2 rounded-lg font-semibold text-[#F5E6D3] hover:bg-white/10 hover:text-brand-gold transition-colors tracking-wider uppercase text-[11px]"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Header ───────────────────────────────────────────────────────────────────

export const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<SubCategoryItem[]>([]);
  const location = useLocation();
  const menuVariants = useMotionSafe(slideInRight);

  const mobileNavRef = useFocusTrap<HTMLElement>({
    isOpen: menuOpen,
    onClose: () => setMenuOpen(false),
  });

  const totalItems = useCartStore((s) => s.totalItems);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const pulseBadge = useCartStore((s) => s.pulseBadge);
  const user = useAuthStore((s) => s.user);

  // Load categories from API for navigation dropdown
  useEffect(() => {
    api
      .getCategories()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data
            .filter((c) => c.is_active !== false)
            .map((c) => ({
              label: c.name.toUpperCase(),
              to: `/catalog?category=${c.slug}`,
            }));
          setDynamicCategories(mapped);
        }
      })
      .catch((err) => console.error('Failed to load header categories:', err));
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Add shadow when scrolled
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const currentCategories = dynamicCategories.length > 0 ? dynamicCategories : DEFAULT_SHOP_CATEGORIES;

  return (
    <>
      <header
        className={[
          'sticky top-0 z-40 w-full',
          'bg-royal-dark-gradient border-b border-brand-gold/30 text-[#F5E6D3] transition-all duration-200',
          scrolled ? 'shadow-lg' : '',
        ].join(' ')}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          {/* ── Brand Logo ────────────────────────────────────────────────── */}
          <Link
            to="/"
            id="site-wordmark"
            className="flex items-center text-[#F5E6D3] focus:outline-none"
            aria-label="Rajkanwari - House of Ethnic Wear"
          >
            <BrandLogo variant="full" size="md" inverted />
          </Link>

          {/* ── Desktop Navigation ───────────────────────────────────────────── */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-7">
            {NAV_ITEMS.map((item) =>
              item.hasDropdown ? (
                <DesktopNavDropdown key={item.to} item={item} categories={currentCategories} />
              ) : (
                <DesktopNavLink key={item.to} item={item} />
              )
            )}
          </nav>

          {/* ── Actions ──────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {user?.role === 'owner' && (
              <Link
                to="/admin"
                id="admin-console-button"
                aria-label="Admin Console"
                title="Admin Console"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-gold/15 text-brand-gold text-xs font-semibold border border-brand-gold/40 hover:bg-brand-gold hover:text-black transition-all shadow-xs"
              >
                <LayoutDashboard size={14} />
                <span>Admin</span>
              </Link>
            )}

            {/* Customer Account / Sign In Link */}
            <Link
              to="/auth"
              id="account-button"
              aria-label={user ? `Account (${user.first_name})` : 'Sign in or register'}
              title={user ? `Account (${user.first_name})` : 'Sign in / Register'}
              className={[
                'relative hidden sm:flex h-9 w-9 items-center justify-center rounded-full',
                'border border-brand-gold/30 bg-white/10',
                'text-[#F5E6D3] hover:text-brand-gold hover:border-brand-gold hover:bg-white/20',
                'transition-colors duration-200 cursor-pointer shadow-2xs',
              ].join(' ')}
            >
              <User size={16} aria-hidden />
              {user && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-bg" />
              )}
            </Link>

            {/* My Orders Link */}
            <Link
              to="/orders"
              id="orders-button"
              aria-label="My Orders"
              title="My Orders & Receipts"
              className={[
                'relative hidden sm:flex h-9 w-9 items-center justify-center rounded-full',
                'border border-brand-gold/30 bg-white/10',
                'text-[#F5E6D3] hover:text-brand-gold hover:border-brand-gold hover:bg-white/20',
                'transition-colors duration-200 cursor-pointer shadow-2xs',
              ].join(' ')}
            >
              <Package size={16} aria-hidden />
            </Link>

            {/* Cart Button */}
            <button
              type="button"
              id="cart-button"
              aria-label={`Open bag, ${totalItems} items`}
              onClick={openDrawer}
              className={[
                'relative flex h-9 w-9 items-center justify-center rounded-full',
                'border border-brand-gold/30 bg-white/10',
                'text-[#F5E6D3] hover:text-brand-gold hover:border-brand-gold hover:bg-white/20',
                'transition-colors duration-200 cursor-pointer shadow-2xs',
              ].join(' ')}
            >
              <ShoppingBag size={16} aria-hidden />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  animate={pulseBadge ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-crimson px-1 text-[10px] font-bold text-white shadow"
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </motion.span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-toggle"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((o) => !o)}
              className={[
                'flex h-9 w-9 items-center justify-center rounded-full md:hidden',
                'border border-brand-gold/30 bg-white/10 text-[#F5E6D3]',
                'hover:text-brand-gold hover:border-brand-gold hover:bg-white/20 transition-colors duration-200',
              ].join(' ')}
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <Portal>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />

            {/* Panel */}
            <motion.nav
              key="mobile-nav"
              id="mobile-nav"
              ref={mobileNavRef}
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className={[
                'fixed right-0 top-0 bottom-0 z-[101] w-72 md:hidden',
                'bg-[#1A0F0A] border-l border-brand-gold/30 shadow-2xl text-[#F5E6D3]',
                'flex flex-col gap-1 px-6 pt-20 pb-8',
                'overflow-y-auto focus:outline-none',
              ].join(' ')}
              tabIndex={-1}
            >
              {/* Close button inside panel */}
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="absolute right-4 top-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-brand-gold/30 text-[#F5E6D3] hover:text-brand-gold hover:border-brand-gold transition-colors"
              >
                <X size={18} />
              </button>

              {NAV_ITEMS.map((item) => {
                if (item.hasDropdown) {
                  return (
                    <div key={item.to} className="space-y-1">
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-white/5 font-semibold text-base text-[#F5E6D3]">
                        <NavLink
                          to={item.to}
                          className="flex-1 uppercase tracking-wider"
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                        <button
                          type="button"
                          onClick={() => setMobileShopOpen((o) => !o)}
                          aria-label="Toggle categories dropdown"
                          className="p-1 text-[#A8998C] hover:text-brand-gold"
                        >
                          <ChevronDown
                            size={18}
                            className={`transition-transform duration-200 ${
                              mobileShopOpen ? 'rotate-180 text-brand-gold' : ''
                            }`}
                          />
                        </button>
                      </div>

                      <AnimatePresence>
                        {mobileShopOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 space-y-1 border-l-2 border-brand-gold/40 ml-3 overflow-hidden text-xs"
                          >
                            {currentCategories.map((cat) => (
                              <NavLink
                                key={cat.label}
                                to={cat.to}
                                onClick={() => setMenuOpen(false)}
                                className="block rounded-md px-3 py-2 font-medium text-[#A8998C] hover:text-brand-gold hover:bg-white/5 tracking-wider uppercase text-[11px]"
                              >
                                {cat.label}
                              </NavLink>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        'rounded-md px-3 py-2.5 text-base font-semibold transition-colors duration-150 uppercase tracking-wider',
                        isActive
                          ? 'bg-white/10 text-brand-gold font-bold'
                          : 'text-[#F5E6D3] hover:bg-white/5 hover:text-brand-gold',
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                );
              })}

              <div className="mt-auto pt-6 border-t border-brand-gold/20 space-y-1">
                {user?.role === 'owner' && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-bold text-brand-gold hover:bg-white/5 transition-colors uppercase tracking-wider"
                  >
                    <LayoutDashboard size={16} />
                    <span>Admin Console</span>
                  </NavLink>
                )}
                <NavLink
                  to="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold text-[#F5E6D3] hover:text-brand-gold hover:bg-white/5 transition-colors"
                >
                  My Orders & Receipts
                </NavLink>
                <NavLink
                  to="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold text-[#F5E6D3] hover:text-brand-gold hover:bg-white/5 transition-colors"
                >
                  {user ? `Account (${user.first_name})` : 'Sign in / Register'}
                </NavLink>
              </div>
            </motion.nav>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
};
