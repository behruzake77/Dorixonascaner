// ═══════════════════════════════════════════
// API: /api/gopharm/search
// Gopharm.uz dan real-time qidiruv
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const GOPHARM_BASE = 'https://gopharm.uz';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Kamida 2 ta harf kiriting",
      });
    }

    // Gopharm.uz dan qidiruv
    const searchUrl = `${GOPHARM_BASE}/search?q=${encodeURIComponent(query)}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'ru,uz;q=0.9',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const results: any[] = [];

    // Qidiruv natijalarini ajratish
    // Gopharm.uz turli HTML struktura ishlatishi mumkin
    $('a[href*="/product/"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      const slug = href.split('/product/')[1];

      if (!slug) return;

      // Nomi
      const name = $el.find('h6, [class*="name"], [class*="title"]').first().text().trim() ||
        $el.find('img').attr('alt') ||
        $el.text().trim();

      if (!name || name.length < 2) return;

      // Narx
      const priceText = $el.find('[class*="price"]').text().replace(/[^\d]/g, '');
      const price = priceText ? parseInt(priceText, 10) : null;

      // Ishlab chiqaruvchi
      const manufacturer = $el.find('[class*="manufacturer"], [class*="producer"]').text().trim() || null;

      // Rasm
      const imageUrl = $el.find('img').attr('src') || null;

      // Takroriy tekshirish
      const exists = results.find((r) => r.slug === slug);
      if (!exists) {
        results.push({
          slug,
          name,
          price: price && price > 0 ? price : null,
          manufacturer,
          imageUrl: imageUrl?.startsWith('http') ? imageUrl : imageUrl ? `${GOPHARM_BASE}${imageUrl}` : null,
          sourceUrl: `${GOPHARM_BASE}/product/${slug}`,
        });
      }
    });

    // Agar natija topilmasa — to'g'ridan-to'g'ri product sahifasini tekshirish
    if (results.length === 0) {
      // Slug sifatida qidirish
      const slug = query.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const directUrl = `${GOPHARM_BASE}/product/${slug}`;

      try {
        const directResponse = await axios.get(directUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000,
        });

        if (directResponse.status === 200) {
          const $direct = cheerio.load(directResponse.data);
          const name = $direct('h1').first().text().trim();

          if (name && name.length > 2) {
            const priceText = $direct('[class*="price"]').first().text().replace(/[^\d]/g, '');

            results.push({
              slug,
              name,
              price: priceText ? parseInt(priceText, 10) : null,
              manufacturer: null,
              imageUrl: $direct('meta[property="og:image"]').attr('content') || null,
              sourceUrl: directUrl,
            });
          }
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: results.slice(0, 20), // Maksimum 20 ta natija
      total: results.length,
    });
  } catch (error: any) {
    console.error('Gopharm search error:', error.message);
    return NextResponse.json(
      { success: false, error: "Qidirishda xatolik", data: [] },
      { status: 500 }
    );
  }
}
