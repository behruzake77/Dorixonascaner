// ═══════════════════════════════════════════
// API: /api/inventory/[id]
// Ombor elementini boshqarish
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — Bitta ombor elementi
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: params.id },
      include: {
        medicine: {
          include: { gtins: true },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Topilmadi' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}

// PUT — Ombor elementini yangilash
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { minQuantity, maxQuantity, buyPrice, sellPrice, location, shelf } = body;

    const item = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        ...(minQuantity !== undefined && { minQuantity }),
        ...(maxQuantity !== undefined && { maxQuantity }),
        ...(buyPrice !== undefined && { buyPrice }),
        ...(sellPrice !== undefined && { sellPrice }),
        ...(location !== undefined && { location }),
        ...(shelf !== undefined && { shelf }),
      },
      include: { medicine: true },
    });

    return NextResponse.json({
      success: true,
      data: item,
      message: 'Yangilandi',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}

// DELETE — Ombor elementini o'chirish
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.inventoryItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "O'chirildi",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}
