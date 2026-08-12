// ═══════════════════════════════════════════
// API: /api/medicines/barcode/[barcode]
// Barcode bo'yicha dori qidirish
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findMedicineByBarcodeLocal } from '@/lib/barcode-database';

export async function GET(
  request: NextRequest,
  { params }: { params: { barcode: string } }
) {
  try {
    const { barcode } = params;

    if (!barcode) {
      return NextResponse.json(
        { success: false, error: 'Barcode kiritish shart' },
        { status: 400 }
      );
    }

    // 1-QADAM: PostgreSQL bazadan qidirish
    const medicine = await prisma.medicine.findUnique({
      where: { barcode },
      include: {
        gtins: {
          orderBy: { scannedAt: 'desc' },
        },
      },
    });

    if (medicine) {
      return NextResponse.json({
        success: true,
        data: medicine,
      });
    }

    // 2-QADAM: Lokal barcode bazasidan qidirish
    const localEntry = findMedicineByBarcodeLocal(barcode);

    if (localEntry) {
      return NextResponse.json({
        success: true,
        data: {
          id: 'local-' + localEntry.barcode,
          barcode: localEntry.barcode,
          name: localEntry.name,
          nameRu: localEntry.nameRu,
          manufacturer: localEntry.manufacturer,
          country: localEntry.country,
          dosageForm: localEntry.dosageForm,
          activeSubstance: localEntry.activeSubstance,
          dosage: localEntry.dosage,
          price: localEntry.price,
          category: localEntry.category,
          sourceUrl: localEntry.gopharmSlug
            ? `https://gopharm.uz/product/${localEntry.gopharmSlug}`
            : undefined,
          prescription: false,
          gtins: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // 3-QADAM: Topilmadi
    return NextResponse.json(
      { success: false, error: 'Dori topilmadi' },
      { status: 404 }
    );
  } catch (error) {
    console.error('GET /api/medicines/barcode error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}
