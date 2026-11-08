import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import { TrendingUp, Calendar, Megaphone } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import StatCard from './StatCard';

// Recent chats and upcoming appointments don't have a backing endpoint yet
// (owned by the Chats/Customers workstreams) -- mocked here to match the
// approved dashboard design until those APIs land.
const RECENT_CHATS = [
  { name: 'Neha Patel', message: 'Do you have any hair spa packages?', time: '11:42 AM', initials: 'NP', color: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300' },
  { name: 'Rahul Sharma', message: 'I want to book an appointment', time: '11:36 AM', initials: 'RS', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
  { name: 'Priya Singh', message: 'What are your timings tomorrow?', time: '11:15 AM', initials: 'PS', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' },
];

const UPCOMING_APPOINTMENTS = [
  { name: 'Neha Patel', service: 'Hair Spa', date: 'May 14, 2026', time: '10:00 AM', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
  { name: 'Rahul Sharma', service: 'Hair Cut', date: 'May 14, 2026', time: '12:00 PM', color: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300' },
  { name: 'Priya Singh', service: 'Hair Coloring', date: 'May 14, 2026', time: '4:00 PM', color: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300' },
];

function ChatTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-md text-sm">
      <p className="text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-gray-100">{payload[0].value} conversations</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { conversations, customers, appointments, revenue, aiResolutionRate, conversationSeries, dayLabels, loading } =
    useAnalyticsData();

  const firstName = user?.user_metadata?.business_name || user?.email?.split('@')[0] || 'there';
  const chartData = dayLabels.map((day, i) => ({ day, conversations: conversationSeries[i] }));
  const resolutionData = [{ name: 'AI Resolution Rate', value: aiResolutionRate.value, fill: '#16a34a' }];

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Good morning, {firstName}</h2>
          <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your business today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Conversations" value={conversations.value} trend={conversations.trend} loading={loading} />
        <StatCard label="Customers" value={customers.value} trend={customers.trend} loading={loading} />
        <StatCard label="Appointments" value={appointments.value} trend={appointments.trend} loading={loading} />
        <StatCard label="Revenue" value={revenue.value} trend={revenue.trend} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Conversations Over Time</h3>
            <span className="text-sm text-gray-400 dark:text-gray-500 font-medium border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-1.5">
              7 Days
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="conversationsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChatTooltip />} />
              <Area
                type="monotone"
                dataKey="conversations"
                stroke="#16a34a"
                strokeWidth={2.5}
                fill="url(#conversationsFill)"
                dot={{ r: 4, fill: '#16a34a', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">AI Resolution Rate</h3>
          <div className="flex-1 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                data={resolutionData}
                innerRadius="75%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar dataKey="value" cornerRadius={20} background={{ fill: '#f1f5f9' }} angleAxisId={0} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{aiResolutionRate.value}%</span>
            </div>
          </div>
          <p className="flex items-center justify-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
            <TrendingUp size={14} /> {aiResolutionRate.trend}%
            <span className="text-gray-400 dark:text-gray-500 font-medium">vs last 7 days</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Chats</h3>
          <div className="space-y-4">
            {RECENT_CHATS.map((chat) => (
              <div key={chat.name} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${chat.color}`}>
                  {chat.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{chat.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{chat.message}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{chat.time}</span>
              </div>
            ))}
          </div>
          <button className="w-full text-center text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 mt-4">
            View all chats
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Upcoming Appointments</h3>
            <button className="text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {UPCOMING_APPOINTMENTS.map((appt) => (
              <div key={`${appt.name}-${appt.time}`} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${appt.color}`}>
                  <Calendar size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{appt.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{appt.service}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500">{appt.date}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{appt.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center">
            <Megaphone size={22} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Create Campaign</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Send offers and promotions to your customers on WhatsApp.</p>
          </div>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors">
            Create Now
          </button>
        </div>
      </div>
    </div>
  );
}
