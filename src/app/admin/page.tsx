'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Plus,
  Search,
  Edit3,
  Trash2,
  Save,
  X,
  Pill,
  Tag,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link2,
  Package,
} from 'lucide-react';
import { playBeep } from '@/lib/api';
import type { Medicine, MedicineGtin } from '@/types';

interface MedicineForm {
  barcode: string;
  name: string;
  nameRu: string;
  manufacturer: string;
  country: string;
  dosageForm: string;
  activeSubstance: string;
  dosage: string;
  price: string;
  category: string;
  prescription: boolean;
}

const emptyForm: MedicineForm = {
  barcode: '',
  name: '',
  nameRu: '',
  manufacturer: '',
  country: '',
  dosageForm: '',
  activeSubstance: '',
  dosage: '',
  price: '',
  category: '',
  prescription: false,
};

export default function AdminPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MedicineForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showGtinForm, setShowGtinForm] = useState<string | null>(null);
  const [gtinForm, setGtinForm] = useState({ gtin: '', serial: '', expiry: '', batch: '' });

  // Dorilarni yuklash
  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/medicines?page=1&pageSize=100');
      const data = await res.json();
      if (data.success) {
        setMedicines(data.data.items);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // Dori qo'shish/tahrirlash
  const handleSave = async () => {
    if (!form.barcode || !form.name) {
      setMessage({ type: 'error', text: "Barcode va nom kiritish shart" });
      return;
    }

    setSaving(true);
    try {
      const body = {
        ...form,
        price: form.price ? parseFloat(form.price) : null,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/medicines/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/medicines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcode: form.barcode }),
        });
      }

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: editingId ? 'Dori yangilandi' : "Dori qo'shildi" });
        playBeep('success');
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        await loadMedicines();
      } else {
        setMessage({ type: 'error', text: data.error || 'Xatolik' });
        playBeep('error');
      }
    } catch {
      setMessage({ type: 'error', text: 'Server xatoligi' });
      playBeep('error');
    } finally {
      setSaving(false);
    }
  };

  // Dori o'chirish
  const handleDelete = async (id: string) => {
    if (!confirm("Rostdan o'chirmoqchimisiz?")) return;

    try {
      const res = await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
      if (res.ok) {
        playBeep('success');
        await loadMedicines();
      }
    } catch {}
  };

  // Tahrirlashni boshlash
  const startEdit = (medicine: Medicine) => {
    setForm({
      barcode: medicine.barcode,
      name: medicine.name,
      nameRu: medicine.nameRu || '',
      manufacturer: medicine.manufacturer || '',
      country: medicine.country || '',
      dosageForm: medicine.dosageForm || '',
      activeSubstance: medicine.activeSubstance || '',
      dosage: medicine.dosage || '',
      price: medicine.price?.toString() || '',
      category: medicine.category || '',
      prescription: medicine.prescription,
    });
    setEditingId(medicine.id);
    setShowForm(true);
  };

  // GTIN qo'shish
  const handleAddGtin = async () => {
    if (!showGtinForm || !gtinForm.gtin) return;

    try {
      const res = await fetch(`/api/medicines/${showGtinForm}/gtins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gtinForm),
      });

      const data = await res.json();
      if (data.success) {
        playBeep('success');
        setShowGtinForm(null);
        setGtinForm({ gtin: '', serial: '', expiry: '', batch: '' });
        await loadMedicines();
      } else {
        setMessage({ type: 'error', text: data.error || 'Xatolik' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Server xatoligi' });
    }
  };

  // Filtr
  const filtered = medicines.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.barcode.includes(q) ||
      m.manufacturer?.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          <a href="/" className="p-2 rounded-xl hover:bg-card-hover">
            <ChevronLeft size={20} className="text-muted" />
          </a>
          <Settings size={20} className="text-primary" />
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <span className="text-xs bg-muted/20 text-muted px-2 py-0.5 rounded-full ml-auto">
            {medicines.length} dori
          </span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Xabar */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`rounded-xl p-3 flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-success/10 border border-success/30 text-success'
                  : 'bg-danger/10 border border-danger/30 text-danger'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span className="text-sm">{message.text}</span>
              <button onClick={() => setMessage(null)} className="ml-auto">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Qidiruv + Qo'shish */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Dori qidirish..."
              className="w-full h-12 bg-card border border-border rounded-xl pl-11 pr-4 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
            }}
            className="h-12 px-5 bg-primary text-white rounded-xl font-semibold flex items-center gap-2"
          >
            <Plus size={18} />
            Qo&apos;shish
          </motion.button>
        </div>

        {/* Dori form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-card rounded-2xl border border-border p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Pill size={18} className="text-primary" />
                  {editingId ? 'Dorini tahrirlash' : "Yangi dori qo'shish"}
                </h2>
                <button onClick={() => setShowForm(false)}>
                  <X size={20} className="text-muted" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Barcode *" value={form.barcode} onChange={(v) => setForm({ ...form, barcode: v })} placeholder="EAN-13" />
                <FormField label="Nomi *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Paratsetamol" />
                <FormField label="Ruscha nomi" value={form.nameRu} onChange={(v) => setForm({ ...form, nameRu: v })} placeholder="Парацетамол" />
                <FormField label="Ishlab chiqaruvchi" value={form.manufacturer} onChange={(v) => setForm({ ...form, manufacturer: v })} placeholder="Pharmstandard" />
                <FormField label="Mamlakat" value={form.country} onChange={(v) => setForm({ ...form, country: v })} placeholder="Rossiya" />
                <FormField label="Shakli" value={form.dosageForm} onChange={(v) => setForm({ ...form, dosageForm: v })} placeholder="Tabletkasi" />
                <FormField label="Faol modda" value={form.activeSubstance} onChange={(v) => setForm({ ...form, activeSubstance: v })} placeholder="Paratsetamol" />
                <FormField label="Dozasi" value={form.dosage} onChange={(v) => setForm({ ...form, dosage: v })} placeholder="500mg" />
                <FormField label="Narxi (so'm)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} placeholder="5500" type="number" />
                <FormField label="Kategoriya" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="Og'riq qoldiruvchi" />
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.prescription}
                  onChange={(e) => setForm({ ...form, prescription: e.target.checked })}
                  className="rounded border-border"
                />
                Retsept bilan beriladi
              </label>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-12 bg-success text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="h-12 px-6 bg-card-hover rounded-xl text-muted"
                >
                  Bekor qilish
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dorilar ro'yxati */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={64} className="mx-auto mb-4 text-muted opacity-20" />
            <p className="text-muted">Dorilar topilmadi</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((medicine) => (
              <motion.div
                key={medicine.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{medicine.name}</h3>
                    {medicine.nameRu && (
                      <p className="text-xs text-muted">{medicine.nameRu}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-mono">
                        {medicine.barcode}
                      </span>
                      {medicine.manufacturer && (
                        <span className="text-[10px] bg-card-hover text-muted px-2 py-0.5 rounded-full">
                          {medicine.manufacturer}
                        </span>
                      )}
                      {medicine.price && (
                        <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded-full">
                          {new Intl.NumberFormat('uz-UZ').format(medicine.price)} so&apos;m
                        </span>
                      )}
                      {medicine.prescription && (
                        <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                          Retsept
                        </span>
                      )}
                    </div>

                    {/* GTIN lar */}
                    {medicine.gtins && medicine.gtins.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {medicine.gtins.slice(0, 3).map((g) => (
                          <span
                            key={g.id}
                            className="text-[9px] bg-background rounded px-1.5 py-0.5 font-mono text-muted"
                          >
                            {g.gtin}
                          </span>
                        ))}
                        {medicine.gtins.length > 3 && (
                          <span className="text-[9px] text-muted">
                            +{medicine.gtins.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => setShowGtinForm(medicine.id)}
                      className="p-2 rounded-lg hover:bg-primary/10 text-muted hover:text-primary"
                      title="GTIN qo'shish"
                    >
                      <Tag size={14} />
                    </button>
                    <button
                      onClick={() => startEdit(medicine)}
                      className="p-2 rounded-lg hover:bg-primary/10 text-muted hover:text-primary"
                      title="Tahrirlash"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(medicine.id)}
                      className="p-2 rounded-lg hover:bg-danger/10 text-muted hover:text-danger"
                      title="O'chirish"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* GTIN form */}
                <AnimatePresence>
                  {showGtinForm === medicine.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-border space-y-2"
                    >
                      <p className="text-xs text-muted flex items-center gap-1">
                        <Link2 size={12} />
                        GTIN qo&apos;shish
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={gtinForm.gtin}
                          onChange={(e) => setGtinForm({ ...gtinForm, gtin: e.target.value })}
                          placeholder="GTIN (14 raqam)"
                          className="h-9 bg-background rounded-lg px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <input
                          value={gtinForm.serial}
                          onChange={(e) => setGtinForm({ ...gtinForm, serial: e.target.value })}
                          placeholder="Serial"
                          className="h-9 bg-background rounded-lg px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <input
                          value={gtinForm.expiry}
                          onChange={(e) => setGtinForm({ ...gtinForm, expiry: e.target.value })}
                          placeholder="Expiry (YYMMDD)"
                          className="h-9 bg-background rounded-lg px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <input
                          value={gtinForm.batch}
                          onChange={(e) => setGtinForm({ ...gtinForm, batch: e.target.value })}
                          placeholder="Batch"
                          className="h-9 bg-background rounded-lg px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddGtin}
                          className="h-8 px-4 bg-success text-white rounded-lg text-xs font-medium"
                        >
                          Qo&apos;shish
                        </button>
                        <button
                          onClick={() => setShowGtinForm(null)}
                          className="h-8 px-4 bg-card-hover text-muted rounded-lg text-xs"
                        >
                          Bekor
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ═══ Form Field ═══
function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
