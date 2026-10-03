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

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === 'system') return getSystemTheme();
  return pref;
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
      (set, get) => ({
        preference: 'system',
        resolved: 'light',

        setPreference(pref: ThemePreference) {
          const resolved = resolveTheme(pref);
          applyTheme(resolved);
          set({ preference: pref, resolved });
        },

        _resolveFromSystem() {
          if (get().preference === 'system') {
            const resolved = getSystemTheme();
            applyTheme(resolved);
            set({ resolved });
          }
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
  let stored: ThemePreference = 'system';
  try {
    const raw = localStorage.getItem('shikkis-theme');
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      stored = raw;
    } else if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.preference) stored = parsed.state.preference;
    }
  } catch {}

  const initialResolved = resolveTheme(stored);
  applyTheme(initialResolved);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    useThemeStore.getState()._resolveFromSystem();
  });
}
