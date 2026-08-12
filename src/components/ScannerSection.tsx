'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CameraOff,
  ScanBarcode,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  SwitchCamera,
  Flashlight,
  FlashlightOff,
  ImagePlus,
  Plus,
  Save,
  ArrowRight,
  Package,
  Tag,
  X,
  Printer,
  Link2,
} from 'lucide-react';
import { useScannerStore } from '@/store/scanner-store';
import { parseGS1DataMatrix, detectBarcodeFormat, formatScanResult } from '@/lib/gs1-parser';
import { findMedicineByBarcode, playBeep, vibrateDevice, saveUnknownGtin, createMedicine, addGtin } from '@/lib/api';
import {
  isNativeBarcodeSupported,
  createCameraStream,
  detectBarcodeFromVideo,
  toggleTorch,
  isTorchSupported,
} from '@/lib/native-scanner';
import type { ScanResult, Medicine, MedicineGtin } from '@/types';

// ═══ ISH TARTIBI ═══
type Step = 
  | 'scan-barcode'    // 1-QADAM: EAN-13 skanerlash → dori topish
  | 'medicine-found'  // Dori topildi, GTIN skanerlashga tayyor
  | 'scan-gtin'       // 2-QADAM: DataMatrix/GTIN skanerlash
  | 'gtin-saved';     // GTIN saqlandi

export default function ScannerSection() {
  // ═══ State ═══
  const [step, setStep] = useState<Step>('scan-barcode');
  const [isScanning, setIsScanning] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanPaused, setScanPaused] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [savedGtins, setSavedGtins] = useState<MedicineGtin[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  // ═══ Refs ═══
  const scannerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastScanTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef({ count: 0, lastTime: Date.now() });

  const { addScan } = useScannerStore();

  // ═══ Cleanup ═══
  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ═══ 1-QADAM: EAN-13 bo'yicha dori qidirish ═══
  const lookupMedicine = useCallback(async (barcode: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await findMedicineByBarcode(barcode);

      if (result.success && result.data) {
        setCurrentMedicine(result.data);
        setStep('medicine-found');
        setSavedGtins(result.data.gtins || []);
        playBeep('success');
        vibrateDevice([100, 50, 100]);
      } else {
        // Bazada yo'q — yaratish
        const createResult = await createMedicine(barcode);
        if (createResult.success && createResult.data) {
          setCurrentMedicine(createResult.data);
          setStep('medicine-found');
          playBeep('success');
        } else {
          setError("Bu barcode bo'yicha dori topilmadi. Qo'lda kiriting.");
          playBeep('warning');
        }
      }
    } catch (err) {
      setError("Qidirishda xatolik");
      playBeep('error');
    } finally {
      setLoading(false);
    }
  }, []);

  // ═══ 2-QADAM: GTIN saqlash ═══
  const saveGtin = useCallback(async (rawValue: string) => {
    if (!currentMedicine) return;

    setLoading(true);
    try {
      const parsed = parseGS1DataMatrix(rawValue);

      const result = await addGtin(currentMedicine.id, {
        gtin: parsed.gtin || rawValue,
        serial: parsed.serial,
        expiry: parsed.expiry,
        batch: parsed.batch,
      });

      if (result.success && result.data) {
        setSavedGtins((prev) => [result.data!, ...prev]);
        setStep('gtin-saved');
        playBeep('success');
        vibrateDevice([100, 50, 100]);

        // 2 soniyadan keyin yana GTIN skanerlashga qaytish
        setTimeout(() => {
          setStep('scan-gtin');
        }, 2000);
      } else {
        setError(result.error || "GTIN saqlashda xatolik");
        playBeep('error');
      }
    } catch (err) {
      setError("GTIN saqlashda xatolik");
      playBeep('error');
    } finally {
      setLoading(false);
    }
  }, [currentMedicine]);

  // ═══ Scan natijasini qayta ishlash ═══
  const processScanResult = useCallback(
    async (rawValue: string) => {
      // Takroriy skanerlashni oldini olish
      const now = Date.now();
      if (lastScanTimeRef.current && now - lastScanTimeRef.current < 2000) return;
      if (lastScannedCode === rawValue) return;

      lastScanTimeRef.current = now;
      setLastScannedCode(rawValue);

      const format = detectBarcodeFormat(rawValue);

      // Scan logga qo'shish
      addScan({
        type: format,
        format: format,
        rawValue,
        parsed: format === 'DATAMATRIX' ? parseGS1DataMatrix(rawValue) : undefined,
        timestamp: new Date(),
      });

      setScanPaused(true);
      setTimeout(() => setScanPaused(false), 2000);

      // ═══ 1-QADAM: EAN-13 bo'lsa → dori qidirish ═══
      if (step === 'scan-barcode' && (format === 'EAN13' || format === 'UNKNOWN')) {
        await lookupMedicine(rawValue);
        return;
      }

      // ═══ 2-QADAM: DataMatrix bo'lsa → GTIN saqlash ═══
      if (step === 'scan-gtin' && format === 'DATAMATRIX') {
        await saveGtin(rawValue);
        return;
      }

      // Noto'g'ri format
      if (step === 'scan-barcode' && format === 'DATAMATRIX') {
        setError("Avval dori shtrix kodini (EAN-13) skanerlang");
        playBeep('warning');
      } else if (step === 'scan-gtin' && format === 'EAN13') {
        setError("Hozir GTIN (DataMatrix) skanerlash kerak");
        playBeep('warning');
      }
    },
    [step, lookupMedicine, saveGtin, addScan, lastScannedCode]
  );

  // ═══ Kamera ═══
  const startScanner = useCallback(async () => {
    try {
      setError(null);
      setLastScannedCode('');

      if (isNativeBarcodeSupported()) {
        const stream = await createCameraStream(facingMode);
        if (stream) {
          streamRef.current = stream;
          setIsScanning(true);
          setTorchSupported(isTorchSupported(stream));

          let video = videoRef.current;
          if (!video) {
            video = document.createElement('video');
            video.setAttribute('playsinline', 'true');
            video.setAttribute('autoplay', 'true');
            video.muted = true;
            videoRef.current = video;
          }

          video.srcObject = stream;
          await video.play();

          const container = document.getElementById('qr-reader');
          if (container) {
            container.innerHTML = '';
            container.appendChild(video);
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.borderRadius = '1rem';
          }

          const scanLoop = async () => {
            if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
              animFrameRef.current = requestAnimationFrame(scanLoop);
              return;
            }

            if (!scanPaused) {
              const result = await detectBarcodeFromVideo(videoRef.current);
              if (result) {
                await processScanResult(result.rawValue);
              }
            }

            animFrameRef.current = requestAnimationFrame(scanLoop);
          };

          animFrameRef.current = requestAnimationFrame(scanLoop);
          return;
        }
      }

      // Fallback: html5-qrcode
      const { Html5Qrcode } = await import('html5-qrcode');
      if (scannerRef.current) await scannerRef.current.stop();

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode },
        { fps: 15, qrbox: { width: 250, height: 250 } },
        (text: string) => processScanResult(text),
        () => {}
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Scanner error:', err);
      setError("Kamera ochilmadi. Ruxsat bering.");
    }
  }, [facingMode, scanPaused, processScanResult]);

  const stopScanner = useCallback(async () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (videoRef.current) { videoRef.current.srcObject = null; videoRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    try { if (scannerRef.current) { await scannerRef.current.stop(); scannerRef.current = null; } } catch {}
    setIsScanning(false);
    setTorchOn(false);
  }, []);

  const handleTorchToggle = useCallback(async () => {
    if (!streamRef.current) return;
    const success = await toggleTorch(streamRef.current, !torchOn);
    if (success) setTorchOn(!torchOn);
  }, [torchOn]);

  const switchCamera = useCallback(async () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    if (isScanning) {
      await stopScanner();
      setTimeout(() => startScanner(), 300);
    }
  }, [facingMode, isScanning, stopScanner, startScanner]);

  // ═══ Qo'lda barcode kiritish ═══
  const handleManualInput = async () => {
    if (!manualBarcode.trim()) return;
    await lookupMedicine(manualBarcode.trim());
    setShowManualInput(false);
    setManualBarcode('');
  };

  // ═══ Yangi dori uchun ═══
  const handleNewMedicine = () => {
    setCurrentMedicine(null);
    setSavedGtins([]);
    setStep('scan-barcode');
    setLastScannedCode('');
    setError(null);
  };

  // ═══ Render ═══
  return (
    <div className="space-y-4">
      {/* ═══ QADAM KO'RSATKICHI ═══ */}
      <div className="flex items-center gap-2 text-xs">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
          step === 'scan-barcode' ? 'bg-primary text-white' : 'bg-primary/20 text-primary'
        }`}>
          <ScanBarcode size={12} />
          <span>1. Shtrix kod</span>
        </div>
        <ArrowRight size={14} className="text-muted" />
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
          step === 'scan-gtin' || step === 'gtin-saved' ? 'bg-success text-white' : 'bg-card text-muted'
        }`}>
          <Tag size={12} />
          <span>2. GTIN saqlash</span>
        </div>
      </div>

      {/* ═══ DORI TOPILGANDA ═══ */}
      <AnimatePresence>
        {currentMedicine && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="bg-success/10 border border-success/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
                  <Package size={20} className="text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{currentMedicine.name}</h3>
                  <p className="text-xs text-muted">
                    {currentMedicine.manufacturer || "Ishlab chiqaruvchi noma'lum"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleNewMedicine}
                className="p-2 rounded-lg hover:bg-card transition-colors"
                title="Yangi dori"
              >
                <X size={16} className="text-muted" />
              </button>
            </div>

            {/* Saqlangan GTIN lar */}
            {savedGtins.length > 0 && (
              <div className="mt-3 pt-3 border-t border-success/20">
                <p className="text-xs text-muted mb-2">
                  Saqlangan GTIN lar: {savedGtins.length}
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {savedGtins.map((g) => (
                    <div key={g.id} className="flex items-center justify-between text-xs bg-background/50 rounded-lg px-3 py-1.5">
                      <span className="font-mono">{g.gtin}</span>
                      {g.serial && <span className="text-muted">SN: {g.serial}</span>}
                      <span className="text-success text-[10px]">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TUGMALAR ═══ */}
      <div className="flex gap-2">
        {!isScanning ? (
          <>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
              className={`h-12 px-3 rounded-xl font-medium flex items-center gap-1.5 border transition-colors text-sm ${
                facingMode === 'user' ? 'bg-primary/20 text-primary border-primary/50' : 'bg-card text-muted border-border'
              }`}
            >
              <SwitchCamera size={16} />
              <span className="hidden sm:inline">{facingMode === 'environment' ? 'Orqa' : 'Old'}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={startScanner}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <Camera size={20} />
              {step === 'scan-barcode' ? 'Shtrix kod skanerlash' : 'GTIN skanerlash'}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowManualInput(true)}
              className="h-12 px-3 bg-card hover:bg-card-hover rounded-xl font-medium flex items-center gap-1.5 border border-border text-sm"
            >
              <Plus size={16} />
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={stopScanner}
              className="flex-1 h-12 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <CameraOff size={20} />
              To&apos;xtatish
            </motion.button>

            {torchSupported && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleTorchToggle}
                className={`h-12 px-3 rounded-xl border transition-colors ${
                  torchOn ? 'bg-accent text-background border-accent' : 'bg-card text-foreground border-border'
                }`}
              >
                {torchOn ? <FlashlightOff size={18} /> : <Flashlight size={18} />}
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={switchCamera}
              className="h-12 px-3 bg-card rounded-xl border border-border"
            >
              <SwitchCamera size={18} />
            </motion.button>
          </>
        )}
      </div>

      {/* ═══ SKANER OYNASI ═══ */}
      <div className="relative rounded-2xl overflow-hidden bg-card min-h-[300px]">
        <div
          id="qr-reader"
          className={`w-full min-h-[300px] ${isScanning ? 'block' : 'hidden'}`}
        />

        {!isScanning && (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted">
            <ScanBarcode size={64} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">
              {step === 'scan-barcode'
                ? "Dori shtrix kodini (EAN-13) skanerlang"
                : "GTIN (DataMatrix) kodini skanerlang"}
            </p>
            <p className="text-xs mt-1 opacity-60">
              {step === 'scan-barcode'
                ? "Masalan: 4607015470868"
                : "Har bir dori paketidagi DataMatrix kod"}
            </p>
          </div>
        )}

        {/* Lazer animatsiya */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-blue-500 rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-blue-500 rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-blue-500 rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-blue-500 rounded-br-lg" />

            <div className="absolute left-6 right-6 h-[2px] top-0">
              <motion.div
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0) 10%, rgba(59,130,246,0.8) 50%, rgba(59,130,246,0) 90%, transparent 100%)',
                  boxShadow: '0 0 15px rgba(59,130,246,0.5)',
                }}
                animate={{ top: ['5%', '95%', '5%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {scanPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-success/5 flex items-center justify-center"
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-success/20 rounded-full p-3">
                  <CheckCircle2 size={32} className="text-success" />
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ═══ XATOLIK ═══ */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-danger/10 border border-danger/30 rounded-xl p-3 flex items-center gap-2"
          >
            <AlertCircle size={16} className="text-danger flex-shrink-0" />
            <p className="text-sm text-danger">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X size={14} className="text-danger" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ LOADING ═══ */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="text-sm text-muted">Qidirilmoqda...</span>
        </div>
      )}

      {/* ═══ QO'LDA KIRITISH ═══ */}
      <AnimatePresence>
        {showManualInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card rounded-xl border border-border p-4 space-y-3"
          >
            <p className="text-sm font-medium">Barcode raqamini kiriting</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualInput()}
                placeholder="Masalan: 4607015470868"
                className="flex-1 h-10 bg-background border border-border rounded-lg px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <button
                onClick={handleManualInput}
                disabled={!manualBarcode.trim()}
                className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Qidirish
              </button>
            </div>
            <button
              onClick={() => { setShowManualInput(false); setManualBarcode(''); }}
              className="text-xs text-muted"
            >
              Bekor qilish
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
