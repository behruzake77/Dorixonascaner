// ═══════════════════════════════════════════
// API: /api/unknown-gtins
// Noma'lum GTIN lar
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseGS1Date } from '@/lib/gs1-parser';

// GET — Noma'lum GTIN lar ro'yxati
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get('resolved');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (resolved !== null) {
      where.resolved = resolved === 'true';
    }

    const [items, total] = await Promise.all([
      prisma.unknownGtin.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { scannedAt: 'desc' },
      }),
      prisma.unknownGtin.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('GET /api/unknown-gtins error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}

// POST — Noma'lum GTIN saqlash
export async function POST(request: NextRequest) {
  try {
    const { gtin, rawData, serial, expiry, batch } = await request.json();

    if (!gtin) {
      return NextResponse.json(
        { success: false, error: 'GTIN kiritish shart' },
        { status: 400 }
      );
    }

    // Takroriy tekshirish
    const existing = await prisma.unknownGtin.findUnique({
      where: { gtin },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        message: 'Bu GTIN allaqachon saqlangan',
      });
    }

    const expiryDate = expiry ? parseGS1Date(expiry) : null;

    const unknownGtin = await prisma.unknownGtin.create({
      data: {
        gtin,
        rawData: rawData || null,
        serial: serial || null,
        expiry: expiryDate || null,
        batch: batch || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: unknownGtin,
      message: 'Noma\'lum GTIN saqlandi',
    });
  } catch (error) {
    console.error('POST /api/unknown-gtins error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}
