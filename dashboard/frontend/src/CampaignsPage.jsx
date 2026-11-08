import React, { useMemo, useState } from 'react';
import { Plus, X, Target, Leaf, Repeat, Sparkles, Send } from 'lucide-react';

// Campaign data/sending isn't backed by a real endpoint yet (per the brief,
// this is explicitly mocked) -- kept in local state so the create flow still
// feels real end-to-end.
const INITIAL_CAMPAIGNS = [
  {
    id: '1',
    name: 'Summer Offer Campaign',
    description: '20% off on all hair spa packages',
    type: 'Broadcast',
    audience: 2345,
    sentOn: 'May 10, 2026',
    status: 'Delivered',
    deliveryRate: 88,
    color: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    Icon: Target,
  },
  {
    id: '2',
    name: 'Weekend Special',
    description: 'Flat 15% off on hair coloring',
    type: 'Broadcast',
    audience: 1890,
    sentOn: 'May 3, 2026',
    status: 'Delivered',
    deliveryRate: 92,
    color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    Icon: Leaf,
  },
  {
    id: '3',
    name: 'Win Back Customers',
    description: "We miss you! Here's 25% off",
    type: 'Follow-up',
    audience: 1234,
    sentOn: 'Apr 26, 2026',
    status: 'Delivered',
    deliveryRate: 65,
    color: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    Icon: Repeat,
  },
  {
    id: '4',
    name: 'New Services Launch',
    description: 'Keratin treatment now available',
    type: 'Broadcast',
    audience: 2107,
    sentOn: 'Apr 20, 2026',
    status: 'Delivered',
    deliveryRate: 71,
    color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    Icon: Sparkles,
  },
];

const TABS = ['All', 'Broadcast', 'Promotions', 'Follow-ups'];

function StatusBadge({ status }) {
  const styles = {
    Delivered: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    Scheduled: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    Draft: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    Failed: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || styles.Draft}`}>{status}</span>;
}

function CreateCampaignModal({ open, onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    type: 'Broadcast',
    message: '',
    audience: 'All Customers',
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setStep(1);
    setForm({ name: '', type: 'Broadcast', message: '', audience: 'All Customers' });
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleCreate() {
    onCreate({
      id: String(Date.now()),
      name: form.name || 'Untitled Campaign',
      description: form.message.slice(0, 60) || 'No message set',
      type: form.type,
      audience: 0,
      sentOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Scheduled',
      deliveryRate: 0,
      color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
      Icon: Send,
    });
    handleClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Create Campaign</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Step {step} of 2 · {step === 1 ? 'Campaign details' : 'Message & audience'}
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {step === 1 ? (
            <>
              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Campaign Name</span>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
                  placeholder="e.g. Monsoon Offer"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Campaign Type</span>
                <div className="grid grid-cols-3 gap-2">
                  {['Broadcast', 'Promotions', 'Follow-up'].map((type) => (
                    <button
                      key={type}
                      onClick={() => update('type', type)}
                      className={`text-sm font-semibold rounded-xl py-2.5 border transition-colors ${
                        form.type === type
                          ? 'bg-green-50 dark:bg-green-950/40 border-green-500 text-green-700 dark:text-green-400'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </label>
            </>
          ) : (
            <>
              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Audience</span>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
                  value={form.audience}
                  onChange={(e) => update('audience', e.target.value)}
                >
                  <option>All Customers</option>
                  <option>VIP Customers</option>
                  <option>Inactive Customers</option>
                  <option>New Customers</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Message</span>
                <textarea
                  className="w-full h-32 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
                  placeholder="Write your WhatsApp message..."
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                />
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">{form.message.length}/1000 characters</span>
              </label>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl py-2.5 transition-colors"
            >
              Back
            </button>
          )}
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!form.name.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl py-2.5 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!form.message.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl py-2.5 transition-colors"
            >
              Create Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [activeTab, setActiveTab] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    if (activeTab === 'All') return campaigns;
    if (activeTab === 'Follow-ups') return campaigns.filter((c) => c.type === 'Follow-up');
    return campaigns.filter((c) => c.type === activeTab.replace(/s$/, ''));
  }, [campaigns, activeTab]);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Campaigns</h2>
          <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-800 mt-1 inline-block">
            Mock Data
          </span>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} /> Create Campaign
        </button>
      </div>

      <div className="flex gap-6 border-b border-gray-100 dark:border-gray-700 px-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-green-600 text-green-700 dark:text-green-400'
                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
              No campaigns in this category yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 dark:text-gray-500 text-xs font-semibold border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-3">Campaign</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Audience</th>
                  <th className="px-6 py-3">Sent</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Delivered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/60 last:border-0 hover:bg-gray-50/60 dark:hover:bg-gray-700/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}>
                          <c.Icon size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{c.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{c.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{c.type}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{c.audience.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{c.sentOn}</td>
                    <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{c.deliveryRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CreateCampaignModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(campaign) => setCampaigns((prev) => [campaign, ...prev])}
      />
    </div>
  );
}
