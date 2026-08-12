'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  MessageCircle,
  Send,
  Copy,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import {
  shareToWhatsApp,
  shareToTelegram,
  shareNative,
  copyToClipboard,
  downloadCSV,
  downloadExcel,
} from '@/lib/export-utils';
import type { ScanResult, Medicine } from '@/types';
import { playBeep } from '@/lib/api';

interface SharePanelProps {
  medicine?: Medicine | null;
  scans?: ScanResult[];
  show: boolean;
  onClose: () => void;
}

export default function SharePanel({ medicine, scans, show, onClose }: SharePanelProps) {
  const [copied, setCopied] = useState(false);

  if (!show) return null;

  const getText = (): string => {
    if (medicine) {
      const lines = [`💊 ${medicine.name}`];
      if (medicine.manufacturer) lines.push(`🏭 ${medicine.manufacturer}`);
      if (medicine.price) lines.push(`💰 ${new Intl.NumberFormat('uz-UZ').format(medicine.price)} so'm`);
      if (medicine.barcode) lines.push(`📋 ${medicine.barcode}`);
      return lines.join('\n');
    }
    if (scans && scans.length > 0) {
      return `📦 ${scans.length} ta skanerlash natijasi — Dorixona Skaner`;
    }
    return '';
  };

  const handleCopy = async () => {
    const text = getText();
    await copyToClipboard(text);
    setCopied(true);
    playBeep('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    shareToWhatsApp(getText());
  };

  const handleTelegram = () => {
    shareToTelegram(getText());
  };

  const handleNativeShare = async () => {
    await shareNative('Dorixona Skaner', getText());
  };

  const handleDownloadCSV = () => {
    if (scans && scans.length > 0) {
      downloadCSV(scans);
      playBeep('success');
    }
  };

  const handleDownloadExcel = () => {
    if (scans && scans.length > 0) {
      downloadExcel(scans);
      playBeep('success');
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card rounded-t-3xl p-6 pb-8 border-t border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Share2 size={20} className="text-primary" />
                Ulashish
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-card-hover transition-colors"
              >
                <X size={20} className="text-muted" />
              </button>
            </div>

            {/* Ijtimoiy tarmoqlar */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <ShareButton
                icon={<MessageCircle size={24} />}
                label="WhatsApp"
                color="bg-green-600"
                onClick={handleWhatsApp}
              />
              <ShareButton
                icon={<Send size={24} />}
                label="Telegram"
                color="bg-blue-500"
                onClick={handleTelegram}
              />
              <ShareButton
                icon={copied ? <CheckCircle2 size={24} /> : <Copy size={24} />}
                label={copied ? "Nusxalandi!" : "Nusxalash"}
                color={copied ? 'bg-success' : 'bg-muted'}
                onClick={handleCopy}
              />
              <ShareButton
                icon={<Share2 size={24} />}
                label="Boshqa"
                color="bg-purple-600"
                onClick={handleNativeShare}
              />
            </div>

            {/* Export tugmalari (faqat scans bo'lsa) */}
            {scans && scans.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-3 uppercase tracking-wider">
                  Hisobot yuklab olish
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-3 bg-card-hover hover:bg-border p-4 rounded-xl transition-colors"
                  >
                    <FileText size={20} className="text-success" />
                    <div className="text-left">
                      <p className="text-sm font-medium">CSV fayl</p>
                      <p className="text-xs text-muted">Excel da ochish</p>
                    </div>
                  </button>
                  <button
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-3 bg-card-hover hover:bg-border p-4 rounded-xl transition-colors"
                  >
                    <FileSpreadsheet size={20} className="text-accent" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Excel fayl</p>
                      <p className="text-xs text-muted">To&apos;liq hisobot</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShareButton({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}
      >
        {icon}
      </div>
      <span className="text-[10px] text-muted text-center leading-tight">{label}</span>
    </motion.button>
  );
}
