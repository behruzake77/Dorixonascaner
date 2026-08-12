'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  QrCode,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { playBeep } from '@/lib/api';

type BarcodeType = 'ean13' | 'qr';

export default function BarcodeGeneratorPage() {
  const [barcodeType, setBarcodeType] = useState<BarcodeType>('ean13');
  const [inputValue, setInputValue] = useState('');
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // EAN-13 check digit hisoblash
  const calculateCheckDigit = (code: string): string => {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
    }
    return ((10 - (sum % 10)) % 10).toString();
  };

  // EAN-13 barcode chizish
  const drawEAN13 = useCallback((ctx: CanvasRenderingContext2D, code: string) => {
    const width = 300;
    const height = 150;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // EAN-13 pattern (L kodlar)
    const patterns: Record<string, string[]> = {
      '0': ['0001101', '0100111', '1110010'],
      '1': ['0011001', '0110011', '1100110'],
      '2': ['0010011', '0011011', '1101100'],
      '3': ['0111101', '0100001', '1000010'],
      '4': ['0100011', '0011101', '1011100'],
      '5': ['0110001', '0111001', '1001110'],
      '6': ['0101111', '0000101', '1010000'],
      '7': ['0111011', '0010001', '1000100'],
      '8': ['0110111', '0001001', '1001000'],
      '9': ['0001011', '0010111', '1110100'],
    };

    // Start guard
    let x = 20;
    const barWidth = 2;
    const barHeight = 100;

    const drawBar = (isBlack: boolean) => {
      if (isBlack) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, 10, barWidth, barHeight);
      }
      x += barWidth;
    };

    // Start pattern: 101
    drawBar(true); drawBar(false); drawBar(true);

    // Left side (6 digits)
    for (let i = 0; i < 6; i++) {
      const digit = code[i];
      const pattern = patterns[digit]?.[0] || '0001101';
      for (const bit of pattern) {
        drawBar(bit === '1');
      }
    }

    // Center guard: 01010
    drawBar(false); drawBar(true); drawBar(false); drawBar(true); drawBar(false);

    // Right side (6 digits)
    for (let i = 6; i < 12; i++) {
      const digit = code[i];
      const pattern = patterns[digit]?.[2] || '1110010';
      for (const bit of pattern) {
        drawBar(bit === '1');
      }
    }

    // End guard: 101
    drawBar(true); drawBar(false); drawBar(true);

    // Text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(code.substring(0, 1), 15, height - 5);
    ctx.fillText(code.substring(1, 7), width / 2 - 40, height - 5);
    ctx.fillText(code.substring(7), width / 2 + 50, height - 5);
  }, []);

  // QR code chizish (soddalashtirilgan — haqiqiy QR emas, ko'rinishi uchun)
  const drawQR = useCallback((ctx: CanvasRenderingContext2D, text: string) => {
    const size = 200;
    ctx.canvas.width = size;
    ctx.canvas.height = size;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // QR pattern simulation (haqiqiy QR uchun kutubxona kerak)
    const moduleSize = 8;
    const modules = Math.floor(size / moduleSize);

    // Seed from text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    // Position patterns (3 burchak)
    const drawPositionPattern = (px: number, py: number) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(px, py, 7 * moduleSize, 7 * moduleSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + moduleSize, py + moduleSize, 5 * moduleSize, 5 * moduleSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect(px + 2 * moduleSize, py + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };

    drawPositionPattern(0, 0);
    drawPositionPattern((modules - 7) * moduleSize, 0);
    drawPositionPattern(0, (modules - 7) * moduleSize);

    // Data pattern (pseudo-random)
    ctx.fillStyle = '#000000';
    let seed = Math.abs(hash);
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        // Position patternlar joyini o'tkazib yuborish
        if ((x < 8 && y < 8) || (x >= modules - 8 && y < 8) || (x < 8 && y >= modules - 8)) {
          continue;
        }
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        if (seed % 3 === 0) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Text pastda
    ctx.fillStyle = '#000000';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text.substring(0, 30), size / 2, size - 5);
  }, []);

  // Generate
  const handleGenerate = () => {
    if (!inputValue.trim()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (barcodeType === 'ean13') {
      let code = inputValue.replace(/\D/g, '');
      if (code.length === 12) {
        code += calculateCheckDigit(code);
      }
      if (code.length !== 13) {
        alert("EAN-13 uchun 12 yoki 13 raqam kiriting");
        return;
      }
      drawEAN13(ctx, code);
    } else {
      drawQR(ctx, inputValue);
    }

    setGenerated(true);
    playBeep('success');
  };

  // Download
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `barcode-${inputValue}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    playBeep('success');
  };

  // Print
  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Barcode - ${inputValue}</title></head>
          <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="text-align:center;">
              <img src="${dataUrl}" style="max-width:400px;" />
              <p style="font-family:monospace;margin-top:10px;">${inputValue}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Copy
  const handleCopy = async () => {
    await navigator.clipboard.writeText(inputValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          <a href="/" className="p-2 rounded-xl hover:bg-card-hover">
            <ChevronLeft size={20} className="text-muted" />
          </a>
          <BarChart3 size={20} className="text-primary" />
          <h1 className="text-lg font-bold">Barcode Generator</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Type tanlash */}
        <div className="flex gap-3">
          <button
            onClick={() => setBarcodeType('ean13')}
            className={`flex-1 h-12 rounded-xl font-medium flex items-center justify-center gap-2 ${
              barcodeType === 'ean13'
                ? 'bg-primary text-white'
                : 'bg-card text-muted border border-border'
            }`}
          >
            <BarChart3 size={18} />
            EAN-13
          </button>
          <button
            onClick={() => setBarcodeType('qr')}
            className={`flex-1 h-12 rounded-xl font-medium flex items-center justify-center gap-2 ${
              barcodeType === 'qr'
                ? 'bg-primary text-white'
                : 'bg-card text-muted border border-border'
            }`}
          >
            <QrCode size={18} />
            QR Code
          </button>
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={barcodeType === 'ean13' ? '12 yoki 13 raqam (masalan: 460701547086)' : 'Matn yoki URL'}
            className="flex-1 h-12 bg-card border border-border rounded-xl px-4 text-foreground font-mono placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={!inputValue.trim()}
            className="h-12 px-6 bg-primary text-white rounded-xl font-semibold disabled:opacity-50"
          >
            Yaratish
          </button>
        </div>

        {/* Canvas */}
        <motion.div
          initial={false}
          animate={{ height: generated ? 'auto' : 200 }}
          className="bg-white rounded-2xl p-6 flex items-center justify-center"
        >
          <canvas
            ref={canvasRef}
            className="max-w-full"
            style={{ imageRendering: 'pixelated' }}
          />
          {!generated && (
            <p className="text-gray-400 text-sm">Barcode shu yerda ko&apos;rinadi</p>
          )}
        </motion.div>

        {/* Amallar */}
        {generated && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="grid grid-cols-3 gap-3"
          >
            <button
              onClick={handleDownload}
              className="h-12 bg-card hover:bg-card-hover rounded-xl text-sm font-medium flex items-center justify-center gap-2 border border-border"
            >
              <Download size={16} />
              Yuklab olish
            </button>
            <button
              onClick={handlePrint}
              className="h-12 bg-card hover:bg-card-hover rounded-xl text-sm font-medium flex items-center justify-center gap-2 border border-border"
            >
              <Printer size={16} />
              Chop etish
            </button>
            <button
              onClick={handleCopy}
              className="h-12 bg-card hover:bg-card-hover rounded-xl text-sm font-medium flex items-center justify-center gap-2 border border-border"
            >
              {copied ? <CheckCircle2 size={16} className="text-success" /> : <Copy size={16} />}
              {copied ? 'Nusxalandi' : 'Nusxalash'}
            </button>
          </motion.div>
        )}

        {/* Ma'lumot */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold mb-2">EAN-13 haqida</h3>
          <ul className="text-xs text-muted space-y-1">
            <li>• 12 ta raqam kiriting — 13-chi (check digit) avtomatik hisoblanadi</li>
            <li>• O&apos;zbekiston barcode: 460... yoki 478... bilan boshlanadi</li>
            <li>• GS1 standarti — xalqaro</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
