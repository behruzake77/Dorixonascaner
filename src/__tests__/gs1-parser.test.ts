// ═══════════════════════════════════════════
// GS1 Parser — Unit Tests
// ═══════════════════════════════════════════

import {
  parseGS1DataMatrix,
  detectBarcodeFormat,
  isValidEAN13,
  parseGS1Date,
  gtinToEAN13,
  formatScanResult,
} from '../gs1-parser';

// ═══ parseGS1DataMatrix ═══
describe('parseGS1DataMatrix', () => {
  test('parentheses format: (01)GTIN(17)DATE(10)BATCH(21)SERIAL', () => {
    const result = parseGS1DataMatrix('(01)04607015470868(17)261231(10)B001(21)SER001');
    expect(result.gtin).toBe('4607015470868');
    expect(result.expiry).toBe('261231');
    expect(result.batch).toBe('B001');
    expect(result.serial).toBe('SER001');
  });

  test('raw format: 01GTIN17DATE10BATCH21SERIAL', () => {
    const result = parseGS1DataMatrix('01046070154708681726123110B00121SER001');
    expect(result.gtin).toBe('4607015470868');
    expect(result.expiry).toBe('261231');
  });

  test('FNC1 prefix: ]d201GTIN...', () => {
    const result = parseGS1DataMatrix(']d201460701547086817261231');
    expect(result.gtin).toBe('4607015470868');
    expect(result.expiry).toBe('261231');
  });

  test('faqat GTIN', () => {
    const result = parseGS1DataMatrix('(01)04607015470868');
    expect(result.gtin).toBe('4607015470868');
    expect(result.serial).toBeUndefined();
  });

  test('bo\'sh string', () => {
    const result = parseGS1DataMatrix('');
    expect(result.gtin).toBeUndefined();
  });

  test('expiry date parse qilinadi', () => {
    const result = parseGS1DataMatrix('(01)04607015470868(17)261231');
    expect(result.expiryDate).toBeDefined();
    expect(result.expiryDate?.getFullYear()).toBe(2026);
    expect(result.expiryDate?.getMonth()).toBe(11); // December
  });
});

// ═══ detectBarcodeFormat ═══
describe('detectBarcodeFormat', () => {
  test('13 raqam → EAN13', () => {
    expect(detectBarcodeFormat('4607015470868')).toBe('EAN13');
  });

  test('8 raqam → EAN13 (EAN-8)', () => {
    expect(detectBarcodeFormat('12345678')).toBe('EAN13');
  });

  test('01 bilan boshlansa → DATAMATRIX', () => {
    expect(detectBarcodeFormat('01460701547086817261231')).toBe('DATAMATRIX');
  });

  test('FNC1 prefix → DATAMATRIX', () => {
    expect(detectBarcodeFormat(']d2014607015470868')).toBe('DATAMATRIX');
  });

  test('parentheses → DATAMATRIX', () => {
    expect(detectBarcodeFormat('(01)4607015470868(17)261231')).toBe('DATAMATRIX');
  });

  test('14 raqam → DATAMATRIX', () => {
    expect(detectBarcodeFormat('04607015470868')).toBe('DATAMATRIX');
  });

  test('http:// → QR_CODE', () => {
    expect(detectBarcodeFormat('https://gopharm.uz')).toBe('QR_CODE');
  });

  test('noma\'lum → UNKNOWN', () => {
    expect(detectBarcodeFormat('abc')).toBe('UNKNOWN');
  });
});

// ═══ isValidEAN13 ═══
describe('isValidEAN13', () => {
  test('to\'g\'ri EAN-13', () => {
    expect(isValidEAN13('4607015470868')).toBe(true);
  });

  test('noto\'g\'ri check digit', () => {
    expect(isValidEAN13('4607015470869')).toBe(false);
  });

  test('13 ta raqam emas', () => {
    expect(isValidEAN13('12345')).toBe(false);
  });

  test('harflar bor', () => {
    expect(isValidEAN13('460701547086a')).toBe(false);
  });
});

// ═══ parseGS1Date ═══
describe('parseGS1Date', () => {
  test('251231 → 2026-12-31', () => {
    const date = parseGS1Date('261231');
    expect(date).toBeDefined();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(11);
    expect(date?.getDate()).toBe(31);
  });

  test('240101 → 2024-01-01', () => {
    const date = parseGS1Date('240101');
    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(0);
    expect(date?.getDate()).toBe(1);
  });

  test('noto\'g\'ri format → undefined', () => {
    expect(parseGS1Date('')).toBeUndefined();
    expect(parseGS1Date('12345')).toBeUndefined();
    expect(parseGS1Date('130001')).toBeUndefined(); // month 00
  });
});

// ═══ gtinToEAN13 ═══
describe('gtinToEAN13', () => {
  test('GTIN-14 → EAN-13', () => {
    expect(gtinToEAN13('04607015470868')).toBe('4607015470868');
  });

  test('EAN-13 → EAN-13', () => {
    expect(gtinToEAN13('4607015470868')).toBe('4607015470868');
  });
});

// ═══ formatScanResult ═══
describe('formatScanResult', () => {
  test('EAN-13 formatlash', () => {
    const result = formatScanResult('4607015470868');
    expect(result).toContain('460701');
  });

  test('DataMatrix formatlash', () => {
    const result = formatScanResult('(01)04607015470868(17)261231');
    expect(result).toContain('GTIN');
  });
});
