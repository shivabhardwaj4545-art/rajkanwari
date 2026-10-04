import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (pref: ThemePreference) => void;
  _resolveFromSystem: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveTheme(_pref?: ThemePreference): ResolvedTheme {
  return 'light';
}

function applyTheme(_theme?: ResolvedTheme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        preference: 'light',
        resolved: 'light',

        setPreference(pref: ThemePreference) {
          const resolved = resolveTheme(pref);
          applyTheme(resolved);
          set({ preference: pref, resolved });
        },

        _resolveFromSystem() {
          // Keep light theme as the stable store default
          applyTheme('light');
          set({ preference: 'light', resolved: 'light' });
        },
      }),
      {
        name: 'shikkis-theme',
        onRehydrateStorage: () => (state) => {
          if (state) {
            const resolved = resolveTheme(state.preference);
            applyTheme(resolved);
            state.resolved = resolved;
          }
        },
      },
    ),
  ),
);

// Synchronize theme on startup - strictly light
if (typeof window !== 'undefined') {
  try {
    localStorage.setItem('shikkis-theme', 'light');
  } catch {}

  applyTheme('light');
}
