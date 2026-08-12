// ═══════════════════════════════════════════
// Dorixona Skaner — TypeScript Types
// ═══════════════════════════════════════════

// Dori ma'lumotlari
export interface Medicine {
  id: string;
  barcode: string;
  name: string;
  nameRu?: string;
  nameEn?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  priceCurrency: string;
  manufacturer?: string;
  country?: string;
  dosageForm?: string;
  activeSubstance?: string;
  dosage?: string;
  prescription: boolean;
  category?: string;
  sourceUrl?: string;
  scrapedAt?: string;
  gtins: MedicineGtin[];
  createdAt: string;
  updatedAt: string;
}

// GTIN (DataMatrix) ma'lumotlari
export interface MedicineGtin {
  id: string;
  medicineId: string;
  gtin: string;
  serial?: string;
  expiry?: Date;
  batch?: string;
  scannedAt: string;
  scannedBy?: string;
  location?: string;
  status: GtinStatus;
  createdAt: string;
  updatedAt: string;
}

export type GtinStatus = 'ACTIVE' | 'EXPIRED' | 'SOLD' | 'DAMAGED';

// GS1 DataMatrix parsing natijasi
export interface GS1ParsedData {
  gtin?: string;
  serial?: string;
  expiry?: string; // YYMMDD format
  expiryDate?: Date;
  batch?: string;
  raw: string;
}

// Skanerlash natijasi
export interface ScanResult {
  type: ScanType;
  format: string;
  rawValue: string;
  parsed?: GS1ParsedData;
  medicine?: Medicine | null;
  timestamp: Date;
}

export type ScanType = 'EAN13' | 'DATAMATRIX' | 'QR_CODE' | 'UNKNOWN';

// Batch skanerlash sessiyasi
export interface ScanSession {
  id: string;
  medicineId?: string;
  totalScanned: number;
  matched: number;
  unmatched: number;
  startedAt: string;
  completedAt?: string;
  scans: ScanLog[];
}

export interface ScanLog {
  id: string;
  sessionId: string;
  barcode: string;
  scanType: ScanType;
  matched: boolean;
  medicineId?: string;
  scannedAt: string;
}

// Noma'lum GTIN
export interface UnknownGtin {
  id: string;
  gtin: string;
  rawData?: string;
  serial?: string;
  expiry?: Date;
  batch?: string;
  scannedAt: string;
  resolved: boolean;
  createdAt: string;
}

// Scraping natijasi (gopharm.uz dan)
export interface ScrapedMedicine {
  name: string;
  nameRu?: string;
  imageUrl?: string;
  price?: number;
  manufacturer?: string;
  country?: string;
  dosageForm?: string;
  activeSubstance?: string;
  dosage?: string;
  barcode?: string;
  sourceUrl: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Qidiruv
export interface SearchFilters {
  query?: string;
  category?: string;
  manufacturer?: string;
  priceMin?: number;
  priceMax?: number;
  prescription?: boolean;
}

// Store state types (Zustand)
export interface ScannerState {
  isScanning: boolean;
  lastScan: ScanResult | null;
  scanHistory: ScanResult[];
  batchMode: boolean;
  batchScans: ScanResult[];
  startScanning: () => void;
  stopScanning: () => void;
  addScan: (result: ScanResult) => void;
  clearHistory: () => void;
  toggleBatchMode: () => void;
  clearBatch: () => void;
}
