import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Sparkles, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';

const QUICK_PROMPTS = [
  'Hi! I would like to inquire about Bridal Lehengas.',
  'Hello, I want details regarding Rajputi Poshak customization.',
  'Hi Rajkanwari, can I know your boutique store address in Jodhpur?',
];

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = (customMsg?: string) => {
    const textToSend = customMsg || message || 'Hello Rajkanwari! I would like to inquire about your ethnic wear collection.';
    const phoneNumber = '917568572265';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(textToSend)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* ── WhatsApp Chat Popup Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-auto mb-4 w-[330px] sm:w-[360px] rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 font-serif font-bold text-lg text-white border border-white/30">
                  R
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#25D366] ring-2 ring-[#075E54]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm leading-tight">Rajkanwari Jodhpur</h4>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={11} className="text-emerald-300" />
                    <span>Online | Flagship Boutique</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/917568572265?text=Hi%20Rajkanwari!%20I%20would%20like%20to%20connect%20directly."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#25D366] text-white text-[11px] font-bold hover:bg-[#1EBE5B] transition-colors shadow-xs"
                  title="Direct Chat on WhatsApp"
                >
                  <MessageCircle size={12} className="fill-white stroke-none" />
                  <span>Direct Chat</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="rounded-full p-1 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-4 bg-[#E5DDD5]/40 dark:bg-stone-900/60 space-y-3 max-h-[320px] overflow-y-auto">
              {/* Bot Message */}
              <div className="bg-surface p-3.5 rounded-2xl rounded-tl-xs shadow-sm border border-border/60 max-w-[88%] space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                  <Sparkles size={12} />
                  <span>Rajkanwari Concierge</span>
                </div>
                <p className="text-xs text-text leading-relaxed">
                  Namaste! 🙏 Welcome to Rajkanwari — House of Ethnic Wear. How can we assist you with your bridal or festive ensemble today?
                </p>
                <span className="block text-[10px] text-text-muted text-right mt-1">Just now</span>
              </div>

              {/* Quick Prompts */}
              <div className="pt-2 space-y-1.5">
                <p className="text-[11px] font-semibold text-text-muted px-1 uppercase tracking-wider">
                  Quick Inquiry:
                </p>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="w-full text-left text-xs p-2.5 rounded-xl bg-surface hover:bg-brand-crimson/10 hover:text-brand-crimson dark:hover:text-brand-gold border border-border transition-colors shadow-2xs font-medium"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-surface border-t border-border flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-brand-gold"
              />
              <button
                type="submit"
                aria-label="Send WhatsApp Message"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366] text-white hover:bg-[#1EBE5B] transition-colors shadow-sm"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating WhatsApp Trigger Button ──────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact Rajkanwari on WhatsApp"
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all border-2 border-white dark:border-stone-900 group"
      >
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping z-0 pointer-events-none" />
        <MessageCircle size={28} className="relative z-10 fill-white stroke-[#25D366]" />

        {/* Unread badge */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-crimson text-[10px] font-bold text-white ring-2 ring-white">
            1
          </span>
        )}
      </button>
    </div>
  );
};
