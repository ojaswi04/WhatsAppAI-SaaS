import React, { useEffect, useMemo, useState } from 'react';
import { Search, Pencil, MoreHorizontal, Check } from 'lucide-react';
import { useAuth } from './AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Used only if GET /customers is unreachable or not yet implemented, so the
// page still renders something useful. Swap out once the real endpoint lands.
const MOCK_CUSTOMERS = [
  {
    customer_id: '1',
    name: 'Neha Patel',
    phone: '+91 98765 43210',
    email: 'neha.patel@email.com',
    location: 'Mumbai, India',
    first_seen: 'May 14, 2025',
    last_seen: 'Today, 10:30 AM',
    tags: ['VIP', 'Regular'],
    total_bookings: 8,
    total_spent: 12450,
    last_booking: 'May 10, 2025',
    next_appointment: 'May 14, 2025 · 6:00 PM',
    notes: 'Prefers evening appointments. Interested in hair spa and treatments.',
    activity: [
      { label: 'Booked Hair Spa appointment', time: 'Today, 10:30 AM' },
      { label: 'Asked about hair spa packages', time: 'Yesterday, 4:12 PM' },
      { label: 'Completed Hair Cut booking', time: 'May 10, 2025' },
    ],
    bookings: [
      { service: 'Hair Spa', date: 'May 14, 2025', time: '6:00 PM', status: 'Upcoming' },
      { service: 'Hair Cut', date: 'May 10, 2025', time: '11:00 AM', status: 'Completed' },
      { service: 'Hair Coloring', date: 'Apr 22, 2025', time: '2:00 PM', status: 'Completed' },
    ],
    campaigns: [
      { name: 'Summer Offer Campaign', sentOn: 'May 10, 2025', status: 'Delivered' },
      { name: 'Weekend Special', sentOn: 'May 3, 2025', status: 'Delivered' },
    ],
  },
  {
    customer_id: '2',
    name: 'Rahul Sharma',
    phone: '+91 91234 56789',
    email: 'rahul.sharma@email.com',
    location: 'Pune, India',
    first_seen: 'Mar 2, 2025',
    last_seen: 'Yesterday, 6:15 PM',
    tags: ['Regular'],
    total_bookings: 3,
    total_spent: 3200,
    last_booking: 'Apr 28, 2025',
    next_appointment: null,
    notes: 'Asked about group discounts for friends.',
    activity: [{ label: 'Asked about appointment slots', time: 'Yesterday, 6:15 PM' }],
    bookings: [{ service: 'Hair Cut', date: 'Apr 28, 2025', time: '12:00 PM', status: 'Completed' }],
    campaigns: [{ name: 'Win Back Customers', sentOn: 'Apr 26, 2025', status: 'Delivered' }],
  },
  {
    customer_id: '3',
    name: 'Priya Singh',
    phone: '+91 87654 32109',
    email: 'priya.singh@email.com',
    location: 'Mumbai, India',
    first_seen: 'Jan 18, 2025',
    last_seen: '2 days ago',
    tags: ['New'],
    total_bookings: 1,
    total_spent: 999,
    last_booking: 'May 1, 2025',
    next_appointment: 'May 14, 2025 · 4:00 PM',
    notes: '',
    activity: [{ label: 'Asked about salon timings', time: '2 days ago' }],
    bookings: [{ service: 'Hair Coloring', date: 'May 14, 2025', time: '4:00 PM', status: 'Upcoming' }],
    campaigns: [],
  },
  {
    customer_id: '4',
    name: 'Amit Verma',
    phone: '+91 99887 60554',
    email: 'amit.verma@email.com',
    location: 'Thane, India',
    first_seen: 'Feb 9, 2025',
    last_seen: '5 days ago',
    tags: ['Regular'],
    total_bookings: 5,
    total_spent: 6700,
    last_booking: 'May 6, 2025',
    next_appointment: null,
    notes: '',
    activity: [],
    bookings: [{ service: 'Personal Training', date: 'May 6, 2025', time: '7:00 AM', status: 'Completed' }],
    campaigns: [],
  },
  {
    customer_id: '5',
    name: 'Karan Mehta',
    phone: '+91 78543 21098',
    email: 'karan.mehta@email.com',
    location: 'Navi Mumbai, India',
    first_seen: 'Apr 30, 2025',
    last_seen: '1 week ago',
    tags: ['New'],
    total_bookings: 1,
    total_spent: 349,
    last_booking: 'Apr 30, 2025',
    next_appointment: null,
    notes: '',
    activity: [],
    bookings: [{ service: 'Grilled Chicken Bowl', date: 'Apr 30, 2025', time: '1:00 PM', status: 'Completed' }],
    campaigns: [],
  },
];

const TAG_STYLES = {
  VIP: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  Regular: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  New: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
};

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function useCustomers() {
  const { accessToken } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    async function fetchCustomers() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/customers`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error('Failed to load customers');
        const data = await res.json();
        const list = data.customers || [];
        if (!cancelled) {
          setCustomers(list);
          setUsingFallback(false);
        }
      } catch (err) {
        if (!cancelled) {
          setCustomers(MOCK_CUSTOMERS);
          setUsingFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCustomers();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return { customers, loading, usingFallback };
}

function Avatar({ name, size = 'w-10 h-10', textSize = 'text-sm' }) {
  return (
    <div className={`${size} rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-semibold ${textSize} shrink-0`}>
      {initials(name)}
    </div>
  );
}

function OverviewTab({ customer }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 space-y-4">
        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">About</h4>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Phone</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{customer.phone}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Email</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{customer.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">First seen</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{customer.first_seen}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Last seen</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{customer.last_seen}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-gray-500 dark:text-gray-400">Tags</dt>
            <dd className="flex gap-1.5">
              {customer.tags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TAG_STYLES[tag] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 space-y-4">
        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Stats</h4>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Total bookings</dt>
            <dd className="font-bold text-gray-900 dark:text-gray-100">{customer.total_bookings}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Total spent</dt>
            <dd className="font-bold text-gray-900 dark:text-gray-100">₹{customer.total_spent.toLocaleString('en-IN')}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Last booking</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{customer.last_booking || '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Next appointment</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{customer.next_appointment || '—'}</dd>
          </div>
        </dl>
      </div>

      <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Notes</h4>
          <button className="text-xs font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
            Edit
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">{customer.notes || 'No notes yet.'}</p>
      </div>
    </div>
  );
}

function ActivityTab({ customer }) {
  if (!customer.activity.length) {
    return <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No recent activity.</p>;
  }
  return (
    <ul className="space-y-4">
      {customer.activity.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
          <div>
            <p className="text-sm text-gray-900 dark:text-gray-100">{item.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{item.time}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function BookingsTab({ customer }) {
  if (!customer.bookings.length) {
    return <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No bookings yet.</p>;
  }
  return (
    <div className="space-y-3">
      {customer.bookings.map((b, i) => (
        <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3">
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{b.service}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{b.date} · {b.time}</p>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              b.status === 'Upcoming'
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
            }`}
          >
            {b.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function CampaignsTab({ customer }) {
  if (!customer.campaigns.length) {
    return <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No campaigns sent to this customer.</p>;
  }
  return (
    <div className="space-y-3">
      {customer.campaigns.map((c, i) => (
        <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3">
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{c.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sent {c.sentOn}</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
            {c.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function NotesTab({ customer, onSaveNote }) {
  const [draft, setDraft] = useState(customer.notes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(customer.notes || '');
    setSaved(false);
  }, [customer.customer_id]);

  async function handleSave() {
    setSaving(true);
    await onSaveNote(customer.customer_id, draft);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-3">
      <textarea
        className="w-full h-40 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 p-4 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 resize-none"
        placeholder="Add a note about this customer..."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-medium">
            <Check size={14} /> Saved
          </span>
        )}
      </div>
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview', Component: OverviewTab },
  { id: 'activity', label: 'Activity', Component: ActivityTab },
  { id: 'bookings', label: 'Bookings', Component: BookingsTab },
  { id: 'campaigns', label: 'Campaigns', Component: CampaignsTab },
  { id: 'notes', label: 'Notes', Component: NotesTab },
];

export default function CustomersPage() {
  const { customers, loading, usingFallback } = useCustomers();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [localNotes, setLocalNotes] = useState({});

  useEffect(() => {
    if (!selectedId && customers.length) {
      setSelectedId(customers[0].customer_id);
    }
  }, [customers, selectedId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, ''))
    );
  }, [customers, search]);

  const selected = useMemo(() => {
    const base = customers.find((c) => c.customer_id === selectedId);
    if (!base) return null;
    const overriddenNotes = localNotes[selectedId];
    return overriddenNotes !== undefined ? { ...base, notes: overriddenNotes } : base;
  }, [customers, selectedId, localNotes]);

  async function handleSaveNote(customerId, note) {
    setLocalNotes((prev) => ({ ...prev, [customerId]: note }));
    // PUT /customers/{id} isn't implemented in the backend yet -- this keeps
    // the edit locally so the UI feels real. Swap for a real PUT once available.
  }

  const ActiveTabComponent = TABS.find((t) => t.id === activeTab)?.Component;

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Customers</h2>
        {usingFallback && (
          <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-800">
            Mock Data
          </span>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 min-h-0">
        {/* Left: searchable list */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && !customers.length ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-50 dark:bg-gray-900 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">No customers found.</p>
            ) : (
              filtered.map((customer) => (
                <button
                  key={customer.customer_id}
                  onClick={() => {
                    setSelectedId(customer.customer_id);
                    setActiveTab('overview');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    selectedId === customer.customer_id
                      ? 'bg-green-50 dark:bg-green-950/40'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Avatar name={customer.name} />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{customer.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{customer.phone}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: detail view */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              {loading ? 'Loading customers...' : 'Select a customer to view details'}
            </div>
          ) : (
            <>
              <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <Avatar name={selected.name} size="w-14 h-14" textSize="text-lg" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{selected.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selected.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 transition-colors">
                    <Pencil size={14} /> Edit
                  </button>
                  <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 px-2">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              <div className="px-6 pt-3 border-b border-gray-100 dark:border-gray-700 flex gap-6">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-green-600 text-green-700 dark:text-green-400'
                        : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'notes' ? (
                  <NotesTab customer={selected} onSaveNote={handleSaveNote} />
                ) : (
                  ActiveTabComponent && <ActiveTabComponent customer={selected} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
