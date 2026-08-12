// ═══════════════════════════════════════════
// Prisma Client — Lazy Singleton
// prisma generate bo'lmasa ham build xatosiz ishlaydi
// ═══════════════════════════════════════════

const globalForPrisma = globalThis as unknown as {
  __prisma: any;
};

// Lazy getter — faqat prisma.x() chaqirilganda import bo'ladi
function getPrisma() {
  if (!globalForPrisma.__prisma) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaClient } = require('@prisma/client');
      globalForPrisma.__prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    } catch (e: any) {
      // Prisma generate qilinmagan — build vaqtida xato bermaslik uchun
      console.error('Prisma client yuklanmadi:', e.message);
      // Proxy qaytarish — xato faqat haqiqiy so'rovda chiqadi
      return new Proxy({}, {
        get: () => {
          throw new Error(
            'Prisma client mavjud emas. "npx prisma generate" ishga tushiring.'
          );
        },
      });
    }
  }
  return globalForPrisma.__prisma;
}

// Export — proxy orqali, har bir prisma.x chaqiruvda getPrisma() ishlaydi
export const prisma = new Proxy({} as any, {
  get: (_target, prop) => {
    const client = getPrisma();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
