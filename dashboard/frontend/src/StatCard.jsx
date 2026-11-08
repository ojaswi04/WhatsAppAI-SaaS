import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Reusable statistic card with an optional trend indicator.
 *
 * Props:
 *  - label: string            e.g. "Conversations"
 *  - value: string | number   e.g. 128 or "₹84,250"
 *  - trend: number             percentage change vs. previous period (e.g. 24 or -8). Omit to hide.
 *  - trendLabel: string        e.g. "vs last 7 days"
 *  - loading: boolean          shows a skeleton state instead of content
 */
export default function StatCard({ label, value, trend, trendLabel = 'vs last 7 days', loading = false }) {
  const hasTrend = typeof trend === 'number' && !Number.isNaN(trend);
  const isPositive = hasTrend && trend >= 0;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="h-3.5 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-4" />
        <div className="h-7 w-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-3" />
        <div className="h-3 w-28 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
      {hasTrend && (
        <p
          className={`flex items-center gap-1 text-xs font-semibold mt-3 ${
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
          }`}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}%
          <span className="text-gray-400 dark:text-gray-500 font-medium">{trendLabel}</span>
        </p>
      )}
    </div>
  );
}
