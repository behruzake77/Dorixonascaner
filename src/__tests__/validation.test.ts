// ═══════════════════════════════════════════
// Validation — Unit Tests
// ═══════════════════════════════════════════

import {
  validateBarcode,
  validateGTIN,
  validateMedicineName,
  validatePrice,
  validateQuantity,
  validateGS1Date,
  validatePassword,
  sanitizeInput,
  sanitizeSQL,
} from '../validation';

// ═══ validateBarcode ═══
describe('validateBarcode', () => {
  test('to\'g\'ri EAN-13', () => {
    expect(validateBarcode('4607015470868').valid).toBe(true);
  });

  test('to\'g\'ri EAN-8', () => {
    expect(validateBarcode('12345678').valid).toBe(true);
  });

  test('to\'g\'ri GTIN-14', () => {
    expect(validateBarcode('04607015470868').valid).toBe(true);
  });

  test('DataMatrix (01 bilan)', () => {
    expect(validateBarcode('01460701547086817261231').valid).toBe(true);
  });

  test('FNC1 prefix', () => {
    expect(validateBarcode(']d2014607015470868').valid).toBe(true);
  });

  test('parentheses format', () => {
    expect(validateBarcode('(01)4607015470868').valid).toBe(true);
  });

  test('bo\'sh string', () => {
    expect(validateBarcode('').valid).toBe(false);
  });

  test('null', () => {
    expect(validateBarcode(null as any).valid).toBe(false);
  });

  test('harflar', () => {
    expect(validateBarcode('abc').valid).toBe(false);
  });
});

// ═══ validateGTIN ═══
describe('validateGTIN', () => {
  test('14 raqamli GTIN', () => {
    expect(validateGTIN('04607015470868').valid).toBe(true);
  });

  test('13 raqamli GTIN', () => {
    expect(validateGTIN('4607015470868').valid).toBe(true);
  });

  test('kam raqam', () => {
    expect(validateGTIN('123').valid).toBe(false);
  });

  test('bo\'sh', () => {
    expect(validateGTIN('').valid).toBe(false);
  });
});

// ═══ validateMedicineName ═══
describe('validateMedicineName', () => {
  test('to\'g\'ri nom', () => {
    expect(validateMedicineName('Paratsetamol').valid).toBe(true);
  });

  test('qisqa nom', () => {
    expect(validateMedicineName('A').valid).toBe(false);
  });

  test('bo\'sh', () => {
    expect(validateMedicineName('').valid).toBe(false);
  });

  test('XSS hujum', () => {
    expect(validateMedicineName('<script>alert(1)</script>').valid).toBe(false);
  });

  test('javascript:', () => {
    expect(validateMedicineName('javascript:alert(1)').valid).toBe(false);
  });
});

// ═══ validatePrice ═══
describe('validatePrice', () => {
  test('to\'g\'ri narx', () => {
    const result = validatePrice('5500');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(5500);
  });

  test('nol narx', () => {
    const result = validatePrice(0);
    expect(result.valid).toBe(true);
    expect(result.value).toBe(0);
  });

  test('manfiy narx', () => {
    expect(validatePrice(-100).valid).toBe(false);
  });

  test('juda katta narx', () => {
    expect(validatePrice(999999999).valid).toBe(false);
  });

  test('harflar', () => {
    expect(validatePrice('abc').valid).toBe(false);
  });
});

// ═══ validateQuantity ═══
describe('validateQuantity', () => {
  test('to\'g\'ri miqdor', () => {
    const result = validateQuantity('50');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(50);
  });

  test('nol', () => {
    const result = validateQuantity(0);
    expect(result.valid).toBe(true);
    expect(result.value).toBe(0);
  });

  test('manfiy', () => {
    expect(validateQuantity(-5).valid).toBe(false);
  });

  test('kasr son', () => {
    expect(validateQuantity(5.5).valid).toBe(false);
  });

  test('bo\'sh', () => {
    expect(validateQuantity('').valid).toBe(false);
  });
});

// ═══ validateGS1Date ═══
describe('validateGS1Date', () => {
  test('to\'g\'ri sana', () => {
    expect(validateGS1Date('261231').valid).toBe(true);
  });

  test('noto\'g\'ri oy', () => {
    expect(validateGS1Date('261331').valid).toBe(false);
  });

  test('noto\'g\'ri kun', () => {
    expect(validateGS1Date('261232').valid).toBe(false);
  });

  test('qisqa sana', () => {
    expect(validateGS1Date('2612').valid).toBe(false);
  });

  test('bo\'sh — ixtiyoriy', () => {
    expect(validateGS1Date('').valid).toBe(true);
  });
});

// ═══ validatePassword ═══
describe('validatePassword', () => {
  test('to\'g\'ri parol', () => {
    expect(validatePassword('dorixona2025').valid).toBe(true);
  });

  test('qisqa parol', () => {
    expect(validatePassword('ab').valid).toBe(false);
  });

  test('bo\'sh', () => {
    expect(validatePassword('').valid).toBe(false);
  });
});

// ═══ sanitizeInput ═══
describe('sanitizeInput', () => {
  test('oddiy matn', () => {
    expect(sanitizeInput('Paratsetamol')).toBe('Paratsetamol');
  });

  test('HTML teglar', () => {
    expect(sanitizeInput('<b>test</b>')).toBe('&lt;b&gt;test&lt;/b&gt;');
  });

  test('script teg', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).not.toContain('<script>');
  });

  test('bo\'sh', () => {
    expect(sanitizeInput('')).toBe('');
  });
});

// ═══ sanitizeSQL ═══
describe('sanitizeSQL', () => {
  test('oddiy matn', () => {
    expect(sanitizeSQL('Paratsetamol')).toBe('Paratsetamol');
  });

  test('SQL injection', () => {
    const result = sanitizeSQL("'; DROP TABLE medicines; --");
    expect(result).not.toContain('DROP');
    expect(result).not.toContain('--');
  });

  test('UNION attack', () => {
    const result = sanitizeSQL("UNION SELECT * FROM users");
    expect(result).not.toContain('UNION');
    expect(result).not.toContain('SELECT');
  });
});
