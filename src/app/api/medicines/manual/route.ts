// ═══════════════════════════════════════════
// API: /api/medicines/manual
// Qo'lda dori kiritish
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcode, name, manufacturer, price, dosageForm, activeSubstance, dosage } = body;

    if (!barcode || !name) {
      return NextResponse.json(
        { success: false, error: 'Barcode va nom kiritish shart' },
        { status: 400 }
      );
    }

    // Avval tekshirish — allaqachon bormi?
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

    // Yangi dori yaratish
    const medicine = await prisma.medicine.create({
      data: {
        barcode,
        name: name.trim(),
        manufacturer: manufacturer?.trim() || null,
        price: price || null,
        dosageForm: dosageForm?.trim() || null,
        activeSubstance: activeSubstance?.trim() || null,
        dosage: dosage?.trim() || null,
        priceCurrency: 'UZS',
        scrapedAt: new Date(),
      },
      include: { gtins: true },
    });

    return NextResponse.json({
      success: true,
      data: medicine,
      message: "Dori saqlandi",
    });
  } catch (error) {
    console.error('POST /api/medicines/manual error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}
