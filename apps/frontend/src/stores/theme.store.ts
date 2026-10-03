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

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === 'dark') return 'dark';
  return 'light';
}

function applyTheme(theme: ResolvedTheme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
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

// Synchronize theme on startup
if (typeof window !== 'undefined') {
  let stored: ThemePreference = 'light';
  try {
    const raw = localStorage.getItem('shikkis-theme');
    if (raw === 'dark') {
      stored = 'dark';
    } else {
      stored = 'light';
      localStorage.setItem('shikkis-theme', 'light');
    }
  } catch {}

  const initialResolved = resolveTheme(stored);
  applyTheme(initialResolved);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    useThemeStore.getState()._resolveFromSystem();
  });
}
