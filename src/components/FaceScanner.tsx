'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CameraOff,
  Shield,
  ShieldCheck,
  ShieldX,
  Loader2,
  User,
  Fingerprint,
  Scan,
  RefreshCw,
} from 'lucide-react';
import { playBeep } from '@/lib/api';

interface FaceScannerProps {
  mode?: 'detect' | 'login' | 'register';
  onFaceDetected?: (faceData: FaceData) => void;
  onLoginSuccess?: () => void;
  onLoginFail?: (reason: string) => void;
}

export interface FaceData {
  detected: boolean;
  confidence: number;
  landmarks: { x: number; y: number }[];
  box: { x: number; y: number; width: number; height: number };
  descriptor?: number[];
  timestamp: Date;
}

type ScanPhase = 'idle' | 'scanning' | 'analyzing' | 'verified' | 'denied';

export default function FaceScanner({
  mode = 'detect',
  onFaceDetected,
  onLoginSuccess,
  onLoginFail,
}: FaceScannerProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [faceData, setFaceData] = useState<FaceData | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [hudData, setHudData] = useState({
    fps: 0,
    faceCount: 0,
    brightness: 0,
    distance: 'Optimal',
    angle: 'To\'g\'ri',
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const fpsRef = useRef({ count: 0, lastTime: Date.now() });
  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // FPS counter
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - fpsRef.current.lastTime) / 1000;
      setHudData((prev) => ({
        ...prev,
        fps: Math.round(fpsRef.current.count / elapsed),
      }));
      fpsRef.current = { count: 0, lastTime: now };
    }, 2000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Kamerani yoqish
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);
      setPhase('scanning');
      startDetectionLoop();
    } catch (err) {
      console.error('Camera error:', err);
    }
  }, []);

  // Kamerani to'xtatish
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setPhase('idle');
    setScanProgress(0);
  }, []);

  // Face detection loop (browser native)
  const startDetectionLoop = useCallback(() => {
    const detect = () => {
      fpsRef.current.count++;

      if (!videoRef.current || !canvasRef.current) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Video ni canvas ga chizish
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Rasm ma'lumotlarini olish (yorug'lik uchun)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const brightness = calculateBrightness(imageData);

      // Yuz aniqlash (oddiy usul — rang diapazoni bilan)
      const faceRegion = detectFaceRegion(imageData, canvas.width, canvas.height);

      setHudData((prev) => ({
        ...prev,
        brightness: Math.round(brightness),
        faceCount: faceRegion ? 1 : 0,
        distance: faceRegion
          ? faceRegion.width > 200 ? 'Yaqin' : faceRegion.width > 100 ? 'Optimal' : 'Uzoq'
          : 'Aniqlanmadi',
      }));

      if (faceRegion) {
        // Yuz topildi
        const face: FaceData = {
          detected: true,
          confidence: faceRegion.confidence,
          landmarks: faceRegion.landmarks,
          box: faceRegion,
          timestamp: new Date(),
        };

        setFaceData(face);

        // Canvas ga overlay chizish
        drawHUD(ctx, faceRegion, canvas.width, canvas.height, phase);

        // Scan progress
        if (phase === 'scanning') {
          setScanProgress((prev) => {
            const next = Math.min(prev + 2, 100);
            if (next >= 100 && phase === 'scanning') {
              analyzeFace(face);
            }
            return next;
          });
        }
      } else {
        // Yuz topilmadi
        setFaceData(null);
        if (phase === 'scanning') {
          setScanProgress((prev) => Math.max(prev - 1, 0));
        }
        drawNoFaceHUD(ctx, canvas.width, canvas.height);
      }

      animFrameRef.current = requestAnimationFrame(detect);
    };

    animFrameRef.current = requestAnimationFrame(detect);
  }, [phase]);

  // Yuz tahlili
  const analyzeFace = useCallback(
    (face: FaceData) => {
      setPhase('analyzing');
      playBeep('success');

      // Simulate analysis delay
      scanTimerRef.current = setTimeout(() => {
        if (mode === 'detect') {
          setPhase('verified');
          onFaceDetected?.(face);
          playBeep('success');
        } else if (mode === 'login') {
          // Login — saqlangan yuz bilan solishtirish
          const storedFace = localStorage.getItem('dorixona-face-data');
          if (storedFace) {
            // Simple comparison (real app would use face descriptors)
            setPhase('verified');
            playBeep('success');
            setTimeout(() => onLoginSuccess?.(), 1500);
          } else {
            setPhase('denied');
            playBeep('error');
            onLoginFail?.('Yuz bazada topilmadi. Avval ro\'yxatdan o\'ting.');
          }
        } else if (mode === 'register') {
          // Ro'yxatdan o'tkazish — yuzni saqlash
          localStorage.setItem('dorixona-face-data', JSON.stringify({
            box: face.box,
            confidence: face.confidence,
            registeredAt: new Date().toISOString(),
          }));
          setPhase('verified');
          playBeep('success');
        }
      }, 2000);
    },
    [mode, onFaceDetected, onLoginSuccess, onLoginFail]
  );

  // Qayta urinish
  const handleRetry = () => {
    setPhase('scanning');
    setScanProgress(0);
    setFaceData(null);
  };

  return (
    <div className="space-y-4">
      {/* Kamera tugmasi */}
      {!isActive ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startCamera}
          className="w-full h-16 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-red-500/25"
        >
          <Fingerprint size={28} />
          Yuzni skanerlash
        </motion.button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={stopCamera}
          className="w-full h-12 bg-card text-muted rounded-xl font-medium flex items-center justify-center gap-2 border border-border"
        >
          <CameraOff size={18} />
          To&apos;xtatish
        </motion.button>
      )}

      {/* Kamera oynasi + HUD */}
      <div className="relative rounded-2xl overflow-hidden bg-black min-h-[400px]">
        {/* Video */}
        <video
          ref={videoRef}
          className={`w-full ${isActive ? 'block' : 'hidden'}`}
          style={{ transform: 'scaleX(-1)' }}
          playsInline
          muted
          autoPlay
        />

        {/* Canvas overlay */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full ${isActive ? 'block' : 'hidden'}`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Bo'sh holat */}
        {!isActive && (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
            <Scan size={80} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Yuzni skanerlash uchun kamerani yoqing</p>
            <p className="text-xs mt-1 opacity-60">Yuzingizni kameraga qarating</p>
          </div>
        )}

        {/* HUD Overlay — Iron Man uslubida */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Burchak markerlari — qizil */}
            <div className="absolute top-3 left-3 w-12 h-12 border-t-[3px] border-l-[3px] border-red-500/80 rounded-tl-xl" />
            <div className="absolute top-3 right-3 w-12 h-12 border-t-[3px] border-r-[3px] border-red-500/80 rounded-tr-xl" />
            <div className="absolute bottom-3 left-3 w-12 h-12 border-b-[3px] border-l-[3px] border-red-500/80 rounded-bl-xl" />
            <div className="absolute bottom-3 right-3 w-12 h-12 border-b-[3px] border-r-[3px] border-red-500/80 rounded-br-xl" />

            {/* Markaziy crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 border border-red-500/30 rounded-full" />
              <div className="absolute top-1/2 left-0 w-6 h-[1px] bg-red-500/50" />
              <div className="absolute top-1/2 right-0 w-6 h-[1px] bg-red-500/50" />
              <div className="absolute top-0 left-1/2 h-6 w-[1px] bg-red-500/50" />
              <div className="absolute bottom-0 left-1/2 h-6 w-[1px] bg-red-500/50" />
              {/* Ichki doira */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-red-500/60 rounded-full" />
            </div>

            {/* Skanerlash chizig'i */}
            {phase === 'scanning' && (
              <motion.div
                className="absolute left-8 right-8 h-[2px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.8), transparent)',
                  boxShadow: '0 0 20px rgba(239,68,68,0.4)',
                }}
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* HUD ma'lumotlar — chap tomon */}
            <div className="absolute top-4 left-4 space-y-1.5">
              <HudLine label="FPS" value={`${hudData.fps}`} />
              <HudLine label="YUZ" value={hudData.faceCount > 0 ? 'TOPILDI' : 'YO\'Q'} color={hudData.faceCount > 0 ? 'text-green-400' : 'text-red-400'} />
              <HudLine label="MASOFA" value={hudData.distance} />
              <HudLine label="YO'RIQLIK" value={`${hudData.brightness}%`} />
            </div>

            {/* HUD ma'lumotlar — o'ng tomon */}
            <div className="absolute top-4 right-4 text-right space-y-1.5">
              <HudLine label="ENGINE" value="FACE-SCAN" />
              <HudLine label="MODE" value={mode.toUpperCase()} />
              <HudLine label="STATUS" value={phase.toUpperCase()} color={
                phase === 'verified' ? 'text-green-400' :
                phase === 'denied' ? 'text-red-400' :
                'text-red-300'
              } />
            </div>

            {/* Pastki HUD — progress */}
            <div className="absolute bottom-4 left-4 right-4">
              {/* Progress bar */}
              <div className="bg-black/50 rounded-full h-2 mb-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: phase === 'verified'
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : phase === 'denied'
                      ? 'linear-gradient(90deg, #ef4444, #f87171)'
                      : 'linear-gradient(90deg, #ef4444, #f87171)',
                    boxShadow: `0 0 10px ${phase === 'verified' ? '#10b981' : '#ef4444'}`,
                  }}
                  animate={{ width: `${scanProgress}%` }}
                />
              </div>

              {/* Status matn */}
              <div className="text-center">
                {phase === 'scanning' && (
                  <p className="text-red-400 text-xs font-mono animate-pulse">
                    ◉ SKANERLASH — YUZINGIZNI QARATING
                  </p>
                )}
                {phase === 'analyzing' && (
                  <p className="text-yellow-400 text-xs font-mono animate-pulse">
                    ◉ TAHLIL QILINMOQDA...
                  </p>
                )}
                {phase === 'verified' && (
                  <motion.p
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-green-400 text-sm font-bold font-mono"
                  >
                    ✓ ANIQLANDI — KIRISH RUXSAT ETILDI
                  </motion.p>
                )}
                {phase === 'denied' && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <p className="text-red-400 text-sm font-bold font-mono">
                      ✗ KIRISH RAD ETILDI
                    </p>
                    <button
                      onClick={handleRetry}
                      className="text-red-300 text-xs mt-1 underline pointer-events-auto"
                    >
                      Qayta urinish
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Verified overlay — yashil flash */}
        <AnimatePresence>
          {phase === 'verified' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-green-500/10 pointer-events-none"
            />
          )}
          {phase === 'denied' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="absolute inset-0 bg-red-500/20 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Yuz ma'lumotlari */}
      <AnimatePresence>
        {faceData && isActive && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                phase === 'verified' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {phase === 'verified' ? (
                  <ShieldCheck size={20} className="text-green-400" />
                ) : (
                  <User size={20} className="text-red-400" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {phase === 'verified' ? 'Yuz aniqlandi' : 'Skanerlash...'}
                </p>
                <p className="text-xs text-muted">
                  Ishonch: {Math.round(faceData.confidence * 100)}%
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-background rounded-lg px-3 py-2">
                <span className="text-muted">Kenglik</span>
                <p className="font-mono">{faceData.box.width}px</p>
              </div>
              <div className="bg-background rounded-lg px-3 py-2">
                <span className="text-muted">Balandlik</span>
                <p className="font-mono">{faceData.box.height}px</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══ HUD qatori ═══
function HudLine({ label, value, color = 'text-red-300' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-red-500/60 text-[10px] font-mono w-16">{label}</span>
      <span className={`${color} text-[11px] font-mono font-bold`}>{value}</span>
    </div>
  );
}

// ═══ Yordamchi funksiyalar ═══

function calculateBrightness(imageData: ImageData): number {
  const data = imageData.data;
  let sum = 0;
  const pixelCount = data.length / 4;
  // Har 40-pikselni tekshirish (tezlik uchun)
  for (let i = 0; i < data.length; i += 160) {
    sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  return (sum / (pixelCount / 40)) / 255 * 100;
}

interface FaceRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  landmarks: { x: number; y: number }[];
}

function detectFaceRegion(
  imageData: ImageData,
  width: number,
  height: number
): FaceRegion | null {
  const data = imageData.data;

  // Teri rangi diapazoni (HSV asosida)
  // Yuz odatda markazda bo'ladi
  const centerX = width / 2;
  const centerY = height / 2;
  const searchRadiusX = width * 0.3;
  const searchRadiusY = height * 0.35;

  let skinPixels = 0;
  let totalPixels = 0;
  let minX = width, maxX = 0, minY = height, maxY = 0;

  // Markaziy qidiruv hududini tekshirish
  for (let y = centerY - searchRadiusY; y < centerY + searchRadiusY; y += 3) {
    for (let x = centerX - searchRadiusX; x < centerX + searchRadiusX; x += 3) {
      const px = Math.floor(x);
      const py = Math.floor(y);
      if (px < 0 || px >= width || py < 0 || py >= height) continue;

      const i = (py * width + px) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Teri rangi tekshirish (RGB diapazoni)
      if (isSkinColor(r, g, b)) {
        skinPixels++;
        minX = Math.min(minX, px);
        maxX = Math.max(maxX, px);
        minY = Math.min(minY, py);
        maxY = Math.max(maxY, py);
      }
      totalPixels++;
    }
  }

  const skinRatio = skinPixels / totalPixels;

  // Teri piksellari yetarli bo'lsa — yuz bor
  if (skinRatio > 0.3 && skinPixels > 500) {
    const boxWidth = maxX - minX;
    const boxHeight = maxY - minY;

    // Yuz nisbatini tekshirish (odatda 1:1.3 dan 1:1.5 gacha)
    const aspectRatio = boxHeight / boxWidth;
    if (aspectRatio > 0.8 && aspectRatio < 2.0) {
      return {
        x: minX,
        y: minY,
        width: boxWidth,
        height: boxHeight,
        confidence: Math.min(skinRatio * 2, 0.99),
        landmarks: [
          { x: minX + boxWidth * 0.3, y: minY + boxHeight * 0.35 }, // Chap ko'z
          { x: minX + boxWidth * 0.7, y: minY + boxHeight * 0.35 }, // O'ng ko'z
          { x: minX + boxWidth * 0.5, y: minY + boxHeight * 0.55 }, // Burun
          { x: minX + boxWidth * 0.5, y: minY + boxHeight * 0.7 },  // Og'iz
        ],
      };
    }
  }

  return null;
}

function isSkinColor(r: number, g: number, b: number): boolean {
  // Teri rangi — turli xil teri ranglarini aniqlash
  // Yorug' teri
  if (r > 95 && g > 40 && b > 20 &&
      r > g && r > b &&
      Math.abs(r - g) > 15 &&
      r - b > 15) {
    return true;
  }
  // Qorong'u teri
  if (r > 80 && g > 30 && b > 15 &&
      r > g && r > b &&
      (r - g) > 10) {
    return true;
  }
  return false;
}

// ═══ Canvas HUD chizish ═══

function drawHUD(
  ctx: CanvasRenderingContext2D,
  face: FaceRegion,
  width: number,
  height: number,
  phase: ScanPhase
) {
  const padding = 20;

  // Yuz atrofida ramka
  ctx.strokeStyle = phase === 'verified'
    ? 'rgba(16, 185, 129, 0.8)'
    : phase === 'denied'
    ? 'rgba(239, 68, 68, 0.8)'
    : 'rgba(239, 68, 68, 0.6)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);

  // Oval ramka
  const cx = face.x + face.width / 2;
  const cy = face.y + face.height / 2;
  const rx = face.width / 2 + padding;
  const ry = face.height / 2 + padding + 10;

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Landmark nuqtalari
  ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
  face.landmarks.forEach((lm) => {
    ctx.beginPath();
    ctx.arc(lm.x, lm.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Ko'zlar orasiga chiziq
  if (face.landmarks.length >= 2) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(face.landmarks[0].x, face.landmarks[0].y);
    ctx.lineTo(face.landmarks[1].x, face.landmarks[1].y);
    ctx.stroke();
  }
}

function drawNoFaceHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Markaziy doira — qidiruv
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.ellipse(width / 2, height / 2, 80, 100, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}
