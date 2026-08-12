// ═══════════════════════════════════════════
// IndexedDB — Offline Database
// Internetsiz skanerlash + keyin avtomatik yuborish
// ═══════════════════════════════════════════

const DB_NAME = 'dorixona-scanner-db';
const DB_VERSION = 1;

// Store nomlari
const STORES = {
  SCAN_CACHE: 'scan_cache',          // Skanerlash natijalari cache
  MEDICINE_CACHE: 'medicine_cache',  // Dorilar cache
  SYNC_QUEUE: 'sync_queue',          // Serverga yuborilishi kerak
  OFFLINE_SCANS: 'offline_scans',    // Offline skanerlashlar
} as const;

/**
 * Database yaratish
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Scan cache
      if (!db.objectStoreNames.contains(STORES.SCAN_CACHE)) {
        db.createObjectStore(STORES.SCAN_CACHE, { keyPath: 'id' });
      }

      // Medicine cache
      if (!db.objectStoreNames.contains(STORES.MEDICINE_CACHE)) {
        const store = db.createObjectStore(STORES.MEDICINE_CACHE, { keyPath: 'id' });
        store.createIndex('barcode', 'barcode', { unique: true });
      }

      // Sync queue
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const store = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('status', 'status');
      }

      // Offline scans
      if (!db.objectStoreNames.contains(STORES.OFFLINE_SCANS)) {
        db.createObjectStore(STORES.OFFLINE_SCANS, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic CRUD operatsiyalari
 */
async function getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
  const db = await openDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

// ═══ Scan Cache ═══

export async function cacheScanResult(result: any): Promise<void> {
  const store = await getStore(STORES.SCAN_CACHE, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.put({ ...result, id: result.rawValue + '_' + result.timestamp });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedScan(rawValue: string): Promise<any | null> {
  const store = await getStore(STORES.SCAN_CACHE);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      const results = req.result.filter((r: any) => r.rawValue === rawValue);
      resolve(results.length > 0 ? results[0] : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getAllCachedScans(): Promise<any[]> {
  const store = await getStore(STORES.SCAN_CACHE);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function clearScanCache(): Promise<void> {
  const store = await getStore(STORES.SCAN_CACHE, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ═══ Medicine Cache ═══

export async function cacheMedicine(medicine: any): Promise<void> {
  const store = await getStore(STORES.MEDICINE_CACHE, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.put(medicine);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedMedicine(barcode: string): Promise<any | null> {
  const store = await getStore(STORES.MEDICINE_CACHE);
  return new Promise((resolve, reject) => {
    const idx = store.index('barcode');
    const req = idx.get(barcode);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllCachedMedicines(): Promise<any[]> {
  const store = await getStore(STORES.MEDICINE_CACHE);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

// ═══ Sync Queue ═══

export async function addToSyncQueue(item: any): Promise<void> {
  const store = await getStore(STORES.SYNC_QUEUE, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.add({
      ...item,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingSyncItems(): Promise<any[]> {
  const store = await getStore(STORES.SYNC_QUEUE);
  return new Promise((resolve, reject) => {
    const idx = store.index('status');
    const req = idx.getAll('pending');
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function markSynced(id: number): Promise<void> {
  const store = await getStore(STORES.SYNC_QUEUE, 'readwrite');
  return new Promise((resolve, reject) => {
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const item = getReq.result;
      if (item) {
        item.status = 'synced';
        store.put(item);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// ═══ Offline Scans ═══

export async function addOfflineScan(scan: any): Promise<void> {
  const store = await getStore(STORES.OFFLINE_SCANS, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.add({
      ...scan,
      synced: false,
      createdAt: new Date().toISOString(),
    });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getOfflineScans(): Promise<any[]> {
  const store = await getStore(STORES.OFFLINE_SCANS);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getUnsyncedCount(): Promise<number> {
  const scans = await getOfflineScans();
  return scans.filter((s) => !s.synced).length;
}

export async function clearOfflineScans(): Promise<void> {
  const store = await getStore(STORES.OFFLINE_SCANS, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ═══ Sync operatsiyasi ═══

export async function syncOfflineData(): Promise<{ synced: number; failed: number }> {
  const scans = await getOfflineScans();
  const unsynced = scans.filter((s) => !s.synced);

  let synced = 0;
  let failed = 0;

  for (const scan of unsynced) {
    try {
      const res = await fetch('/api/scan-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scans: [scan] }),
      });

      if (res.ok) {
        const store = await getStore(STORES.OFFLINE_SCANS, 'readwrite');
        scan.synced = true;
        store.put(scan);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}

// ═══ Offline holatini tekshirish ═══

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function onOnlineStatusChange(callback: (online: boolean) => void): () => void {
  const handler = () => callback(navigator.onLine);
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
  };
}
