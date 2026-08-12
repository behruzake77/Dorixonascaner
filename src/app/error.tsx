'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Xatolik yuz berdi</h1>
        <p className="text-gray-400 mb-6">
          Sahifani yuklashda muammo bo&apos;ldi. Iltimos, qayta urinib ko&apos;ring.
        </p>
        {error.message && (
          <div className="bg-gray-800 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-1">Xatolik:</p>
            <p className="text-sm text-red-400 font-mono break-all">{error.message}</p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <RefreshCcw size={18} />
            Qayta urinish
          </button>
          <a
            href="/"
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Home size={18} />
            Bosh sahifa
          </a>
        </div>
      </div>
    </main>
  );
}
