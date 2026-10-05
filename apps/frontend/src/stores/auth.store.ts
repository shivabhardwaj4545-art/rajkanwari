import { create } from 'zustand';
import { api, clearAuthTokens, getRefreshToken, onAuthSessionRefreshed, setAuthTokens, type UserProfile } from '@/lib/api';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  demoUsers: Array<{ id: string; email: string; first_name: string; last_name: string; role: string }>;

  initAuth: () => Promise<void>;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUser: (email: string) => Promise<void>;
  setAuthSession: (user: UserProfile, accessToken: string, refreshToken?: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,
  demoUsers: [],

  setAuthSession: (user: UserProfile, accessToken: string, refreshToken?: string) => {
    setAuthTokens(accessToken, refreshToken);
    set({ user, initialized: true });
  },

  initAuth: async () => {
    try {
      set({ loading: true });

      // Fetch demo users for QA switcher
      try {
        const demoRes = await api.getDemoUsers();
        set({ demoUsers: demoRes.users });
      } catch {
        // ignore
      }

      // Check current user session
      try {
        const res = await api.getMe();
        set({ user: res.user, initialized: true });
        return;
      } catch (err: any) {
        // Try silent refresh if refresh token is available
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            const refreshRes = await api.refreshToken(refreshToken);
            setAuthTokens(refreshRes.accessToken, refreshRes.refreshToken);
            set({ user: refreshRes.user, initialized: true });
            return;
          } catch (refreshErr: any) {
            // Only clear tokens if the refresh token is explicitly rejected as invalid or revoked by the server
            if (refreshErr?.status === 401 || refreshErr?.status === 403) {
              clearAuthTokens();
              set({ user: null, initialized: true });
              return;
            }
            // For network errors (e.g. system wake before WiFi reconnects), do NOT wipe stored tokens
            set({ initialized: true });
            return;
          }
        } else if (err?.status === 401) {
          clearAuthTokens();
          set({ user: null, initialized: true });
          return;
        }
        set({ initialized: true });
      }
    } finally {
      set({ loading: false });
    }
  },

  login: async (email: string, password: string = '123456') => {
    try {
      set({ loading: true });
      const res = await api.login(email, password);
      setAuthTokens(res.accessToken, res.refreshToken);
      set({ user: res.user, initialized: true });
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      await api.logout();
      clearAuthTokens();
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  switchUser: async (email: string) => {
    await get().login(email, '123456');
    window.location.reload();
  },
}));

// Automatically sync store whenever api.ts performs a silent token refresh
if (typeof window !== 'undefined') {
  onAuthSessionRefreshed((user) => {
    useAuthStore.setState({ user, initialized: true });
  });
}

