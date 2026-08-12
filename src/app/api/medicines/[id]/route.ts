// ═══════════════════════════════════════════
// API: /api/medicines/[id]
// Dori CRUD (bitta)
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — Bitta dori
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const medicine = await prisma.medicine.findUnique({
      where: { id },
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
    console.error('GET /api/medicines/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}

// PUT — Dorini yangilash
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const medicine = await prisma.medicine.update({
      where: { id },
      data: body,
      include: { gtins: true },
    });

    return NextResponse.json({
      success: true,
      data: medicine,
      message: 'Dori yangilandi',
    });
  } catch (error) {
    console.error('PUT /api/medicines/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}

// DELETE — Dorini o'chirish
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.medicine.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Dori o'chirildi",
    });
  } catch (error) {
    console.error('DELETE /api/medicines/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}
