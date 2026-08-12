// ═══════════════════════════════════════════
// API: /api/auth/check
// Auth holatini tekshirish
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../login/route';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('dorixona-auth')?.value;

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
