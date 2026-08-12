'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Dizayn
  theme: 'dark' | 'light' | 'auto';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  beepVolume: number; // 0-1

  // Skaner
  scanEngine: 'auto' | 'native' | 'html5qrcode';
  autoLookup: boolean;    // Skanerlaganda avtomatik dori qidirish
  scanDelay: number;      // Takroriy scan blokirovka (ms)
  torchDefault: boolean;  // Kamera yoqilganda chiroq avtomatik yoqilsinmi

  // Ombor
  lowStockThreshold: number; // Default min. miqdor
  showPrices: boolean;

  // Bildirishnoma
  expiryAlertDays: number;  // Necha kun oldin ogohlantirish

  // Actions
  setTheme: (theme: 'dark' | 'light' | 'auto') => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setBeepVolume: (volume: number) => void;
  setScanEngine: (engine: 'auto' | 'native' | 'html5qrcode') => void;
  setAutoLookup: (auto: boolean) => void;
  setScanDelay: (delay: number) => void;
  setTorchDefault: (on: boolean) => void;
  setLowStockThreshold: (threshold: number) => void;
  setShowPrices: (show: boolean) => void;
  setExpiryAlertDays: (days: number) => void;
  resetToDefaults: () => void;
}

const defaults = {
  theme: 'dark' as const,
  soundEnabled: true,
  vibrationEnabled: true,
  beepVolume: 0.3,
  scanEngine: 'auto' as const,
  autoLookup: true,
  scanDelay: 1500,
  torchDefault: false,
  lowStockThreshold: 5,
  showPrices: true,
  expiryAlertDays: 30,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,

      setTheme: (theme) => set({ theme }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),
      setBeepVolume: (beepVolume) => set({ beepVolume }),
      setScanEngine: (scanEngine) => set({ scanEngine }),
      setAutoLookup: (autoLookup) => set({ autoLookup }),
      setScanDelay: (scanDelay) => set({ scanDelay }),
      setTorchDefault: (torchDefault) => set({ torchDefault }),
      setLowStockThreshold: (lowStockThreshold) => set({ lowStockThreshold }),
      setShowPrices: (showPrices) => set({ showPrices }),
      setExpiryAlertDays: (expiryAlertDays) => set({ expiryAlertDays }),
      resetToDefaults: () => set(defaults),
    }),
    {
      name: 'dorixona-settings',
    }
  )
);
