import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const DAY_LABELS = ['May 14', 'May 15', 'May 16', 'May 17', 'May 18', 'May 19', 'May 20'];

// Conversations don't have a backing table/endpoint yet, so the day-by-day
// shape below is mocked to match the approved design. Once a /conversations
// endpoint exists, swap buildConversationSeries() for a real fetch.
const MOCK_CONVERSATION_SERIES = [70, 95, 80, 130, 100, 140, 165];

const MOCK_TOP_SOURCES = [
  { name: 'WhatsApp', value: 40, color: '#7c3aed' },
  { name: 'Campaigns', value: 25, color: '#16a34a' },
  { name: 'Website', value: 10, color: '#ef4444' },
  { name: 'Referral', value: 5, color: '#f59e0b' },
];

const MOCK_RESPONSE_TIME_SERIES = [40, 65, 35, 70, 50, 75, 60];

function formatCurrency(amount, currency = '₹') {
  return `${currency}${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Pulls real revenue (from /payments) and order-derived customer counts
 * (from /orders) for the tenant, and combines them with the mocked
 * conversation/appointment/engagement metrics that don't have a backend
 * source yet. Designed so each metric can be swapped to "real" independently
 * as new endpoints land, without changing consumers (DashboardPage, AnalyticsPage).
 */
export function useAnalyticsData() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError('');
      setUsingFallback(false);
      try {
        const headers = { Authorization: `Bearer ${accessToken}` };
        const [ordersRes, paymentsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/orders`, { headers }),
          fetch(`${API_BASE_URL}/payments`, { headers }),
        ]);

        if (!ordersRes.ok || !paymentsRes.ok) {
          throw new Error('Failed to load live metrics');
        }

        const ordersData = await ordersRes.json();
        const paymentsData = await paymentsRes.json();

        if (!cancelled) {
          setOrders(ordersData.orders || []);
          setPayments(paymentsData.payments || []);
        }
      } catch (err) {
        if (!cancelled) {
          // Fall back to fully-mocked numbers so the dashboard still renders
          // something useful while the backend/Supabase is unreachable.
          setError(err.message);
          setUsingFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const metrics = useMemo(() => {
    if (usingFallback) {
      return {
        conversations: { value: 128, trend: 24 },
        customers: { value: 45, trend: 10 },
        appointments: { value: 32, trend: 15 },
        revenue: { value: formatCurrency(84250), trend: 20 },
        aiResolutionRate: { value: 86, trend: 12 },
        conversationSeries: MOCK_CONVERSATION_SERIES,
        topSources: MOCK_TOP_SOURCES,
        responseTime: { value: '2m 34s', trend: -16, series: MOCK_RESPONSE_TIME_SERIES },
        dayLabels: DAY_LABELS,
      };
    }

    // Revenue: sum paid amounts from /payments. Supabase rows may store
    // amount in `amount_cents` (paise) per latest_dashboard_module.py, with a
    // plain `amount` fallback for older/demo rows.
    const revenueTotal = payments.reduce((sum, p) => {
      const status = (p.status || '').toLowerCase();
      if (status && status !== 'paid') return sum;
      const cents = p.amount_cents ?? (p.amount != null ? p.amount * 100 : 0);
      return sum + cents / 100;
    }, 0);

    // Customers: unique customer_id across orders. A brand-new tenant with
    // no orders yet legitimately has 0 -- don't paper over that with a mock.
    const uniqueCustomers = new Set(orders.map((o) => o.customer_id)).size;

    return {
      conversations: { value: 128, trend: 24 }, // no backing endpoint yet
      customers: { value: uniqueCustomers, trend: 10 },
      appointments: { value: 32, trend: 15 }, // no backing endpoint yet
      revenue: { value: formatCurrency(revenueTotal), trend: 20 },
      aiResolutionRate: { value: 86, trend: 12 }, // no backing endpoint yet
      conversationSeries: MOCK_CONVERSATION_SERIES,
      topSources: MOCK_TOP_SOURCES,
      responseTime: { value: '2m 34s', trend: -16, series: MOCK_RESPONSE_TIME_SERIES },
      dayLabels: DAY_LABELS,
    };
  }, [orders, payments, usingFallback]);

  return { ...metrics, loading, error, usingFallback };
}
