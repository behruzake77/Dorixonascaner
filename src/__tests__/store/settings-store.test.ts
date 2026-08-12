// ═══════════════════════════════════════════
// Settings Store — Unit Tests
// ═══════════════════════════════════════════

import { useSettingsStore } from '../../store/settings-store';

describe('Settings Store', () => {
  beforeEach(() => {
    // Standart holatga qaytarish
    useSettingsStore.getState().resetToDefaults();
  });

  test('standart qiymatlar', () => {
    const state = useSettingsStore.getState();
    expect(state.theme).toBe('dark');
    expect(state.soundEnabled).toBe(true);
    expect(state.vibrationEnabled).toBe(true);
    expect(state.beepVolume).toBe(0.3);
    expect(state.scanEngine).toBe('auto');
    expect(state.autoLookup).toBe(true);
    expect(state.scanDelay).toBe(1500);
    expect(state.lowStockThreshold).toBe(5);
  });

  test('temani o\'zgartirish', () => {
    useSettingsStore.getState().setTheme('light');
    expect(useSettingsStore.getState().theme).toBe('light');
  });

  test('ovozni o\'chirish', () => {
    useSettingsStore.getState().setSoundEnabled(false);
    expect(useSettingsStore.getState().soundEnabled).toBe(false);
  });

  test('vibratsiyani o\'chirish', () => {
    useSettingsStore.getState().setVibrationEnabled(false);
    expect(useSettingsStore.getState().vibrationEnabled).toBe(false);
  });

  test('beep volume', () => {
    useSettingsStore.getState().setBeepVolume(0.8);
    expect(useSettingsStore.getState().beepVolume).toBe(0.8);
  });

  test('scan delay', () => {
    useSettingsStore.getState().setScanDelay(2000);
    expect(useSettingsStore.getState().scanDelay).toBe(2000);
  });

  test('low stock threshold', () => {
    useSettingsStore.getState().setLowStockThreshold(10);
    expect(useSettingsStore.getState().lowStockThreshold).toBe(10);
  });

  test('reset to defaults', () => {
    useSettingsStore.getState().setTheme('light');
    useSettingsStore.getState().setSoundEnabled(false);
    useSettingsStore.getState().setBeepVolume(0.9);
    
    useSettingsStore.getState().resetToDefaults();
    
    const state = useSettingsStore.getState();
    expect(state.theme).toBe('dark');
    expect(state.soundEnabled).toBe(true);
    expect(state.beepVolume).toBe(0.3);
  });
});
