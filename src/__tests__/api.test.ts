// ═══════════════════════════════════════════
// API — Integration Tests
// ═══════════════════════════════════════════

// Bu testlar Prisma mock bilan ishlaydi
// Haqiqiy database kerak emas

import { detectBarcodeFormat, parseGS1DataMatrix } from '../gs1-parser';
import { validateBarcode, validatePrice, validateQuantity, sanitizeInput } from '../validation';

// ═══ Full Pipeline Test ═══
describe('To\'liq skanerlash pipeline', () => {
  test('EAN-13 → format → validate → sanitize', () => {
    // 1. Scan
    const rawValue = '4607015470868';

    // 2. Format aniqlash
    const format = detectBarcodeFormat(rawValue);
    expect(format).toBe('EAN13');

    // 3. Validate
    const validation = validateBarcode(rawValue);
    expect(validation.valid).toBe(true);

    // 4. (EAN-13 da parse qilmaydi — faqat DataMatrix da)
    const parsed = parseGS1DataMatrix(rawValue);
    expect(parsed.gtin).toBeUndefined(); // EAN-13 — parse qilmaydi
  });

  test('DataMatrix → format → parse → validate → sanitize', () => {
    // 1. Scan
    const rawValue = '(01)04607015470868(17)261231(10)B001(21)SER001';

    // 2. Format aniqlash
    const format = detectBarcodeFormat(rawValue);
    expect(format).toBe('DATAMATRIX');

    // 3. Parse
    const parsed = parseGS1DataMatrix(rawValue);
    expect(parsed.gtin).toBe('4607015470868');
    expect(parsed.expiry).toBe('261231');
    expect(parsed.batch).toBe('B001');
    expect(parsed.serial).toBe('SER001');

    // 4. Validate GTIN
    const gtinValidation = validateBarcode(parsed.gtin!);
    expect(gtinValidation.valid).toBe(true);

    // 5. Narxni validate qilish
    const priceResult = validatePrice('5500');
    expect(priceResult.valid).toBe(true);
    expect(priceResult.value).toBe(5500);
  });

  test('Ombor transaksiya pipeline', () => {
    // 1. Miqdor validate
    const qtyResult = validateQuantity('100');
    expect(qtyResult.valid).toBe(true);
    expect(qtyResult.value).toBe(100);

    // 2. Narx validate
    const priceResult = validatePrice(5500);
    expect(priceResult.valid).toBe(true);
    expect(priceResult.value).toBe(5500);

    // 3. Jami hisob
    const total = qtyResult.value! * priceResult.value!;
    expect(total).toBe(550000);
  });

  test('XSS himoya pipeline', () => {
    // 1. Zararli input
    const maliciousInput = '<script>alert("hacked")</script>Paratsetamol';

    // 2. Sanitize
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
    expect(sanitized).toContain('Paratsetamol');
  });
});

// ═══ Edge Cases ═══
describe('Edge cases', () => {
  test('bo\'sh qiymatlar', () => {
    expect(detectBarcodeFormat('')).toBe('UNKNOWN');
    expect(validateBarcode('').valid).toBe(false);
    expect(validatePrice('').valid).toBe(false);
    expect(validateQuantity('').valid).toBe(false);
  });

  test('juda uzun qiymatlar', () => {
    const longString = 'a'.repeat(10000);
    expect(sanitizeInput(longString)).toBeTruthy();
  });

  test('maxsus belgilar', () => {
    expect(sanitizeInput('!@#$%^&*()')).toBeTruthy();
    expect(sanitizeInput('Ўзбекистон')).toBeTruthy(); // Kiril
    expect(sanitizeInput('O\'zbekiston')).toBeTruthy(); // Apostrof
  });

  test('raqamlar bilan matn', () => {
    expect(detectBarcodeFormat('abc123')).toBe('UNKNOWN');
    expect(detectBarcodeFormat('123abc')).toBe('UNKNOWN');
  });
});
