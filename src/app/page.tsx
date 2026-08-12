'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanBarcode,
  Search,
  Package,
  History,
  Settings,
} from 'lucide-react';
import Header from '@/components/Header';
import ScannerSection from '@/components/ScannerSection';
import RecentScans from '@/components/RecentScans';
import QuickStats from '@/components/QuickStats';
import SearchBar from '@/components/SearchBar';
import OfflineIndicator from '@/components/OfflineIndicator';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'scan' | 'search' | 'inventory'>('scan');

  return (
    <main className="flex flex-col min-h-screen">
      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Header */}
      <Header />

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <QuickStats />
              <ScannerSection />
              <RecentScans />
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SearchBar />
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center py-10">
                <a
                  href="/inventory"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-green-500/25"
                >
                  <Package size={24} />
                  Omborxonani ochish
                </a>
                <p className="text-sm text-muted mt-3">
                  Dori zaxirasi, kirish/chiqish, kam qolgan dorilar
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pastki navigatsiya */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}

// ═══════════════════════════════════════════
// PASTKI NAVIGATSIYA
// ═══════════════════════════════════════════
function BottomNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: 'scan' | 'search' | 'inventory') => void;
}) {
  const tabs = [
    { id: 'scan' as const, label: 'Skaner', icon: ScanBarcode },
    { id: 'search' as const, label: 'Qidirish', icon: Search },
    { id: 'inventory' as const, label: 'Ombor', icon: Package },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 touch-target px-6 py-2 rounded-xl transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <tab.icon size={22} />
              <span className="text-xs font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 h-0.5 w-12 bg-primary rounded-full"
                />
              )}
            </button>
          ))}

          {/* Tarix */}
          <a
            href="/history"
            className="flex flex-col items-center gap-1 touch-target px-6 py-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <History size={22} />
            <span className="text-xs font-medium">Tarix</span>
          </a>

          {/* Admin */}
          <a
            href="/admin"
            className="flex flex-col items-center gap-1 touch-target px-6 py-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <Settings size={22} />
            <span className="text-xs font-medium">Admin</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
