// ═══════════════════════════════════════════
// Gopharm.uz Scraper
// Dori ma'lumotlarini olish
// ═══════════════════════════════════════════

import * as cheerio from 'cheerio';
import axios from 'axios';
import type { ScrapedMedicine } from '@/types';

const GOPHARM_BASE = 'https://gopharm.uz';

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 soniya

async function rateLimitedFetch(url: string): Promise<string> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'uz,ru;q=0.9,en;q=0.8',
    },
    timeout: 15000,
  });

  return response.data;
}

/**
 * Gopharm.uz dan barcode bo'yicha dori ma'lumotlarini olish
 */
export async function scrapeMedicineFromGopharm(
  barcode: string
): Promise<ScrapedMedicine | null> {
  try {
    // 1-usul: Qidiruv orqali
    const searchUrl = `${GOPHARM_BASE}/search?q=${encodeURIComponent(barcode)}`;
    const html = await rateLimitedFetch(searchUrl);
    const $ = cheerio.load(html);

    // Qidiruv natijasidan birinchi dori linkini olish
    const productLink = $('a.product-card, a[href*="/product/"], .product-item a').first().attr('href');

    if (productLink) {
      const fullUrl = productLink.startsWith('http') ? productLink : `${GOPHARM_BASE}${productLink}`;
      return await scrapeProductPage(fullUrl);
    }

    // 2-usul: To'g'ridan-to'g'ri URL
    const directUrl = `${GOPHARM_BASE}/product/${barcode}`;
    try {
      return await scrapeProductPage(directUrl);
    } catch {
      // Topilmadi
    }

    return null;
  } catch (error: any) {
    console.error('Scraping error:', error.message);
    return null;
  }
}

/**
 * Dori sahifasidan ma'lumotlarni olish
 */
async function scrapeProductPage(url: string): Promise<ScrapedMedicine | null> {
  try {
    const html = await rateLimitedFetch(url);
    const $ = cheerio.load(html);

    // Sahifa strukturasiga qarab parsing
    // Gopharm.uz strukturasiga moslashgan

    const name = $('h1, .product-title, .product-name, [data-testid="product-name"]')
      .first()
      .text()
      .trim();

    if (!name) return null;

    // Narx
    const priceText = $(
      '.product-price, .price, [data-testid="product-price"], .price-current'
    )
      .first()
      .text()
      .replace(/[^\d]/g, '');
    const price = priceText ? parseInt(priceText, 10) : undefined;

    // Rasm
    const imageUrl =
      $('img.product-image, .product-gallery img, [data-testid="product-image"]')
        .first()
        .attr('src') ||
      $('meta[property="og:image"]').attr('content');

    // Ishlab chiqaruvchi
    const manufacturer = extractDetail($, [
      'Ishlab chiqaruvchi',
      'Производитель',
      'Manufacturer',
    ]);

    // Mamlakat
    const country = extractDetail($, ['Mamlakat', 'Страна', 'Country']);

    // Dozalik shakli
    const dosageForm = extractDetail($, [
      'Dozalik shakli',
      'Лекарственная форма',
      'Dosage form',
    ]);

    // Faol modda
    const activeSubstance = extractDetail($, [
      'Faol modda',
      'Действующее вещество',
      'Active substance',
    ]);

    // Dozasi
    const dosage = extractDetail($, ['Dozasi', 'Дозировка', 'Dosage']);

    return {
      name,
      nameRu: name,
      imageUrl: imageUrl?.startsWith('http') ? imageUrl : imageUrl ? `${GOPHARM_BASE}${imageUrl}` : undefined,
      price,
      manufacturer,
      country,
      dosageForm,
      activeSubstance,
      dosage,
      sourceUrl: url,
    };
  } catch (error: any) {
    console.error('Product page scraping error:', error.message);
    return null;
  }
}

/**
 * Sahifadan detallarni olish
 * Turli xil label lar bilan ishlash
 */
function extractDetail(
  $: cheerio.CheerioAPI,
  labels: string[]
): string | undefined {
  for (const label of labels) {
    // dt/dd format
    const dt = $(`dt:contains("${label}"), th:contains("${label}")`);
    if (dt.length) {
      const value = dt.next('dd, td').text().trim();
      if (value) return value;
    }

    // Label + value format
    const labelEl = $(`*:contains("${label}")`).filter(function () {
      return $(this).text().trim().startsWith(label);
    });
    if (labelEl.length) {
      const text = labelEl.text().trim();
      const value = text.replace(label, '').replace(/^[:\s]+/, '').trim();
      if (value && value !== label) return value;
    }

    // Specific class patterns
    const classMap: Record<string, string> = {
      'Ishlab chiqaruvchi': '.manufacturer, .producer, [data-field="manufacturer"]',
      'Mamlakat': '.country, [data-field="country"]',
      'Dozalik shakli': '.dosage-form, [data-field="dosage-form"]',
      'Faol modda': '.active-substance, [data-field="active-substance"]',
    };

    if (classMap[label]) {
      const value = $(classMap[label]).first().text().trim();
      if (value) return value;
    }
  }

  return undefined;
}
