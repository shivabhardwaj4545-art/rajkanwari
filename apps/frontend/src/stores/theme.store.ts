import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  /** What the user chose — stored in localStorage */
  preference: ThemePreference;
  /** The actual theme applied to the DOM right now */
  resolved: ResolvedTheme;
  /** Update user preference and resolve it immediately */
  setPreference: (pref: ThemePreference) => void;
  /** Called internally when the OS preference changes */
  _resolveFromSystem: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyTheme(_theme?: ResolvedTheme): void {
  document.documentElement.setAttribute('data-theme', 'light');
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        preference: 'light',
        resolved: 'light',

        setPreference() {
          applyTheme('light');
          set({ preference: 'light', resolved: 'light' });
        },

        _resolveFromSystem() {
          applyTheme('light');
          set({ preference: 'light', resolved: 'light' });
        },
      }),
      {
        name: 'rajkanwari-theme',
        partialize: () => ({ preference: 'light' }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            applyTheme('light');
            state.preference = 'light';
            state.resolved = 'light';
          }
        },
      },
    ),
  ),
);

// Enforce light theme on load
if (typeof window !== 'undefined') {
  applyTheme('light');
}
