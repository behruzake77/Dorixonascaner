// ═══════════════════════════════════════════
// Zustand Store — Skaner holati
// ═══════════════════════════════════════════

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScanResult, ScannerState } from '@/types';

export const useScannerStore = create<ScannerState>()(
  persist(
    (set, get) => ({
      isScanning: false,
      lastScan: null,
      scanHistory: [],
      batchMode: false,
      batchScans: [],

      startScanning: () => set({ isScanning: true }),
      
      stopScanning: () => set({ isScanning: false }),

      addScan: (result: ScanResult) =>
        set((state) => ({
          lastScan: result,
          scanHistory: [result, ...state.scanHistory].slice(0, 100), // Oxirgi 100 ta
          batchScans: state.batchMode
            ? [...state.batchScans, result]
            : state.batchScans,
        })),

      clearHistory: () =>
        set({ scanHistory: [], lastScan: null }),

      toggleBatchMode: () =>
        set((state) => ({
          batchMode: !state.batchMode,
          batchScans: state.batchMode ? [] : state.batchScans,
        })),

      clearBatch: () => set({ batchScans: [] }),
    }),
    {
      name: 'dorixona-scanner-storage',
      partialize: (state) => ({
        scanHistory: state.scanHistory.slice(0, 50),
        batchMode: state.batchMode,
      }),
    }
  )
);
