// ═══════════════════════════════════════════
// O'zbekiston dorilari barcode bazasi
// 478 — O'zbekiston, 460 — Rossiya, boshqalar — import
// ═══════════════════════════════════════════

export interface BarcodeEntry {
  barcode: string;
  name: string;
  nameRu?: string;
  manufacturer?: string;
  country?: string;
  dosageForm?: string;
  activeSubstance?: string;
  dosage?: string;
  price?: number;
  category?: string;
  gopharmSlug?: string;
}

export const BARCODE_DATABASE: BarcodeEntry[] = [
  // ═══════════════════════════════════════
  // O'ZBEKISTON DORILARI (478...)
  // ═══════════════════════════════════════
  { barcode: '4780000370012', name: 'Paratsetamol', nameRu: 'Парацетамол', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Paratsetamol', dosage: '500mg', price: 4500, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4780000370029', name: 'Paratsetamol bolalar uchun', nameRu: 'Парацетамол детский', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Suspensiya', activeSubstance: 'Paratsetamol', dosage: '120mg/5ml', price: 12000, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4780000370036', name: 'Ibuprofen', nameRu: 'Ибупрофен', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Ibuprofen', dosage: '400mg', price: 7500, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4780000370043', name: 'Askorbin kislota', nameRu: 'Аскорбиновая кислота', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Vitamin C', dosage: '50mg', price: 3000, category: 'Vitamin' },
  { barcode: '4780000370050', name: 'Analgin', nameRu: 'Анальгин', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Metamizol natriy', dosage: '500mg', price: 4000, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4780000370067', name: 'No-shpa', nameRu: 'Но-шпа', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Drotaverin', dosage: '40mg', price: 8000, category: 'Spazmolitik' },
  { barcode: '4780000370074', name: 'Validol', nameRu: 'Валидол', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Mentol', dosage: '60mg', price: 3500, category: 'Yurak-qon tomir' },
  { barcode: '4780000370081', name: 'Korvalol', nameRu: 'Корвалол', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tomchi', activeSubstance: 'Etilbromizovalerianat', dosage: '25ml', price: 7000, category: 'Yurak-qon tomir' },
  { barcode: '4780000370098', name: 'Amoksitsillin', nameRu: 'Амоксициллин', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Kapsulasi', activeSubstance: 'Amoksitsillin', dosage: '500mg', price: 11000, category: 'Antibiotik' },
  { barcode: '4780000370104', name: 'Azitromitsin', nameRu: 'Азитромицин', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Azitromitsin', dosage: '500mg', price: 16000, category: 'Antibiotik' },
  { barcode: '4780000370111', name: 'Omeprazol', nameRu: 'Омепразол', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Kapsulasi', activeSubstance: 'Omeprazol', dosage: '20mg', price: 9000, category: 'Gastroenterologiya' },
  { barcode: '4780000370128', name: 'Loratadin', nameRu: 'Лоратадин', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Loratadin', dosage: '10mg', price: 5500, category: 'Antigistamin' },
  { barcode: '4780000370135', name: 'Suprastin', nameRu: 'Супрастин', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Xloropiramin', dosage: '25mg', price: 6000, category: 'Antigistamin' },
  { barcode: '4780000370142', name: 'Ambroksol', nameRu: 'Амброксол', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Ambroksol', dosage: '30mg', price: 5000, category: 'Terapevtik' },
  { barcode: '4780000370159', name: 'Mukaltin', nameRu: 'Мукалтин', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Altey ildizi', dosage: '50mg', price: 3000, category: 'Terapevtik' },
  { barcode: '4780000370166', name: 'Furazolidon', nameRu: 'Фуразолидон', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Furazolidon', dosage: '100mg', price: 4500, category: 'Antibiotik' },
  { barcode: '4780000370173', name: 'Metronidazol', nameRu: 'Метронидазол', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Metronidazol', dosage: '250mg', price: 5000, category: 'Antibiotik' },
  { barcode: '4780000370180', name: 'Diklofenak', nameRu: 'Диклофенак', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Diklofenak natriy', dosage: '50mg', price: 6000, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4780000370197', name: 'Nimesulid', nameRu: 'Нимесулид', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Nimesulid', dosage: '100mg', price: 7000, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4780000370203', name: 'Ranitidin', nameRu: 'Ранитидин', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Ranitidin', dosage: '150mg', price: 5500, category: 'Gastroenterologiya' },
  { barcode: '4780000370210', name: 'Deksametazon', nameRu: 'Дексаметазон', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Deksametazon', dosage: '0.5mg', price: 8000, category: 'Gormonal' },
  { barcode: '4780000370227', name: 'Prednizolon', nameRu: 'Преднизолон', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Prednizolon', dosage: '5mg', price: 6000, category: 'Gormonal' },
  { barcode: '4780000370234', name: 'Glyitsin', nameRu: 'Глицин', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Glyitsin', dosage: '100mg', price: 5000, category: 'Nerv tizimi' },
  { barcode: '4780000370241', name: 'Persen', nameRu: 'Персен', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Kapsulasi', activeSubstance: 'Valeriana + Melissa + Nana', dosage: '', price: 25000, category: 'Nerv tizimi' },
  { barcode: '4780000370258', name: 'Aktivan ugol', nameRu: 'Активированный уголь', manufacturer: 'Jurabek Laboratories', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Aktivan ugol', dosage: '250mg', price: 3000, category: 'Gastroenterologiya' },

  // ═══════════════════════════════════════
  // NOBEL PHARMSANOAT (478...)
  // ═══════════════════════════════════════
  { barcode: '4780000010015', name: 'Loratadin', nameRu: 'Лоратадин', manufacturer: 'Nobel Pharmsanoat', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Loratadin', dosage: '10mg', price: 6000, category: 'Antigistamin' },
  { barcode: '4780000010022', name: 'Tsetirizin', nameRu: 'Цетиризин', manufacturer: 'Nobel Pharmsanoat', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Tsetirizin', dosage: '10mg', price: 7000, category: 'Antigistamin' },
  { barcode: '4780000010039', name: 'Omeprazol', nameRu: 'Омепразол', manufacturer: 'Nobel Pharmsanoat', country: 'O\'zbekiston', dosageForm: 'Kapsulasi', activeSubstance: 'Omeprazol', dosage: '20mg', price: 10000, category: 'Gastroenterologiya' },
  { barcode: '4780000010046', name: 'Amoksitsillin', nameRu: 'Амоксициллин', manufacturer: 'Nobel Pharmsanoat', country: 'O\'zbekiston', dosageForm: 'Kapsulasi', activeSubstance: 'Amoksitsillin', dosage: '500mg', price: 12000, category: 'Antibiotik' },
  { barcode: '4780000010053', name: 'Paratsetamol', nameRu: 'Парацетамол', manufacturer: 'Nobel Pharmsanoat', country: 'O\'zbekiston', dosageForm: 'Tabletkasi', activeSubstance: 'Paratsetamol', dosage: '500mg', price: 5000, category: 'Og\'riq qoldiruvchi' },

  // ═══════════════════════════════════════
  // DENTAFILL PLUS (478...)
  // ═══════════════════════════════════════
  { barcode: '4780000130019', name: 'Paratsetamol DF', nameRu: 'Парацетамол ДФ', manufacturer: 'Dentafill Plus', country: 'O\'zbekiston', dosageForm: 'Shamcha', activeSubstance: 'Paratsetamol', dosage: '125mg', price: 6000, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4780000130026', name: 'Paratsetamol DF katta', nameRu: 'Парацетамол ДФ взрослый', manufacturer: 'Dentafill Plus', country: 'O\'zbekiston', dosageForm: 'Shamcha', activeSubstance: 'Paratsetamol', dosage: '250mg', price: 7000, category: 'Og\'riq qoldiruvchi' },

  // ═══════════════════════════════════════
  // ROSSIYA DORILARI (460...)
  // ═══════════════════════════════════════
  { barcode: '4607015470868', name: 'Paratsetamol', nameRu: 'Парацетамол', manufacturer: 'Татхимфармпрепараты', country: 'Rossiya', dosageForm: 'Tabletkasi', activeSubstance: 'Paratsetamol', dosage: '500mg', price: 5500, category: 'Og\'riq qoldiruvchi', gopharmSlug: 'paratsetamol-tab-500mg-no10' },
  { barcode: '4607033440143', name: 'Ibuprofen', nameRu: 'Ибупрофен', manufacturer: 'Hemofarm', country: 'Serbiya', dosageForm: 'Tabletkasi', activeSubstance: 'Ibuprofen', dosage: '400mg', price: 8200, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4607077810145', name: 'Amoksitsillin', nameRu: 'Амоксициллин', manufacturer: 'Sandoz', country: 'Avstriya', dosageForm: 'Kapsulasi', activeSubstance: 'Amoksitsillin', dosage: '500mg', price: 12500, category: 'Antibiotik' },
  { barcode: '4607053840367', name: 'Loratadin', nameRu: 'Лоратадин', manufacturer: 'Ozon', country: 'Rossiya', dosageForm: 'Tabletkasi', activeSubstance: 'Loratadin', dosage: '10mg', price: 6700, category: 'Antigistamin' },
  { barcode: '4607029551037', name: 'Omeprazol', nameRu: 'Омепразол', manufacturer: 'Stada', country: 'Rossiya', dosageForm: 'Kapsulasi', activeSubstance: 'Omeprazol', dosage: '20mg', price: 9800, category: 'Gastroenterologiya' },
  { barcode: '4607037650134', name: 'Mezim Forte', nameRu: 'Мезим Форте', manufacturer: 'Berlin-Chemie', country: 'Germaniya', dosageForm: 'Tabletkasi', activeSubstance: 'Pankreatin', dosage: '10000', price: 25000, category: 'Gastroenterologiya' },
  { barcode: '4607059490440', name: 'Validol', nameRu: 'Валидол', manufacturer: 'Фармстандарт', country: 'Rossiya', dosageForm: 'Tabletkasi', activeSubstance: 'Mentol', dosage: '60mg', price: 3500, category: 'Yurak-qon tomir' },
  { barcode: '4607088410017', name: 'Korvalol', nameRu: 'Корвалол', manufacturer: 'Фармстандарт', country: 'Rossiya', dosageForm: 'Tomchi', activeSubstance: 'Etilbromizovalerianat', dosage: '25ml', price: 8000, category: 'Yurak-qon tomir' },
  { barcode: '4607034460468', name: 'TeraFlu', nameRu: 'ТераФлю', manufacturer: 'Novartis', country: 'Shveytsariya', dosageForm: 'Paketcha', activeSubstance: 'Paratsetamol + Fenilefrin + Feniramin', dosage: '10 paket', price: 89600, category: 'Shamollash' },
  { barcode: '4607055870324', name: 'Strepsils', nameRu: 'Стрепсилс', manufacturer: 'Reckitt Benckiser', country: 'Buyuk Britaniya', dosageForm: 'Tabletkasi', activeSubstance: 'Amilmetakrezol', dosage: '', price: 35000, category: 'Shamollash' },
  { barcode: '4620763870718', name: 'Tsetrin', nameRu: 'Цетрин', manufacturer: 'Dr. Reddy\'s', country: 'Hindiston', dosageForm: 'Tabletkasi', activeSubstance: 'Tsetirizin', dosage: '10mg', price: 12000, category: 'Antigistamin' },
  { barcode: '4607033850015', name: 'Nurofen', nameRu: 'Нурофен', manufacturer: 'Reckitt Benckiser', country: 'Buyuk Britaniya', dosageForm: 'Tabletkasi', activeSubstance: 'Ibuprofen', dosage: '200mg', price: 15000, category: 'Og\'riq qoldiruvchi' },
  { barcode: '5000159484977', name: 'Citramon P', nameRu: 'Цитрамон П', manufacturer: 'Фармстандарт', country: 'Rossiya', dosageForm: 'Tabletkasi', activeSubstance: 'Paratsetamol + Kofein + ASA', dosage: '', price: 4500, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4607025490316', name: 'Glyitsin', nameRu: 'Глицин', manufacturer: 'Biotiki', country: 'Rossiya', dosageForm: 'Tabletkasi', activeSubstance: 'Glyitsin', dosage: '100mg', price: 8000, category: 'Nerv tizimi' },
  { barcode: '4607027860124', name: 'Supradyn', nameRu: 'Супрадин', manufacturer: 'Bayer', country: 'Germaniya', dosageForm: 'Tabletkasi', activeSubstance: 'Multivitaminlar', dosage: '', price: 65000, category: 'Vitamin' },
  { barcode: '4607027860131', name: 'Essentiale Forte N', nameRu: 'Эссенциале форте Н', manufacturer: 'Sanofi', country: 'Frantsiya', dosageForm: 'Kapsulasi', activeSubstance: 'Fosfolipidlar', dosage: '300mg', price: 176900, category: 'Gastroenterologiya' },
  { barcode: '4607042130114', name: 'Voltaren Emulgel', nameRu: 'Вольтарен Эмульгель', manufacturer: 'Novartis', country: 'Shveytsariya', dosageForm: 'Gel', activeSubstance: 'Diklofenak', dosage: '1%', price: 65600, category: 'Teri' },
  { barcode: '4607050230122', name: 'Bepanten', nameRu: 'Бепантен', manufacturer: 'Bayer', country: 'Germaniya', dosageForm: 'Krem', activeSubstance: 'Dekspantenol', dosage: '5%', price: 55000, category: 'Teri' },
  { barcode: '4607043870129', name: 'Vizin', nameRu: 'Визин', manufacturer: 'Johnson & Johnson', country: 'AQSH', dosageForm: 'Tomchi', activeSubstance: 'Tetrizolin', dosage: '15ml', price: 45000, category: 'Ko\'z' },
  { barcode: '4607036110226', name: 'ACC', nameRu: 'АЦЦ', manufacturer: 'Sandoz', country: 'Germaniya', dosageForm: 'Paketcha', activeSubstance: 'Asetilsistein', dosage: '200mg', price: 28000, category: 'Terapevtik' },
  { barcode: '4607044130319', name: 'Afobazol', nameRu: 'Афобазол', manufacturer: 'Фармстандарт', country: 'Rossiya', dosageForm: 'Tabletkasi', activeSubstance: 'Fabomotizol', dosage: '10mg', price: 109300, category: 'Nerv tizimi' },

  // ═══════════════════════════════════════
  // IMPORT DORILARI (boshqa mamlakatlar)
  // ═══════════════════════════════════════
  { barcode: '8901234567890', name: 'Azitral', nameRu: 'Азитрал', manufacturer: 'Alembic', country: 'Hindiston', dosageForm: 'Kapsulasi', activeSubstance: 'Azitromitsin', dosage: '250mg', price: 14000, category: 'Antibiotik' },
  { barcode: '8901234567891', name: 'Ciprofloxacin', nameRu: 'Ципрофлоксацин', manufacturer: 'Cipla', country: 'Hindiston', dosageForm: 'Tabletkasi', activeSubstance: 'Siprofloksatsin', dosage: '500mg', price: 12000, category: 'Antibiotik' },
  { barcode: '8901234567892', name: 'Metformin', nameRu: 'Метформин', manufacturer: 'USV', country: 'Hindiston', dosageForm: 'Tabletkasi', activeSubstance: 'Metformin', dosage: '500mg', price: 8000, category: 'Diabet' },
  { barcode: '8901234567893', name: 'Amlodipin', nameRu: 'Амлодипин', manufacturer: 'Cipla', country: 'Hindiston', dosageForm: 'Tabletkasi', activeSubstance: 'Amlodipin', dosage: '5mg', price: 9000, category: 'Yurak-qon tomir' },
  { barcode: '8901234567894', name: 'Enalapril', nameRu: 'Эналаприл', manufacturer: 'Hemofarm', country: 'Serbiya', dosageForm: 'Tabletkasi', activeSubstance: 'Enalapril', dosage: '10mg', price: 7000, category: 'Yurak-qon tomir' },
  { barcode: '8901234567895', name: 'Atorvastatin', nameRu: 'Аторвастатин', manufacturer: 'Cipla', country: 'Hindiston', dosageForm: 'Tabletkasi', activeSubstance: 'Atorvastatin', dosage: '10mg', price: 15000, category: 'Yurak-qon tomir' },
  { barcode: '8901234567896', name: 'Omeprazol', nameRu: 'Омепразол', manufacturer: 'Sun Pharma', country: 'Hindiston', dosageForm: 'Kapsulasi', activeSubstance: 'Omeprazol', dosage: '20mg', price: 8000, category: 'Gastroenterologiya' },
  { barcode: '8901234567897', name: 'Pantoprazol', nameRu: 'Пантопразол', manufacturer: 'Sun Pharma', country: 'Hindiston', dosageForm: 'Tabletkasi', activeSubstance: 'Pantoprazol', dosage: '40mg', price: 12000, category: 'Gastroenterologiya' },
  { barcode: '8901234567898', name: 'Deksametazon', nameRu: 'Дексаметазон', manufacturer: 'Cadila', country: 'Hindiston', dosageForm: 'Tabletkasi', activeSubstance: 'Deksametazon', dosage: '0.5mg', price: 5000, category: 'Gormonal' },
  { barcode: '8901234567899', name: 'Diklofenak', nameRu: 'Диклофенак', manufacturer: 'Cipla', country: 'Hindiston', dosageForm: 'Tabletkasi', activeSubstance: 'Diklofenak', dosage: '50mg', price: 5500, category: 'Og\'riq qoldiruvchi' },
  { barcode: '8699526110014', name: 'Augmentin', nameRu: 'Аугментин', manufacturer: 'GSK', country: 'Buyuk Britaniya', dosageForm: 'Tabletkasi', activeSubstance: 'Amoksitsillin + Klavulanat', dosage: '625mg', price: 35000, category: 'Antibiotik' },
  { barcode: '8699526110021', name: 'Amoksisar', nameRu: 'Амоксисар', manufacturer: 'BIOFARMA', country: 'Turkiya', dosageForm: 'Kapsulasi', activeSubstance: 'Amoksitsillin', dosage: '500mg', price: 10000, category: 'Antibiotik' },
  { barcode: '5909990000126', name: 'Polopiryna', nameRu: 'Полопирина', manufacturer: 'Polpharma', country: 'Polsha', dosageForm: 'Tabletkasi', activeSubstance: 'Asetilsalitsil kislota', dosage: '500mg', price: 5000, category: 'Og\'riq qoldiruvchi' },

  // ═══════════════════════════════════════
  // BOSHQA KO'P UCHRAYDIGAN DORILAR
  // ═══════════════════════════════════════
  { barcode: '4780000990001', name: 'Fosfogliv', nameRu: 'Фосфоглив', manufacturer: 'Pharmstandard', country: 'Rossiya', dosageForm: 'Kapsulasi', activeSubstance: 'Fosfolipidlar + Glitsirrin', dosage: '', price: 85000, category: 'Gastroenterologiya' },
  { barcode: '4780000990002', name: 'Arbidol', nameRu: 'Арбидол', manufacturer: 'Pharmstandard', country: 'Rossiya', dosageForm: 'Kapsulasi', activeSubstance: 'Umifenovir', dosage: '100mg', price: 45000, category: 'Shamollash' },
  { barcode: '4780000990003', name: 'Kagotsel', nameRu: 'Кагоцел', manufacturer: 'Nearmedic', country: 'Rossiya', dosageForm: 'Tabletkasi', activeSubstance: 'Kagotsel', dosage: '12mg', price: 38000, category: 'Shamollash' },
  { barcode: '4780000990004', name: 'Ingavirin', nameRu: 'Ингавирин', manufacturer: 'Valenta', country: 'Rossiya', dosageForm: 'Kapsulasi', activeSubstance: 'Imidazoletanamid', dosage: '60mg', price: 55000, category: 'Shamollash' },
  { barcode: '4780000990005', name: 'Viferon', nameRu: 'Виферон', manufacturer: 'Feron', country: 'Rossiya', dosageForm: 'Shamcha', activeSubstance: 'Interferon', dosage: '1500000 IU', price: 35000, category: 'Shamollash' },
  { barcode: '4780000990006', name: 'Panadol', nameRu: 'Панадол', manufacturer: 'GSK', country: 'Buyuk Britaniya', dosageForm: 'Tabletkasi', activeSubstance: 'Paratsetamol', dosage: '500mg', price: 12000, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4780000990007', name: 'Efferalgan', nameRu: 'Эффералган', manufacturer: 'Bristol-Myers Squibb', country: 'Frantsiya', dosageForm: 'Shamcha', activeSubstance: 'Paratsetamol', dosage: '150mg', price: 18000, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4780000990008', name: 'Nurofen bolalar', nameRu: 'Нурофен для детей', manufacturer: 'Reckitt Benckiser', country: 'Buyuk Britaniya', dosageForm: 'Suspensiya', activeSubstance: 'Ibuprofen', dosage: '100mg/5ml', price: 54000, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4780000990009', name: 'Smecta', nameRu: 'Смекта', manufacturer: 'Beaufour Ipsen', country: 'Frantsiya', dosageForm: 'Paketcha', activeSubstance: 'Diosmektit', dosage: '3g', price: 22000, category: 'Gastroenterologiya' },
  { barcode: '4780000990010', name: 'Linex', nameRu: 'Линекс', manufacturer: 'Sandoz', country: 'Sloveniya', dosageForm: 'Kapsulasi', activeSubstance: 'Probiotiklar', dosage: '', price: 45000, category: 'Gastroenterologiya' },
  { barcode: '4780000990011', name: 'Dialak Forte', nameRu: 'Диалак Форте', manufacturer: 'Alcala Farma', country: 'Ispaniya', dosageForm: 'Kapsulasi', activeSubstance: 'Probiotiklar', dosage: '240mg', price: 70300, category: 'Gastroenterologiya' },
  { barcode: '4780000990012', name: 'Espumizan', nameRu: 'Эспумизан', manufacturer: 'Berlin-Chemie', country: 'Germaniya', dosageForm: 'Kapsulasi', activeSubstance: 'Simetikon', dosage: '40mg', price: 28000, category: 'Gastroenterologiya' },
  { barcode: '4780000990013', name: 'Loperamid', nameRu: 'Лоперамид', manufacturer: 'Stada', country: 'Rossiya', dosageForm: 'Tabletkasi', activeSubstance: 'Loperamid', dosage: '2mg', price: 5000, category: 'Gastroenterologiya' },
  { barcode: '4780000990014', name: 'No-shpa Forte', nameRu: 'Но-шпа Форте', manufacturer: 'Sanofi', country: 'Vengriya', dosageForm: 'Tabletkasi', activeSubstance: 'Drotaverin', dosage: '80mg', price: 22000, category: 'Spazmolitik' },
  { barcode: '4780000990015', name: 'Spazmalgon', nameRu: 'Спазмалгон', manufacturer: 'Hemofarm', country: 'Serbiya', dosageForm: 'Tabletkasi', activeSubstance: 'Metamizol + Pitofenon', dosage: '', price: 15000, category: 'Spazmolitik' },
  { barcode: '4780000990016', name: 'Baralgin', nameRu: 'Баралгин', manufacturer: 'Sanofi', country: 'Vengriya', dosageForm: 'Tabletkasi', activeSubstance: 'Metamizol + Pitofenon + Fenpiveriniy', dosage: '', price: 18000, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4780000990017', name: 'Ketanov', nameRu: 'Кетанов', manufacturer: 'Ranbaxy', country: 'Hindiston', dosageForm: 'Tabletkasi', activeSubstance: 'Ketorolak', dosage: '10mg', price: 15000, category: 'Og\'riq qoldiruvchi' },
  { barcode: '4780000990018', name: 'Diklofenak gel', nameRu: 'Диклофенак гель', manufacturer: 'Hemofarm', country: 'Serbiya', dosageForm: 'Gel', activeSubstance: 'Diklofenak', dosage: '1%', price: 12000, category: 'Teri' },
  { barcode: '4780000990019', name: 'Finalgon', nameRu: 'Финалгон', manufacturer: 'Boehringer Ingelheim', country: 'Avstriya', dosageForm: 'Maz', activeSubstance: 'Nonivamid + Nikoboksil', dosage: '', price: 35000, category: 'Teri' },
  { barcode: '4780000990020', name: 'Menovazin', nameRu: 'Меновазин', manufacturer: 'Tula Pharmaceutical', country: 'Rossiya', dosageForm: 'Erigma', activeSubstance: 'Mentol + Novokain + Anestezin', dosage: '40ml', price: 5000, category: 'Teri' },
];

/**
 * Barcode bo'yicha dori qidirish
 */
export function findMedicineByBarcodeLocal(barcode: string): BarcodeEntry | null {
  const cleaned = barcode.replace(/\s/g, '');

  // To'g'ridan-to'g'ri barcode
  const exact = BARCODE_DATABASE.find((e) => e.barcode === cleaned);
  if (exact) return exact;

  // GTIN → EAN-13
  if (cleaned.length === 14 && cleaned.startsWith('0')) {
    const ean13 = cleaned.substring(1);
    const found = BARCODE_DATABASE.find((e) => e.barcode === ean13);
    if (found) return found;
  }

  // EAN-13 → GTIN
  if (cleaned.length === 13) {
    const gtin = '0' + cleaned;
    const found = BARCODE_DATABASE.find((e) => e.barcode === gtin);
    if (found) return found;
  }

  return null;
}

/**
 * Nomi bo'yicha qidirish
 */
export function findMedicineByNameLocal(query: string): BarcodeEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return BARCODE_DATABASE.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.nameRu?.toLowerCase().includes(q) ||
      e.manufacturer?.toLowerCase().includes(q) ||
      e.activeSubstance?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q)
  );
}

/**
 * Barcha dorilar
 */
export function getAllMedicines(): BarcodeEntry[] {
  return BARCODE_DATABASE;
}

/**
 * Kategoriyalar
 */
export function getCategories(): string[] {
  const cats = new Set(BARCODE_DATABASE.map((e) => e.category).filter(Boolean));
  return Array.from(cats) as string[];
}
