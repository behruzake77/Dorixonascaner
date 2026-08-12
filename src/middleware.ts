// ═══════════════════════════════════════════
// Middleware — Barcha sahifalarni himoya qilish
// Parol bo'lmasa → /login ga yo'naltiriladi
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';

// Himoya qilinmaydigan yo'llar (ochiq)
const PUBLIC_PATHS = [
  '/login',
  '/face-login',
  '/api/auth/login',
  '/api/auth/check',
  '/manifest.json',
  '/favicon.svg',
  '/sw.js',
  '/icons',
];

/**
 * Yo'l ochiqmi tekshirish
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Token tekshirish (middleware da — edge runtime)
 */
function hasValidAuth(request: NextRequest): boolean {
  const token = request.cookies.get('dorixona-auth')?.value;
  if (!token) return false;

  try {
    const [dataB64, signature] = token.split('.');
    if (!dataB64 || !signature) return false;

    // Base64 decode
    const data = Buffer.from(dataB64, 'base64').toString('utf-8');
    const payload = JSON.parse(data);

    // Auth flag tekshirish
    if (payload.auth !== true) return false;

    // Muddati tekshirish (24 soat)
    const age = Date.now() - payload.timestamp;
    const maxAge = 24 * 60 * 60 * 1000;
    if (age > maxAge) return false;

    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ochiq yo'llar — o'tkazib yuborish
  if (isPublicPath(pathname)) {
    // Agar login sahifasiga kirgan va allaqachon login bo'lgan bo'lsa
    if (pathname === '/login' && hasValidAuth(request)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Static fayllar (.js, .css, .ico, rasm)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(js|css|ico|png|jpg|jpeg|svg|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // Auth tekshirish
  if (!hasValidAuth(request)) {
    // API so'rov bo'lsa — 401 qaytarish
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: "Avval tizimga kiring" },
        { status: 401 }
      );
    }

    // Sahifa so'rov bo'lsа — login ga yo'naltirish
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Middleware qaysi yo'llarda ishlashi
  matcher: [
    /*
     * Barcha yo'llar:
     * - /login
     * - /api/*
     * - /_next/static
     * - /_next/image
     * - /favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
