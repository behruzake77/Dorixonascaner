// ═══════════════════════════════════════════
// API: /api/medicines/[id]/gtins
// Dori uchun GTIN CRUD
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseGS1Date } from '@/lib/gs1-parser';

// GET — Dori GTINlari
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const gtins = await prisma.medicineGtin.findMany({
      where: { medicineId: id },
      orderBy: { scannedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: gtins,
    });
  } catch (error) {
    console.error('GET /api/medicines/[id]/gtins error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}

// POST — Yangi GTIN qo'shish
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { gtin, serial, expiry, batch } = await request.json();

    if (!gtin) {
      return NextResponse.json(
        { success: false, error: 'GTIN kiritish shart' },
        { status: 400 }
      );
    }

    // Dori mavjudligini tekshirish
    const medicine = await prisma.medicine.findUnique({
      where: { id },
    });

    if (!medicine) {
      return NextResponse.json(
        { success: false, error: 'Dori topilmadi' },
        { status: 404 }
      );
    }

    // Takroriy GTIN tekshirish
    const existing = await prisma.medicineGtin.findFirst({
      where: {
        gtin,
        serial: serial || null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Bu GTIN allaqachon mavjud' },
        { status: 409 }
      );
    }

    // Expiry date parse
    const expiryDate = expiry ? parseGS1Date(expiry) : null;

    const gtinRecord = await prisma.medicineGtin.create({
      data: {
        medicineId: id,
        gtin,
        serial: serial || null,
        expiry: expiryDate || null,
        batch: batch || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: gtinRecord,
      message: 'GTIN muvaffaqiyatli qo\'shildi',
    });
  } catch (error) {
    console.error('POST /api/medicines/[id]/gtins error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}
