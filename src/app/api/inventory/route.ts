// ═══════════════════════════════════════════
// API: /api/inventory
// Ombor boshqaruvi
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — Ombor ro'yxati
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const lowStock = searchParams.get('lowStock') === 'true';
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * pageSize;

    // Filter
    const where: any = {};

    if (lowStock) {
      // Kam qolgan dorilar — quantity <= minQuantity
      where.quantity = { lte: prisma.inventoryItem.fields.minQuantity };
    }

    if (search) {
      where.medicine = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search } },
          { manufacturer: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          medicine: {
            include: {
              gtins: { take: 5, orderBy: { scannedAt: 'desc' } },
            },
          },
          transactions: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    // Kam qolgan dorilar soni
    const lowStockCount = await prisma.inventoryItem.count({
      where: {
        quantity: { gt: 0 },
        // quantity <= minQuantity — Prisma da raw query kerak
      },
    });

    // Jami qiymat
    const totalValue = await prisma.inventoryItem.aggregate({
      _sum: { quantity: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        stats: {
          totalItems: total,
          lowStockCount,
          totalQuantity: totalValue._sum.quantity || 0,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/inventory error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}

// POST — Yangi ombor elementi yaratish
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { medicineId, quantity, minQuantity, maxQuantity, buyPrice, sellPrice, location, shelf } = body;

    if (!medicineId) {
      return NextResponse.json(
        { success: false, error: 'Dori ID kiritish shart' },
        { status: 400 }
      );
    }

    // Dori mavjudligini tekshirish
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicine) {
      return NextResponse.json(
        { success: false, error: 'Dori topilmadi' },
        { status: 404 }
      );
    }

    // Allaqachon mavjudmi?
    const existing = await prisma.inventoryItem.findUnique({
      where: { medicineId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Bu dori allaqachon omborda bor. Tahrirlash uchun PUT ishlating." },
        { status: 409 }
      );
    }

    const item = await prisma.inventoryItem.create({
      data: {
        medicineId,
        quantity: quantity || 0,
        minQuantity: minQuantity || 5,
        maxQuantity: maxQuantity || null,
        buyPrice: buyPrice || null,
        sellPrice: sellPrice || null,
        location: location || null,
        shelf: shelf || null,
      },
      include: { medicine: true },
    });

    // Agar quantity > 0 bo'lsa, kirish transaksiyasi yaratish
    if (quantity && quantity > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          itemId: item.id,
          type: 'IN',
          quantity,
          reason: "Boshlang'ich kirish",
          performedBy: body.performedBy || 'Admin',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: item,
      message: "Ombor elementi yaratildi",
    });
  } catch (error) {
    console.error('POST /api/inventory error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}
