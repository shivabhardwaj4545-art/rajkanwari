import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, Heart, Search, Menu, X, Sun, Moon, Shield } from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuthStore.ts';
import { useCartStore } from '../../hooks/useCartStore.ts';
import { useTheme } from '../../hooks/useTheme.ts';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { totalCount, isBouncing, setDrawerOpen } = useCartStore();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const cartCount = totalCount();

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/95 backdrop-blur-md border-b border-border transition-colors duration-200">
      {/* Gold Shimmer Festival Banner */}
      <div className="bg-primary text-white text-[11px] py-6 px-16 text-center font-medium tracking-widest uppercase shadow-sm">
        ✨ HERITAGE FESTIVE COLLECTION — FREE SHIPPING ON ORDERS ABOVE ₹2500 ✨
      </div>

      <div className="max-w-7xl mx-auto px-16 sm:px-24 flex items-center justify-between h-72">
        {/* Mobile Hamburger Menu Button (< 768px) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-8 text-text hover:text-brand-gold min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-24 h-24" /> : <Menu className="w-24 h-24" />}
        </button>

        {/* Brand Logo with Lotus Flourish matching Screenshot 1 */}
        <Link to="/" className="flex items-center gap-8 group">
          <svg className="w-28 h-28 text-brand-primary dark:text-brand-gold fill-current" viewBox="0 0 24 24">
            <path d="M12 2C10.5 5 8 8 4 9c0 0 4 2 6 7 2-5 6-7 6-7-4-1-6.5-4-4-7zm0 20c-3 0-6-1.5-8-4 4 0 6.5-2 8-5 1.5 3 4 5 8 5-2 2.5-5 4-8 4z" />
          </svg>
          <span className="font-serif text-22 sm:text-26 font-bold tracking-widest text-text uppercase">
            RAJKUNWARI
          </span>
        </Link>

        {/* Desktop Horizontal Navigation (>= 768px) matching Screenshot 1 */}
        <nav className="hidden lg:flex items-center gap-24 font-sans text-xs font-semibold text-text uppercase tracking-wider">
          <Link to="/catalog?sort=newest" className="hover:text-brand-gold transition-colors">
            NEW ARRIVALS
          </Link>
          <Link to="/catalog?category=kurtas" className="hover:text-brand-gold transition-colors">
            KURTAS & TOPS
          </Link>
          <Link to="/catalog?category=dresses" className="hover:text-brand-gold transition-colors">
            DRESSES
          </Link>
          <Link to="/catalog?category=bottoms" className="hover:text-brand-gold transition-colors">
            BOTTOMS
          </Link>
          <Link to="/catalog?category=jewellery" className="hover:text-brand-gold transition-colors">
            JEWELLERY
          </Link>
          <Link to="/catalog?category=handbags" className="hover:text-brand-gold transition-colors">
            HANDBAGS
          </Link>
          <Link to="/catalog" className="hover:text-brand-gold transition-colors">
            COLLECTIONS
          </Link>
          {user?.role === 'owner' && (
            <Link to="/admin" className="flex items-center gap-4 text-brand-crimson dark:text-brand-gold font-bold hover:underline">
              <Shield className="w-14 h-14" /> OWNER
            </Link>
          )}
        </nav>

        {/* Right Action Icons matching Screenshot 1 */}
        <div className="flex items-center gap-8 sm:gap-12 text-text">
          {/* Search Icon */}
          <Link
            to="/catalog"
            className="p-8 hover:text-brand-gold rounded-sm min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Search Catalog"
          >
            <Search className="w-20 h-20" />
          </Link>

          {/* User Account / Auth */}
          {user ? (
            <div className="relative group">
              <button
                className="flex items-center gap-6 p-8 hover:text-brand-gold rounded-sm min-h-[44px] text-xs font-medium"
                aria-label="User profile menu"
              >
                <UserIcon className="w-20 h-20" />
              </button>
              <div className="absolute right-0 top-full mt-4 hidden group-hover:block bg-surface border border-border rounded-md shadow-lg py-8 w-48 z-50">
                <div className="px-16 py-8 border-b border-border text-xs">
                  <p className="font-semibold text-text">{user.fullName}</p>
                  <p className="text-text-muted truncate">{user.email}</p>
                </div>
                {user.role === 'owner' && (
                  <Link to="/admin" className="block px-16 py-10 text-xs font-semibold text-brand-crimson dark:text-brand-gold hover:bg-surface-alt min-h-[44px]">
                    Owner Dashboard
                  </Link>
                )}
                <Link to="/orders" className="block px-16 py-10 text-xs text-text hover:bg-surface-alt min-h-[44px]">
                  My Orders & Tracking
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full text-left px-16 py-10 text-xs text-danger hover:bg-surface-alt min-h-[44px]"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/auth"
              className="p-8 hover:text-brand-gold min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Sign In"
            >
              <UserIcon className="w-20 h-20" />
            </Link>
          )}

          {/* Wishlist Heart Icon */}
          <Link
            to="/catalog"
            className="p-8 hover:text-brand-gold rounded-sm min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-20 h-20" />
          </Link>

          {/* Shopping Bag Drawer Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-8 hover:text-brand-gold min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open shopping bag"
          >
            <ShoppingBag className="w-20 h-20" />
            {cartCount > 0 && (
              <span
                className={`absolute top-4 right-4 bg-brand-crimson text-white text-[10px] font-bold w-18 h-18 rounded-full flex items-center justify-center transition-transform duration-300 ${
                  isBouncing ? 'scale-125' : 'scale-100'
                }`}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Theme Selector Icon */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-8 hover:text-brand-gold rounded-sm min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-18 h-18" /> : <Moon className="w-18 h-18" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu (< 1024px) */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-border bg-surface px-16 py-16 flex flex-col gap-8 text-xs font-semibold uppercase tracking-wider">
          <Link to="/catalog?sort=newest" onClick={() => setMobileMenuOpen(false)} className="py-8 text-text hover:text-brand-gold flex items-center min-h-[44px]">
            NEW ARRIVALS
          </Link>
          <Link to="/catalog?category=kurtas" onClick={() => setMobileMenuOpen(false)} className="py-8 text-text hover:text-brand-gold flex items-center min-h-[44px]">
            KURTAS & TOPS
          </Link>
          <Link to="/catalog?category=dresses" onClick={() => setMobileMenuOpen(false)} className="py-8 text-text hover:text-brand-gold flex items-center min-h-[44px]">
            DRESSES
          </Link>
          <Link to="/catalog?category=bottoms" onClick={() => setMobileMenuOpen(false)} className="py-8 text-text hover:text-brand-gold flex items-center min-h-[44px]">
            BOTTOMS
          </Link>
          <Link to="/catalog?category=jewellery" onClick={() => setMobileMenuOpen(false)} className="py-8 text-text hover:text-brand-gold flex items-center min-h-[44px]">
            JEWELLERY
          </Link>
          <Link to="/catalog?category=handbags" onClick={() => setMobileMenuOpen(false)} className="py-8 text-text hover:text-brand-gold flex items-center min-h-[44px]">
            HANDBAGS
          </Link>
          <Link to="/catalog" onClick={() => setMobileMenuOpen(false)} className="py-8 text-text hover:text-brand-gold flex items-center min-h-[44px]">
            COLLECTIONS
          </Link>
        </nav>
      )}
    </header>
  );
};
