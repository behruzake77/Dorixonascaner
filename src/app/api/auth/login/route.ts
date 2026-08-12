// ═══════════════════════════════════════════
// API: /api/auth/login
// Parol bilan kirish
// ═══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Parolni environment dan olish (eng xavfsiz usul)
const APP_PASSWORD = process.env.APP_PASSWORD || 'dorixona2025';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dorixona-scanner-secret-key-2025';

// Rate limiting — har IP uchun
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

/**
 * Token yaratish
 */
function createToken(password: string): string {
  const payload = {
    auth: true,
    timestamp: Date.now(),
    hash: crypto.createHash('sha256').update(password + SESSION_SECRET).digest('hex').substring(0, 16),
  };
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + signature;
}

/**
 * Token tekshirish
 */
export function verifyToken(token: string): boolean {
  try {
    const [dataB64, signature] = token.split('.');
    if (!dataB64 || !signature) return false;

    const data = Buffer.from(dataB64, 'base64').toString('utf-8');
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');

    // Signature tekshirish
    if (signature !== expectedSig) return false;

    const payload = JSON.parse(data);

    // Muddati tekshirish (24 soat)
    const age = Date.now() - payload.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 soat
    if (age > maxAge) return false;

    return payload.auth === true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { password, faceAuth } = await request.json();

    // Face auth — yuz bilan kirish (client-side tekshiriladi)
    if (faceAuth === true) {
      const token = createToken('face-auth-' + SESSION_SECRET);
      const response = NextResponse.json({
        success: true,
        message: "Yuz bilan kirish muvaffaqiyatli",
      });
      response.cookies.set('dorixona-auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Parol kiritish shart' },
        { status: 400 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const attempt = loginAttempts.get(ip);

    if (attempt) {
      if (attempt.count >= MAX_ATTEMPTS) {
        const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
        const lockoutMs = LOCKOUT_MINUTES * 60 * 1000;

        if (timeSinceLastAttempt < lockoutMs) {
          const remainingMinutes = Math.ceil((lockoutMs - timeSinceLastAttempt) / 60000);
          return NextResponse.json(
            {
              success: false,
              error: `Juda ko'p urinish. ${remainingMinutes} daqiqadan keyin qayta urinib ko'ring.`,
            },
            { status: 429 }
          );
        } else {
          // Lockout tugadi
          loginAttempts.delete(ip);
        }
      }
    }

    // Parol tekshirish
    if (password !== APP_PASSWORD) {
      // Urinishni saqlash
      const current = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
      loginAttempts.set(ip, {
        count: current.count + 1,
        lastAttempt: Date.now(),
      });

      return NextResponse.json(
        { success: false, error: "Noto'g'ri parol" },
        { status: 401 }
      );
    }

    // Muvaffaqiyatli kirish — urinishlarni tozalash
    loginAttempts.delete(ip);

    // Token yaratish
    const token = createToken(password);

    // Cookie ga saqlash
    const response = NextResponse.json({
      success: true,
      message: 'Muvaffaqiyatli kirish',
    });

    response.cookies.set('dorixona-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 soat
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}
