// ═══════════════════════════════════════════
// Sentry — Error Tracking
// Xatolarni serverga yuboradi va ogohlantiradi
// ═══════════════════════════════════════════

/**
 * Sentry ni ishga tushirish (faqat production da)
 * 
 * O'rnatish:
 * npm install @sentry/nextjs
 * npx @sentry/wizard -i nextjs
 */
export function initSentry(): void {
  if (process.env.NODE_ENV !== 'production') return;
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  try {
    // Dynamic import — Sentry bo'lmasa ham ishlaydi
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: 0.1, // 10% so'rovlarni kuzatish
        environment: process.env.NODE_ENV,
        release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        integrations: [
          // Browser integrations
        ],
        beforeSend(event) {
          // Maxfiy ma'lumotlarni tozalash
          if (event.request?.headers) {
            delete event.request.headers['cookie'];
            delete event.request.headers['authorization'];
          }
          return event;
        },
      });
    }).catch(() => {
      // Sentry yuklanmadi — davom etish
    });
  } catch {
    // Sentry mavjud emas
  }
}

/**
 * Xatolikni Sentry ga yuborish (manual)
 */
export function captureError(error: Error, context?: Record<string, any>): void {
  console.error('Error:', error, context);

  if (process.env.NODE_ENV !== 'production') return;

  try {
    import('@sentry/nextjs').then((Sentry) => {
      if (context) {
        Sentry.setContext('custom', context);
      }
      Sentry.captureException(error);
    }).catch(() => {});
  } catch {}
}

/**
 * Custom event yuborish
 */
export function captureEvent(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (process.env.NODE_ENV !== 'production') return;

  try {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.captureMessage(message, level);
    }).catch(() => {});
  } catch {}
}
