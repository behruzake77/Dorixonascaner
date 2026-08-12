// ═══════════════════════════════════════════
// Native BarcodeDetector Wrapper
// Chrome/Edge da brauzer o'zi decode qiladi — 10x tezroq!
// Fallback: html5-qrcode
// ═══════════════════════════════════════════

export interface NativeScanResult {
  rawValue: string;
  format: string;
}

/**
 * BarcodeDetector API mavjudligini tekshirish
 */
export function isNativeBarcodeSupported(): boolean {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
}

/**
 * Qo'llab-quvvatlanadigan formatlar
 */
const BARCODE_FORMATS = [
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'code_128',
  'code_39',
  'code_93',
  'codabar',
  'itf',
  'data_matrix',
  'qr_code',
  'pdf417',
];

/**
 * Native BarcodeDetector yaratish
 */
async function createNativeDetector(): Promise<any | null> {
  if (!isNativeBarcodeSupported()) return null;

  try {
    const BarcodeDetector = (window as any).BarcodeDetector;

    // Qo'llab-quvvatlanadigan formatlarni tekshirish
    const supportedFormats = await BarcodeDetector.getSupportedFormats();
    const formats = BARCODE_FORMATS.filter((f) => supportedFormats.includes(f));

    return new BarcodeDetector({ formats });
  } catch {
    return null;
  }
}

/**
 * Video frame dan barcode aniqlash (Native API)
 */
export async function detectBarcodeFromVideo(
  video: HTMLVideoElement
): Promise<NativeScanResult | null> {
  const detector = await createNativeDetector();
  if (!detector) return null;

  try {
    const barcodes = await detector.detect(video);
    if (barcodes.length > 0) {
      return {
        rawValue: barcodes[0].rawValue,
        format: barcodes[0].format,
      };
    }
  } catch {
    // Frame hali tayyor emas — normal
  }

  return null;
}

/**
 * Canvas frame dan barcode aniqlash (Native API)
 */
export async function detectBarcodeFromCanvas(
  canvas: HTMLCanvasElement
): Promise<NativeScanResult | null> {
  const detector = await createNativeDetector();
  if (!detector) return null;

  try {
    const barcodes = await detector.detect(canvas);
    if (barcodes.length > 0) {
      return {
        rawValue: barcodes[0].rawValue,
        format: barcodes[0].format,
      };
    }
  } catch {
    // Frame tayyor emas
  }

  return null;
}

/**
 * Rasm fayldan barcode aniqlash
 */
export async function detectBarcodeFromImage(
  imageFile: File
): Promise<NativeScanResult | null> {
  const detector = await createNativeDetector();
  if (!detector) return null;

  try {
    const bitmap = await createImageBitmap(imageFile);
    const barcodes = await detector.detect(bitmap);
    bitmap.close();

    if (barcodes.length > 0) {
      return {
        rawValue: barcodes[0].rawValue,
        format: barcodes[0].format,
      };
    }
  } catch {
    // Rasm o'qib bo'lmadi
  }

  return null;
}

/**
 * Kamera stream yaratish (eng yuqori sifat bilan)
 */
export async function createCameraStream(
  facingMode: 'environment' | 'user' = 'environment'
): Promise<MediaStream | null> {
  try {
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode,
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        // Auto-focus — skanerlash uchun juda muhim
        // @ts-ignore
        focusMode: 'continuous',
        // @ts-ignore
        exposureMode: 'continuous',
        // @ts-ignore
        whiteBalanceMode: 'continuous',
      },
      audio: false,
    };

    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    // Fallback — past sifat bilan
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
    } catch {
      return null;
    }
  }
}

/**
 * Torch (chiroq) yoqish/o'chirish
 */
export async function toggleTorch(
  stream: MediaStream,
  enabled: boolean
): Promise<boolean> {
  try {
    const track = stream.getVideoTracks()[0];
    if (!track) return false;

    const capabilities = track.getCapabilities() as any;

    // Torch qo'llab-quvvatlanadimi?
    if (!capabilities.torch) {
      console.warn('Torch not supported on this device');
      return false;
    }

    await track.applyConstraints({
      // @ts-ignore
      advanced: [{ torch: enabled }],
    });

    return true;
  } catch (err) {
    console.error('Torch toggle error:', err);
    return false;
  }
}

/**
 * Zoom nazorati
 */
export async function setZoom(
  stream: MediaStream,
  zoomLevel: number
): Promise<boolean> {
  try {
    const track = stream.getVideoTracks()[0];
    if (!track) return false;

    const capabilities = track.getCapabilities() as any;

    if (!capabilities.zoom) {
      return false;
    }

    const min = capabilities.zoom.min || 1;
    const max = capabilities.zoom.max || 10;
    const zoom = Math.min(Math.max(zoomLevel, min), max);

    await track.applyConstraints({
      // @ts-ignore
      advanced: [{ zoom }],
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Zoom imkoniyatlarini olish
 */
export function getZoomCapabilities(stream: MediaStream): {
  supported: boolean;
  min: number;
  max: number;
  step: number;
} {
  try {
    const track = stream.getVideoTracks()[0];
    if (!track) return { supported: false, min: 1, max: 1, step: 1 };

    const capabilities = track.getCapabilities() as any;

    if (!capabilities.zoom) {
      return { supported: false, min: 1, max: 1, step: 1 };
    }

    return {
      supported: true,
      min: capabilities.zoom.min || 1,
      max: capabilities.zoom.max || 10,
      step: capabilities.zoom.step || 0.1,
    };
  } catch {
    return { supported: false, min: 1, max: 1, step: 1 };
  }
}

/**
 * Torch qo'llab-quvvatlanishini tekshirish
 */
export function isTorchSupported(stream: MediaStream): boolean {
  try {
    const track = stream.getVideoTracks()[0];
    if (!track) return false;
    const capabilities = track.getCapabilities() as any;
    return !!capabilities.torch;
  } catch {
    return false;
  }
}
