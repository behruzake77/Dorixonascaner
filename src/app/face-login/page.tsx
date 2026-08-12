'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  UserPlus,
  LogIn,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Fingerprint,
} from 'lucide-react';
import FaceScanner, { type FaceData } from '@/components/FaceScanner';
import { playBeep } from '@/lib/api';

type PageMode = 'menu' | 'login' | 'register' | 'manage';

export default function FaceLoginPage() {
  const [mode, setMode] = useState<PageMode>('menu');
  const [hasRegistered, setHasRegistered] = useState(
    typeof window !== 'undefined' && !!localStorage.getItem('dorixona-face-data')
  );
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLoginSuccess = () => {
    playBeep('success');
    // Auth token yaratish (password bilan bir xil)
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'face-auth-bypass', faceAuth: true }),
    }).then(() => {
      window.location.href = '/';
    }).catch(() => {
      // Fallback — to'g'ridan-to'g'ri o'tish
      window.location.href = '/';
    });
  };

  const handleLoginFail = (reason: string) => {
    setMessage({ type: 'error', text: reason });
    playBeep('error');
  };

  const handleRegistered = (faceData: FaceData) => {
    setHasRegistered(true);
    setMessage({ type: 'success', text: "Yuz muvaffaqiyatli ro'yxatdan o'tkazildi! Endi yuz bilan kirishingiz mumkin." });
    playBeep('success');
  };

  const handleDeleteFace = () => {
    if (confirm("Ro'yxatdan o'tkazilgan yuzni o'chirishni xohlaysizmi?")) {
      localStorage.removeItem('dorixona-face-data');
      setHasRegistered(false);
      setMessage({ type: 'success', text: "Yuz ma'lumoti o'chirildi" });
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#334155]">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          <a href="/" className="p-2 rounded-xl hover:bg-[#334155]">
            <ChevronLeft size={20} className="text-gray-400" />
          </a>
          <Shield size={20} className="text-red-400" />
          <h1 className="text-lg font-bold text-white">Yuz bilan kirish</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Xabar */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`rounded-xl p-3 flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span className="text-sm flex-1">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ═══ MENYU ═══ */}
          {mode === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Logo */}
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/25"
                >
                  <Fingerprint size={48} className="text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-white">Yuz autentifikatsiya</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {hasRegistered
                    ? "Ro'yxatdan o'tilgan ✅"
                    : "Avval yuzingizni ro'yxatdan o'tkazing"}
                </p>
              </div>

              {/* Kirish tugmasi */}
              {hasRegistered && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setMode('login')}
                  className="w-full h-16 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-red-500/25"
                >
                  <LogIn size={24} />
                  Yuz bilan kirish
                </motion.button>
              )}

              {/* Ro'yxatdan o'tish */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setMode('register')}
                className={`w-full h-14 rounded-2xl font-semibold flex items-center justify-center gap-3 ${
                  hasRegistered
                    ? 'bg-[#1e293b] text-gray-300 border border-[#334155]'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                }`}
              >
                <UserPlus size={20} />
                {hasRegistered ? "Qayta ro'yxatdan o'tish" : "Yuzni ro'yxatdan o'tkazish"}
              </motion.button>

              {/* Boshqarish */}
              {hasRegistered && (
                <button
                  onClick={handleDeleteFace}
                  className="w-full h-12 rounded-xl text-sm text-red-400 flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                  Yuz ma&apos;lumotini o&apos;chirish
                </button>
              )}

              {/* Ma'lumot */}
              <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-4 space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Shield size={14} className="text-red-400" />
                  Qanday ishlaydi?
                </h3>
                <ul className="text-xs text-gray-400 space-y-1.5">
                  <li>• Kamera yuzingizni aniqlaydi</li>
                  <li>• Yuz ma&apos;lumotlari faqat telefoningizda saqlanadi</li>
                  <li>• Serverga yuborilmadi — maxfiy</li>
                  <li>• Parol kiritish shart emas</li>
                  <li>• Qorong&apos;uda ishlamasligi mumkin</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* ═══ LOGIN ═══ */}
          {mode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <button
                onClick={() => setMode('menu')}
                className="text-sm text-gray-400 flex items-center gap-1"
              >
                ← Orqaga
              </button>

              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-white">Yuzni tekshirish</h2>
                <p className="text-sm text-gray-400">Kameraga qarating</p>
              </div>

              <FaceScanner
                mode="login"
                onLoginSuccess={handleLoginSuccess}
                onLoginFail={handleLoginFail}
              />
            </motion.div>
          )}

          {/* ═══ REGISTER ═══ */}
          {mode === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <button
                onClick={() => setMode('menu')}
                className="text-sm text-gray-400 flex items-center gap-1"
              >
                ← Orqaga
              </button>

              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-white">Yuzni ro&apos;yxatdan o&apos;tkazish</h2>
                <p className="text-sm text-gray-400">Kameraga qarating — yuzingiz saqlanadi</p>
              </div>

              <FaceScanner
                mode="register"
                onFaceDetected={handleRegistered}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
