// ═══════════════════════════════════════════
// API: /api/medicines/search
// Dori qidirish
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findMedicineByNameLocal, findMedicineByBarcodeLocal } from '@/lib/barcode-database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, category, manufacturer, prescription, page = 1, pageSize = 20 } = body;

    const skip = (page - 1) * pageSize;

    // Filter yasash
    const where: any = {
      AND: [],
    };

    // Text qidiruv
    if (query) {
      where.AND.push({
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nameRu: { contains: query, mode: 'insensitive' } },
          { barcode: { contains: query } },
          { manufacturer: { contains: query, mode: 'insensitive' } },
          { activeSubstance: { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    // Kategoriya filter
    if (category) {
      where.AND.push({
        category: { contains: category, mode: 'insensitive' },
      });
    }

    // Ishlab chiqaruvchi filter
    if (manufacturer) {
      where.AND.push({
        manufacturer: { contains: manufacturer, mode: 'insensitive' },
      });
    }

    // Retsept filter
    if (prescription !== undefined) {
      where.AND.push({ prescription });
    }

    // Agar filter bo'sh bo'lsa
    if (where.AND.length === 0) {
      delete where.AND;
    }

    // 1-QADAM: PostgreSQL bazadan qidirish
    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          gtins: {
            take: 5,
            orderBy: { scannedAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.medicine.count({ where }),
    ]);

    // Agar bazada topilmasa — lokal bazadan qidirish
    if (medicines.length === 0 && query) {
      // Avval barcode bilan qidirish
      const barcodeResult = findMedicineByBarcodeLocal(query);
      if (barcodeResult) {
        return NextResponse.json({
          success: true,
          data: {
            items: [{
              id: 'local-' + barcodeResult.barcode,
              barcode: barcodeResult.barcode,
              name: barcodeResult.name,
              nameRu: barcodeResult.nameRu,
              manufacturer: barcodeResult.manufacturer,
              country: barcodeResult.country,
              dosageForm: barcodeResult.dosageForm,
              activeSubstance: barcodeResult.activeSubstance,
              dosage: barcodeResult.dosage,
              price: barcodeResult.price,
              category: barcodeResult.category,
              sourceUrl: barcodeResult.gopharmSlug
                ? `https://gopharm.uz/product/${barcodeResult.gopharmSlug}`
                : undefined,
              prescription: false,
              gtins: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }],
            total: 1,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          },
        });
      }

      // Nomi bo'yicha lokal bazadan qidirish
      const localResults = findMedicineByNameLocal(query);
      if (localResults.length > 0) {
        return NextResponse.json({
          success: true,
          data: {
            items: localResults.map((entry) => ({
              id: 'local-' + entry.barcode,
              barcode: entry.barcode,
              name: entry.name,
              nameRu: entry.nameRu,
              manufacturer: entry.manufacturer,
              country: entry.country,
              dosageForm: entry.dosageForm,
              activeSubstance: entry.activeSubstance,
              dosage: entry.dosage,
              price: entry.price,
              category: entry.category,
              sourceUrl: entry.gopharmSlug
                ? `https://gopharm.uz/product/${entry.gopharmSlug}`
                : undefined,
              prescription: false,
              gtins: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })),
            total: localResults.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          },
        });
      }
    }

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
    console.error('POST /api/medicines/search error:', error);
    return NextResponse.json(
      { success: false, error: 'Qidirishda xatolik' },
      { status: 500 }
    );
  }
}
