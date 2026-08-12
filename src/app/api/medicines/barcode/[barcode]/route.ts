// ═══════════════════════════════════════════
// API: /api/medicines/barcode/[barcode]
// Barcode bo'yicha dori qidirish
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Barcode bo'yicha qidirish
    const medicine = await prisma.medicine.findUnique({
      where: { barcode },
      include: {
        gtins: {
          orderBy: { scannedAt: 'desc' },
        },
      },
    });

    if (!medicine) {
      return NextResponse.json(
        { success: false, error: 'Dori topilmadi' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    console.error('GET /api/medicines/barcode error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}
