'use client';

import { motion } from 'framer-motion';
import {
  Pill,
  MapPin,
  Building2,
  Banknote,
  ShieldCheck,
  Tag,
  ExternalLink,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';
import type { Medicine } from '@/types';

interface MedicineCardProps {
  medicine: Medicine;
  compact?: boolean;
}

export default function MedicineCard({ medicine, compact = false }: MedicineCardProps) {
  const [copied, setCopied] = useState(false);

  const copyBarcode = async () => {
    await navigator.clipboard.writeText(medicine.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Pill size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{medicine.name}</h3>
            <p className="text-xs text-muted truncate">
              {medicine.manufacturer || "Noma&apos;lum ishlab chiqaruvchi"}
            </p>
          </div>
          {medicine.price && (
            <span className="text-success font-semibold text-sm">
              {formatPrice(medicine.price)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Rasm */}
      {medicine.imageUrl ? (
        <div className="h-48 bg-background relative overflow-hidden">
          <img
            src={medicine.imageUrl}
            alt={medicine.name}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Pill size={48} className="text-primary/30" />
        </div>
      )}

      {/* Ma'lumotlar */}
      <div className="p-5 space-y-4">
        {/* Nomi */}
        <div>
          <h2 className="text-xl font-bold text-foreground">{medicine.name}</h2>
          {medicine.nameRu && medicine.nameRu !== medicine.name && (
            <p className="text-sm text-muted mt-1">{medicine.nameRu}</p>
          )}
        </div>

        {/* Asosiy ma'lumotlar */}
        <div className="grid grid-cols-2 gap-3">
          {medicine.manufacturer && (
            <InfoItem
              icon={Building2}
              label="Ishlab chiqaruvchi"
              value={medicine.manufacturer}
            />
          )}
          {medicine.country && (
            <InfoItem icon={MapPin} label="Mamlakat" value={medicine.country} />
          )}
          {medicine.dosageForm && (
            <InfoItem icon={Pill} label="Shakli" value={medicine.dosageForm} />
          )}
          {medicine.activeSubstance && (
            <InfoItem icon={Tag} label="Faol modda" value={medicine.activeSubstance} />
          )}
        </div>

        {/* Narx */}
        {medicine.price && (
          <div className="flex items-center gap-2 bg-success/10 rounded-xl p-3">
            <Banknote size={20} className="text-success" />
            <span className="text-lg font-bold text-success">
              {formatPrice(medicine.price)}
            </span>
            <span className="text-xs text-muted">so&apos;m</span>
          </div>
        )}

        {/* Retsept */}
        {medicine.prescription && (
          <div className="flex items-center gap-2 bg-accent/10 rounded-xl p-3">
            <ShieldCheck size={18} className="text-accent" />
            <span className="text-sm text-accent font-medium">Retsept bilan beriladi</span>
          </div>
        )}

        {/* Barcode */}
        <div className="flex items-center gap-2 bg-background rounded-xl p-3">
          <span className="text-xs text-muted flex-1 font-mono">
            EAN: {medicine.barcode}
          </span>
          <button
            onClick={copyBarcode}
            className="p-1.5 rounded-lg hover:bg-card transition-colors"
          >
            {copied ? (
              <CheckCircle2 size={16} className="text-success" />
            ) : (
              <Copy size={16} className="text-muted" />
            )}
          </button>
        </div>

        {/* GTIN lar */}
        {medicine.gtins && medicine.gtins.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2 text-foreground">
              GTIN ro&apos;yxati ({medicine.gtins.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {medicine.gtins.map((gtin) => (
                <div
                  key={gtin.id}
                  className="bg-background rounded-lg p-2.5 text-xs font-mono"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">{gtin.gtin}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        gtin.status === 'ACTIVE'
                          ? 'bg-success/20 text-success'
                          : gtin.status === 'EXPIRED'
                          ? 'bg-danger/20 text-danger'
                          : 'bg-muted/20 text-muted'
                      }`}
                    >
                      {gtin.status}
                    </span>
                  </div>
                  {gtin.serial && (
                    <span className="text-muted">SN: {gtin.serial}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manba */}
        {medicine.sourceUrl && (
          <a
            href={medicine.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink size={14} />
            gopharm.uz da ko&apos;rish
          </a>
        )}
      </div>
    </motion.div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-background rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} className="text-muted" />
        <span className="text-[10px] text-muted uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
    </div>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('uz-UZ').format(price);
}
