// ═══════════════════════════════════════════
// API: /api/docs
// API hujjatlari (Swagger/OpenAPI format)
// ═══════════════════════════════════════════

import { NextResponse } from 'next/server';

const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'Dorixona Skaner API',
    version: '1.0.0',
    description: "O'zbekiston dorixonalar uchun barcode/DataMatrix skaner API",
  },
  servers: [
    { url: '/api', description: 'Asosiy server' },
  ],
  paths: {
    '/medicines': {
      get: {
        summary: 'Dorilar ro\'yxati',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': { description: 'Muvaffaqiyatli' },
        },
      },
      post: {
        summary: 'Yangi dori yaratish (scraping bilan)',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { barcode: { type: 'string' } },
                required: ['barcode'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Yaratildi' },
          '404': { description: 'Topilmadi' },
        },
      },
    },
    '/medicines/barcode/{barcode}': {
      get: {
        summary: 'Barcode bo\'yicha dori qidirish',
        parameters: [
          { name: 'barcode', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Topildi' },
          '404': { description: 'Topilmadi' },
        },
      },
    },
    '/medicines/search': {
      post: {
        summary: 'Dori qidirish',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  query: { type: 'string' },
                  category: { type: 'string' },
                  manufacturer: { type: 'string' },
                  prescription: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    '/medicines/{id}/gtins': {
      get: {
        summary: 'Dori GTINlari',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
      },
      post: {
        summary: 'GTIN qo\'shish',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  gtin: { type: 'string' },
                  serial: { type: 'string' },
                  expiry: { type: 'string' },
                  batch: { type: 'string' },
                },
                required: ['gtin'],
              },
            },
          },
        },
      },
    },
    '/inventory': {
      get: {
        summary: 'Ombor ro\'yxati',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer' } },
          { name: 'lowStock', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
      },
      post: {
        summary: 'Omborga qo\'shish',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  medicineId: { type: 'string' },
                  quantity: { type: 'integer' },
                  minQuantity: { type: 'integer' },
                  buyPrice: { type: 'number' },
                  sellPrice: { type: 'number' },
                  location: { type: 'string' },
                },
                required: ['medicineId'],
              },
            },
          },
        },
      },
    },
    '/inventory/transaction': {
      post: {
        summary: 'Kirish/Chiqish transaksiya',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  itemId: { type: 'string' },
                  type: { type: 'string', enum: ['IN', 'OUT', 'ADJUST', 'EXPIRED', 'DAMAGED', 'RETURN'] },
                  quantity: { type: 'integer' },
                  reason: { type: 'string' },
                  unitPrice: { type: 'number' },
                  note: { type: 'string' },
                },
                required: ['itemId', 'type', 'quantity'],
              },
            },
          },
        },
      },
    },
    '/scan-sessions': {
      post: {
        summary: 'Batch skanerlash natijalarini saqlash',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  scans: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        rawValue: { type: 'string' },
                        matched: { type: 'boolean' },
                        medicineId: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/unknown-gtins': {
      get: {
        summary: 'Noma\'lum GTIN lar ro\'yxati',
      },
      post: {
        summary: 'Noma\'lum GTIN saqlash',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  gtin: { type: 'string' },
                  rawData: { type: 'string' },
                  serial: { type: 'string' },
                  expiry: { type: 'string' },
                  batch: { type: 'string' },
                },
                required: ['gtin'],
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Parol bilan kirish',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  password: { type: 'string' },
                  faceAuth: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Muvaffaqiyatli kirish' },
          '401': { description: 'Noto\'g\'ri parol' },
          '429': { description: 'Juda ko\'p urinish' },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Chiqish',
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(apiDocs, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
