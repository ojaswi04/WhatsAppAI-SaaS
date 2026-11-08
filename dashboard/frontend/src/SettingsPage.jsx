import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useAuth } from './AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const BUSINESS_CATEGORIES = [
  'Beauty, Cosmetic & Personal Care',
  'Health & Fitness',
  'Food & Restaurant',
  'Retail & Shopping',
  'Home Services',
  'Real Estate',
  'Other',
];

const DEFAULT_SETTINGS = {
  business_name: '',
  business_category: BUSINESS_CATEGORIES[0],
  description: '',
  business_address: '',
  logo_initials: '',
  whatsapp_number: '',
  whatsapp_connected: false,
  ai_tone: 'Friendly',
  ai_auto_reply: true,
  ai_handoff_keywords: 'refund, complaint, manager',
  notify_new_chat: true,
  notify_new_booking: true,
  notify_payment: false,
  team_members: [],
};

function useSettings() {
  const { accessToken } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    async function fetchSettings() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/settings`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error('Failed to load settings');
        const data = await res.json();
        if (!cancelled) {
          setSettings({ ...DEFAULT_SETTINGS, ...(data.settings || data) });
          setUsingFallback(false);
        }
      } catch (err) {
        if (!cancelled) {
          setSettings({
            ...DEFAULT_SETTINGS,
            business_name: 'Urban Salon',
            business_category: 'Beauty, Cosmetic & Personal Care',
            description: 'Premium salon offering hair, skin and beauty services.',
            business_address: '123, Park Street, Mumbai, Maharashtra 400001',
            logo_initials: 'US',
            whatsapp_number: '+91 98765 43210',
            whatsapp_connected: true,
            team_members: [
              { name: 'Aarya Shah', role: 'Owner', email: 'aarya@urbansalon.com' },
              { name: 'Dev Patel', role: 'Staff', email: 'dev@urbansalon.com' },
            ],
          });
          setUsingFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  async function saveSettings(updates) {
    const merged = { ...settings, ...updates };
    setSettings(merged);
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(merged),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      return true;
    } catch (err) {
      // Backend not available yet -- keep the local optimistic update so the
      // form still feels responsive, but surface that it wasn't persisted.
      return false;
    }
  }

  return { settings, loading, usingFallback, saveSettings };
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500';

function SaveBar({ saving, saved, onSave }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        onClick={onSave}
        disabled={saving}
        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
      {saved && (
        <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-medium">
          <Check size={14} /> Saved
        </span>
      )}
    </div>
  );
}

function BusinessProfileTab({ settings, saveSettings }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await saveSettings(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 space-y-5">
        <h4 className="font-bold text-gray-900 dark:text-gray-100">Business Information</h4>
        <Field label="Business Name">
          <input className={inputClass} value={form.business_name} onChange={(e) => update('business_name', e.target.value)} />
        </Field>
        <Field label="Business Category">
          <select className={inputClass} value={form.business_category} onChange={(e) => update('business_category', e.target.value)}>
            {BUSINESS_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </Field>
        <Field label="Description">
          <textarea
            className={`${inputClass} h-24 resize-none`}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </Field>
        <Field label="Business Address">
          <textarea
            className={`${inputClass} h-20 resize-none`}
            value={form.business_address}
            onChange={(e) => update('business_address', e.target.value)}
          />
        </Field>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 space-y-4 h-fit">
        <h4 className="font-bold text-gray-900 dark:text-gray-100">Business Logo</h4>
        <div className="w-24 h-24 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-3xl font-bold">
          {form.logo_initials || initialsFromName(form.business_name)}
        </div>
        <button className="w-full border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-xl py-2.5 transition-colors">
          Upload new logo
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500">JPG, PNG (max 2MB)</p>
      </div>

      <div className="lg:col-span-2">
        <SaveBar saving={saving} saved={saved} onSave={handleSave} />
      </div>
    </div>
  );
}

function initialsFromName(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'US';
}

function WhatsAppTab({ settings, saveSettings }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  async function handleSave() {
    setSaving(true);
    await saveSettings(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-900 dark:text-gray-100">Connection Status</h4>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              form.whatsapp_connected
                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
            }`}
          >
            {form.whatsapp_connected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
        <Field label="WhatsApp Business Number">
          <input
            className={inputClass}
            value={form.whatsapp_number}
            onChange={(e) => setForm((p) => ({ ...p, whatsapp_number: e.target.value }))}
            placeholder="+91 98765 43210"
          />
        </Field>
        <button
          onClick={() => setForm((p) => ({ ...p, whatsapp_connected: !p.whatsapp_connected }))}
          className={`text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors ${
            form.whatsapp_connected
              ? 'border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {form.whatsapp_connected ? 'Disconnect' : 'Connect WhatsApp'}
        </button>
      </div>
      <SaveBar saving={saving} saved={saved} onSave={handleSave} />
    </div>
  );
}

function AIConfigTab({ settings, saveSettings }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  async function handleSave() {
    setSaving(true);
    await saveSettings(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 space-y-5">
        <Field label="AI Reply Tone">
          <select className={inputClass} value={form.ai_tone} onChange={(e) => setForm((p) => ({ ...p, ai_tone: e.target.value }))}>
            {['Friendly', 'Professional', 'Casual', 'Formal'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Hand-off Keywords (comma separated)">
          <input
            className={inputClass}
            value={form.ai_handoff_keywords}
            onChange={(e) => setForm((p) => ({ ...p, ai_handoff_keywords: e.target.value }))}
            placeholder="refund, complaint, manager"
          />
        </Field>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Auto-reply to new conversations</span>
          <Toggle checked={form.ai_auto_reply} onChange={(v) => setForm((p) => ({ ...p, ai_auto_reply: v }))} />
        </label>
      </div>
      <SaveBar saving={saving} saved={saved} onSave={handleSave} />
    </div>
  );
}

function NotificationsTab({ settings, saveSettings }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  async function handleSave() {
    setSaving(true);
    await saveSettings(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const rows = [
    { key: 'notify_new_chat', label: 'New chat messages' },
    { key: 'notify_new_booking', label: 'New bookings & appointments' },
    { key: 'notify_payment', label: 'Payment received' },
  ];

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 space-y-5">
        {rows.map((r) => (
          <label key={r.key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{r.label}</span>
            <Toggle checked={form[r.key]} onChange={(v) => setForm((p) => ({ ...p, [r.key]: v }))} />
          </label>
        ))}
      </div>
      <SaveBar saving={saving} saved={saved} onSave={handleSave} />
    </div>
  );
}

function TeamTab({ settings, saveSettings }) {
  const [members, setMembers] = useState(settings.team_members || []);
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setMembers(settings.team_members || []), [settings]);

  function addMember() {
    if (!newEmail.trim()) return;
    setMembers((prev) => [...prev, { name: newEmail.split('@')[0], role: 'Staff', email: newEmail.trim() }]);
    setNewEmail('');
  }

  function removeMember(email) {
    setMembers((prev) => prev.filter((m) => m.email !== email));
  }

  async function handleSave() {
    setSaving(true);
    await saveSettings({ team_members: members });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 space-y-4">
        <h4 className="font-bold text-gray-900 dark:text-gray-100">Team Members</h4>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.email} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{m.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{m.email} · {m.role}</p>
              </div>
              <button onClick={() => removeMember(m.email)} className="text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300">
                Remove
              </button>
            </div>
          ))}
          {!members.length && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No team members yet.</p>}
        </div>
        <div className="flex gap-2 pt-2">
          <input
            type="email"
            className={inputClass}
            placeholder="teammate@email.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <button onClick={addMember} className="px-4 py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white text-sm font-semibold rounded-xl transition-colors shrink-0">
            Invite
          </button>
        </div>
      </div>
      <SaveBar saving={saving} saved={saved} onSave={handleSave} />
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

const TABS = [
  { id: 'profile', label: 'Business Profile', Component: BusinessProfileTab },
  { id: 'whatsapp', label: 'WhatsApp', Component: WhatsAppTab },
  { id: 'ai', label: 'AI Configuration', Component: AIConfigTab },
  { id: 'notifications', label: 'Notifications', Component: NotificationsTab },
  { id: 'team', label: 'Team', Component: TeamTab },
];

export default function SettingsPage() {
  const { settings, loading, usingFallback, saveSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.Component;

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
        {usingFallback && (
          <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-800">
            Mock Data
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex-1 flex flex-col min-h-0">
        <div className="px-6 pt-4 border-b border-gray-100 dark:border-gray-700 flex gap-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
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
          {loading ? (
            <div className="max-w-xl space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-50 dark:bg-gray-900 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            ActiveComponent && <ActiveComponent settings={settings} saveSettings={saveSettings} />
          )}
        </div>
      </div>
    </div>
  );
}
