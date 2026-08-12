// ═══════════════════════════════════════════
// Prisma Seed — Boshlang'ich ma'lumotlar
// ═══════════════════════════════════════════

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed boshlanmoqda...");

  // ═══════════════════════════════════════
  // DORILAR
  // ═══════════════════════════════════════

  const paratsetamol = await prisma.medicine.upsert({
    where: { barcode: '4607015470868' },
    update: {},
    create: {
      barcode: '4607015470868',
      name: 'Paratsetamol',
      nameRu: 'Парацетамол',
      description: "Og'riq qoldiruvchi va isitma tushiruvchi dori",
      price: 5500,
      priceCurrency: 'UZS',
      manufacturer: 'Pharmstandard',
      country: 'Rossiya',
      dosageForm: 'Tabletkasi',
      activeSubstance: 'Paratsetamol',
      dosage: '500mg',
      prescription: false,
      category: "Og'riq qoldiruvchi",
      sourceUrl: 'https://gopharm.uz/search?q=4607015470868',
      scrapedAt: new Date(),
    },
  });

  const ibuprofen = await prisma.medicine.upsert({
    where: { barcode: '4607033440143' },
    update: {},
    create: {
      barcode: '4607033440143',
      name: 'Ibuprofen',
      nameRu: 'Ибупрофен',
      description: "Yallig'lanishga qarshi va og'riq qoldiruvchi",
      price: 8200,
      priceCurrency: 'UZS',
      manufacturer: 'Hemofarm',
      country: 'Serbiya',
      dosageForm: 'Tabletkasi',
      activeSubstance: 'Ibuprofen',
      dosage: '400mg',
      prescription: false,
      category: "Yallig'lanishga qarshi",
      sourceUrl: 'https://gopharm.uz/search?q=4607033440143',
      scrapedAt: new Date(),
    },
  });

  const amoksitsillin = await prisma.medicine.upsert({
    where: { barcode: '4607077810145' },
    update: {},
    create: {
      barcode: '4607077810145',
      name: 'Amoksitsillin',
      nameRu: 'Амоксициллин',
      description: "Bakteriyalarga qarshi antibiotik",
      price: 12500,
      priceCurrency: 'UZS',
      manufacturer: 'Sandoz',
      country: 'Avstriya',
      dosageForm: 'Kapsulasi',
      activeSubstance: 'Amoksitsillin trihidrati',
      dosage: '500mg',
      prescription: true,
      category: 'Antibiotik',
      sourceUrl: 'https://gopharm.uz/search?q=4607077810145',
      scrapedAt: new Date(),
    },
  });

  const omeprazol = await prisma.medicine.upsert({
    where: { barcode: '4607029551037' },
    update: {},
    create: {
      barcode: '4607029551037',
      name: 'Omeprazol',
      nameRu: 'Омепразол',
      description: "Oshqozon kislotaliligini kamaytiruvchi",
      price: 9800,
      priceCurrency: 'UZS',
      manufacturer: 'Stada',
      country: 'Rossiya',
      dosageForm: 'Kapsulasi',
      activeSubstance: 'Omeprazol',
      dosage: '20mg',
      prescription: false,
      category: 'Gastroenterologiya',
      sourceUrl: 'https://gopharm.uz/search?q=4607029551037',
      scrapedAt: new Date(),
    },
  });

  const loratadin = await prisma.medicine.upsert({
    where: { barcode: '4607053840367' },
    update: {},
    create: {
      barcode: '4607053840367',
      name: 'Loratadin',
      nameRu: 'Лоратадин',
      description: "Allergiyaga qarshi dori",
      price: 6700,
      priceCurrency: 'UZS',
      manufacturer: 'Ozon',
      country: 'Rossiya',
      dosageForm: 'Tabletkasi',
      activeSubstance: 'Loratadin',
      dosage: '10mg',
      prescription: false,
      category: 'Antigistamin',
      sourceUrl: 'https://gopharm.uz/search?q=4607053840367',
      scrapedAt: new Date(),
    },
  });

  console.log(`✅ ${5} ta dori yaratildi`);

  // ═══════════════════════════════════════
  // GTINLAR
  // ═══════════════════════════════════════

  const gtins = [
    {
      medicineId: paratsetamol.id,
      gtin: '04607015470868',
      serial: 'SER001',
      expiry: new Date(2026, 11, 31),
      batch: 'B20250101',
      status: 'ACTIVE' as const,
    },
    {
      medicineId: ibuprofen.id,
      gtin: '04607033440143',
      serial: 'SER002',
      expiry: new Date(2026, 5, 30),
      batch: 'B20250215',
      status: 'ACTIVE' as const,
    },
    {
      medicineId: amoksitsillin.id,
      gtin: '04607077810145',
      serial: 'SER003',
      expiry: new Date(2025, 11, 31),
      batch: 'B20250301',
      status: 'ACTIVE' as const,
    },
  ];

  for (const gtin of gtins) {
    await prisma.medicineGtin.upsert({
      where: {
        gtin_serial: {
          gtin: gtin.gtin,
          serial: gtin.serial,
        },
      },
      update: {},
      create: gtin,
    });
  }

  console.log(`✅ ${gtins.length} ta GTIN yaratildi`);
  console.log("🎉 Seed tugadi!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed xatolik:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
