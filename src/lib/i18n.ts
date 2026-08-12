// ═══════════════════════════════════════════
// i18n — 3 tilda tarjima (O'zbek / Rus / Ingliz)
// ═══════════════════════════════════════════

export type Locale = 'uz' | 'ru' | 'en';

const translations: Record<Locale, Record<string, string>> = {
  uz: {
    // Asosiy
    'app.name': 'Dorixona Skaner',
    'app.description': 'Dori kod skaneri',

    // Navigatsiya
    'nav.scan': 'Skaner',
    'nav.search': 'Qidirish',
    'nav.inventory': 'Ombor',
    'nav.history': 'Tarix',
    'nav.admin': 'Admin',
    'nav.settings': 'Sozlamalar',

    // Skaner
    'scan.start': 'Kamerani yoqish',
    'scan.stop': "To'xtatish",
    'scan.batch': 'Batch rejimi',
    'scan.torch': 'Chiroq',
    'scan.switch_camera': 'Kamera almashtirish',
    'scan.scanning': 'Skanerlash...',
    'scan.found': 'Topildi',
    'scan.not_found': 'Topilmadi',
    'scan.paused': 'Kutish...',

    // Dori
    'medicine.name': 'Nomi',
    'medicine.manufacturer': 'Ishlab chiqaruvchi',
    'medicine.country': 'Mamlakat',
    'medicine.dosage_form': 'Shakli',
    'medicine.active_substance': 'Faol modda',
    'medicine.dosage': 'Dozasi',
    'medicine.price': 'Narxi',
    'medicine.prescription': 'Retsept bilan',
    'medicine.barcode': 'Barcode',
    'medicine.gtin_list': 'GTIN ro\'yxati',

    // Qidiruv
    'search.placeholder': 'Dori nomi, barcode yoki ishlab chiqaruvchi...',
    'search.button': 'Qidirish',
    'search.results': 'ta natija topildi',
    'search.empty': 'Hech narsa topilmadi',
    'search.popular': 'Mashhur qidiruvlar',

    // Ombor
    'inventory.title': 'Omborxona',
    'inventory.add': "Qo'shish",
    'inventory.in': 'Kirish',
    'inventory.out': 'Chiqish',
    'inventory.adjust': 'Tuzatish',
    'inventory.expired': "Muddati o'tdi",
    'inventory.low_stock': 'Kam qolgan',
    'inventory.empty': 'Tugagan',
    'inventory.total_value': 'Ombor qiymati',
    'inventory.quantity': 'Miqdori',
    'inventory.min_quantity': 'Min. ogohlantirish',
    'inventory.location': 'Joylashuv',

    // Tarix
    'history.title': 'Skanerlash tarixi',
    'history.export_csv': 'CSV',
    'history.export_excel': 'Excel',
    'history.share': 'Ulashish',
    'history.clear': 'Tarixni tozalash',
    'history.select': 'Tanlash',

    // Share
    'share.title': 'Ulashish',
    'share.whatsapp': 'WhatsApp',
    'share.telegram': 'Telegram',
    'share.copy': 'Nusxalash',
    'share.other': 'Boshqa',

    // Kirish
    'login.title': 'Kirish',
    'login.password': 'Parolni kiriting',
    'login.submit': 'Kirish',
    'login.face': 'Yuz bilan kirish',
    'login.error': "Noto'g'ri parol",
    'login.restricted': 'Faqat ruxsat etilgan xodimlar uchun',

    // Sozlamalar
    'settings.theme': 'Tema',
    'settings.dark': "Qorong'u",
    'settings.light': "Yorug'",
    'settings.auto': 'Auto',
    'settings.sound': 'Ovoz (Beep)',
    'settings.vibration': 'Vibratsiya',
    'settings.volume': 'Ovoz balandligi',
    'settings.scan_engine': 'Skanerlash engine',
    'settings.auto_lookup': 'Avtomatik qidirish',
    'settings.reset': 'Standart sozlamalarga qaytarish',

    // Umumiy
    'common.save': 'Saqlash',
    'common.cancel': 'Bekor qilish',
    'common.delete': "O'chirish",
    'common.edit': 'Tahrirlash',
    'common.back': 'Orqaga',
    'common.loading': 'Yuklanmoqda...',
    'common.error': 'Xatolik',
    'common.success': 'Muvaffaqiyatli',
    'common.confirm': 'Tasdiqlash',
    'common.yes': 'Ha',
    'common.no': "Yo'q",
    'common.all': 'Hammasi',
  },

  ru: {
    'app.name': 'Аптека Сканер',
    'app.description': 'Сканер кодов лекарств',
    'nav.scan': 'Сканер',
    'nav.search': 'Поиск',
    'nav.inventory': 'Склад',
    'nav.history': 'История',
    'nav.admin': 'Админ',
    'nav.settings': 'Настройки',
    'scan.start': 'Включить камеру',
    'scan.stop': 'Остановить',
    'scan.batch': 'Пакетный режим',
    'scan.torch': 'Фонарик',
    'scan.switch_camera': 'Сменить камеру',
    'medicine.name': 'Название',
    'medicine.manufacturer': 'Производитель',
    'medicine.country': 'Страна',
    'medicine.price': 'Цена',
    'medicine.prescription': 'По рецепту',
    'search.placeholder': 'Название, штрих-код или производитель...',
    'search.button': 'Найти',
    'search.empty': 'Ничего не найдено',
    'inventory.title': 'Склад',
    'inventory.add': 'Добавить',
    'inventory.in': 'Приход',
    'inventory.out': 'Расход',
    'inventory.low_stock': 'Мало',
    'inventory.empty': 'Закончилось',
    'history.title': 'История сканирований',
    'login.title': 'Вход',
    'login.password': 'Введите пароль',
    'login.submit': 'Войти',
    'login.face': 'Вход по лицу',
    'settings.theme': 'Тема',
    'settings.dark': 'Тёмная',
    'settings.light': 'Светлая',
    'settings.sound': 'Звук',
    'settings.vibration': 'Вибрация',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.back': 'Назад',
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успешно',
  },

  en: {
    'app.name': 'Pharmacy Scanner',
    'app.description': 'Medicine code scanner',
    'nav.scan': 'Scanner',
    'nav.search': 'Search',
    'nav.inventory': 'Inventory',
    'nav.history': 'History',
    'nav.admin': 'Admin',
    'nav.settings': 'Settings',
    'scan.start': 'Start Camera',
    'scan.stop': 'Stop',
    'scan.batch': 'Batch Mode',
    'scan.torch': 'Torch',
    'scan.switch_camera': 'Switch Camera',
    'medicine.name': 'Name',
    'medicine.manufacturer': 'Manufacturer',
    'medicine.country': 'Country',
    'medicine.price': 'Price',
    'medicine.prescription': 'Prescription',
    'search.placeholder': 'Medicine name, barcode, or manufacturer...',
    'search.button': 'Search',
    'search.empty': 'Nothing found',
    'inventory.title': 'Inventory',
    'inventory.add': 'Add',
    'inventory.in': 'Stock In',
    'inventory.out': 'Stock Out',
    'inventory.low_stock': 'Low Stock',
    'inventory.empty': 'Out of Stock',
    'history.title': 'Scan History',
    'login.title': 'Login',
    'login.password': 'Enter password',
    'login.submit': 'Login',
    'login.face': 'Face Login',
    'settings.theme': 'Theme',
    'settings.dark': 'Dark',
    'settings.light': 'Light',
    'settings.sound': 'Sound',
    'settings.vibration': 'Vibration',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
};

// Joriy til
let currentLocale: Locale = 'uz';

/**
 * Tilni o'zgartirish
 */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
  if (typeof window !== 'undefined') {
    localStorage.setItem('dorixona-locale', locale);
  }
}

/**
 * Joriy tilni olish
 */
export function getLocale(): Locale {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('dorixona-locale') as Locale;
    if (stored && translations[stored]) {
      return stored;
    }
  }
  return currentLocale;
}

/**
 * Tarjimani olish
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const locale = getLocale();
  let text = translations[locale]?.[key] || translations['uz']?.[key] || key;

  // Parametrlarni almashtirish: {name} → qiymat
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }

  return text;
}

/**
 * Til ro'yxati
 */
export const LOCALES: { id: Locale; label: string; flag: string }[] = [
  { id: 'uz', label: "O'zbek", flag: '🇺🇿' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
];
