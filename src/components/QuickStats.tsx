'use client';

import { motion } from 'framer-motion';
import { ScanBarcode, CheckCircle2, AlertTriangle, Package } from 'lucide-react';
import { useScannerStore } from '@/store/scanner-store';

export default function QuickStats() {
  const { scanHistory, batchScans, batchMode } = useScannerStore();

  const todayScans = scanHistory.filter(
    (s) => new Date(s.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const totalScans = scanHistory.length;
  const matchedScans = scanHistory.filter((s) => s.medicine).length;

  const stats = [
    {
      icon: ScanBarcode,
      label: 'Bugun',
      value: todayScans,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: CheckCircle2,
      label: 'Topilgan',
      value: matchedScans,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      icon: Package,
      label: 'Jami',
      value: totalScans,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    ...(batchMode
      ? [
          {
            icon: AlertTriangle,
            label: 'Batch',
            value: batchScans.length,
            color: 'text-orange-400',
            bg: 'bg-orange-400/10',
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-3 gap-3 my-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
            <stat.icon size={16} className={stat.color} />
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted mt-0.5">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
