'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Pill, Filter, X } from 'lucide-react';
import { searchMedicines } from '@/lib/api';
import MedicineCard from './MedicineCard';
import type { Medicine, SearchFilters } from '@/types';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const result = await searchMedicines({
        query: query.trim(),
        ...filters,
      });

      if (result.success && result.data) {
        setResults(result.data.items);
      } else {
        setResults([]);
      }
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Qidiruv maydoni */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Dori nomi, barcode yoki ishlab chiqaruvchi..."
              className="w-full h-14 bg-card border border-border rounded-xl pl-11 pr-4 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary touch-target"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setSearched(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="h-14 px-6 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 touch-target"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            Qidirish
          </motion.button>
        </div>

        {/* Filtr tugmasi */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mt-2 text-xs text-muted flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Filter size={12} />
          Filtrlar
        </button>
      </div>

      {/* Filtrlar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card rounded-xl border border-border p-4 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted mb-1 block">Ishlab chiqaruvchi</label>
                <input
                  type="text"
                  value={filters.manufacturer || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, manufacturer: e.target.value })
                  }
                  placeholder="Masalan: Pharmstandard"
                  className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Kategoriya</label>
                <input
                  type="text"
                  value={filters.category || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  placeholder="Masalan: Og'riq qoldiruvchi"
                  className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.prescription || false}
                  onChange={(e) =>
                    setFilters({ ...filters, prescription: e.target.checked })
                  }
                  className="rounded border-border"
                />
                Faqat retsept bilan
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Natijalar */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="text-sm text-muted">Qidirilmoqda...</span>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12">
          <Pill size={48} className="mx-auto mb-3 text-muted opacity-30" />
          <p className="text-muted">Hech narsa topilmadi</p>
          <p className="text-xs text-muted/60 mt-1">
            Boshqa so&apos;z bilan qidirib ko&apos;ring
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <p className="text-sm text-muted mb-3">
            {results.length} ta natija topildi
          </p>
          <div className="space-y-3">
            {results.map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} compact />
            ))}
          </div>
        </div>
      )}

      {/* Mashhur qidiruvlar */}
      {!searched && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-muted mb-3">Mashhur qidiruvlar</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Paratsetamol',
              'Ibuprofen',
              'Amoksitsillin',
              'Omeprazol',
              'Loratadin',
              'Nurofen',
              'Citramon',
              'Validol',
            ].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  setTimeout(handleSearch, 100);
                }}
                className="bg-card hover:bg-card-hover text-sm px-4 py-2 rounded-full border border-border transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
