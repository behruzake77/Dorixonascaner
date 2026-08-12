// ═══════════════════════════════════════════
// API: /api/inventory/transaction
// Kirish/Chiqish transaksiyalari
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST — Transaksiya yaratish (kirish/chiqish)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      itemId,
      type,       // IN, OUT, ADJUST, EXPIRED, DAMAGED, RETURN
      quantity,   // Miqdor (musbat)
      reason,
      performedBy,
      unitPrice,
      note,
    } = body;

    if (!itemId || !type || !quantity) {
      return NextResponse.json(
        { success: false, error: 'itemId, type va quantity shart' },
        { status: 400 }
      );
    }

    // Ombor elementini topish
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Ombor elementi topilmadi' },
        { status: 404 }
      );
    }

    // Yangi miqdorni hisoblash
    let newQuantity = item.quantity;

    switch (type) {
      case 'IN':
      case 'RETURN':
        newQuantity += quantity;
        break;
      case 'OUT':
      case 'EXPIRED':
      case 'DAMAGED':
        newQuantity -= quantity;
        if (newQuantity < 0) {
          return NextResponse.json(
            { success: false, error: `Omborda faqat ${item.quantity} ta bor. ${quantity} ta chiqarib bo'lmaydi.` },
            { status: 400 }
          );
        }
        break;
      case 'ADJUST':
        // Tuzatish — to'g'ridan-to'g'ri qiymat
        newQuantity = quantity;
        break;
    }

    // Transaksiyani yaratish va miqdorni yangilash
    const [transaction] = await prisma.$transaction([
      prisma.inventoryTransaction.create({
        data: {
          itemId,
          type,
          quantity: type === 'OUT' || type === 'EXPIRED' || type === 'DAMAGED' ? -quantity : quantity,
          reason: reason || null,
          performedBy: performedBy || 'Admin',
          unitPrice: unitPrice || null,
          totalPrice: unitPrice ? unitPrice * quantity : null,
          note: note || null,
        },
      }),
      prisma.inventoryItem.update({
        where: { id: itemId },
        data: {
          quantity: newQuantity,
          ...(type === 'IN' || type === 'RETURN' ? { lastRestockAt: new Date() } : {}),
          ...(type === 'OUT' ? { lastSoldAt: new Date() } : {}),
        },
      }),
    ]);

    // Kam qolgan dorilar uchun ogohlantirish
    let warning: string | null = null;
    if (newQuantity <= item.minQuantity && newQuantity > 0) {
      warning = `Diqqat: Omborda faqat ${newQuantity} ta qoldi! (Minimum: ${item.minQuantity})`;
    } else if (newQuantity === 0) {
      warning = `Tugadi! Omborda bu dori yo'q.`;
    }

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        newQuantity,
        warning,
      },
      message: `${type} transaksiya muvaffaqiyatli${warning ? ' ⚠️ ' + warning : ''}`,
    });
  } catch (error) {
    console.error('POST /api/inventory/transaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}
