// ═══════════════════════════════════════════
// API: /api/medicines/search
// Dori qidirish
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
