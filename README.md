# Dorixona Skaner 💊

O'zbekiston dorixonalar uchun **EAN-13** shtrix-kod va **GS1 DataMatrix** skaner web-ilovasi.

## ✨ Imkoniyatlari

- 📷 **EAN-13 shtrix-kodni skanerlash** — mobil kamera orqali
- 🔍 **GS1 DataMatrix parsing** — GTIN, Serial, Expiry, Batch avtomatik ajratish
- 💊 **Dori ma'lumotlarini olish** — gopharm.uz dan scraping
- 📦 **Batch mode** — ommaviy skanerlash (ovoz + vibratsiya bilan)
- 🏷️ **GTIN ro'yxati** — har dori uchun alohida
- 📱 **PWA** — offline ishlash, Play Market ga chiqarish
- 🔎 **Qidiruv** — dori nomi, barcode, ishlab chiqaruvchi bo'yicha
- 🌑 **Dark mode** — ko'zni tinchituvchi dizayn

## 🛠️ Texnologiyalar

| Qatlam | Texnologiya |
|--------|-------------|
| Frontend | Next.js 14, React 18, TypeScript |
| UI | Tailwind CSS, Framer Motion, Lucide Icons |
| Skaner | html5-qrcode |
| Backend | Next.js API Routes |
| Database | PostgreSQL, Prisma ORM |
| State | Zustand |
| Scraping | Cheerio, Axios |
| PWA | Service Worker, Web App Manifest |

## 🚀 Boshlash

### 1. O'rnatish

```bash
npm install
```

### 2. Database sozlash

```bash
# Prisma client yaratish
npx prisma generate

# Database migration
npx prisma db push

# Seed ma'lumotlar
npx prisma db seed
```

### 3. Ishga tushirish

```bash
npm run dev
```

http://localhost:3000 da oching

### 4. PWA sifatida o'rnatish

Brauzerda "Ilovani o'rnatish" tugmasini bosing yoki Play Market dan yuklab oling.

## 📁 Loyiha strukturasi

```
src/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── medicines/          # Dorilar CRUD
│   │   │   ├── barcode/        # Barcode qidirish
│   │   │   ├── gtin/           # GTIN qidirish
│   │   │   ├── search/         # Qidiruv
│   │   │   └── [id]/gtins/     # GTIN CRUD
│   │   ├── unknown-gtins/      # Noma'lum GTIN lar
│   │   └── scan-sessions/      # Batch sessiyalar
│   ├── globals.css             # Global style
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Asosiy sahifa
├── components/
│   ├── Header.tsx              # Yuqori panel
│   ├── ScannerSection.tsx      # Skaner komponenti
│   ├── MedicineCard.tsx        # Dori kartochkasi
│   ├── QuickStats.tsx          # Statistika
│   ├── RecentScans.tsx         # Oxirgi skanerlashlar
│   └── SearchBar.tsx           # Qidiruv
├── lib/
│   ├── api.ts                  # API client
│   ├── gs1-parser.ts           # GS1 DataMatrix parser
│   ├── prisma.ts               # Prisma client
│   └── scraper.ts              # Gopharm.uz scraper
├── store/
│   └── scanner-store.ts        # Zustand store
└── types/
    └── index.ts                # TypeScript types
```

## 📖 GS1 DataMatrix format

```
(01)04607015470868  — GTIN (14 raqam)
(17)261231          — Yaroqlilik muddati (YYMMDD)
(10)B20250101       — Partiya raqami
(21)SER001          — Seriya raqami
```

## 🎨 Rang palitrasi

| Rang | Kod | Ishlatilishi |
|------|-----|-------------|
| Background | `#0f172a` | Asosiy fon |
| Card | `#1e293b` | Kartochka foni |
| Primary | `#3b82f6` | Asosiy rang (ko'k) |
| Success | `#10b981` | Muvaffaqiyat (yashil) |
| Accent | `#f59e0b` | Diqqat (sariq) |
| Danger | `#ef4444` | Xatolik (qizil) |

## 📱 PWA xususiyatlari

- ✅ Offline ishlash (Service Worker)
- ✅ Home screen ga qo'shish
- ✅ Push bildirishnomalar (kelajakda)
- ✅ Kamera ruxsati
- ✅ Vibratsiya API

## 📄 Litsenziya

MIT
