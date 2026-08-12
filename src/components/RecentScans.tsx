'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, ScanBarcode, Clock } from 'lucide-react';
import { useScannerStore } from '@/store/scanner-store';
import { formatScanResult, detectBarcodeFormat } from '@/lib/gs1-parser';

export default function RecentScans() {
  const { scanHistory, clearHistory } = useScannerStore();

  if (scanHistory.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <History size={20} className="text-muted" />
          Oxirgi skanerlashlar
        </h2>
        <div className="bg-card rounded-xl p-8 text-center border border-border">
          <ScanBarcode size={48} className="mx-auto mb-3 text-muted opacity-30" />
          <p className="text-sm text-muted">Hali skanerlash yo&apos;q</p>
          <p className="text-xs text-muted/60 mt-1">
            Kamerani yoqing va kodni skaner qiling
          </p>
        
        </div>
      </div>
    );
  }

  const formatType = (type: string) => {
    switch (type) {
      case 'EAN13':
        return { label: 'EAN-13', bg: 'bg-blue-500/20', text: 'text-blue-400' };
      case 'DATAMATRIX':
        return { label: 'DataMatrix', bg: 'bg-purple-500/20', text: 'text-purple-400' };
      case 'QR_CODE':
        return { label: 'QR', bg: 'bg-green-500/20', text: 'text-green-400' };
      default:
        return { label: type, bg: 'bg-gray-500/20', text: 'text-gray-400' };
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History size={20} className="text-muted" />
          Oxirgi skanerlashlar
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            {scanHistory.length}
          </span>
        </h2>
        <button
          onClick={clearHistory}
          className="p-2 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {scanHistory.slice(0, 20).map((scan, index) => {
            const typeInfo = formatType(scan.type);
            return (
              <motion.div
                key={`${scan.rawValue}-${scan.timestamp.toString()}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeInfo.bg} ${typeInfo.text}`}
                      >
                        {typeInfo.label}
                      </span>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Clock size={10} />
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
                      <p className="text-xs text-muted mt-1">
                        GTIN: {scan.parsed.gtin}
                        {scan.parsed.serial && ` | SN: ${scan.parsed.serial}`}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
