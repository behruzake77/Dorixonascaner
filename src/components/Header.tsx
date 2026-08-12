'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Settings, Bell, BarChart3, LogOut, X } from 'lucide-react';

export default function Header() {
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/login';
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="Dorixona Skaner"
              className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/25"
            />
            <div>
              <h1 className="text-lg font-bold text-foreground">Dorixona Skaner</h1>
              <p className="text-xs text-muted">Dori kod skaneri</p>
            </div>
          </a>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <a
              href="/barcode-generator"
              className="p-2 rounded-xl hover:bg-card-hover transition-colors"
              title="Barcode generator"
            >
              <BarChart3 size={20} className="text-muted" />
            </a>
            <button className="relative p-2 rounded-xl hover:bg-card-hover transition-colors">
              <Bell size={20} className="text-muted" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-success rounded-full" />
            </button>
            <a
              href="/settings"
              className="p-2 rounded-xl hover:bg-card-hover transition-colors"
              title="Sozlamalar"
            >
              <Settings size={20} className="text-muted" />
            </a>
            <button
              onClick={() => setShowLogout(true)}
              className="p-2 rounded-xl hover:bg-danger/10 transition-colors"
              title="Chiqish"
            >
              <LogOut size={20} className="text-muted hover:text-danger" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {showLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLogout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Chiqish</h3>
                <button onClick={() => setShowLogout(false)}>
                  <X size={20} className="text-muted" />
                </button>
              </div>
              <p className="text-sm text-muted mb-6">
                Tizimdan chiqishni xohlaysizmi? Qayta kirish uchun parol kiritishingiz kerak.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogout(false)}
                  className="flex-1 h-12 bg-card-hover rounded-xl text-muted font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Chiqish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
