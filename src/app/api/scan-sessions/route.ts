// ═══════════════════════════════════════════
// API: /api/scan-sessions
// Batch skanerlash sessiyalari
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { detectBarcodeFormat } from '@/lib/gs1-parser';

// POST — Batch skanerlash natijalarini saqlash
export async function POST(request: NextRequest) {
  try {
    const { scans } = await request.json();

    if (!scans || !Array.isArray(scans) || scans.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Skanerlash natijalari kiritish shart' },
        { status: 400 }
      );
    }

    // Session yaratish
    const session = await prisma.scanSession.create({
      data: {
        totalScanned: scans.length,
        matched: scans.filter((s: any) => s.matched).length,
        unmatched: scans.filter((s: any) => !s.matched).length,
        completedAt: new Date(),
      },
    });

    // Scan loglarni yaratish
    const scanLogs = await Promise.all(
      scans.map((scan: any) =>
        prisma.scanLog.create({
          data: {
            sessionId: session.id,
            barcode: scan.rawValue || scan.barcode,
            scanType: detectBarcodeFormat(scan.rawValue || scan.barcode),
            matched: scan.matched || false,
            medicineId: scan.medicineId || null,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        session,
        scanLogs,
      },
      message: `${scans.length} ta skanerlash saqlandi`,
    });
  } catch (error) {
    console.error('POST /api/scan-sessions error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}
