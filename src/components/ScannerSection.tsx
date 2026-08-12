'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CameraOff,
  ScanBarcode,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Layers,
  Flashlight,
  FlashlightOff,
  SwitchCamera,
  ZoomIn,
  ZoomOut,
  ImagePlus,
  Crosshair,
  Gauge,
} from 'lucide-react';
import { useScannerStore } from '@/store/scanner-store';
import { parseGS1DataMatrix, detectBarcodeFormat, formatScanResult } from '@/lib/gs1-parser';
import { findMedicineByBarcode, playBeep, vibrateDevice, saveUnknownGtin, createMedicine } from '@/lib/api';
import {
  isNativeBarcodeSupported,
  createCameraStream,
  detectBarcodeFromVideo,
  toggleTorch,
  setZoom,
  getZoomCapabilities,
  isTorchSupported,
} from '@/lib/native-scanner';
import type { ScanResult, Medicine } from '@/types';
import MedicineCard from './MedicineCard';

// Scan engine turi
type ScanEngine = 'native' | 'html5qrcode';

export default function ScannerSection() {
  // ═══ State ═══
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomInfo, setZoomInfo] = useState({ supported: false, min: 1, max: 1, step: 1 });
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanEngine, setScanEngine] = useState<ScanEngine>('native');
  const [fps, setFps] = useState(0);
  const [scanPaused, setScanPaused] = useState(false);

  // ═══ Refs ═══
  const scannerRef = useRef<any>(null); // html5-qrcode instance
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastScanTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef({ count: 0, lastTime: Date.now() });

  const { addScan, batchMode, batchScans, toggleBatchMode } = useScannerStore();

  // ═══ Cleanup ═══
  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FPS counter
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - fpsCounterRef.current.lastTime) / 1000;
      setFps(Math.round(fpsCounterRef.current.count / elapsed));
      fpsCounterRef.current = { count: 0, lastTime: now };
    }, 2000);
    return () => clearInterval(interval);
  }, [isScanning]);

  // ═══ Dori qidirish ═══
  const lookupMedicine = useCallback(async (scanResult: ScanResult) => {
    setLoading(true);
    setError(null);
    setMedicine(null);

    try {
      let barcode = scanResult.rawValue;
      if (scanResult.parsed?.gtin) {
        barcode = scanResult.parsed.gtin;
      }

      const result = await findMedicineByBarcode(barcode);

      if (result.success && result.data) {
        setMedicine(result.data);
        playBeep('success');
      } else {
        const createResult = await createMedicine(barcode);
        if (createResult.success && createResult.data) {
          setMedicine(createResult.data);
          playBeep('success');
        } else {
          if (scanResult.parsed?.gtin) {
            await saveUnknownGtin({
              gtin: scanResult.parsed.gtin,
              rawData: scanResult.rawValue,
              serial: scanResult.parsed.serial,
              expiry: scanResult.parsed.expiry,
              batch: scanResult.parsed.batch,
            });
          }
          setError("Bu kod bo'yicha dori topilmadi");
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

  // ═══ Scan natijasini qayta ishlash ═══
  const processScanResult = useCallback(
    async (rawValue: string, formatName?: string) => {
      // Takroriy skanerlashni oldini olish (1.5 soniya ichida)
      const now = Date.now();
      if (lastScanTimeRef.current && now - lastScanTimeRef.current < 1500) return;
      if (lastResultRef.current?.rawValue === rawValue && !batchMode) return;

      lastScanTimeRef.current = now;

      const format = detectBarcodeFormat(rawValue);
      const parsed = format === 'DATAMATRIX' ? parseGS1DataMatrix(rawValue) : undefined;

      const scanResult: ScanResult = {
        type: format,
        format: formatName || format,
        rawValue,
        parsed,
        timestamp: new Date(),
      };

      setLastResult(scanResult);
      lastResultRef.current = scanResult;
      addScan(scanResult);

      // Ovoz + vibratsiya
      playBeep('success');
      vibrateDevice([100, 50, 100]);

      // Batch mode da faqat saqlash, dori qidirmaydi
      if (!batchMode) {
        await lookupMedicine(scanResult);
      }

      // Scan pause — 1.5 soniya kutish (takroriy scan oldini olish)
      setScanPaused(true);
      setTimeout(() => setScanPaused(false), 1500);
    },
    [addScan, batchMode, lookupMedicine]
  );

  const lastResultRef = useRef<ScanResult | null>(null);

  // ═══ Native BarcodeDetector loop ═══
  const startNativeScan = useCallback(
    async (stream: MediaStream) => {
      streamRef.current = stream;

      // Video element yaratish
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

      // Container ga qo'shish
      const container = document.getElementById('qr-reader');
      if (container) {
        container.innerHTML = '';
        container.appendChild(video);
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.borderRadius = '1rem';
      }

      // Torch/Zoom imkoniyatlarini tekshirish
      setTorchSupported(isTorchSupported(stream));
      setZoomInfo(getZoomCapabilities(stream));

      // Scan loop
      const scanLoop = async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
          animFrameRef.current = requestAnimationFrame(scanLoop);
          return;
        }

        // FPS counter
        fpsCounterRef.current.count++;

        // Pause bo'lsa scan qilmaydi
        if (!scanPaused) {
          const result = await detectBarcodeFromVideo(videoRef.current);
          if (result) {
            await processScanResult(result.rawValue, result.format);
          }
        }

        animFrameRef.current = requestAnimationFrame(scanLoop);
      };

      animFrameRef.current = requestAnimationFrame(scanLoop);
    },
    [processScanResult, scanPaused]
  );

  // ═══ html5-qrcode fallback ═══
  const startHtml5QrScan = useCallback(async () => {
    const { Html5Qrcode } = await import('html5-qrcode');

    if (scannerRef.current) {
      await scannerRef.current.stop();
    }

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    const config = {
      fps: 15,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      formatsToSupport: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      ],
    };

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
      processScanResult(
        decodedText,
        decodedResult?.result?.format?.formatName
      );
    };

    const onScanFailure = () => {};

    await scanner.start(
      { facingMode },
      config,
      onScanSuccess,
      onScanFailure
    );

    // Torch imkoniyatini tekshirish (html5-qrcode stream orqali)
    try {
      const stream = (scanner as any)._localMediaStream;
      if (stream) {
        setTorchSupported(isTorchSupported(stream));
        setZoomInfo(getZoomCapabilities(stream));
      }
    } catch {}
  }, [facingMode, processScanResult]);

  // ═══ Skanerlashni boshlash ═══
  const startScanner = useCallback(async () => {
    try {
      setError(null);
      lastResultRef.current = null;

      // Native BarcodeDetector tekshirish
      if (isNativeBarcodeSupported()) {
        setScanEngine('native');
        const stream = await createCameraStream(facingMode);
        if (stream) {
          setIsScanning(true);
          await startNativeScan(stream);
          return;
        }
      }

      // Fallback: html5-qrcode
      setScanEngine('html5qrcode');
      setIsScanning(true);
      await startHtml5QrScan();
    } catch (err: any) {
      console.error('Scanner start error:', err);
      setError("Kamera ochilmadi. Kamera ruxsatini bering.");
      setIsScanning(false);
    }
  }, [facingMode, startNativeScan, startHtml5QrScan]);

  // ═══ Skanerlashni to'xtatish ═══
  const stopScanner = useCallback(async () => {
    // Native scanner to'xtatish
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // html5-qrcode to'xtatish
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
    } catch {}

    setIsScanning(false);
    setTorchOn(false);
    setZoomLevel(1);
    setFps(0);
  }, []);

  // ═══ Torch toggle ═══
  const handleTorchToggle = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream) return;

    const success = await toggleTorch(stream, !torchOn);
    if (success) {
      setTorchOn(!torchOn);
    }
  }, [torchOn]);

  // ═══ Zoom ═══
  const handleZoom = useCallback(
    async (direction: 'in' | 'out') => {
      const stream = streamRef.current;
      if (!stream || !zoomInfo.supported) return;

      const newZoom =
        direction === 'in'
          ? Math.min(zoomLevel + 1, zoomInfo.max)
          : Math.max(zoomLevel - 1, zoomInfo.min);

      const success = await setZoom(stream, newZoom);
      if (success) {
        setZoomLevel(newZoom);
      }
    },
    [zoomLevel, zoomInfo]
  );

  // ═══ Kamera almashtirish ═══
  const switchCamera = useCallback(async () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);

    if (isScanning) {
      await stopScanner();
      // Kichik delay — kamera to'liq yopilishi uchun
      setTimeout(() => {
        startScanner();
      }, 300);
    }
  }, [facingMode, isScanning, stopScanner, startScanner]);

  // ═══ Rasm fayldan skanerlash (galereya yoki kamera) ═══
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // capture atributi YO'Q — foydalanuvchi galereyadan yoki kameradan tanlashi mumkin

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // Native API bilan rasm dan o'qish
        if (isNativeBarcodeSupported()) {
          const { detectBarcodeFromImage } = await import('@/lib/native-scanner');
          const result = await detectBarcodeFromImage(file);
          if (result) {
            await processScanResult(result.rawValue, result.format);
            return;
          }
        }

        // html5-qrcode fallback
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

  // ═══ Batch hisob ═══
  const matchedCount = batchScans.filter((s: any) => s.medicine).length;
  const unmatchedCount = batchScans.length - matchedCount;

  return (
    <div className="space-y-4">
      {/* ═══ Engine indicator ═══ */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                scanEngine === 'native' ? 'bg-success animate-pulse' : 'bg-accent'
              }`}
            />
            <span className="text-muted">
              {scanEngine === 'native' ? 'Native Engine' : 'html5-qrcode'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-muted">
            {fps > 0 && (
              <span className="flex items-center gap-1">
                <Gauge size={12} /> {fps} FPS
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ Asosiy tugmalar ═══ */}
      <div className="flex gap-2">
        {!isScanning ? (
          <>
            {/* Kamera tanlash (orqa/old) */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
              aria-label={facingMode === 'environment' ? "Old kameraga o'tish" : "Orqa kameraga o'tish"}
              className={`h-14 px-4 rounded-xl font-semibold flex items-center gap-2 touch-target border transition-colors ${
                facingMode === 'user'
                  ? 'bg-primary/20 text-primary border-primary/50'
                  : 'bg-card hover:bg-card-hover text-foreground border-border'
              }`}
            >
              <SwitchCamera size={20} aria-hidden="true" />
              <span className="text-xs">{facingMode === 'environment' ? 'Orqa' : 'Old'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startScanner}
              aria-label="Kamerani yoqish va skanerlashni boshlash"
              className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 touch-target"
            >
              <Camera size={22} aria-hidden="true" />
              Skanerlash
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleImageUpload}
              aria-label="Galereyadan rasm tanlash"
              className="h-14 px-4 bg-card hover:bg-card-hover text-foreground rounded-xl font-semibold flex items-center gap-2 touch-target border border-border"
            >
              <ImagePlus size={20} aria-hidden="true" />
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={stopScanner}
              aria-label="Skanerlashni to'xtatish"
              className="flex-1 h-14 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 touch-target"
            >
              <CameraOff size={22} aria-hidden="true" />
              To&apos;xtatish
            </motion.button>

            {/* Torch */}
            {torchSupported && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleTorchToggle}
                aria-label={torchOn ? "Chiroqni o'chirish" : "Chiroqni yoqish"}
                className={`h-14 px-4 rounded-xl font-semibold flex items-center gap-2 touch-target border transition-colors ${
                  torchOn
                    ? 'bg-accent text-background border-accent'
                    : 'bg-card hover:bg-card-hover text-foreground border-border'
                }`}
              >
                {torchOn ? <FlashlightOff size={20} /> : <Flashlight size={20} />}
              </motion.button>
            )}

            {/* Kamera almashtirish (skanerlash paytida) */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={switchCamera}
              aria-label="Kamerani almashtirish"
              className={`h-14 px-4 rounded-xl font-semibold flex items-center gap-2 touch-target border transition-colors ${
                facingMode === 'user'
                  ? 'bg-primary/20 text-primary border-primary/50'
                  : 'bg-card hover:bg-card-hover text-foreground border-border'
              }`}
            >
              <SwitchCamera size={20} aria-hidden="true" />
            </motion.button>
          </>
        )}

        {/* Batch mode */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleBatchMode}
          aria-label={batchMode ? "Batch rejimini o'chirish" : "Batch rejimini yoqish"}
          aria-pressed={batchMode}
          className={`h-14 px-5 rounded-xl font-semibold flex items-center gap-2 touch-target transition-colors ${
            batchMode
              ? 'bg-accent text-background'
              : 'bg-card hover:bg-card-hover text-foreground border border-border'
          }`}
        >
          <Layers size={20} />
          {batchMode ? 'ON' : 'OFF'}
        </motion.button>
      </div>

      {/* ═══ Zoom nazorati ═══ */}
      <AnimatePresence>
        {isScanning && zoomInfo.supported && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-3"
          >
            <ZoomOut size={16} className="text-muted" />
            <input
              type="range"
              min={zoomInfo.min}
              max={zoomInfo.max}
              step={zoomInfo.step}
              value={zoomLevel}
              onChange={(e) => {
                const newZoom = parseFloat(e.target.value);
                setZoomLevel(newZoom);
                if (streamRef.current) {
                  setZoom(streamRef.current, newZoom);
                }
              }}
              className="flex-1 h-2 bg-card rounded-full appearance-none cursor-pointer accent-primary"
            />
            <ZoomIn size={16} className="text-muted" />
            <span className="text-xs text-muted font-mono w-8">{zoomLevel.toFixed(1)}x</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Batch mode holati ═══ */}
      <AnimatePresence>
        {batchMode && batchScans.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-accent/10 border border-accent/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-accent" />
                <span className="font-medium">Batch rejimi</span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-success flex items-center gap-1">
                  <CheckCircle2 size={14} /> {matchedCount}
                </span>
                <span className="text-danger flex items-center gap-1">
                  <XCircle size={14} /> {unmatchedCount}
                </span>
                <span className="text-muted flex items-center gap-1">
                  <ScanBarcode size={14} /> {batchScans.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Skaner oynasi ═══ */}
      <div className="relative rounded-2xl overflow-hidden bg-card min-h-[350px]">
        <div
          id="qr-reader"
          ref={useRef<HTMLDivElement>(null)}
          className={`w-full min-h-[350px] ${isScanning ? 'block' : 'hidden'}`}
        />
        <div id="qr-reader-temp" className="hidden" />

        {!isScanning && (
          <div className="flex flex-col items-center justify-center h-[350px] text-muted">
            <div className="relative">
              <ScanBarcode size={72} className="mb-4 opacity-20" />
              <Crosshair
                size={24}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/40"
              />
            </div>
            <p className="text-sm font-medium">Skanerlash uchun kamerani yoqing</p>
            <p className="text-xs mt-1 opacity-60">EAN-13 · DataMatrix · QR</p>
            <div className="flex gap-2 mt-3">
              {isNativeBarcodeSupported() && (
                <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded-full">
                  Native Engine
                </span>
              )}
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Mobil kamera
              </span>
            </div>
          </div>
        )}

        {/* ═══ Lazer chiziq animatsiyasi ═══ */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Burchak markerlari */}
            <div className="absolute top-3 left-3 w-10 h-10 border-t-[3px] border-l-[3px] border-blue-500 rounded-tl-xl" />
            <div className="absolute top-3 right-3 w-10 h-10 border-t-[3px] border-r-[3px] border-blue-500 rounded-tr-xl" />
            <div className="absolute bottom-3 left-3 w-10 h-10 border-b-[3px] border-l-[3px] border-blue-500 rounded-bl-xl" />
            <div className="absolute bottom-3 right-3 w-10 h-10 border-b-[3px] border-r-[3px] border-blue-500 rounded-br-xl" />

            {/* Lazer chiziq */}
            <div className="absolute left-6 right-6 h-[2px] top-0">
              <motion.div
                className="w-full h-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0) 10%, rgba(59, 130, 246, 0.8) 50%, rgba(59, 130, 246, 0) 90%, transparent 100%)',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.2)',
                }}
                animate={{
                  top: ['5%', '95%', '5%'],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            {/* Markaziy crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 border border-white/10 rounded-lg" />
              <div className="absolute top-1/2 left-0 w-4 h-[1px] bg-white/30" />
              <div className="absolute top-1/2 right-0 w-4 h-[1px] bg-white/30" />
              <div className="absolute top-0 left-1/2 h-4 w-[1px] bg-white/30" />
              <div className="absolute bottom-0 left-1/2 h-4 w-[1px] bg-white/30" />
            </div>

            {/* Scan pause indikatori */}
            {scanPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-success/5 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-success/20 rounded-full p-3"
                >
                  <CheckCircle2 size={32} className="text-success" />
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ═══ Xatolik ═══ */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle size={20} className="text-danger flex-shrink-0" />
            <p className="text-sm text-danger">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Loading ═══ */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-3 py-4"
        >
          <Loader2 size={20} className="animate-spin text-primary" />
          <span className="text-sm text-muted">Dori qidirilmoqda...</span>
        </motion.div>
      )}

      {/* ═══ Oxirgi natija ═══ */}
      <AnimatePresence>
        {lastResult && !loading && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-mono text-muted bg-background px-2 py-1 rounded">
                {lastResult.type}
              </span>
              <span className="text-xs text-muted">
                {lastResult.timestamp.toLocaleTimeString('uz-UZ')}
              </span>
            </div>
            <p className="font-mono text-sm break-all text-foreground">
              {formatScanResult(lastResult.rawValue)}
            </p>
            {lastResult.parsed && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {lastResult.parsed.gtin && (
                  <div className="bg-background rounded-lg px-3 py-2">
                    <span className="text-muted">GTIN</span>
                    <p className="font-mono mt-0.5">{lastResult.parsed.gtin}</p>
                  </div>
                )}
                {lastResult.parsed.serial && (
                  <div className="bg-background rounded-lg px-3 py-2">
                    <span className="text-muted">Serial</span>
                    <p className="font-mono mt-0.5">{lastResult.parsed.serial}</p>
                  </div>
                )}
                {lastResult.parsed.expiry && (
                  <div className="bg-background rounded-lg px-3 py-2">
                    <span className="text-muted">Yaroqlilik</span>
                    <p className="font-mono mt-0.5">{lastResult.parsed.expiry}</p>
                  </div>
                )}
                {lastResult.parsed.batch && (
                  <div className="bg-background rounded-lg px-3 py-2">
                    <span className="text-muted">Partiya</span>
                    <p className="font-mono mt-0.5">{lastResult.parsed.batch}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Dori kartochkasi ═══ */}
      <AnimatePresence>
        {medicine && !loading && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
          >
            <MedicineCard medicine={medicine} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
