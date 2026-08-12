'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  Filter,
  Download,
  Share2,
  Trash2,
  Calendar,
  ScanBarcode,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  FileSpreadsheet,
} from 'lucide-react';
import { useScannerStore } from '@/store/scanner-store';
import { formatScanResult, detectBarcodeFormat } from '@/lib/gs1-parser';
import { downloadCSV, downloadExcel } from '@/lib/export-utils';
import { playBeep } from '@/lib/api';
import SharePanel from '@/components/SharePanel';
import type { ScanResult } from '@/types';

export default function HistoryPage() {
  const { scanHistory, clearHistory } = useScannerStore();
  const [filteredScans, setFilteredScans] = useState<ScanResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showShare, setShowShare] = useState(false);
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  // Filtr
  useEffect(() => {
    let result = [...scanHistory];

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((s) => s.type === typeFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.rawValue.toLowerCase().includes(q) ||
          s.parsed?.gtin?.toLowerCase().includes(q) ||
          s.parsed?.serial?.toLowerCase().includes(q)
      );
    }

    setFilteredScans(result);
  }, [scanHistory, typeFilter, searchQuery]);

  const typeCounts = {
    all: scanHistory.length,
    EAN13: scanHistory.filter((s) => s.type === 'EAN13').length,
    DATAMATRIX: scanHistory.filter((s) => s.type === 'DATAMATRIX').length,
    QR_CODE: scanHistory.filter((s) => s.type === 'QR_CODE').length,
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedScans);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedScans(newSet);
  };

  const selectAll = () => {
    if (selectedScans.size === filteredScans.length) {
      setSelectedScans(new Set());
    } else {
      setSelectedScans(new Set(filteredScans.map((s) => s.rawValue + s.timestamp)));
    }
  };

  const getSelectedScans = (): ScanResult[] => {
    if (selectedScans.size === 0) return filteredScans;
    return filteredScans.filter((s) => selectedScans.has(s.rawValue + s.timestamp));
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          <a href="/" className="p-2 rounded-xl hover:bg-card-hover">
            <ChevronLeft size={20} className="text-muted" />
          </a>
          <History size={20} className="text-primary" />
          <h1 className="text-lg font-bold">Skanerlash tarixi</h1>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-auto">
            {scanHistory.length}
          </span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Qidiruv */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="GTIN, serial yoki kod qidirish..."
            className="w-full h-12 bg-card border border-border rounded-xl pl-11 pr-4 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['all', 'EAN13', 'DATAMATRIX', 'QR_CODE'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === type
                  ? 'bg-primary text-white'
                  : 'bg-card text-muted hover:text-foreground'
              }`}
            >
              {type === 'all' ? 'Hammasi' : type} ({typeCounts[type as keyof typeof typeCounts]})
            </button>
          ))}
        </div>

        {/* Amallar */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectMode(!selectMode)}
            className={`flex-1 h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
              selectMode ? 'bg-primary text-white' : 'bg-card text-muted'
            }`}
          >
            <CheckCircle2 size={16} />
            {selectMode ? `${selectedScans.size} tanlandi` : 'Tanlash'}
          </button>

          <button
            onClick={() => setShowShare(true)}
            className="h-11 px-4 bg-card rounded-xl text-sm font-medium text-muted flex items-center gap-2"
          >
            <Share2 size={16} />
            Ulashish
          </button>

          <button
            onClick={() => {
              downloadCSV(filteredScans);
              playBeep('success');
            }}
            className="h-11 px-4 bg-card rounded-xl text-sm font-medium text-muted flex items-center gap-2"
          >
            <Download size={16} />
            CSV
          </button>

          <button
            onClick={() => {
              downloadExcel(filteredScans);
              playBeep('success');
            }}
            className="h-11 px-4 bg-card rounded-xl text-sm font-medium text-muted flex items-center gap-2"
          >
            <FileSpreadsheet size={16} />
          </button>
        </div>

        {/* Select mode — barchasini tanlash */}
        {selectMode && (
          <button
            onClick={selectAll}
            className="text-xs text-primary"
          >
            {selectedScans.size === filteredScans.length ? 'Tanlovni bekor qilish' : 'Barchasini tanlash'}
          </button>
        )}

        {/* Scan ro'yxati */}
        {filteredScans.length === 0 ? (
          <div className="text-center py-16">
            <ScanBarcode size={64} className="mx-auto mb-4 text-muted opacity-20" />
            <p className="text-muted">
              {searchQuery ? "Hech narsa topilmadi" : "Tarix bo'sh"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredScans.map((scan, index) => {
              const id = scan.rawValue + scan.timestamp;
              const isSelected = selectedScans.has(id);
              const typeColors: Record<string, string> = {
                EAN13: 'bg-blue-500/20 text-blue-400',
                DATAMATRIX: 'bg-purple-500/20 text-purple-400',
                QR_CODE: 'bg-green-500/20 text-green-400',
                UNKNOWN: 'bg-gray-500/20 text-gray-400',
              };

              return (
                <motion.div
                  key={`${id}-${index}`}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => selectMode && toggleSelect(id)}
                  className={`bg-card rounded-xl p-4 border transition-all ${
                    isSelected
                      ? 'border-primary ring-1 ring-primary/30'
                      : 'border-border hover:border-primary/30'
                  } ${selectMode ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {selectMode && (
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-muted'
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 size={12} className="text-white" />
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            typeColors[scan.type] || typeColors.UNKNOWN
                          }`}
                        >
                          {scan.type}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(scan.timestamp).toLocaleDateString('uz-UZ')}
                        </span>
                        <span className="text-xs text-muted">
                          {new Date(scan.timestamp).toLocaleTimeString('uz-UZ', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="font-mono text-xs text-foreground truncate">
                        {formatScanResult(scan.rawValue)}
                      </p>

                      {scan.parsed?.gtin && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-[10px] bg-background rounded px-1.5 py-0.5 font-mono text-muted">
                            GTIN: {scan.parsed.gtin}
                          </span>
                          {scan.parsed.serial && (
                            <span className="text-[10px] bg-background rounded px-1.5 py-0.5 font-mono text-muted">
                              SN: {scan.parsed.serial}
                            </span>
                          )}
                          {scan.parsed.expiry && (
                            <span className="text-[10px] bg-background rounded px-1.5 py-0.5 font-mono text-muted">
                              EXP: {scan.parsed.expiry}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Tozalash */}
        {scanHistory.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Tarixni to'liq tozalashni xohlaysizmi?")) {
                clearHistory();
              }
            }}
            className="w-full h-12 rounded-xl text-sm text-danger flex items-center justify-center gap-2 hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={16} />
            Tarixni tozalash
          </button>
        )}
      </div>

      {/* Share panel */}
      <SharePanel
        scans={getSelectedScans()}
        show={showShare}
        onClose={() => setShowShare(false)}
      />
    </main>
  );
}
