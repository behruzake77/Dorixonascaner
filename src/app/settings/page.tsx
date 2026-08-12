'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  ChevronLeft,
  Volume2,
  VolumeX,
  Vibrate,
  Flashlight,
  ScanBarcode,
  Package,
  Bell,
  Palette,
  RotateCcw,
  CheckCircle2,
  Moon,
  Sun,
  Smartphone,
  Gauge,
  Search,
  DollarSign,
  Clock,
  Zap,
} from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { playBeep } from '@/lib/api';

export default function SettingsPage() {
  const store = useSettingsStore();
  const [saved, setSaved] = useState(false);

  const handleTestSound = () => {
    playBeep('success');
  };

  const handleReset = () => {
    if (confirm("Barcha sozlamalarni standart holatga qaytarishni xohlaysizmi?")) {
      store.resetToDefaults();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          <a href="/" className="p-2 rounded-xl hover:bg-card-hover">
            <ChevronLeft size={20} className="text-muted" />
          </a>
          <Settings size={20} className="text-primary" />
          <h1 className="text-lg font-bold">Sozlamalar</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 space-y-6">
        {/* Saqlandi xabari */}
        {saved && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-success/10 border border-success/30 text-success rounded-xl p-3 flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span className="text-sm">Sozlamalar standart holatga qaytarildi</span>
          </motion.div>
        )}

        {/* ═══ DIZAYN ═══ */}
        <Section title="Dizayn" icon={Palette}>
          {/* Tema */}
          <SettingRow
            icon={Moon}
            title="Tema"
            description="Ilova ko'rinishi"
          >
            <div className="flex gap-1.5">
              {[
                { id: 'dark' as const, icon: Moon, label: 'Qorong\'u' },
                { id: 'light' as const, icon: Sun, label: 'Yorug\'' },
                { id: 'auto' as const, icon: Smartphone, label: 'Auto' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => store.setTheme(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    store.theme === t.id
                      ? 'bg-primary text-white'
                      : 'bg-card-hover text-muted'
                  }`}
                >
                  <t.icon size={12} />
                  {t.label}
                </button>
              ))}
            </div>
          </SettingRow>
        </Section>

        {/* ═══ OVOZ VA VIBRATSIYA ═══ */}
        <Section title="Ovoz va vibratsiya" icon={Volume2}>
          {/* Ovoz */}
          <SettingRow
            icon={store.soundEnabled ? Volume2 : VolumeX}
            title="Ovoz (Beep)"
            description="Skanerlashda ovoz chiqadi"
          >
            <Toggle
              checked={store.soundEnabled}
              onChange={store.setSoundEnabled}
            />
          </SettingRow>

          {/* Ovoz balandligi */}
          {store.soundEnabled && (
            <SettingRow
              icon={Gauge}
              title="Ovoz balandligi"
              description={`${Math.round(store.beepVolume * 100)}%`}
            >
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={store.beepVolume}
                onChange={(e) => store.setBeepVolume(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-card rounded-full appearance-none cursor-pointer accent-primary"
              />
            </SettingRow>
          )}

          {/* Vibratsiya */}
          <SettingRow
            icon={Vibrate}
            title="Vibratsiya"
            description="Skanerlashda telefon titraydi"
          >
            <Toggle
              checked={store.vibrationEnabled}
              onChange={store.setVibrationEnabled}
            />
          </SettingRow>

          {/* Test */}
          <button
            onClick={handleTestSound}
            className="w-full h-11 bg-card-hover rounded-xl text-sm text-muted flex items-center justify-center gap-2 hover:text-foreground transition-colors"
          >
            <Volume2 size={16} />
            Ovozni sinash
          </button>
        </Section>

        {/* ═══ SKANER ═══ */}
        <Section title="Skaner" icon={ScanBarcode}>
          {/* Engine */}
          <SettingRow
            icon={Zap}
            title="Skanerlash engine"
            description="Auto — eng tezini tanlaydi"
          >
            <div className="flex gap-1.5">
              {[
                { id: 'auto' as const, label: 'Auto' },
                { id: 'native' as const, label: 'Native' },
                { id: 'html5qrcode' as const, label: 'html5' },
              ].map((e) => (
                <button
                  key={e.id}
                  onClick={() => store.setScanEngine(e.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    store.scanEngine === e.id
                      ? 'bg-primary text-white'
                      : 'bg-card-hover text-muted'
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </SettingRow>

          {/* Auto lookup */}
          <SettingRow
            icon={Search}
            title="Avtomatik qidirish"
            description="Skanerlaganda dori ma'lumotini avtomatik topadi"
          >
            <Toggle
              checked={store.autoLookup}
              onChange={store.setAutoLookup}
            />
          </SettingRow>

          {/* Scan delay */}
          <SettingRow
            icon={Clock}
            title="Takroriy scan blokirovka"
            description={`${(store.scanDelay / 1000).toFixed(1)} soniya`}
          >
            <select
              value={store.scanDelay}
              onChange={(e) => store.setScanDelay(parseInt(e.target.value))}
              className="bg-card-hover text-foreground text-xs rounded-lg px-3 py-1.5 border-none focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="500">0.5s — Tez</option>
              <option value="1000">1.0s — Normal</option>
              <option value="1500">1.5s — Standart</option>
              <option value="2000">2.0s — Sekin</option>
              <option value="3000">3.0s — Juda sekin</option>
            </select>
          </SettingRow>

          {/* Torch default */}
          <SettingRow
            icon={Flashlight}
            title="Chiroq avtomatik yoqish"
            description="Kamera yoqilganda chiroq ham yoqiladi"
          >
            <Toggle
              checked={store.torchDefault}
              onChange={store.setTorchDefault}
            />
          </SettingRow>
        </Section>

        {/* ═══ OMBOR ═══ */}
        <Section title="Ombor" icon={Package}>
          <SettingRow
            icon={Bell}
            title="Kam qolgan ogohlantirish"
            description={`Miqdor ${store.lowStockThreshold} dan kam bo'lsa ogohlantiradi`}
          >
            <input
              type="number"
              min="1"
              max="100"
              value={store.lowStockThreshold}
              onChange={(e) => store.setLowStockThreshold(parseInt(e.target.value) || 5)}
              className="w-16 bg-card-hover text-foreground text-sm rounded-lg px-3 py-1.5 text-center border-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </SettingRow>

          <SettingRow
            icon={DollarSign}
            title="Narxlarni ko'rsatish"
            description="Dori kartochkalarida narx ko'rinadi"
          >
            <Toggle
              checked={store.showPrices}
              onChange={store.setShowPrices}
            />
          </SettingRow>
        </Section>

        {/* ═══ BILDIRISHNOMALAR ═══ */}
        <Section title="Bildirishnomalar" icon={Bell}>
          <SettingRow
            icon={Clock}
            title="Muddati o'tgan ogohlantirish"
            description={`${store.expiryAlertDays} kun oldin ogohlantiradi`}
          >
            <select
              value={store.expiryAlertDays}
              onChange={(e) => store.setExpiryAlertDays(parseInt(e.target.value))}
              className="bg-card-hover text-foreground text-xs rounded-lg px-3 py-1.5 border-none focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="7">7 kun</option>
              <option value="14">14 kun</option>
              <option value="30">30 kun</option>
              <option value="60">60 kun</option>
              <option value="90">90 kun</option>
            </select>
          </SettingRow>
        </Section>

        {/* ═══ RESET ═══ */}
        <button
          onClick={handleReset}
          className="w-full h-12 bg-danger/10 border border-danger/30 text-danger rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-danger/20 transition-colors"
        >
          <RotateCcw size={16} />
          Standart sozlamalarga qaytarish
        </button>

        {/* Versiya */}
        <div className="text-center py-4">
          <p className="text-xs text-muted">Dorixona Skaner v1.0.0</p>
          <p className="text-[10px] text-muted/50 mt-1">Next.js 14 + Prisma + PostgreSQL</p>
        </div>
      </div>
    </main>
  );
}

// ═══ Yordamchi komponentlar ═══

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
        <Icon size={14} />
        {title}
      </h2>
      <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: any;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 bg-card-hover rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-muted" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted truncate">{description}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 ml-3">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-card-hover'
      }`}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
      />
    </button>
  );
}
