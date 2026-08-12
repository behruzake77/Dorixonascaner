// ═══════════════════════════════════════════
// Gopharm.uz Scraper — Yaxshilangan versiya
// Dori ma'lumotlarini olish
// ═══════════════════════════════════════════

import * as cheerio from 'cheerio';
import axios from 'axios';
import type { ScrapedMedicine } from '@/types';

const GOPHARM_BASE = 'https://gopharm.uz';

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1500;

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
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'uz,ru;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
    },
    timeout: 20000,
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

    // Turli xil selectorlar bilan product linkini topish
    const productLink =
      $('a[href*="/product/"]').first().attr('href') ||
      $('a[href*="/products/"]').first().attr('href') ||
      $('a.product-card').first().attr('href') ||
      $('a[data-product-id]').first().attr('href') ||
      $('a[href*="/p/"]').first().attr('href') ||
      // Qidiruv natijasidagi birinchi mahsulot
      $('.product-item a, .search-result a, .product-link, [class*="product"] a').first().attr('href');

    if (productLink) {
      const fullUrl = productLink.startsWith('http') ? productLink : `${GOPHARM_BASE}${productLink}`;
      const result = await scrapeProductPage(fullUrl);
      if (result) return result;
    }

    // 2-usul: Barcode bilan to'g'ridan-to'g'ri qidiruv
    const directSearchUrl = `${GOPHARM_BASE}/uz/search?q=${encodeURIComponent(barcode)}`;
    try {
      const directHtml = await rateLimitedFetch(directSearchUrl);
      const $direct = cheerio.load(directHtml);
      const directLink = $direct('a[href*="/product/"]').first().attr('href');
      if (directLink) {
        const fullUrl = directLink.startsWith('http') ? directLink : `${GOPHARM_BASE}${directLink}`;
        return await scrapeProductPage(fullUrl);
      }
    } catch {}

    // 3-usul: API orqali (agar mavjud bo'lsa)
    try {
      const apiUrl = `${GOPHARM_BASE}/api/v1/products?search=${encodeURIComponent(barcode)}`;
      const apiResponse = await axios.get(apiUrl, {
        headers: { 'Accept': 'application/json' },
        timeout: 10000,
      });

      if (apiResponse.data?.data?.length > 0) {
        const product = apiResponse.data.data[0];
        return {
          name: product.name || product.title,
          nameRu: product.name_ru || product.name,
          imageUrl: product.image || product.image_url,
          price: product.price ? parseFloat(product.price) : undefined,
          manufacturer: product.manufacturer || product.producer,
          country: product.country,
          dosageForm: product.dosage_form || product.form,
          activeSubstance: product.active_substance || product.substance,
          dosage: product.dosage,
          barcode: barcode,
          sourceUrl: `${GOPHARM_BASE}/product/${product.id || product.slug}`,
        };
      }
    } catch {}

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

    // Nomi — turli xil selectorlar
    const name =
      $('h1').first().text().trim() ||
      $('[class*="product-name"], [class*="product-title"], [data-testid*="name"]').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim();

    if (!name || name.length < 2) return null;

    // Narx
    const priceText =
      $('[class*="price"]').first().text().replace(/[^\d]/g, '') ||
      $('meta[property="product:price:amount"]').attr('content') ||
      $('[data-price]').first().attr('data-price') ||
      '';
    const price = priceText ? parseInt(priceText, 10) : undefined;

    // Rasm
    const imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('img[class*="product"], img[class*="gallery"]').first().attr('src') ||
      $('img[src*="product"]').first().attr('src');

    // Ma'lumotlarni ajratish
    const details = extractDetails($);

    return {
      name,
      nameRu: name,
      imageUrl: fixImageUrl(imageUrl),
      price: price && price > 0 ? price : undefined,
      manufacturer: details.manufacturer,
      country: details.country,
      dosageForm: details.dosageForm,
      activeSubstance: details.activeSubstance,
      dosage: details.dosage,
      sourceUrl: url,
    };
  } catch (error: any) {
    console.error('Product page scraping error:', error.message);
    return null;
  }
}

/**
 * Sahifadan barcha ma'lumotlarni ajratish
 */
function extractDetails($: cheerio.CheerioAPI): {
  manufacturer?: string;
  country?: string;
  dosageForm?: string;
  activeSubstance?: string;
  dosage?: string;
} {
  const result: any = {};

  // Barcha dt/dd juftliklarini tekshirish
  $('dt, th, [class*="label"], [class*="key"]').each((_, el) => {
    const label = $(el).text().trim().toLowerCase();
    const value = $(el).next('dd, td, [class*="value"]').text().trim();

    if (!value) return;

    if (label.includes('ishlab chiqaruvchi') || label.includes('производитель') || label.includes('manufacturer')) {
      result.manufacturer = value;
    } else if (label.includes('mamlakat') || label.includes('страна') || label.includes('country')) {
      result.country = value;
    } else if (label.includes('shakl') || label.includes('форма') || label.includes('dosage form')) {
      result.dosageForm = value;
    } else if (label.includes('faol modda') || label.includes('действующее') || label.includes('active substance')) {
      result.activeSubstance = value;
    } else if (label.includes('doza') || label.includes('дозировка') || label.includes('dosage')) {
      result.dosage = value;
    }
  });

  // Meta teglaridan ham tekshirish
  if (!result.manufacturer) {
    result.manufacturer = $('meta[property="product:brand"]').attr('content');
  }

  return result;
}

/**
 * Rasm URL ni to'g'rilash
 */
function fixImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${GOPHARM_BASE}${url}`;
  return `${GOPHARM_BASE}/${url}`;
}
