import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Calendar,
  Megaphone,
  BarChart3,
  Package,
  Repeat,
  Check,
  Clock,
  CreditCard,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  Bot,
  Phone,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from './ThemeContext';

const NAV_LINKS = ['Features', 'How It Works', 'Pricing'];

const TRUSTED_BY = ['Urban Salon', 'FitLife Gym', 'Healing Hands Clinic', 'Burger House', 'HomeFix Services', 'Prime Realty'];

const HOW_IT_WORKS = [
  { step: 1, title: 'AI Answers Instantly', description: 'Your AI employee replies to customer questions instantly.' },
  { step: 2, title: 'Handles & Automates', description: 'Books appointments, follows up, and manages conversations.' },
  { step: 3, title: 'You Grow Your Business', description: 'Save time, close more deals, and keep customers happy.' },
];

const FEATURES = [
  { Icon: MessageSquare, title: '24/7 Customer Support', description: 'Your AI employee never sleeps, answering customer questions around the clock.' },
  { Icon: Calendar, title: 'Smart Appointment Booking', description: 'Customers book, reschedule, and confirm appointments without any back and forth.' },
  { Icon: Megaphone, title: 'Campaigns & Broadcasts', description: 'Send offers and promotions to your customer list, segmented by behavior.' },
  { Icon: BarChart3, title: 'Actionable Analytics', description: 'See conversation trends, response times, and revenue at a glance.' },
  { Icon: Package, title: 'Product Catalog', description: 'Showcase your products and services so the AI can recommend them in chat.' },
  { Icon: Repeat, title: 'Automated Follow-ups', description: 'Win back inactive customers and remind them about upcoming bookings.' },
];

const PRICING_TIERS = [
  {
    name: 'Starter',
    description: 'Perfect for small businesses',
    monthlyPrice: 999,
    yearlyPrice: 799,
    features: ['1 WhatsApp Number', '1,000 Conversations / month', 'Basic AI Responses', 'Appointment Booking'],
    popular: false,
  },
  {
    name: 'Growth',
    description: 'Best for growing businesses',
    monthlyPrice: 1999,
    yearlyPrice: 1599,
    features: ['2 WhatsApp Numbers', '5,000 Conversations / month', 'Advanced AI Responses', 'Campaigns & Broadcasts', 'Analytics & Reports'],
    popular: true,
  },
  {
    name: 'Business',
    description: 'For established businesses',
    monthlyPrice: 3999,
    yearlyPrice: 3199,
    features: ['5 WhatsApp Numbers', 'Unlimited Conversations', 'Advanced AI + Customization', 'Priority Support', 'Team Members'],
    popular: false,
  },
];

const TRUST_SIGNALS = [
  { Icon: Clock, label: '14-day free trial' },
  { Icon: CreditCard, label: 'No credit card required' },
  { Icon: ShieldCheck, label: 'Cancel anytime' },
  { Icon: Headphones, label: '24/7 support' },
];

function PhoneMockup() {
  return (
    <div className="relative w-[300px] mx-auto">
      <div className="absolute -inset-12 bg-gradient-to-br from-green-300/30 to-blue-300/30 dark:from-green-500/10 dark:to-blue-500/10 rounded-full blur-3xl" />
      <div className="relative bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
            <Bot size={16} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">BizMate AI</p>
            <p className="text-xs text-green-600 dark:text-green-400">Online</p>
          </div>
        </div>
        <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-900 min-h-[320px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-200 w-fit max-w-[85%] shadow-sm">
            Hi! Do you have any appointments tomorrow?
          </div>
          <div className="bg-green-100 dark:bg-green-900/40 rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-100 w-fit max-w-[85%] ml-auto shadow-sm">
            Yes! We have slots available tomorrow. Would you like to book one?
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-200 w-fit max-w-[85%] shadow-sm">
            Great! 6 PM works for me.
          </div>
          <div className="bg-green-100 dark:bg-green-900/40 rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-100 w-fit max-w-[85%] ml-auto shadow-sm flex items-start gap-1.5">
            <CheckCircle2 size={15} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <span>Great! Your appointment is confirmed for tomorrow at 6:00 PM.</span>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-green-600 rounded-full shadow-lg flex items-center justify-center text-white">
        <Phone size={22} />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [billingCycle, setBillingCycle] = useState('monthly');

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Hero */}
      <div className="bg-green-50 dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-400/20 dark:bg-green-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-500/10 blur-[100px]" />

        <nav className="relative z-20 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 shadow-sm flex items-center justify-center text-white font-bold text-lg">
              W
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-gray-100">WhatsappAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link.toLowerCase().replace(/\s+/g, '-'))}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium text-sm transition-colors"
              >
                {link}
              </button>
            ))}
            <button
              onClick={() => navigate('/team')}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium text-sm transition-colors"
            >
              Team
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/60 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => navigate('/login')} className="px-5 py-2.5 text-gray-900 dark:text-gray-100 hover:bg-white/60 dark:hover:bg-gray-800 font-semibold rounded-xl transition-all text-sm">
              Log In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-sm transition-all text-sm"
            >
              Start Free Trial
            </button>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
              Your AI Employee <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500">
                on WhatsApp
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0">
              Automate customer support, bookings, follow-ups, and sales conversations. 24/7. On WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl shadow-lg shadow-green-500/30 transition-all hover:-translate-y-1"
              >
                Start Free Trial
              </button>
              <button className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-1">
                Book a Demo
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 pt-2">
              {TRUST_SIGNALS.slice(0, 3).map((t) => (
                <span key={t.label} className="flex items-center gap-1.5">
                  <Check size={14} className="text-green-600 dark:text-green-400" /> {t.label}
                </span>
              ))}
            </div>
          </div>

          <PhoneMockup />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
          <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">Trusted by 1,500+ businesses</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-gray-400 dark:text-gray-500 font-semibold text-sm">
            {TRUSTED_BY.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.step} className="text-center relative">
              <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 font-bold text-xl flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{item.description}</p>
              {i < HOW_IT_WORKS.length - 1 && (
                <span className="hidden md:block absolute top-7 -right-6 text-gray-300 dark:text-gray-600 text-xl">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 dark:bg-gray-950 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">Everything you need to grow</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-xl mx-auto mb-16">
            One AI employee that handles support, sales, and marketing — all inside WhatsApp.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 flex items-center justify-center mb-4">
                  <f.Icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">Simple pricing for every business</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Start free and upgrade anytime. No hidden fees.</p>

        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex items-center gap-1 text-sm font-semibold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full transition-colors ${
                billingCycle === 'monthly' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Yearly <span className="text-green-600 dark:text-green-400">(Save 20%)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-6 border ${
                tier.popular ? 'border-green-500 shadow-lg scale-[1.02]' : 'border-gray-200 dark:border-gray-700'
              } bg-white dark:bg-gray-800 flex flex-col`}
            >
              {tier.popular && (
                <span className="absolute -top-3 right-6 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="font-bold text-gray-900 dark:text-gray-100">{tier.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{tier.description}</p>
              <p className="mb-6">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  ₹{billingCycle === 'monthly' ? tier.monthlyPrice.toLocaleString('en-IN') : tier.yearlyPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">/month</span>
              </p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Check size={16} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/login')}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                  tier.popular
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Start Free Trial
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
          {TRUST_SIGNALS.map((t) => (
            <span key={t.label} className="flex items-center gap-1.5">
              <t.Icon size={15} /> {t.label}
            </span>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        © {new Date().getFullYear()} WhatsappAI. All rights reserved.
      </footer>
    </div>
  );
}
