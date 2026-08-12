'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowDown,
  ArrowUp,
  RotateCcw,
  Trash2,
  Edit3,
  Save,
  X,
  MapPin,
  Banknote,
} from 'lucide-react';
import { playBeep } from '@/lib/api';

interface InventoryItem {
  id: string;
  medicineId: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number | null;
  buyPrice: number | null;
  sellPrice: number | null;
  location: string | null;
  shelf: string | null;
  lastRestockAt: string | null;
  lastSoldAt: string | null;
  medicine: {
    id: string;
    name: string;
    nameRu: string | null;
    barcode: string;
    manufacturer: string | null;
    price: number | null;
    dosageForm: string | null;
    dosage: string | null;
  };
  transactions: any[];
}

type TransactionType = 'IN' | 'OUT' | 'ADJUST' | 'EXPIRED' | 'DAMAGED' | 'RETURN';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'empty'>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showTransaction, setShowTransaction] = useState<{ itemId: string; type: TransactionType } | null>(null);
  const [transQuantity, setTransQuantity] = useState('');
  const [transNote, setTransNote] = useState('');
  const [transPrice, setTransPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ barcode: '', quantity: '0', minQuantity: '5', buyPrice: '', sellPrice: '', location: '' });
  const [stats, setStats] = useState({ totalItems: 0, lowStockCount: 0, totalQuantity: 0 });

  // Yuklash
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory?page=1&pageSize=200');
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items);
        setStats(data.data.stats);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // Filtr
  const filtered = items.filter((item) => {
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        item.medicine.name.toLowerCase().includes(q) ||
        item.medicine.barcode.includes(q) ||
        item.medicine.manufacturer?.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Filter
    if (filter === 'low') {
      return item.quantity > 0 && item.quantity <= item.minQuantity;
    }
    if (filter === 'empty') {
      return item.quantity === 0;
    }

    return true;
  });

  // Statistika
  const lowStockItems = items.filter((i) => i.quantity > 0 && i.quantity <= i.minQuantity);
  const emptyItems = items.filter((i) => i.quantity === 0);
  const totalValue = items.reduce((sum, i) => sum + (i.quantity * (i.sellPrice || i.medicine?.price || 0)), 0);

  // Transaksiya
  const handleTransaction = async () => {
    if (!showTransaction || !transQuantity) return;

    setSaving(true);
    try {
      const res = await fetch('/api/inventory/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: showTransaction.itemId,
          type: showTransaction.type,
          quantity: parseInt(transQuantity),
          unitPrice: transPrice ? parseFloat(transPrice) : undefined,
          note: transNote || undefined,
          performedBy: 'Dorixonachi',
        }),
      });

      const data = await res.json();
      if (data.success) {
        playBeep('success');
        if (data.data.warning) {
          setMessage({ type: 'warning', text: data.data.warning });
        } else {
          setMessage({ type: 'success', text: data.message });
        }
        setShowTransaction(null);
        setTransQuantity('');
        setTransNote('');
        setTransPrice('');
        await loadInventory();
      } else {
        setMessage({ type: 'error', text: data.error });
        playBeep('error');
      }
    } catch {
      setMessage({ type: 'error', text: 'Xatolik' });
    } finally {
      setSaving(false);
    }
  };

  // Omborga qo'shish (barcode bilan)
  const handleAddItem = async () => {
    if (!newItem.barcode) return;

    setSaving(true);
    try {
      // Avval dorini topish yoki yaratish
      let medicineId: string;

      const medRes = await fetch(`/api/medicines/barcode/${newItem.barcode}`);
      const medData = await medRes.json();

      if (medData.success) {
        medicineId = medData.data.id;
      } else {
        // Scraping qilish
        const createRes = await fetch('/api/medicines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcode: newItem.barcode }),
        });
        const createData = await createRes.json();
        if (!createData.success) {
          setMessage({ type: 'error', text: "Dori topilmadi va yaratib bo'lmadi" });
          setSaving(false);
          return;
        }
        medicineId = createData.data.id;
      }

      // Omborga qo'shish
      const invRes = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId,
          quantity: parseInt(newItem.quantity) || 0,
          minQuantity: parseInt(newItem.minQuantity) || 5,
          buyPrice: newItem.buyPrice ? parseFloat(newItem.buyPrice) : undefined,
          sellPrice: newItem.sellPrice ? parseFloat(newItem.sellPrice) : undefined,
          location: newItem.location || undefined,
        }),
      });

      const invData = await invRes.json();
      if (invData.success) {
        playBeep('success');
        setMessage({ type: 'success', text: "Omborga qo'shildi!" });
        setShowAddForm(false);
        setNewItem({ barcode: '', quantity: '0', minQuantity: '5', buyPrice: '', sellPrice: '', location: '' });
        await loadInventory();
      } else {
        setMessage({ type: 'error', text: invData.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Xatolik' });
    } finally {
      setSaving(false);
    }
  };

  const transLabels: Record<TransactionType, { label: string; icon: any; color: string }> = {
    IN: { label: 'Kirish', icon: ArrowDown, color: 'text-success bg-success/20' },
    OUT: { label: 'Chiqish', icon: ArrowUp, color: 'text-primary bg-primary/20' },
    ADJUST: { label: 'Tuzatish', icon: RotateCcw, color: 'text-accent bg-accent/20' },
    EXPIRED: { label: "Muddati o'tdi", icon: XCircle, color: 'text-danger bg-danger/20' },
    DAMAGED: { label: 'Shikastlandi', icon: Trash2, color: 'text-danger bg-danger/20' },
    RETURN: { label: 'Qaytarildi', icon: RotateCcw, color: 'text-purple-400 bg-purple-400/20' },
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          <a href="/" className="p-2 rounded-xl hover:bg-card-hover">
            <ChevronLeft size={20} className="text-muted" />
          </a>
          <Package size={20} className="text-primary" />
          <h1 className="text-lg font-bold">Omborxona</h1>
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
                  : message.type === 'warning'
                  ? 'bg-accent/10 border border-accent/30 text-accent'
                  : 'bg-danger/10 border border-danger/30 text-danger'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span className="text-sm flex-1">{message.text}</span>
              <button onClick={() => setMessage(null)}><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistika kartochkalari */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={Package}
            label="Jami"
            value={items.length}
            color="text-primary"
            bg="bg-primary/10"
          />
          <StatCard
            icon={AlertTriangle}
            label="Kam qolgan"
            value={lowStockItems.length}
            color="text-accent"
            bg="bg-accent/10"
            alert={lowStockItems.length > 0}
          />
          <StatCard
            icon={XCircle}
            label="Tugagan"
            value={emptyItems.length}
            color="text-danger"
            bg="bg-danger/10"
            alert={emptyItems.length > 0}
          />
        </div>

        {/* Jami qiymat */}
        <div className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote size={18} className="text-success" />
            <span className="text-sm text-muted">Ombor qiymati</span>
          </div>
          <span className="text-lg font-bold text-success">
            {new Intl.NumberFormat('uz-UZ').format(totalValue)} so&apos;m
          </span>
        </div>

        {/* Qidiruv + Filter */}
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
            onClick={() => setShowAddForm(true)}
            className="h-12 px-5 bg-success text-white rounded-xl font-semibold flex items-center gap-2"
          >
            <Plus size={18} />
            Qo&apos;shish
          </motion.button>
        </div>

        {/* Filter tugmalari */}
        <div className="flex gap-2">
          {[
            { id: 'all' as const, label: `Hammasi (${items.length})` },
            { id: 'low' as const, label: `Kam qolgan (${lowStockItems.length})` },
            { id: 'empty' as const, label: `Tugagan (${emptyItems.length})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-primary text-white'
                  : 'bg-card text-muted hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Omborga qo'shish form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-card rounded-2xl border border-border p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Plus size={18} className="text-success" />
                  Omborga qo&apos;shish
                </h2>
                <button onClick={() => setShowAddForm(false)}><X size={18} className="text-muted" /></button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-muted mb-1 block">Barcode *</label>
                  <input
                    value={newItem.barcode}
                    onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
                    placeholder="EAN-13 yoki DataMatrix"
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Miqdori</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Min. ogohlantirish</label>
                  <input
                    type="number"
                    value={newItem.minQuantity}
                    onChange={(e) => setNewItem({ ...newItem, minQuantity: e.target.value })}
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Sotib olish narxi</label>
                  <input
                    type="number"
                    value={newItem.buyPrice}
                    onChange={(e) => setNewItem({ ...newItem, buyPrice: e.target.value })}
                    placeholder="so&apos;m"
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Sotish narxi</label>
                  <input
                    type="number"
                    value={newItem.sellPrice}
                    onChange={(e) => setNewItem({ ...newItem, sellPrice: e.target.value })}
                    placeholder="so&apos;m"
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted mb-1 block">Joylashuv</label>
                  <input
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    placeholder="Masalan: 2-taxta, 3-qator"
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                onClick={handleAddItem}
                disabled={!newItem.barcode || saving}
                className="w-full h-12 bg-success text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Saqlanmoqda...' : "Omborga qo'shish"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaksiya form */}
        <AnimatePresence>
          {showTransaction && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-card rounded-2xl border border-border p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  {(() => {
                    const Icon = transLabels[showTransaction.type].icon;
                    return <Icon size={18} className={transLabels[showTransaction.type].color.split(' ')[0]} />;
                  })()}
                  {transLabels[showTransaction.type].label}
                </h2>
                <button onClick={() => setShowTransaction(null)}><X size={18} className="text-muted" /></button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted mb-1 block">Miqdori *</label>
                  <input
                    type="number"
                    value={transQuantity}
                    onChange={(e) => setTransQuantity(e.target.value)}
                    placeholder="0"
                    min="1"
                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                {(showTransaction.type === 'OUT' || showTransaction.type === 'IN') && (
                  <div>
                    <label className="text-xs text-muted mb-1 block">Narx (so&apos;m)</label>
                    <input
                      type="number"
                      value={transPrice}
                      onChange={(e) => setTransPrice(e.target.value)}
                      placeholder="ixtiyoriy"
                      className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-muted mb-1 block">Izoh</label>
                <input
                  value={transNote}
                  onChange={(e) => setTransNote(e.target.value)}
                  placeholder="ixtiyoriy"
                  className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                onClick={handleTransaction}
                disabled={!transQuantity || saving}
                className="w-full h-12 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {saving ? 'Saqlanmoqda...' : 'Tasdiqlash'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ombor ro'yxati */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={64} className="mx-auto mb-4 text-muted opacity-20" />
            <p className="text-muted">{searchQuery ? "Topilmadi" : "Ombor bo'sh"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => {
              const isExpanded = expandedItem === item.id;
              const isLow = item.quantity > 0 && item.quantity <= item.minQuantity;
              const isEmpty = item.quantity === 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`bg-card rounded-xl border overflow-hidden transition-colors ${
                    isEmpty
                      ? 'border-danger/30'
                      : isLow
                      ? 'border-accent/30'
                      : 'border-border'
                  }`}
                >
                  {/* Asosiy qator */}
                  <div
                    onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                    className="p-4 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">{item.medicine.name}</h3>
                          {isEmpty && (
                            <span className="text-[9px] bg-danger/20 text-danger px-1.5 py-0.5 rounded-full font-bold">
                              TUGADI
                            </span>
                          )}
                          {isLow && (
                            <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-bold">
                              KAM
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-background text-muted px-1.5 py-0.5 rounded font-mono">
                            {item.medicine.barcode}
                          </span>
                          {item.medicine.manufacturer && (
                            <span className="text-[10px] text-muted">
                              {item.medicine.manufacturer}
                            </span>
                          )}
                          {item.location && (
                            <span className="text-[10px] text-muted flex items-center gap-0.5">
                              <MapPin size={8} /> {item.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${
                            isEmpty ? 'text-danger' : isLow ? 'text-accent' : 'text-foreground'
                          }`}>
                            {item.quantity}
                          </p>
                          <p className="text-[9px] text-muted">min: {item.minQuantity}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-muted" />
                        ) : (
                          <ChevronDown size={16} className="text-muted" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Kengaytirilgan qism */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                          {/* Narx ma'lumotlari */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {item.buyPrice && (
                              <div className="bg-background rounded-lg px-3 py-2">
                                <span className="text-muted">Sotib olish</span>
                                <p className="font-semibold text-foreground">
                                  {new Intl.NumberFormat('uz-UZ').format(item.buyPrice)} so&apos;m
                                </p>
                              </div>
                            )}
                            {item.sellPrice && (
                              <div className="bg-background rounded-lg px-3 py-2">
                                <span className="text-muted">Sotish</span>
                                <p className="font-semibold text-success">
                                  {new Intl.NumberFormat('uz-UZ').format(item.sellPrice)} so&apos;m
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Oxirgi transaksiyalar */}
                          {item.transactions.length > 0 && (
                            <div>
                              <p className="text-[10px] text-muted uppercase tracking-wider mb-1.5">
                                Oxirgi harakatlar
                              </p>
                              <div className="space-y-1">
                                {item.transactions.slice(0, 3).map((t: any) => (
                                  <div key={t.id} className="flex items-center justify-between text-xs bg-background rounded-lg px-3 py-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                        transLabels[t.type as TransactionType]?.color || 'bg-muted/20 text-muted'
                                      }`}>
                                        {t.type}
                                      </span>
                                      <span className="text-muted">{t.reason || t.note || ''}</span>
                                    </div>
                                    <span className={t.quantity > 0 ? 'text-success' : 'text-danger'}>
                                      {t.quantity > 0 ? '+' : ''}{t.quantity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Amallar tugmalari */}
                          <div className="grid grid-cols-4 gap-2">
                            <ActionButton
                              icon={ArrowDown}
                              label="Kirish"
                              color="bg-success/10 text-success"
                              onClick={() => {
                                setShowTransaction({ itemId: item.id, type: 'IN' });
                                setTransQuantity('');
                              }}
                            />
                            <ActionButton
                              icon={ArrowUp}
                              label="Chiqish"
                              color="bg-primary/10 text-primary"
                              onClick={() => {
                                setShowTransaction({ itemId: item.id, type: 'OUT' });
                                setTransQuantity('');
                              }}
                            />
                            <ActionButton
                              icon={RotateCcw}
                              label="Tuzatish"
                              color="bg-accent/10 text-accent"
                              onClick={() => {
                                setShowTransaction({ itemId: item.id, type: 'ADJUST' });
                                setTransQuantity(item.quantity.toString());
                              }}
                            />
                            <ActionButton
                              icon={XCircle}
                              label="Muddati o&apos;tdi"
                              color="bg-danger/10 text-danger"
                              onClick={() => {
                                setShowTransaction({ itemId: item.id, type: 'EXPIRED' });
                                setTransQuantity(item.quantity.toString());
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

// ═══ Komponentlar ═══

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
  alert,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  bg: string;
  alert?: boolean;
}) {
  return (
    <div className={`bg-card rounded-xl p-4 border ${alert ? 'border-accent/30' : 'border-border'}`}>
      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
        <Icon size={16} className={color} />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: any;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2 rounded-xl ${color} transition-colors hover:opacity-80`}
    >
      <Icon size={16} />
      <span className="text-[9px] font-medium">{label}</span>
    </motion.button>
  );
}
