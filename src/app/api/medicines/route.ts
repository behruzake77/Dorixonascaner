// ═══════════════════════════════════════════
// API: /api/medicines
// Dorilar CRUD
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scrapeMedicineFromGopharm } from '@/lib/scraper';

// GET — Dorilar ro'yxati
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const skip = (page - 1) * pageSize;

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        skip,
        take: pageSize,
        include: {
          gtins: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.medicine.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: medicines,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('GET /api/medicines error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}

// POST — Yangi dori yaratish (barcode bilan scraping)
export async function POST(request: NextRequest) {
  try {
    const { barcode } = await request.json();

    if (!barcode) {
      return NextResponse.json(
        { success: false, error: 'Barcode kiritish shart' },
        { status: 400 }
      );
    }

    // Avval bazadan qidirish
    const existing = await prisma.medicine.findUnique({
      where: { barcode },
      include: { gtins: true },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        message: 'Bazada mavjud',
      });
    }

    // Scraping qilish
    const scraped = await scrapeMedicineFromGopharm(barcode);

    if (scraped) {
      const medicine = await prisma.medicine.create({
        data: {
          barcode,
          name: scraped.name,
          nameRu: scraped.nameRu,
          imageUrl: scraped.imageUrl,
          price: scraped.price,
          manufacturer: scraped.manufacturer,
          country: scraped.country,
          dosageForm: scraped.dosageForm,
          activeSubstance: scraped.activeSubstance,
          dosage: scraped.dosage,
          sourceUrl: scraped.sourceUrl,
          scrapedAt: new Date(),
        },
        include: { gtins: true },
      });

      return NextResponse.json({
        success: true,
        data: medicine,
        message: "Yangi dori yaratildi (gopharm.uz dan olindi)",
      });
    }

    // Scraping ham topmadi
    return NextResponse.json(
      { success: false, error: "Dori ma'lumoti topilmadi" },
      { status: 404 }
    );
  } catch (error) {
    console.error('POST /api/medicines error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}
