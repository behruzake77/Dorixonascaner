'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Lock, Eye, EyeOff, Loader2, AlertCircle, Fingerprint } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        // Muvaffaqiyatli — asosiy sahifaga o'tish
        window.location.href = '/';
      } else {
        setError(data.error || "Noto'g'ri parol");
        setPassword('');
      }
    } catch (err) {
      setError("Server bilan aloqa yo'q");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25"
          >
            <Pill size={40} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Dorixona Skaner</h1>
          <p className="text-sm text-gray-400 mt-1">Davom etish uchun kirish</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Parol */}
          <div>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Parolni kiriting"
                autoFocus
                autoComplete="current-password"
                className="w-full h-14 bg-[#1e293b] border border-[#334155] rounded-xl pl-12 pr-12 text-white text-lg font-mono tracking-wider placeholder:text-gray-500 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Xatolik */}
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2"
            >
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          {/* Kirish tugmasi */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={!password.trim() || loading}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 transition-all"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Tekshirilmoqda...
              </>
            ) : (
              <>
                <Lock size={18} />
                Kirish
              </>
            )}
          </motion.button>
        </form>

        {/* Yuz bilan kirish */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#334155]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0f172a] px-3 text-gray-500">yoki</span>
            </div>
          </div>
          <a
            href="/face-login"
            className="mt-4 w-full h-14 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:from-red-700 hover:to-red-600 transition-all"
          >
            <Fingerprint size={20} />
            Yuz bilan kirish
          </a>
        </div>

        {/* Pastki matn */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Faqat ruxsat etilgan xodimlar uchun
        </p>
      </motion.div>
    </main>
  );
}
