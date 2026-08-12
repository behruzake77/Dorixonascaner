// ═══════════════════════════════════════════
// Export Utilities — Excel/CSV/Share
// ═══════════════════════════════════════════

import type { ScanResult, Medicine } from '@/types';

/**
 * CSV formatga o'tkazish
 */
export function scansToCSV(scans: ScanResult[]): string {
  const headers = [
    'Sana',
    'Vaqt',
    'Kod turi',
    'Raw kod',
    'GTIN',
    'Seriya',
    'Yaroqlilik',
    'Partiya',
    'Dori nomi',
  ];

  const rows = scans.map((scan) => {
    const date = new Date(scan.timestamp);
    return [
      date.toLocaleDateString('uz-UZ'),
      date.toLocaleTimeString('uz-UZ'),
      scan.type,
      `"${scan.rawValue}"`,
      scan.parsed?.gtin || '',
      scan.parsed?.serial || '',
      scan.parsed?.expiry || '',
      scan.parsed?.batch || '',
      scan.medicine ? `"${(scan.medicine as any).name || ''}"` : '',
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * CSV faylni yuklab olish
 */
export function downloadCSV(scans: ScanResult[], filename?: string): void {
  const csv = scansToCSV(scans);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `dorixona-skaner-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Excel HTML format (xls fayl ochiladi)
 */
export function scansToExcel(scans: ScanResult[]): string {
  const rows = scans.map((scan) => {
    const date = new Date(scan.timestamp);
    return `
      <tr>
        <td>${date.toLocaleDateString('uz-UZ')}</td>
        <td>${date.toLocaleTimeString('uz-UZ')}</td>
        <td>${scan.type}</td>
        <td>${scan.rawValue}</td>
        <td>${scan.parsed?.gtin || ''}</td>
        <td>${scan.parsed?.serial || ''}</td>
        <td>${scan.parsed?.expiry || ''}</td>
        <td>${scan.parsed?.batch || ''}</td>
      </tr>`;
  });

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <style>
        table { border-collapse: collapse; }
        th, td { border: 1px solid #333; padding: 8px 12px; }
        th { background: #0f172a; color: white; font-weight: bold; }
        tr:nth-child(even) { background: #f8fafc; }
      </style>
    </head>
    <body>
      <h2>Dorixona Skaner — Hisobot</h2>
      <p>Sana: ${new Date().toLocaleDateString('uz-UZ')}</p>
      <table>
        <thead>
          <tr>
            <th>Sana</th>
            <th>Vaqt</th>
            <th>Kod turi</th>
            <th>Raw kod</th>
            <th>GTIN</th>
            <th>Seriya</th>
            <th>Yaroqlilik</th>
            <th>Partiya</th>
          </tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
      <p>Jami: ${scans.length} ta skanerlash</p>
    </body>
    </html>`;
}

/**
 * Excel faylni yuklab olish
 */
export function downloadExcel(scans: ScanResult[], filename?: string): void {
  const html = scansToExcel(scans);
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `dorixona-hisobot-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══ WhatsApp / Telegram ═══

/**
 * Dori ma'lumotlarini matn sifatida formatlash
 */
export function formatMedicineForShare(medicine: Medicine): string {
  const lines = [
    `💊 ${medicine.name}`,
    '',
  ];

  if (medicine.manufacturer) lines.push(`🏭 Ishlab chiqaruvchi: ${medicine.manufacturer}`);
  if (medicine.country) lines.push(`🌍 Mamlakat: ${medicine.country}`);
  if (medicine.dosageForm) lines.push(`💊 Shakli: ${medicine.dosageForm}`);
  if (medicine.activeSubstance) lines.push(`🧪 Faol modda: ${medicine.activeSubstance}`);
  if (medicine.dosage) lines.push(`📏 Dozasi: ${medicine.dosage}`);
  if (medicine.price) lines.push(`💰 Narxi: ${new Intl.NumberFormat('uz-UZ').format(medicine.price)} so'm`);
  if (medicine.prescription) lines.push(`⚠️ Retsept bilan`);
  lines.push('', `📋 Barcode: ${medicine.barcode}`);

  if (medicine.gtins && medicine.gtins.length > 0) {
    lines.push('', `🏷️ GTIN lar (${medicine.gtins.length}):`);
    medicine.gtins.forEach((g, i) => {
      lines.push(`  ${i + 1}. ${g.gtin}${g.serial ? ` (SN: ${g.serial})` : ''}`);
    });
  }

  lines.push('', `📱 Dorixona Skaner ilovasi orqali yuborildi`);

  return lines.join('\n');
}

/**
 * Batch natijalarni matn sifatida formatlash
 */
export function formatBatchForShare(scans: ScanResult[]): string {
  const lines = [
    `📦 Batch Skanerlash Hisoboti`,
    `📅 Sana: ${new Date().toLocaleDateString('uz-UZ')}`,
    `📊 Jami: ${scans.length} ta kod`,
    '',
  ];

  scans.forEach((scan, i) => {
    const parsed = scan.parsed;
    lines.push(`${i + 1}. ${scan.type} — ${parsed?.gtin || scan.rawValue}`);
    if (parsed?.serial) lines.push(`   SN: ${parsed.serial}`);
    if (parsed?.expiry) lines.push(`   Exp: ${parsed.expiry}`);
  });

  lines.push('', `📱 Dorixona Skaner ilovasi orqali yuborildi`);

  return lines.join('\n');
}

/**
 * WhatsApp ga yuborish
 */
export function shareToWhatsApp(text: string): void {
  const encoded = encodeURIComponent(text);
  const url = `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
}

/**
 * Telegram ga yuborish
 */
export function shareToTelegram(text: string): void {
  const encoded = encodeURIComponent(text);
  const url = `https://t.me/share/url?text=${encoded}`;
  window.open(url, '_blank');
}

/**
 * Web Share API (mobil brauzerlar uchun)
 */
export async function shareNative(title: string, text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await (navigator as any).share({ title, text });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Clipboard ga nusxalash
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}
