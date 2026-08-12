'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, XCircle, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import type { MedicineGtin } from '@/types';

interface ExpiryAlertProps {
  gtins: MedicineGtin[];
}

/**
 * Muddati o'tgan yoki yaqinlashgan dorilar uchun ogohlantirish
 */
export default function ExpiryAlerts({ gtins }: ExpiryAlertProps) {
  const [expanded, setExpanded] = useState(false);

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Kategoriyalarga ajratish
  const expired: MedicineGtin[] = [];
  const expiringSoon: MedicineGtin[] = []; // 30 kun
  const expiringLater: MedicineGtin[] = []; // 90 kun

  gtins.forEach((gtin) => {
    if (!gtin.expiry) return;
    const expiry = new Date(gtin.expiry);

    if (expiry < now) {
      expired.push(gtin);
    } else if (expiry < thirtyDays) {
      expiringSoon.push(gtin);
    } else if (expiry < ninetyDays) {
      expiringLater.push(gtin);
    }
  });

  const totalAlerts = expired.length + expiringSoon.length + expiringLater.length;

  if (totalAlerts === 0) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="space-y-2"
    >
      {/* Muddati o'tgan — qizil */}
      {expired.length > 0 && (
        <ExpiryCard
          type="expired"
          count={expired.length}
          gtins={expired}
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
        />
      )}

      {/* 30 kun ichida — sariq */}
      {expiringSoon.length > 0 && (
        <ExpiryCard
          type="soon"
          count={expiringSoon.length}
          gtins={expiringSoon}
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
        />
      )}

      {/* 90 kun ichida — ko'k */}
      {expiringLater.length > 0 && (
        <ExpiryCard
          type="later"
          count={expiringLater.length}
          gtins={expiringLater}
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
        />
      )}
    </motion.div>
  );
}

function ExpiryCard({
  type,
  count,
  gtins,
  expanded,
  onToggle,
}: {
  type: 'expired' | 'soon' | 'later';
  count: number;
  gtins: MedicineGtin[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const config = {
    expired: {
      bg: 'bg-danger/10',
      border: 'border-danger/30',
      text: 'text-danger',
      icon: XCircle,
      label: "Muddati o'tgan",
    },
    soon: {
      bg: 'bg-accent/10',
      border: 'border-accent/30',
      text: 'text-accent',
      icon: AlertTriangle,
      label: '30 kun ichida tugaydi',
    },
    later: {
      bg: 'bg-primary/10',
      border: 'border-primary/30',
      text: 'text-primary',
      icon: Clock,
      label: '90 kun ichida tugaydi',
    },
  };

  const c = config[type];
  const Icon = c.icon;

  return (
    <div className={`${c.bg} border ${c.border} rounded-xl overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3"
      >
        <div className="flex items-center gap-2">
          <Icon size={18} className={c.text} />
          <span className={`text-sm font-medium ${c.text}`}>
            {c.label}: {count} ta
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className={c.text} />
        ) : (
          <ChevronDown size={16} className={c.text} />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5">
              {gtins.map((gtin) => (
                <div
                  key={gtin.id}
                  className="flex items-center justify-between text-xs bg-background/50 rounded-lg px-3 py-2"
                >
                  <span className="font-mono">{gtin.gtin}</span>
                  <span className={c.text}>
                    {gtin.expiry
                      ? new Date(gtin.expiry).toLocaleDateString('uz-UZ')
                      : "Noma'lum"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Umumiy expiry statistikasi (QuickStats uchun)
 */
export function getExpiryStats(gtins: MedicineGtin[]): {
  expired: number;
  expiringSoon: number;
} {
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  let expired = 0;
  let expiringSoon = 0;

  gtins.forEach((gtin) => {
    if (!gtin.expiry) return;
    const expiry = new Date(gtin.expiry);
    if (expiry < now) expired++;
    else if (expiry < thirtyDays) expiringSoon++;
  });

  return { expired, expiringSoon };
}
