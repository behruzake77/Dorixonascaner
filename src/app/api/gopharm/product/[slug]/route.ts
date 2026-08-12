// ═══════════════════════════════════════════
// API: /api/gopharm/product/[slug]
// Gopharm.uz dan bitta product ma'lumotini olish
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const GOPHARM_BASE = 'https://gopharm.uz';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug kiritish shart' },
        { status: 400 }
      );
    }

    const url = `${GOPHARM_BASE}/product/${slug}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'ru,uz;q=0.9',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Nomi
    const name = $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') || '';

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Product topilmadi' },
        { status: 404 }
      );
    }

    // Narx
    const priceText = $('[class*="price"]').first().text().replace(/[^\d]/g, '') ||
      $('meta[property="product:price:amount"]').attr('content') || '';
    const price = priceText ? parseInt(priceText, 10) : null;

    // Rasm
    const imageUrl = $('meta[property="og:image"]').attr('content') ||
      $('img[src*="cdn.gopharm"]').first().attr('src') || null;

    // Ma'lumotlarni ajratish
    let manufacturer = '';
    let country = '';
    let dosageForm = '';
    let activeSubstance = '';
    let dosage = '';
    let category = '';
    let prescription = '';

    // dt/dd format
    $('dt, th').each((_, el) => {
      const label = $(el).text().trim().toLowerCase();
      const value = $(el).next('dd, td').text().trim();

      if (!value) return;

      if (label.includes('производитель')) manufacturer = value;
      else if (label.includes('страна')) country = value;
      else if (label.includes('форма выпуска')) dosageForm = value;
      else if (label.includes('действующ')) activeSubstance = value;
      else if (label.includes('дозировка')) dosage = value;
      else if (label.includes('количество')) dosage = dosage || value;
      else if (label.includes('категория')) category = value;
      else if (label.includes('порядок отпуска') || label.includes('рецепт')) prescription = value;
    });

    // Agar dt/dd topilmasa — boshqa selectorlar
    if (!manufacturer) {
      manufacturer = $('a[href*="/manufacturer"]').first().text().trim() ||
        $('[class*="manufacturer"]').first().text().trim() || '';
    }

    if (!country) {
      country = $('a[href*="/country"]').first().text().trim() ||
        $('[class*="country"]').first().text().trim() || '';
    }

    return NextResponse.json({
      success: true,
      data: {
        slug,
        name,
        nameRu: name,
        manufacturer: manufacturer || null,
        country: country || null,
        dosageForm: dosageForm || null,
        activeSubstance: activeSubstance || null,
        dosage: dosage || null,
        price: price && price > 0 ? price : null,
        imageUrl: imageUrl?.startsWith('http') ? imageUrl : imageUrl ? `${GOPHARM_BASE}${imageUrl}` : null,
        category: category || null,
        prescription: prescription?.toLowerCase().includes('рецепт') || false,
        sourceUrl: url,
      },
    });
  } catch (error: any) {
    console.error('Gopharm product error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Product yuklab olishda xatolik' },
      { status: 500 }
    );
  }
}
