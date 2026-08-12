// ═══════════════════════════════════════════
// API Client — Backend bilan aloqa
// ═══════════════════════════════════════════

import axios from 'axios';
import type { ApiResponse, Medicine, MedicineGtin, SearchFilters, PaginatedResponse } from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ═══════════════════════════════════════════
// DORI MA'LUMOTLARI
// ═══════════════════════════════════════════

/**
 * Barcode bo'yicha dori qidirish
 */
export async function findMedicineByBarcode(barcode: string): Promise<ApiResponse<Medicine>> {
  try {
    const response = await api.get<ApiResponse<Medicine>>(`/medicines/barcode/${barcode}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { success: false, error: 'Dori topilmadi' };
    }
    return { success: false, error: 'Xatolik yuz berdi' };
  }
}

/**
 * GTIN bo'yicha dori qidirish
 */
export async function findMedicineByGtin(gtin: string): Promise<ApiResponse<Medicine>> {
  try {
    const response = await api.get<ApiResponse<Medicine>>(`/medicines/gtin/${gtin}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { success: false, error: 'GTIN bo\'yicha dori topilmadi' };
    }
    return { success: false, error: 'Xatolik yuz berdi' };
  }
}

/**
 * Dorilar ro'yxati
 */
export async function getMedicines(
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<Medicine>>> {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<Medicine>>>(
      `/medicines?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  } catch (error) {
    return { success: false, error: 'Dorilar ro\'yxatini olishda xatolik' };
  }
}

/**
 * Dori qidirish
 */
export async function searchMedicines(
  filters: SearchFilters,
  page: number = 1
): Promise<ApiResponse<PaginatedResponse<Medicine>>> {
  try {
    const response = await api.post<ApiResponse<PaginatedResponse<Medicine>>>(
      '/medicines/search',
      { ...filters, page }
    );
    return response.data;
  } catch (error) {
    return { success: false, error: 'Qidirishda xatolik' };
  }
}

/**
 * Dori yaratish (scraping bilan)
 */
export async function createMedicine(barcode: string): Promise<ApiResponse<Medicine>> {
  try {
    const response = await api.post<ApiResponse<Medicine>>('/medicines', { barcode });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Dori yaratishda xatolik',
    };
  }
}

// ═══════════════════════════════════════════
// GTIN OPERATSIYALARI
// ═══════════════════════════════════════════

/**
 * Dori uchun GTIN qo'shish
 */
export async function addGtin(
  medicineId: string,
  data: { gtin: string; serial?: string; expiry?: string; batch?: string }
): Promise<ApiResponse<MedicineGtin>> {
  try {
    const response = await api.post<ApiResponse<MedicineGtin>>(
      `/medicines/${medicineId}/gtins`,
      data
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'GTIN qo\'shishda xatolik',
    };
  }
}

/**
 * Noma'lum GTIN saqlash
 */
export async function saveUnknownGtin(data: {
  gtin: string;
  rawData?: string;
  serial?: string;
  expiry?: string;
  batch?: string;
}): Promise<ApiResponse<any>> {
  try {
    const response = await api.post<ApiResponse<any>>('/unknown-gtins', data);
    return response.data;
  } catch (error) {
    return { success: false, error: 'GTIN saqlashda xatolik' };
  }
}

/**
 * Batch skanerlash natijalarini saqlash
 */
export async function saveBatchScan(scans: any[]): Promise<ApiResponse<any>> {
  try {
    const response = await api.post<ApiResponse<any>>('/scan-sessions', { scans });
    return response.data;
  } catch (error) {
    return { success: false, error: 'Batch saqlashda xatolik' };
  }
}

// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════

/**
 * Ovoz effekti (beep) — sozlamalarga mos
 */
export function playBeep(type: 'success' | 'error' | 'warning' = 'success') {
  try {
    // Sozlamalarni o'qish (Zustand persist dan)
    let soundEnabled = true;
    let volume = 0.3;
    try {
      const stored = JSON.parse(localStorage.getItem('dorixona-settings') || '{}');
      if (stored.state) {
        soundEnabled = stored.state.soundEnabled ?? true;
        volume = stored.state.beepVolume ?? 0.3;
      }
    } catch {}

    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'success':
        oscillator.frequency.value = 1200;
        gainNode.gain.value = volume;
        oscillator.type = 'sine';
        break;
      case 'error':
        oscillator.frequency.value = 400;
        gainNode.gain.value = Math.min(volume + 0.2, 1);
        oscillator.type = 'sawtooth';
        break;
      case 'warning':
        oscillator.frequency.value = 800;
        gainNode.gain.value = volume;
        oscillator.type = 'triangle';
        break;
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (e) {
    console.warn('Audio not supported');
  }
}

/**
 * Vibratsiya effekti — sozlamalarga mos
 */
export function vibrateDevice(pattern: number[] = [100, 50, 100]) {
  try {
    let vibrationEnabled = true;
    try {
      const stored = JSON.parse(localStorage.getItem('dorixona-settings') || '{}');
      if (stored.state) {
        vibrationEnabled = stored.state.vibrationEnabled ?? true;
      }
    } catch {}

    if (!vibrationEnabled) return;

    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {}
}
