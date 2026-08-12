// ═══════════════════════════════════════════
// GS1 DataMatrix Parser
// DataMatrix koddan GTIN, Serial, Expiry, Batch ajratish
// ═══════════════════════════════════════════

import type { GS1ParsedData } from '@/types';

// GS1 Application Identifier (AI) kodlari
const AI_CODES: Record<string, { name: string; length?: number; fixed: boolean }> = {
  '01': { name: 'gtin', length: 14, fixed: true },
  '02': { name: 'gtin_contained', length: 14, fixed: true },
  '10': { name: 'batch', fixed: false },        // Variable length, max 20
  '11': { name: 'production_date', length: 6, fixed: true },
  '13': { name: 'packaging_date', length: 6, fixed: true },
  '15': { name: 'best_before', length: 6, fixed: true },
  '17': { name: 'expiry', length: 6, fixed: true },
  '21': { name: 'serial', fixed: false },        // Variable length, max 20
  '30': { name: 'variable_count', fixed: false },
};

// GS1 FNC1 separator (ASCII 29 - Group Separator)
const GS1_SEPARATOR = String.fromCharCode(29);
const FNC1 = ']d2'; // GS1 DataMatrix prefix

/**
 * GS1 DataMatrix kodni parse qilish
 * 
 * Format: (01)GTIN(17)YYMMDD(10)BATCH(21)SERIAL
 * yoki: 01GTIN17YYMMDD10BATCH21SERIAL
 */
export function parseGS1DataMatrix(rawData: string): GS1ParsedData {
  const result: GS1ParsedData = {
    raw: rawData,
  };

  // Tozalash
  let data = rawData.trim();
  
  // GS1 prefix ni olib tashlash
  if (data.startsWith(FNC1)) {
    data = data.substring(FNC1.length);
  }
  
  // Qavslarni olib tashlash: (01)1234... -> 011234...
  data = data.replace(/\((\d{2,4})\)/g, '$1');

  // Parentheses format: (01)GTIN(17)DATE(10)BATCH(21)SERIAL
  const parenRegex = /\((\d{2})\)([^(]+)/g;
  let match;
  const hasParens = rawData.includes('(');

  if (hasParens) {
    while ((match = parenRegex.exec(rawData)) !== null) {
      const ai = match[1];
      const value = match[2].trim();
      processAI(result, ai, value);
    }
  } else {
    // Raw format: 01GTIN17DATE...
    let pos = 0;
    while (pos < data.length) {
      // Separator bo'lsa o'tkazib yuborish
      if (data[pos] === GS1_SEPARATOR) {
        pos++;
        continue;
      }

      const ai = data.substring(pos, pos + 2);
      const aiConfig = AI_CODES[ai];

      if (!aiConfig) {
        pos++;
        continue;
      }

      pos += 2;

      if (aiConfig.fixed && aiConfig.length) {
        // Fixed length
        const value = data.substring(pos, pos + aiConfig.length);
        processAI(result, ai, value);
        pos += aiConfig.length;
      } else {
        // Variable length - separator yoki keyingi AI gacha
        let endPos = pos;
        while (endPos < data.length) {
          if (data[endPos] === GS1_SEPARATOR) break;
          // Keyingi AI boshlanishini tekshirish
          const nextAI = data.substring(endPos, endPos + 2);
          if (AI_CODES[nextAI] && endPos > pos) break;
          endPos++;
        }
        const value = data.substring(pos, endPos);
        processAI(result, ai, value);
        pos = endPos;
      }
    }
  }

  // GTIN dan barcode yasash (EAN-13)
  if (result.gtin) {
    // GTIN-14 -> EAN-13 (birinchi raqamni olib tashlash yoki check digit)
    const gtin = result.gtin.replace(/^0+/, '');
    if (gtin.length >= 13) {
      result.gtin = gtin.substring(0, 13);
    }
  }

  // Expiry date ni parse qilish
  if (result.expiry) {
    result.expiryDate = parseGS1Date(result.expiry);
  }

  return result;
}

/**
 * AI qiymatini result ga qo'shish
 */
function processAI(result: GS1ParsedData, ai: string, value: string) {
  const config = AI_CODES[ai];
  if (!config) return;

  switch (config.name) {
    case 'gtin':
    case 'gtin_contained':
      result.gtin = value;
      break;
    case 'serial':
      result.serial = value;
      break;
    case 'expiry':
      result.expiry = value;
      break;
    case 'batch':
      result.batch = value;
      break;
  }
}

/**
 * GS1 sanani parse qilish (YYMMDD format)
 * 
 * Masalan: "251231" -> 2025-yil 31-dekabr
 */
export function parseGS1Date(dateStr: string): Date | undefined {
  if (!dateStr || dateStr.length !== 6) return undefined;

  const year = parseInt(dateStr.substring(0, 2), 10);
  const month = parseInt(dateStr.substring(2, 4), 10);
  const day = parseInt(dateStr.substring(4, 6), 10);

  // Yil: 00-49 -> 2000-2049, 50-99 -> 1950-1999
  const fullYear = year <= 49 ? 2000 + year : 1900 + year;

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return undefined;
  }

  return new Date(fullYear, month - 1, day);
}

/**
 * Barcode formatini aniqlash
 */
export function detectBarcodeFormat(rawValue: string): 'EAN13' | 'DATAMATRIX' | 'QR_CODE' | 'UNKNOWN' {
  const cleaned = rawValue.replace(/\s/g, '');

  // EAN-13: 13 raqam
  if (/^\d{13}$/.test(cleaned)) {
    return 'EAN13';
  }

  // EAN-8: 8 raqam
  if (/^\d{8}$/.test(cleaned)) {
    return 'EAN13'; // EAN-8 ham EAN oilasidan
  }

  // GS1 DataMatrix: AI kodlari bilan boshlanadi
  if (cleaned.startsWith('01') && cleaned.length >= 16) {
    return 'DATAMATRIX';
  }

  // GS1 DataMatrix: FNC1 prefix
  if (cleaned.startsWith(']d2') || cleaned.startsWith(']C1')) {
    return 'DATAMATRIX';
  }

  // Parentheses format: (01)...(17)...(10)...
  if (/\(\d{2}\)/.test(rawValue)) {
    return 'DATAMATRIX';
  }

  // Uzun raqamlar — GTIN bo'lishi mumkin
  if (/^\d{14}$/.test(cleaned)) {
    return 'DATAMATRIX';
  }

  // URL yoki matn — QR code
  if (cleaned.startsWith('http') || cleaned.includes('://')) {
    return 'QR_CODE';
  }

  return 'UNKNOWN';
}

/**
 * EAN-13 check digit tekshirish
 */
export function isValidEAN13(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(barcode[12], 10);
}

/**
 * GTIN dan EAN-13 yasash
 */
export function gtinToEAN13(gtin: string): string {
  // GTIN-14 dan EAN-13 ga
  const cleaned = gtin.replace(/\s/g, '');
  
  if (cleaned.length === 14) {
    // Birinchi raqam — packaging indicator, oxirgi 13 tasi EAN-13
    return cleaned.substring(1);
  }
  
  if (cleaned.length === 13) {
    return cleaned;
  }

  return cleaned;
}

/**
 * Skanerlash natijasini formatlash (chiroyli ko'rinish)
 */
export function formatScanResult(rawValue: string): string {
  const format = detectBarcodeFormat(rawValue);
  
  switch (format) {
    case 'EAN13':
      return rawValue.replace(/(\d{1})(\d{6})(\d{6})/, '$1 $2 $3');
    case 'DATAMATRIX':
      const parsed = parseGS1DataMatrix(rawValue);
      if (parsed.gtin) {
        return `GTIN: ${parsed.gtin}${parsed.serial ? ` | SN: ${parsed.serial}` : ''}${parsed.expiry ? ` | Exp: ${parsed.expiry}` : ''}`;
      }
      return rawValue.substring(0, 50) + (rawValue.length > 50 ? '...' : '');
    default:
      return rawValue.substring(0, 50);
  }
}
