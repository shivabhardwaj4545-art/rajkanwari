import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/ui/BrandLogo';

const FOOTER_LINKS = {
  Shop: [
    { label: 'Women', to: '/catalog?gender=women' },
    { label: 'Men', to: '/catalog?gender=men' },
    { label: 'New Arrivals', to: '/catalog?sort=newest' },
    { label: 'Sale', to: '/catalog?sale=true' },
  ],
  Help: [
    { label: 'Track Order', to: '/orders' },
    { label: 'Shipping Policy', to: '/policies/shipping' },
    { label: 'Returns & Exchanges', to: '/policies/returns' },
    { label: 'FAQ', to: '/policies/faq' },
    { label: 'Privacy Policy', to: '/policies/privacy' },
    { label: 'Terms & Conditions', to: '/policies/terms' },
  ],
};

export const Footer: React.FC = () => (
  <footer className="border-t border-border bg-royal-sand-gradient text-text" aria-label="Site footer">
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

        {/* ── Brand column ─────────────────────────────────────────────────── */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Link
            to="/"
            className="inline-block text-text focus:outline-none"
            aria-label="Shikki's — Curated Style"
          >
            <BrandLogo variant="full" size="lg" />
          </Link>
          <p className="text-sm text-text-muted max-w-md leading-relaxed">
            Shikkis — Curated Style. Luxury designer bridal lehengas, Rajputi poshaks &amp; festive couture.
          </p>

          {/* ── Contact ─────────────────────────────────────────────────────── */}
          <address className="not-italic flex flex-col gap-2 text-sm text-text-muted">
            <span className="flex items-start gap-2">
              <MapPin size={15} className="text-brand-gold shrink-0 mt-0.5" aria-hidden />
              <span>269, 2nd C Road, Near Nikky Tiles, Sardarpura, Jodhpur, Rajasthan - 342001</span>
            </span>
            <span className="flex items-center gap-2">
              <Phone size={14} className="text-brand-gold shrink-0" aria-hidden />
              <a href="tel:+917568572265" className="hover:text-text transition-colors">
                +91 75685 72265
              </a>
              <span>/</span>
              <a href="tel:+918619474459" className="hover:text-text transition-colors">
                +91 86194 74459
              </a>
            </span>
            <a
              href="mailto:hello@shikkis.com"
              className="flex items-center gap-2 hover:text-text transition-colors"
            >
              <Mail size={14} className="text-brand-gold shrink-0" aria-hidden />
              hello@shikkis.com
            </a>
          </address>
        </div>

        {/* ── Link columns ─────────────────────────────────────────────────── */}
        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
          <div key={section} className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              {section}
            </h3>
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-muted hover:text-text transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border pt-6">
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} Shikkis — Curated Style. Flagship Boutique: Jodhpur, Rajasthan. All rights reserved.
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-2.5" role="group" aria-label="Social media links">
          <a
            href="https://www.instagram.com/rajkanwari_ethnic_wear/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Shikkis on Instagram"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-border/80 bg-surface/80 text-text-muted hover:text-brand-crimson hover:border-brand-gold hover:bg-surface transition-all hover:scale-105"
          >
            <Instagram size={17} aria-hidden />
          </a>
          <a
            href="https://www.facebook.com/p/Rajkanwari-House-of-Ethnic-Wear-100077052254113/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Shikkis on Facebook"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-border/80 bg-surface/80 text-text-muted hover:text-brand-crimson hover:border-brand-gold hover:bg-surface transition-all hover:scale-105"
          >
            <Facebook size={17} aria-hidden />
          </a>
          <a
            href="https://wa.me/917568572265?text=Hello%20Shikkis,%20I%20would%20like%20to%20inquire%20about%20your%20collection"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Shikkis on WhatsApp"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-border/80 bg-surface/80 text-text-muted hover:text-[#25D366] hover:border-[#25D366] hover:bg-surface transition-all hover:scale-105"
          >
            <MessageCircle size={17} aria-hidden />
          </a>
          <a
            href="tel:+917568572265"
            aria-label="Call Shikkis Flagship Boutique"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-border/80 bg-surface/80 text-text-muted hover:text-brand-crimson hover:border-brand-gold hover:bg-surface transition-all hover:scale-105"
          >
            <Phone size={16} aria-hidden />
          </a>
          <a
            href="mailto:hello@shikkis.com"
            aria-label="Email Shikkis"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-border/80 bg-surface/80 text-text-muted hover:text-brand-crimson hover:border-brand-gold hover:bg-surface transition-all hover:scale-105"
          >
            <Mail size={16} aria-hidden />
          </a>
        </div>
      </div>
    </div>
  </footer>
);
