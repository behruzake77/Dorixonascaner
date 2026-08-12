'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  lines?: number;
  type?: 'card' | 'list' | 'text' | 'stat' | 'button';
}

export default function Skeleton({ className = '', lines = 3, type = 'text' }: SkeletonProps) {
  const pulse = (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className="bg-gray-700/50 rounded-lg"
    />
  );

  switch (type) {
    case 'card':
      return (
        <div className={`bg-[#1e293b] rounded-xl border border-gray-700/50 p-4 space-y-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-700/50" />
            <div className="flex-1 space-y-2">
              {pulse}
              <div className="h-3 w-2/3 bg-gray-700/50 rounded" />
            </div>
          </div>
          <div className="h-4 w-1/2 bg-gray-700/50 rounded" />
        </div>
      );

    case 'list':
      return (
        <div className={`space-y-2 ${className}`}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="bg-[#1e293b] rounded-xl border border-gray-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-700/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-700/50 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-700/50 rounded animate-pulse" />
                </div>
                <div className="w-16 h-8 bg-gray-700/50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'stat':
      return (
        <div className={`grid grid-cols-3 gap-3 ${className}`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#1e293b] rounded-xl border border-gray-700/50 p-4">
              <div className="w-8 h-8 rounded-lg bg-gray-700/50 animate-pulse mb-2" />
              <div className="h-7 w-12 bg-gray-700/50 rounded animate-pulse mb-1" />
              <div className="h-3 w-16 bg-gray-700/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      );

    case 'button':
      return (
        <div className={`h-14 w-full bg-gray-700/50 rounded-xl animate-pulse ${className}`} />
      );

    default:
      return (
        <div className={`space-y-2 ${className}`}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-gray-700/50 rounded animate-pulse"
              style={{ width: `${100 - i * 15}%` }}
            />
          ))}
        </div>
      );
  }
}
