'use client';

import { SearchX, Home, ScanBarcode } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <SearchX size={40} className="text-yellow-400" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-300 mb-2">Sahifa topilmadi</h2>
        <p className="text-gray-400 mb-8">
          Siz qidirayotgan sahifa mavjud emas yoki o&apos;chirilgan.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Home size={18} />
            Bosh sahifa
          </a>
          <a
            href="/"
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <ScanBarcode size={18} />
            Skanerlash
          </a>
        </div>
      </div>
    </main>
  );
}
