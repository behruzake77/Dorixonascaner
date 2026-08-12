'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CameraOff,
  ScanBarcode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  SwitchCamera,
  Flashlight,
  FlashlightOff,
  Plus,
  Save,
  ArrowRight,
  Package,
  Tag,
  X,
  Edit3,
  ImagePlus,
} from 'lucide-react';
import { useScannerStore } from '@/store/scanner-store';
import { parseGS1DataMatrix, detectBarcodeFormat } from '@/lib/gs1-parser';
import { playBeep, vibrateDevice } from '@/lib/api';
import {
  isNativeBarcodeSupported,
  createCameraStream,
  detectBarcodeFromVideo,
  toggleTorch,
  isTorchSupported,
} from '@/lib/native-scanner';
import type { ScanResult, Medicine, MedicineGtin } from '@/types';

type Step =
  | 'scan-barcode'
  | 'medicine-found'
  | 'manual-entry'
  | 'scan-gtin'
  | 'gtin-saved';

export default function ScannerSection() {
  const [step, setStep] = useState<Step>('scan-barcode');
  const [isScanning, setIsScanning] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanPaused, setScanPaused] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [savedGtins, setSavedGtins] = useState<MedicineGtin[]>([]);
  const [manualBarcode, setManualBarcode] = useState('');

  // Qo'lda kiritish formasi
  const [manualForm, setManualForm] = useState({
    name: '',
    manufacturer: '',
    price: '',
    dosageForm: '',
    activeSubstance: '',
    dosage: '',
  });

  const scannerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastScanTimeRef = useRef<number>(0);
  const lastScannedBarcode = useRef<string>('');

  const { addScan } = useScannerStore();

  useEffect(() => {
    return () => { stopScanner(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ═══ DORI QIDIRISH ═══
  const lookupMedicine = useCallback(async (barcode: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/medicines/barcode/${barcode}`);
      const data = await res.json();

      if (data.success && data.data) {
        // TOPILDI!
        setCurrentMedicine(data.data);
        setSavedGtins(data.data.gtins || []);
        setStep('medicine-found');
        playBeep('success');
        vibrateDevice([100, 50, 100]);
      } else {
        // TOPILMADI — qo'lda kiritish formasi
        setStep('manual-entry');
        playBeep('warning');
      }
    } catch (err) {
      setError("Qidirishda xatolik");
      playBeep('error');
    } finally {
      setLoading(false);
    }
  }, []);

  // ═══ QO'LDA KIRITISH — Bazaga saqlash ═══
  const saveManualEntry = useCallback(async () => {
    if (!manualForm.name.trim()) {
      setError("Dori nomini kiriting!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/medicines/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: lastScannedBarcode.current,
          ...manualForm,
          price: manualForm.price ? parseFloat(manualForm.price) : null,
        }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        setCurrentMedicine(data.data);
        setSavedGtins([]);
        setStep('medicine-found');
        setManualForm({ name: '', manufacturer: '', price: '', dosageForm: '', activeSubstance: '', dosage: '' });
        playBeep('success');
        vibrateDevice([100, 50, 100]);
      } else {
        setError(data.error || "Saqlashda xatolik");
        playBeep('error');
      }
    } catch (err) {
      setError("Server xatoligi");
      playBeep('error');
    } finally {
      setLoading(false);
    }
  }, [manualForm]);

  // ═══ GTIN SAQLASH ═══
  const saveGtin = useCallback(async (rawValue: string) => {
    if (!currentMedicine) return;

    setLoading(true);
    try {
      const parsed = parseGS1DataMatrix(rawValue);

      const res = await fetch(`/api/medicines/${currentMedicine.id}/gtins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gtin: parsed.gtin || rawValue,
          serial: parsed.serial,
          expiry: parsed.expiry,
          batch: parsed.batch,
        }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        setSavedGtins((prev) => [data.data, ...prev]);
        setStep('gtin-saved');
        playBeep('success');
        vibrateDevice([100, 50, 100]);

        setTimeout(() => {
          setStep('scan-gtin');
          setLastScannedCode('');
        }, 1500);
      } else {
        setError(data.error || "GTIN saqlashda xatolik");
        playBeep('error');
      }
    } catch (err) {
      setError("GTIN saqlashda xatolik");
      playBeep('error');
    } finally {
      setLoading(false);
    }
  }, [currentMedicine]);

  // ═══ SCAN NATIJASI ═══
  const processScanResult = useCallback(
    async (rawValue: string) => {
      const now = Date.now();
      if (lastScanTimeRef.current && now - lastScanTimeRef.current < 2000) return;
      if (lastScannedCode === rawValue) return;

      lastScanTimeRef.current = now;
      setLastScannedCode(rawValue);
      lastScannedBarcode.current = rawValue;

      const format = detectBarcodeFormat(rawValue);

      addScan({
        type: format,
        format,
        rawValue,
        parsed: format === 'DATAMATRIX' ? parseGS1DataMatrix(rawValue) : undefined,
        timestamp: new Date(),
      });

      setScanPaused(true);
      setTimeout(() => setScanPaused(false), 2000);

      // 1-QADAM: EAN-13 → dori qidirish
      if (step === 'scan-barcode' && format === 'EAN13') {
        await lookupMedicine(rawValue);
        return;
      }

      // 2-QADAM: DataMatrix → GTIN saqlash
      if (step === 'scan-gtin' && format === 'DATAMATRIX') {
        await saveGtin(rawValue);
        return;
      }

      // Noto'g'ri format
      if (step === 'scan-barcode' && format === 'DATAMATRIX') {
        setError("Avval dori shtrix kodini (EAN-13) skanerlang, keyin GTIN ni");
      } else if (step === 'scan-gtin' && format === 'EAN13') {
        setError("Hozir GTIN (DataMatrix) kerak. EAN-13 emas!");
      }
    },
    [step, lookupMedicine, saveGtin, addScan, lastScannedCode]
  );

  // ═══ KAMERA ═══
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
              if (result) await processScanResult(result.rawValue);
            }
            animFrameRef.current = requestAnimationFrame(scanLoop);
          };

          animFrameRef.current = requestAnimationFrame(scanLoop);
          return;
        }
      }

      // Fallback
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
    } catch (err) {
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
    if (isScanning) { await stopScanner(); setTimeout(() => startScanner(), 300); }
  }, [facingMode, isScanning, stopScanner, startScanner]);

  const handleNewMedicine = () => {
    setCurrentMedicine(null);
    setSavedGtins([]);
    setStep('scan-barcode');
    setLastScannedCode('');
    lastScannedBarcode.current = '';
    setError(null);
  };

  // ═══ GALEREYADAN SKANERLASH ═══
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        if (isNativeBarcodeSupported()) {
          const { detectBarcodeFromImage } = await import('@/lib/native-scanner');
          const result = await detectBarcodeFromImage(file);
          if (result) {
            await processScanResult(result.rawValue);
            return;
          }
        }

        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('qr-reader-temp');
        try {
          const result = await scanner.scanFile(file, true);
          await processScanResult(result);
        } catch {
          setError("Rasm dan kod o'qib bo'lmadi. Aniqroq rasm sinab ko'ring.");
          playBeep('error');
        } finally {
          await scanner.clear();
        }
      } catch (err) {
        setError("Rasm qayta ishlashda xatolik");
      }
    };

    input.click();
  }, [processScanResult]);

  return (
    <div className="space-y-4">
      {/* ═══ QADAM KO'RSATKICHI ═══ */}
      <div className="flex items-center gap-2 text-xs">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
          step === 'scan-barcode' || step === 'manual-entry' ? 'bg-primary text-white' : 'bg-primary/20 text-primary'
        }`}>
          <ScanBarcode size={12} />
          <span>1. Shtrix kod</span>
        </div>
        <ArrowRight size={14} className="text-muted" />
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
          step === 'scan-gtin' || step === 'gtin-saved' || step === 'medicine-found' ? 'bg-success text-white' : 'bg-card text-muted'
        }`}>
          <Tag size={12} />
          <span>2. GTIN saqlash</span>
        </div>
      </div>

      {/* ═══ DORI TOPILDI ═══ */}
      <AnimatePresence>
        {currentMedicine && step !== 'manual-entry' && (
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
                    {currentMedicine.manufacturer || "—"} | {currentMedicine.barcode}
                  </p>
                  {currentMedicine.price && (
                    <p className="text-xs text-success font-medium">
                      {new Intl.NumberFormat('uz-UZ').format(currentMedicine.price)} so&apos;m
                    </p>
                  )}
                </div>
              </div>
              <button onClick={handleNewMedicine} className="p-2 rounded-lg hover:bg-card">
                <X size={16} className="text-muted" />
              </button>
            </div>

            {savedGtins.length > 0 && (
              <div className="mt-3 pt-3 border-t border-success/20">
                <p className="text-xs text-muted mb-2">Saqlangan GTIN lar: {savedGtins.length}</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {savedGtins.map((g) => (
                    <div key={g.id} className="flex items-center justify-between text-xs bg-background/50 rounded-lg px-3 py-1.5">
                      <span className="font-mono">{g.gtin}</span>
                      {g.serial && <span className="text-muted">SN: {g.serial}</span>}
                      <CheckCircle2 size={12} className="text-success" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'medicine-found' && (
              <button
                onClick={() => { setStep('scan-gtin'); startScanner(); }}
                className="mt-3 w-full h-10 bg-success text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <Tag size={16} />
                GTIN skanerlashni boshlash
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ QO'LDA KIRITISH FORMASI ═══ */}
      <AnimatePresence>
        {step === 'manual-entry' && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="bg-card rounded-xl border border-border p-4 space-y-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <Edit3 size={16} className="text-primary" />
              <h3 className="font-semibold text-sm">Dori ma&apos;lumotlarini kiriting</h3>
            </div>

            <div className="bg-background rounded-lg px-3 py-2 text-xs font-mono text-muted">
              Barcode: {lastScannedBarcode.current}
            </div>

            <div>
              <label className="text-xs text-muted mb-1 block">Dori nomi *</label>
              <input
                type="text"
                value={manualForm.name}
                onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                placeholder="Masalan: Paratsetamol"
                className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted mb-1 block">Ishlab chiqaruvchi</label>
                <input
                  type="text"
                  value={manualForm.manufacturer}
                  onChange={(e) => setManualForm({ ...manualForm, manufacturer: e.target.value })}
                  placeholder="Pharmstandard"
                  className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Narxi (so&apos;m)</label>
                <input
                  type="number"
                  value={manualForm.price}
                  onChange={(e) => setManualForm({ ...manualForm, price: e.target.value })}
                  placeholder="5500"
                  className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted mb-1 block">Shakli</label>
                <input
                  type="text"
                  value={manualForm.dosageForm}
                  onChange={(e) => setManualForm({ ...manualForm, dosageForm: e.target.value })}
                  placeholder="Tabletkasi"
                  className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Dozasi</label>
                <input
                  type="text"
                  value={manualForm.dosage}
                  onChange={(e) => setManualForm({ ...manualForm, dosage: e.target.value })}
                  placeholder="500mg"
                  className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveManualEntry}
                disabled={!manualForm.name.trim() || loading}
                className="flex-1 h-10 bg-success text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Saqlash
              </button>
              <button
                onClick={() => { setStep('scan-barcode'); setError(null); }}
                className="h-10 px-4 bg-card-hover text-muted rounded-lg text-sm"
              >
                Bekor
              </button>
            </div>
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
              className={`h-12 px-3 rounded-xl border text-sm ${
                facingMode === 'user' ? 'bg-primary/20 text-primary border-primary/50' : 'bg-card text-muted border-border'
              }`}
            >
              <SwitchCamera size={16} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={startScanner}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <Camera size={20} />
              {step === 'scan-barcode' ? 'Shtrix kod skanerlash' :
               step === 'scan-gtin' ? 'GTIN skanerlash' :
               'Kamerani yoqish'}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleImageUpload}
              aria-label="Galereyadan rasm tanlash"
              className="h-12 px-4 bg-card hover:bg-card-hover text-foreground rounded-xl font-semibold flex items-center gap-2 border border-border"
            >
              <ImagePlus size={18} />
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
                className={`h-12 px-3 rounded-xl border ${
                  torchOn ? 'bg-accent text-background' : 'bg-card text-foreground border-border'
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
        <div id="qr-reader" className={`w-full min-h-[300px] ${isScanning ? 'block' : 'hidden'}`} />
        <div id="qr-reader-temp" className="hidden" />

        {!isScanning && step !== 'manual-entry' && (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted">
            <ScanBarcode size={64} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">
              {step === 'scan-barcode' ? "Dori shtrix kodini skanerlang" :
               step === 'scan-gtin' ? "GTIN (DataMatrix) kodini skanerlang" :
               "Kamerani yoqing"}
            </p>
            <p className="text-xs mt-1 opacity-60">
              {step === 'scan-barcode' ? "EAN-13 kod — dori qutisida" :
               step === 'scan-gtin' ? "Har bir paketdagi DataMatrix kod" :
               ""}
            </p>
          </div>
        )}

        {/* Lazer */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-blue-500 rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-blue-500 rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-blue-500 rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-blue-500 rounded-br-lg" />
            <div className="absolute left-6 right-6 h-[2px] top-0">
              <motion.div
                className="w-full h-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.8), transparent)', boxShadow: '0 0 15px rgba(59,130,246,0.5)' }}
                animate={{ top: ['5%', '95%', '5%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            {scanPaused && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-success/5 flex items-center justify-center">
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
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-danger/10 border border-danger/30 rounded-xl p-3 flex items-center gap-2"
          >
            <AlertCircle size={16} className="text-danger flex-shrink-0" />
            <p className="text-sm text-danger">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto"><X size={14} className="text-danger" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="text-sm text-muted">Qidirilmoqda...</span>
        </div>
      )}
    </div>
  );
}
