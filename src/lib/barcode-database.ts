// ═══════════════════════════════════════════
// O'zbekiston dorilari barcode bazasi
// gopharm.uz dan olingan
// ═══════════════════════════════════════════

export interface BarcodeEntry {
  barcode: string;
  name: string;
  nameRu?: string;
  manufacturer?: string;
  country?: string;
  dosageForm?: string;
  activeSubstance?: string;
  dosage?: string;
  price?: number;
  category?: string;
  gopharmSlug?: string; // gopharm.uz/product/...
}

// ═══ O'zbekistondagi eng ko'p sotiladigan dorilar ═══
export const BARCODE_DATABASE: BarcodeEntry[] = [
  // ═══ Og'riq qoldiruvchi va isitma tushiruvchi ═══
  {
    barcode: '4607015470868',
    name: 'Paratsetamol',
    nameRu: 'Парацетамол',
    manufacturer: 'Татхимфармпрепараты',
    country: 'Rossiya',
    dosageForm: 'Tabletkasi',
    activeSubstance: 'Paratsetamol',
    dosage: '500mg',
    price: 5500,
    category: "Og'riq qoldiruvchi",
    gopharmSlug: 'paratsetamol-tab-500mg-no10',
  },
  {
    barcode: '4607033440143',
    name: 'Ibuprofen',
    nameRu: 'Ибупрофен',
    manufacturer: 'Hemofarm',
    country: 'Serbiya',
    dosageForm: 'Tabletkasi',
    activeSubstance: 'Ibuprofen',
    dosage: '400mg',
    price: 8200,
    category: "Og'riq qoldiruvchi",
    gopharmSlug: 'ibuprofen-tab-400mg',
  },
  {
    barcode: '4607077810145',
    name: 'Nurofen',
    nameRu: 'Нурофен',
    manufacturer: 'Reckitt Benckiser',
    country: 'Buyuk Britaniya',
    dosageForm: 'Tabletkasi',
    activeSubstance: 'Ibuprofen',
    dosage: '200mg',
    price: 15000,
    category: "Og'riq qoldiruvchi",
    gopharmSlug: 'nurofen-tab-200mg-no10',
  },
  {
    barcode: '5000159484977',
    name: 'Citramon P',
    nameRu: 'Цитрамон П',
    manufacturer: 'Фармстандарт',
    country: 'Rossiya',
    dosageForm: 'Tabletkasi',
    activeSubstance: 'Paratsetamol + Kofein + Asetilsalitsil kislota',
    dosage: '',
    price: 4500,
    category: "Og'riq qoldiruvchi",
    gopharmSlug: 'citramon-p-tab',
  },

  // ═══ Antibiotiklar ═══
  {
    barcode: '4607077810145',
    name: 'Amoksitsillin',
    nameRu: 'Амоксициллин',
    manufacturer: 'Sandoz',
    country: 'Avstriya',
    dosageForm: 'Kapsulasi',
    activeSubstance: 'Amoksitsillin trihidrati',
    dosage: '500mg',
    price: 12500,
    category: 'Antibiotik',
    gopharmSlug: 'amoksitsillin-kaps-500mg',
  },
  {
    barcode: '4607053840367',
    name: 'Azitromitsin',
    nameRu: 'Азитромицин',
    manufacturer: 'Hemofarm',
    country: 'Serbiya',
    dosageForm: 'Tabletkasi',
    activeSubstance: 'Azitromitsin',
    dosage: '500mg',
    price: 18000,
    category: 'Antibiotik',
    gopharmSlug: 'azitromitsin-tab-500mg',
  },

  // ═══ Allergiya ═══
  {
    barcode: '4607053840367',
    name: 'Loratadin',
    nameRu: 'Лоратадин',
    manufacturer: 'Ozon',
    country: 'Rossiya',
    dosageForm: 'Tabletkasi',
    activeSubstance: 'Loratadin',
    dosage: '10mg',
    price: 6700,
    category: 'Antigistamin',
    gopharmSlug: 'loratadin-tab-10mg',
  },
  {
    barcode: '4620763870718',
    name: 'Tsetrin',
    nameRu: 'Цетрин',
    manufacturer: 'Dr. Reddy\'s',
    country: 'Hindiston',
    dosageForm: 'Tabletkasi',
    activeSubstance: 'Tsetirizin',
    dosage: '10mg',
    price: 12000,
    category: 'Antigistamin',
    gopharmSlug: 'tsetrin-tab-10mg',
  },

  // ═══ Oshqozon ═══
  {
    barcode: '4607029551037',
    name: 'Omeprazol',
    nameRu: 'Омепразол',
    manufacturer: 'Stada',
    country: 'Rossiya',
    dosageForm: 'Kapsulasi',
    activeSubstance: 'Omeprazol',
    dosage: '20mg',
    price: 9800,
    category: 'Gastroenterologiya',
    gopharmSlug: 'omeprazol-kaps-20mg',
  },
  {
    barcode: '4607037650134',
    name: 'Mezim Forte',
    nameRu: 'Мезим Форте',
    manufacturer: 'Berlin-Chemie',
    country: 'Germaniya',
    dosageForm: 'Tabletkasi',
    activeSubstance: 'Pankreatin',
    dosage: '10000',
    price: 25000,
    category: 'Gastroenterologiya',
    gopharmSlug: 'mezim-forte-tab',
  },

  // ═══ Yurak-qon tomir ═══
  {
    barcode: '4607059490440',
    name: 'Validol',
    nameRu: 'Валидол',
    manufacturer: 'Фармстандарт',
    country: 'Rossiya',
    dosageForm: 'Tabletkasi',
    activeSubstance: 'Mentol',
    dosage: '60mg',
    price: 3500,
    category: 'Yurak-qon tomir',
    gopharmSlug: 'validol-tab-60mg',
  },
  {
    barcode: '4607088410017',
    name: 'Korvalol',
    nameRu: 'Корвалол',
    manufacturer: 'Фармстандарт',
    country: 'Rossiya',
    dosageForm: 'Tomchi',
    activeSubstance: 'Etilbromizovalerianat + Fenobarbital',
    dosage: '25ml',
    price: 8000,
    category: 'Yurak-qon tomir',
    gopharmSlug: 'korvalol-kapli-25ml',
  },

  // ═══ Shamollash ═══
  {
    barcode: '4607034460468',
    name: 'TeraFlu',
    nameRu: 'ТераФлю',
    manufacturer: 'Novartis',
    country: 'Shveytsariya',
    dosageForm: 'Paketcha',
    activeSubstance: 'Paratsetamol + Fenilefrin + Feniramin',
    dosage: '10 paket',
    price: 89600,
    category: 'Shamollash',
    gopharmSlug: 'teraflju-ot-gripprost-por-no10-limon-1',
  },
  {
    barcode: '4607055870324',
    name: 'Strepsils',
    nameRu: 'Стрепсилс',
    manufacturer: 'Reckitt Benckiser',
    country: 'Buyuk Britaniya',
    dosageForm: 'Tabletkasi',
    activeSubstance: 'Amilmetakrezol + Diklorbenzil spirt',
    dosage: '',
    price: 35000,
    category: 'Shamollash',
    gopharmSlug: 'strepsils-intensiv-sprei-875mgdoza-15ml-no1-visniamiata-1',
  },

  // ═══ Vitaminlar ═══
  {
    barcode: '4607055870324',
    name: 'Askorbin kislota',
    nameRu: 'Аскорбиновая кислота',
    manufacturer: 'Фармстандарт',
    country: 'Rossiya',
    dosageForm: 'Tabletkasi',
    activeSubstance: 'Askorbin kislota (Vitamin C)',
    dosage: '50mg',
    price: 3000,
    category: 'Vitamin',
    gopharmSlug: 'askorbinovaya-kislota-tab-50mg',
  },
  {
    barcode: '4607055870324',
    name: 'Supradyn',
    nameRu: 'Супрадин',
    manufacturer: 'Bayer',
    country: 'Germaniya',
    dosageForm: 'Tabletkasi',
    activeSubstance: 'Multivitaminlar + Minerallar',
    dosage: '',
    price: 65000,
    category: 'Vitamin',
    gopharmSlug: 'supradyn-tab-ship',
  },

  // ═══ Nerv tizimi ═══
  {
    barcode: '4607037650134',
    name: 'Glyitsin',
    nameRu: 'Глицин',
    manufacturer: 'Biotiki',
    country: 'Rossiya',
    dosageForm: 'Tabletkasi',
    activeSubstance: 'Glyitsin',
    dosage: '100mg',
    price: 8000,
    category: 'Nerv tizimi',
    gopharmSlug: 'glitsin-tab-100mg',
  },

  // ═══ Terapevtik ═══
  {
    barcode: '4607055870324',
    name: 'ACC',
    nameRu: 'АЦЦ',
    manufacturer: 'Sandoz',
    country: 'Germaniya',
    dosageForm: 'Paketcha',
    activeSubstance: 'Asetilsistein',
    dosage: '200mg',
    price: 28000,
    category: 'Terapevtik',
    gopharmSlug: 'atsts-por-d-r-200mg',
  },

  // ═══ Ko'z ═══
  {
    barcode: '4607055870324',
    name: 'Vizin',
    nameRu: 'Визин',
    manufacturer: 'Johnson & Johnson',
    country: 'AQSH',
    dosageForm: 'Tomchi',
    activeSubstance: 'Tetrizolin',
    dosage: '15ml',
    price: 45000,
    category: "Ko'z",
    gopharmSlug: 'vizin-kapli-glaz',
  },

  // ═══ Teri ═══
  {
    barcode: '4607055870324',
    name: 'Bepanten',
    nameRu: 'Бепантен',
    manufacturer: 'Bayer',
    country: 'Germaniya',
    dosageForm: 'Krem',
    activeSubstance: 'Dekspantenol',
    dosage: '5%',
    price: 55000,
    category: 'Teri',
    gopharmSlug: 'bepanten-krem-5',
  },
];

/**
 * Barcode bo'yicha dori qidirish
 */
export function findMedicineByBarcodeLocal(barcode: string): BarcodeEntry | null {
  const cleaned = barcode.replace(/\s/g, '');

  // To'g'ridan-to'g'ri barcode
  const exact = BARCODE_DATABASE.find((e) => e.barcode === cleaned);
  if (exact) return exact;

  // GTIN dan EAN-13 ga o'tkazib qidirish
  if (cleaned.length === 14 && cleaned.startsWith('0')) {
    const ean13 = cleaned.substring(1);
    const found = BARCODE_DATABASE.find((e) => e.barcode === ean13);
    if (found) return found;
  }

  // EAN-13 dan GTIN ga o'tkazib qidirish
  if (cleaned.length === 13) {
    const gtin = '0' + cleaned;
    const found = BARCODE_DATABASE.find((e) => e.barcode === gtin);
    if (found) return found;
  }

  return null;
}

/**
 * Nomi bo'yicha dori qidirish
 */
export function findMedicineByNameLocal(query: string): BarcodeEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return BARCODE_DATABASE.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.nameRu?.toLowerCase().includes(q) ||
      e.manufacturer?.toLowerCase().includes(q) ||
      e.activeSubstance?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q)
  );
}

/**
 * Barcha dorilar ro'yxati
 */
export function getAllMedicines(): BarcodeEntry[] {
  return BARCODE_DATABASE;
}

/**
 * Kategoriyalar ro'yxati
 */
export function getCategories(): string[] {
  const categories = new Set(BARCODE_DATABASE.map((e) => e.category).filter(Boolean));
  return Array.from(categories) as string[];
}
