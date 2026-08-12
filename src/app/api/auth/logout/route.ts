// ═══════════════════════════════════════════
// API: /api/auth/logout
// Chiqish
// ═══════════════════════════════════════════

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Chiqildi',
  });

  response.cookies.delete('dorixona-auth');

  return response;
}
