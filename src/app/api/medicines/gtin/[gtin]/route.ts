// ═══════════════════════════════════════════
// API: /api/medicines/gtin/[gtin]
// GTIN bo'yicha dori qidirish
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { gtin: string } }
) {
  try {
    const { gtin } = params;

    if (!gtin) {
      return NextResponse.json(
        { success: false, error: 'GTIN kiritish shart' },
        { status: 400 }
      );
    }

    // GTIN bo'yicha qidirish
    const gtinRecord = await prisma.medicineGtin.findFirst({
      where: { gtin },
      include: {
        medicine: {
          include: {
            gtins: {
              orderBy: { scannedAt: 'desc' },
            },
          },
        },
      },
    });

    if (!gtinRecord || !gtinRecord.medicine) {
      return NextResponse.json(
        { success: false, error: 'GTIN bo\'yicha dori topilmadi' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: gtinRecord.medicine,
    });
  } catch (error) {
    console.error('GET /api/medicines/gtin error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}
