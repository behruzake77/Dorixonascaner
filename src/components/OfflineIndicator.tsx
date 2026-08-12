'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, Loader2 } from 'lucide-react';
import { isOnline, onOnlineStatusChange, getUnsyncedCount, syncOfflineData } from '@/lib/offline-db';
import { playBeep } from '@/lib/api';

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Online holatini kuzatish
  useEffect(() => {
    setOnline(isOnline());

    const cleanup = onOnlineStatusChange((isOnline) => {
      setOnline(isOnline);
      if (isOnline) {
        // Online bo'lganda avtomatik sync
        handleSync();
      }
    });

    // Unsynced count ni tekshirish
    checkUnsynced();

    return cleanup;
  }, []);

  const checkUnsynced = async () => {
    try {
      const count = await getUnsyncedCount();
      setUnsyncedCount(count);
      if (count > 0) setShowBanner(true);
    } catch {}
  };

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);

    try {
      const result = await syncOfflineData();
      if (result.synced > 0) {
        playBeep('success');
        await checkUnsynced();
      }
    } catch {
    } finally {
      setSyncing(false);
    }
  };

  // Offline banner
  if (!online) {
    return (
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-16 left-0 right-0 z-50 px-4"
      >
        <div className="bg-accent/90 text-background rounded-xl p-3 flex items-center gap-3 shadow-lg backdrop-blur-sm">
          <WifiOff size={18} />
          <div className="flex-1">
            <p className="text-sm font-semibold">Offline rejim</p>
            <p className="text-xs opacity-80">
              Skanerlash davom etadi. Internet qaytganda avtomatik yuboriladi.
            </p>
          </div>
          {unsyncedCount > 0 && (
            <span className="bg-background/20 text-background text-xs font-bold px-2 py-1 rounded-full">
              {unsyncedCount}
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  // Sync banner (online, lekin sync qilinmagan narsalar bor)
  if (online && unsyncedCount > 0 && showBanner) {
    return (
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-16 left-0 right-0 z-50 px-4"
      >
        <div className="bg-primary/90 text-white rounded-xl p-3 flex items-center gap-3 shadow-lg backdrop-blur-sm">
          <Cloud size={18} />
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {unsyncedCount} ta skanerlash yuborilmagan
            </p>
            <p className="text-xs opacity-80">
              Serverga yuborish uchun bosing
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            {syncing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {syncing ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="text-white/60 hover:text-white text-xs"
          >
            Yopish
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}
