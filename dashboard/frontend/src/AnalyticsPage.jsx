import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import StatCard from './StatCard';

function ConversationsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-md text-sm">
      <p className="text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-gray-100">{payload[0].value} conversations</p>
    </div>
  );
}

function SourcesLegend({ sources }) {
  if (!sources?.length) return null;
  return (
    <ul className="flex flex-col gap-2.5 ml-2">
      {sources.map((source) => (
        <li key={source.name} className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: source.color }} />
          <span className="text-gray-600 dark:text-gray-300">{source.name}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100 ml-auto">{source.value}%</span>
        </li>
      ))}
    </ul>
  );
}

export default function AnalyticsPage() {
  const {
    conversations,
    customers,
    appointments,
    revenue,
    conversationSeries,
    topSources,
    responseTime,
    dayLabels,
    loading,
    usingFallback,
  } = useAnalyticsData();

  const chartData = dayLabels.map((day, i) => ({ day, conversations: conversationSeries[i] }));
  const responseTimeData = responseTime.series.map((value, i) => ({ index: i, value }));

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Analytics</h2>
        {usingFallback && (
          <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-800">
            Mock Data
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Conversations" value={conversations.value} trend={conversations.trend} loading={loading} />
        <StatCard label="New Customers" value={customers.value} trend={customers.trend} loading={loading} />
        <StatCard label="Appointments" value={appointments.value} trend={appointments.trend} loading={loading} />
        <StatCard label="Revenue" value={revenue.value} trend={revenue.trend} loading={loading} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Conversations Over Time</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="analyticsConversationsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ConversationsTooltip />} />
            <Area
              type="monotone"
              dataKey="conversations"
              stroke="#16a34a"
              strokeWidth={2.5}
              fill="url(#analyticsConversationsFill)"
              dot={{ r: 4, fill: '#16a34a', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Top Sources</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="55%" height={160}>
              <PieChart>
                <Pie
                  data={topSources}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  stroke="none"
                >
                  {topSources.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <SourcesLegend sources={topSources} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Response Time</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{responseTime.value}</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Average response time</p>
          <p
            className={`flex items-center gap-1 text-xs font-semibold mt-1 ${
              responseTime.trend < 0 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}
          >
            {responseTime.trend < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
            {Math.abs(responseTime.trend)}%
            <span className="text-gray-400 dark:text-gray-500 font-medium">vs last 7 days</span>
          </p>
          <ResponsiveContainer width="100%" height={80} className="mt-2">
            <LineChart data={responseTimeData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
