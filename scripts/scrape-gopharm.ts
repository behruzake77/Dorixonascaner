// ═══════════════════════════════════════════
// Gopharm.uz Scraper — Barcha dorilarni yuklab olish
// Sitemap dan product URL larni olish, keyin har birini scrape qilish
// ═══════════════════════════════════════════

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const GOPHARM_BASE = 'https://gopharm.uz';
const DELAY_MS = 1500; // Har bir so'rov orasida kutish

interface Product {
  slug: string;
  name: string;
  nameRu?: string;
  manufacturer?: string;
  country?: string;
  dosageForm?: string;
  activeSubstance?: string;
  dosage?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  sourceUrl: string;
}

// ═══ Kutish funksiyasi ═══
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ═══ Sitemap dan URL larni olish ═══
async function getSitemapUrls(sitemapUrl: string): Promise<string[]> {
  try {
    const response = await axios.get(sitemapUrl, { timeout: 30000 });
    const $ = cheerio.load(response.data, { xmlMode: true });
    const urls: string[] = [];

    $('url loc').each((_, el) => {
      const url = $(el).text().trim();
      if (url.includes('/product/')) {
        urls.push(url);
      }
    });

    return urls;
  } catch (error: any) {
    console.error(`Sitemap xatolik: ${sitemapUrl}`, error.message);
    return [];
  }
}

// ═══ Product sahifasini scrape qilish ═══
async function scrapeProductPage(url: string): Promise<Product | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'ru,uz;q=0.9',
      },
      timeout: 20000,
    });

    const $ = cheerio.load(response.data);
    const slug = url.split('/product/')[1] || '';

    // Nomi
    const name = $('h1').first().text().trim() ||
      $('[class*="product-name"], [class*="title"]').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') || '';

    if (!name || name.length < 2) return null;

    // Narx
    const priceText = $('[class*="price"]').first().text().replace(/[^\d]/g, '') ||
      $('meta[property="product:price:amount"]').attr('content') || '';
    const price = priceText ? parseInt(priceText, 10) : undefined;

    // Rasm
    const imageUrl = $('meta[property="og:image"]').attr('content') ||
      $('img[src*="cdn.gopharm"]').first().attr('src');

    // Ma'lumotlarni ajratish
    let manufacturer = '';
    let country = '';
    let dosageForm = '';
    let activeSubstance = '';
    let dosage = '';
    let category = '';

    // dt/dd va boshqa formatlar
    $('dt, th, [class*="label"], [class*="key"]').each((_, el) => {
      const label = $(el).text().trim().toLowerCase();
      const value = $(el).next('dd, td, [class*="value"]').text().trim();

      if (!value) return;

      if (label.includes('производитель')) manufacturer = value;
      else if (label.includes('страна')) country = value;
      else if (label.includes('форма выпуска')) dosageForm = value;
      else if (label.includes('действующ')) activeSubstance = value;
      else if (label.includes('дозировка') || label.includes('количество')) dosage = value;
      else if (label.includes('категория')) category = value;
    });

    return {
      slug,
      name,
      nameRu: name,
      manufacturer: manufacturer || undefined,
      country: country || undefined,
      dosageForm: dosageForm || undefined,
      activeSubstance: activeSubstance || undefined,
      dosage: dosage || undefined,
      price: price && price > 0 ? price : undefined,
      imageUrl: imageUrl?.startsWith('http') ? imageUrl : imageUrl ? `${GOPHARM_BASE}${imageUrl}` : undefined,
      category: category || undefined,
      sourceUrl: url,
    };
  } catch (error: any) {
    console.error(`Scrape xatolik: ${url}`, error.message);
    return null;
  }
}

// ═══ Asosiy funksiya ═══
async function main() {
  console.log('🚀 Gopharm.uz scraper boshlandi...\n');

  // 1. Barcha sitemap URL larni olish
  console.log('📋 Sitemap URL lar olinmoqda...');
  let allProductUrls: string[] = [];

  for (let i = 1; i <= 20; i++) {
    const ruUrl = `${GOPHARM_BASE}/sitemap-product-ru-${i}.xml`;
    const uzUrl = `${GOPHARM_BASE}/sitemap-product-uz-${i}.xml`;

    const ruUrls = await getSitemapUrls(ruUrl);
    const uzUrls = await getSitemapUrls(uzUrl);

    allProductUrls.push(...ruUrls, ...uzUrls);

    console.log(`  sitemap-${i}: ${ruUrls.length + uzUrls.length} ta URL`);
    await delay(500);
  }

  // Unique URL lar
  allProductUrls = [...new Set(allProductUrls)];
  console.log(`\n📊 Jami: ${allProductUrls.length} ta unikal product URL\n`);

  // 2. Har bir product ni scrape qilish
  const products: Product[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < allProductUrls.length; i++) {
    const url = allProductUrls[i];

    if (i % 100 === 0) {
      console.log(`⏳ Progress: ${i}/${allProductUrls.length} (${successCount} ta muvaffaqiyatli)`);
    }

    const product = await scrapeProductPage(url);

    if (product) {
      products.push(product);
      successCount++;
    } else {
      errorCount++;
    }

    await delay(DELAY_MS);
  }

  console.log(`\n✅ Tugadi! ${successCount} ta dori, ${errorCount} ta xatolik\n`);

  // 3. JSON faylga saqlash
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'gopharm-medicines.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8');
  console.log(`💾 Saqlandi: ${outputPath}`);
  console.log(`📊 Jami: ${products.length} ta dori\n`);

  // 4. Statistika
  const categories = new Set(products.map(p => p.category).filter(Boolean));
  const manufacturers = new Set(products.map(p => p.manufacturer).filter(Boolean));

  console.log('📊 Statistika:');
  console.log(`  Kategoriyalar: ${categories.size}`);
  console.log(`  Ishlab chiqaruvchilar: ${manufacturers.size}`);
  console.log(`  Narx bor: ${products.filter(p => p.price).length}`);
}

main().catch(console.error);
