import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Package, ShoppingBag, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { slideInRight, useMotionSafe } from '@/lib/motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Women', to: '/catalog?gender=women' },
  { label: 'Men', to: '/catalog?gender=men' },
  { label: 'New Arrivals', to: '/catalog?sort=newest' },
  { label: 'Sale', to: '/catalog?sale=true' },
];

// ─── Desktop Nav Link ─────────────────────────────────────────────────────────

const DesktopNavLink: React.FC<{ item: NavItem }> = ({ item }) => (
  <NavLink
    to={item.to}
    className={({ isActive }) =>
      [
        'relative text-sm font-semibold transition-colors duration-150 py-1 px-1',
        'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-brand-gold',
        'after:transition-[width] after:duration-300',
        'hover:text-brand-crimson dark:hover:text-brand-gold hover:after:w-full',
        isActive
          ? 'text-brand-crimson dark:text-brand-gold font-bold after:w-full'
          : 'text-text',
      ].join(' ')
    }
  >
    {item.label}
  </NavLink>
);

// ─── Header ───────────────────────────────────────────────────────────────────

export const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  return (
    <>
      <header
        className={[
          'sticky top-0 z-40 w-full',
          'bg-surface border-b border-border transition-shadow duration-200',
          scrolled ? 'shadow-md' : 'shadow-xs',
        ].join(' ')}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          {/* ── Brand Logo ────────────────────────────────────────────────── */}
          <Link
            to="/"
            id="site-wordmark"
            className="flex items-center text-text hover:opacity-95 transition-opacity duration-200 focus:outline-none"
            aria-label="Rajkanwari - House of Ethnic Wear"
          >
            <BrandLogo variant="full" size="md" />
          </Link>

          {/* ── Desktop Navigation ───────────────────────────────────────────── */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <DesktopNavLink key={item.to} item={item} />
            ))}
          </nav>

          {/* ── Actions ──────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Customer Account / Sign In Link */}
            <Link
              to="/auth"
              id="account-button"
              aria-label={user ? `Account (${user.first_name})` : 'Sign in or register'}
              title={user ? `Account (${user.first_name})` : 'Sign in / Register'}
              className={[
                'relative flex h-9 w-9 items-center justify-center rounded-full',
                'border border-border bg-surface-alt',
                'text-text hover:text-brand-crimson dark:hover:text-brand-gold hover:border-brand-gold',
                'transition-colors duration-200 cursor-pointer shadow-xs',
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
                'relative flex h-9 w-9 items-center justify-center rounded-full',
                'border border-border bg-surface-alt',
                'text-text hover:text-brand-crimson dark:hover:text-brand-gold hover:border-brand-gold',
                'transition-colors duration-200 cursor-pointer shadow-xs',
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
                'border border-border bg-surface-alt',
                'text-text hover:text-brand-crimson dark:hover:text-brand-gold hover:border-brand-gold',
                'transition-colors duration-200 cursor-pointer shadow-xs',
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
                'border border-border bg-surface-alt text-text',
                'hover:text-brand-crimson dark:hover:text-brand-gold hover:border-brand-gold transition-colors duration-200',
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
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
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
                'fixed right-0 top-0 bottom-0 z-40 w-72 md:hidden',
                'bg-surface border-l border-border shadow-2xl',
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
                className="absolute right-4 top-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-border text-text hover:text-brand-crimson dark:hover:text-brand-gold hover:border-brand-gold transition-colors"
              >
                <X size={18} />
              </button>

              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'rounded-md px-3 py-2.5 text-base font-semibold transition-colors duration-150',
                      isActive
                        ? 'bg-surface-alt text-brand-crimson dark:text-brand-gold font-bold'
                        : 'text-text hover:bg-surface-alt hover:text-brand-crimson dark:hover:text-brand-gold',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-auto pt-6 border-t border-border space-y-1">
                <NavLink
                  to="/orders"
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold text-text hover:text-brand-crimson dark:hover:text-brand-gold hover:bg-surface-alt transition-colors"
                >
                  My Orders & Receipts
                </NavLink>
                <NavLink
                  to="/auth"
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold text-text hover:text-brand-crimson dark:hover:text-brand-gold hover:bg-surface-alt transition-colors"
                >
                  Sign in / Register
                </NavLink>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
