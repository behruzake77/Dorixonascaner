// ═══════════════════════════════════════════
// Validation — Input ma'lumotlarini tekshirish
// ═══════════════════════════════════════════

/**
 * Barcode formatini tekshirish
 */
export function validateBarcode(barcode: string): { valid: boolean; error?: string } {
  if (!barcode || typeof barcode !== 'string') {
    return { valid: false, error: 'Barcode kiritish shart' };
  }

  const cleaned = barcode.replace(/\s/g, '');

  // EAN-13: 13 ta raqam
  if (/^\d{13}$/.test(cleaned)) {
    return { valid: true };
  }

  // EAN-8: 8 ta raqam
  if (/^\d{8}$/.test(cleaned)) {
    return { valid: true };
  }

  // GTIN-14: 14 ta raqam
  if (/^\d{14}$/.test(cleaned)) {
    return { valid: true };
  }

  // DataMatrix: 01 bilan boshlanadi
  if (/^01\d{12,}/.test(cleaned)) {
    return { valid: true };
  }

  // FNC1 prefix
  if (/^]d2/.test(cleaned)) {
    return { valid: true };
  }

  // Parentheses format
  if (/^\(\d{2}\)/.test(cleaned)) {
    return { valid: true };
  }

  return { valid: false, error: "Noto'g'ri barcode formati" };
}

/**
 * GTIN formatini tekshirish
 */
export function validateGTIN(gtin: string): { valid: boolean; error?: string } {
  if (!gtin || typeof gtin !== 'string') {
    return { valid: false, error: 'GTIN kiritish shart' };
  }

  const cleaned = gtin.replace(/\s/g, '');

  if (!/^\d{14}$/.test(cleaned) && !/^\d{13}$/.test(cleaned)) {
    return { valid: false, error: 'GTIN 13 yoki 14 ta raqamdan iborat bo\'lishi kerak' };
  }

  return { valid: true };
}

/**
 * Dori nomini tekshirish
 */
export function validateMedicineName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Dori nomi kiritish shart' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Dori nomi kamida 2 ta harfdan iborat bo\'lishi kerak' };
  }

  if (trimmed.length > 200) {
    return { valid: false, error: 'Dori nomi 200 ta harfdan oshmasligi kerak' };
  }

  // XSS hujumni oldini olish
  if (/<script|javascript:|on\w+=/i.test(trimmed)) {
    return { valid: false, error: "Noto'g'ri belgilar" };
  }

  return { valid: true };
}

/**
 * Narxni tekshirish
 */
export function validatePrice(price: string | number): { valid: boolean; error?: string; value?: number } {
  if (!price && price !== 0) {
    return { valid: true, value: undefined }; // Ixtiyoriy
  }

  const num = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(num)) {
    return { valid: false, error: "Noto'g'ri raqam" };
  }

  if (num < 0) {
    return { valid: false, error: "Narx manfiy bo'lishi mumkin emas" };
  }

  if (num > 100000000) {
    return { valid: false, error: "Narx juda katta" };
  }

  return { valid: true, value: num };
}

/**
 * Miqdorni tekshirish
 */
export function validateQuantity(quantity: string | number): { valid: boolean; error?: string; value?: number } {
  if (!quantity && quantity !== 0) {
    return { valid: false, error: 'Miqdor kiritish shart' };
  }

  const num = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;

  if (isNaN(num)) {
    return { valid: false, error: "Noto'g'ri raqam" };
  }

  if (!Number.isInteger(num)) {
    return { valid: false, error: "Miqdor butun son bo'lishi kerak" };
  }

  if (num < 0) {
    return { valid: false, error: "Miqdor manfiy bo'lishi mumkin emas" };
  }

  if (num > 1000000) {
    return { valid: false, error: "Miqdor juda katta" };
  }

  return { valid: true, value: num };
}

/**
 * GS1 sanani tekshirish (YYMMDD)
 */
export function validateGS1Date(dateStr: string): { valid: boolean; error?: string } {
  if (!dateStr) {
    return { valid: true }; // Ixtiyoriy
  }

  if (!/^\d{6}$/.test(dateStr)) {
    return { valid: false, error: 'Sana 6 ta raqamdan iborat bo\'lishi kerak (YYMMDD)' };
  }

  const month = parseInt(dateStr.substring(2, 4), 10);
  const day = parseInt(dateStr.substring(4, 6), 10);

  if (month < 1 || month > 12) {
    return { valid: false, error: "Noto'g'ri oy (01-12)" };
  }

  if (day < 1 || day > 31) {
    return { valid: false, error: "Noto'g'ri kun (01-31)" };
  }

  return { valid: true };
}

/**
 * Parolni tekshirish
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Parol kiritish shart' };
  }

  if (password.length < 4) {
    return { valid: false, error: 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak' };
  }

  if (password.length > 100) {
    return { valid: false, error: 'Parol juda uzun' };
  }

  return { valid: true };
}

/**
 * Input ni sanitize qilish (XSS himoya)
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * SQL injection himoya (Prisma o'zi qiladi, lekin qo'shimcha)
 */
export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/union/gi, '')
    .replace(/select/gi, '')
    .replace(/drop/gi, '')
    .replace(/delete/gi, '')
    .replace(/insert/gi, '')
    .replace(/update/gi, '')
    .trim();
}

/**
 * Email formatini tekshirish
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: true }; // Ixtiyoriy
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { valid: false, error: "Noto'g'ri email formati" };
  }

  return { valid: true };
}
