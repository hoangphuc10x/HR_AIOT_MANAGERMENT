import { create } from 'zustand';

interface LogoState {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  resetLogo: () => void;
}

export const useLogoStore = create<LogoState>((set) => ({
  logoUrl: '/logo.png',
  setLogoUrl: (url) => set({ logoUrl: url }),
  resetLogo: () => set({ logoUrl: '/logo.png' }),
}));
