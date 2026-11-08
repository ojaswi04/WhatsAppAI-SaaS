import React, { useMemo, useState } from 'react';
import { Search, Sparkles, Send, Calendar, Tag, CheckCircle2 } from 'lucide-react';

// No /chats or /messages endpoint exists anywhere in this codebase yet, and
// this page isn't owned by either developer brief -- fully mocked to keep
// the app navigable end-to-end. Swap for real data once a chats API lands.
const CONVERSATIONS = [
  {
    id: '1',
    name: 'Neha Patel',
    initials: 'NP',
    color: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
    online: true,
    status: 'Open',
    lastMessage: 'Sure! Please share a time that works for you.',
    time: '11:42 AM',
    messages: [
      { from: 'customer', text: 'Hi! Do you have any hair spa packages?', time: '11:20 AM' },
      {
        from: 'ai',
        text: 'Yes! We have a variety of hair spa packages:\n• Basic Hair Spa – ₹799\n• Advanced Hair Spa – ₹1,299\n• Luxury Hair Spa – ₹1,999',
        time: '11:21 AM',
      },
      { from: 'customer', text: "Great! I'd like to book the Advanced Hair Spa.", time: '11:30 AM' },
      { from: 'ai', text: 'Sure! Please share a time that works for you.', time: '11:31 AM' },
      { from: 'customer', text: '6 PM tomorrow works.', time: '11:36 AM' },
      { from: 'ai', text: 'Your appointment is confirmed for tomorrow at 6:00 PM.', time: '11:36 AM', confirmed: true },
    ],
    customer: { phone: '+91 98765 43210', location: 'Mumbai, India' },
  },
  {
    id: '2',
    name: 'Rahul Sharma',
    initials: 'RS',
    color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    online: false,
    status: 'Pending',
    lastMessage: 'I want to book an appointment',
    time: '11:36 AM',
    messages: [{ from: 'customer', text: 'I want to book an appointment', time: '11:36 AM' }],
    customer: { phone: '+91 91234 56789', location: 'Pune, India' },
  },
  {
    id: '3',
    name: 'Priya Singh',
    initials: 'PS',
    color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    online: true,
    status: 'Resolved',
    lastMessage: 'What are your timings tomorrow?',
    time: '11:15 AM',
    messages: [
      { from: 'customer', text: 'What are your timings tomorrow?', time: '11:10 AM' },
      { from: 'ai', text: "We're open from 10 AM to 8 PM tomorrow!", time: '11:15 AM' },
    ],
    customer: { phone: '+91 87654 32109', location: 'Mumbai, India' },
  },
];

const FILTERS = ['All', 'Open', 'Pending', 'Resolved'];

const SUGGESTED_REPLIES = [
  'Share package details',
  'Ask for preferred time',
  'Offer to book appointment',
  'Ask for more details',
];

function StatusDot({ status }) {
  const colors = { Open: 'bg-blue-500', Pending: 'bg-amber-500', Resolved: 'bg-green-500' };
  return <span className={`w-2 h-2 rounded-full ${colors[status] || 'bg-gray-400'}`} />;
}

export default function ChatsPage() {
  const [selectedId, setSelectedId] = useState(CONVERSATIONS[0].id);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [localMessages, setLocalMessages] = useState({});

  const filtered = useMemo(() => {
    return CONVERSATIONS.filter((c) => {
      if (filter !== 'All' && c.status !== filter) return false;
      if (search.trim() && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filter, search]);

  const selected = CONVERSATIONS.find((c) => c.id === selectedId);
  const extraMessages = localMessages[selectedId] || [];

  function handleSend() {
    if (!draft.trim()) return;
    setLocalMessages((prev) => ({
      ...prev,
      [selectedId]: [
        ...(prev[selectedId] || []),
        { from: 'agent', text: draft.trim(), time: 'Just now' },
      ],
    }));
    setDraft('');
  }

  const counts = useMemo(() => {
    const c = { All: CONVERSATIONS.length };
    for (const conv of CONVERSATIONS) c[conv.status] = (c[conv.status] || 0) + 1;
    return c;
  }, []);

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] gap-4 min-h-0">
      {/* Conversation list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Chats</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors ${
                  filter === f
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {f} {counts[f] ? counts[f] : 0}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                selectedId === c.id ? 'bg-green-50 dark:bg-green-950/40' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${c.color}`}>
                  {c.initials}
                </div>
                {c.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{c.name}</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{c.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusDot status={c.status} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.lastMessage}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message thread */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col min-h-0">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${selected.color}`}>
                  {selected.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{selected.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{selected.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/40 px-2.5 py-1 rounded-full">
                <Sparkles size={12} /> AI Assisted
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[...selected.messages, ...extraMessages].map((m, i) => {
                const isCustomer = m.from === 'customer';
                return (
                  <div key={i} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                        isCustomer
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                          : 'bg-green-100 dark:bg-green-900/40 text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {m.confirmed && <CheckCircle2 size={14} className="inline mr-1.5 -mt-0.5 text-green-600 dark:text-green-400" />}
                      {m.text}
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">{m.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* AI assist + customer details */}
      {selected && (
        <div className="hidden lg:flex flex-col gap-4 min-h-0 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-3">Suggested replies</h4>
            <div className="space-y-2">
              {SUGGESTED_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => setDraft(reply)}
                  className="w-full text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl px-3.5 py-2.5 transition-colors"
                >
                  {reply}
                </button>
              ))}
              <button className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded-xl px-3.5 py-2.5 border border-dashed border-green-200 dark:border-green-800">
                <Sparkles size={14} /> Generate reply
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-3">Customer details</h4>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${selected.color}`}>
                {selected.initials}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{selected.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selected.customer.phone}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{selected.customer.location}</p>
            <button className="w-full text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl py-2 transition-colors">
              View profile
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-3">Actions</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl px-3.5 py-2.5 transition-colors">
                <Calendar size={15} /> Book Appointment
              </button>
              <button className="w-full flex items-center gap-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl px-3.5 py-2.5 transition-colors">
                <Tag size={15} /> Add Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
