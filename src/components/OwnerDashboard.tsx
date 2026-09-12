import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OwnerSetupData } from '../types';
import {
  ShoppingCart,
  TrendingUp,
  Package,
  AlertTriangle,
  XCircle,
  Clock,
  LayoutDashboard,
  ShoppingBag,
  BarChart2,
  MoreHorizontal,
  Mic,
  Bell,
  ChevronRight,
  Plus,
  Users,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Wallet,
  RefreshCw,
} from 'lucide-react';

interface OwnerDashboardProps {
  data: OwnerSetupData;
  onReset: () => void;
}

// Tiny sparkline (SVG polyline)
const Sparkline: React.FC<{ points: string; color: string }> = ({ points, color }) => (
  <svg viewBox="0 0 80 30" className="w-20 h-8" preserveAspectRatio="none">
    <polyline
      points={points}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  iconBg: string;
  sparkPoints: string;
  sparkColor: string;
}
const StatCard: React.FC<StatCardProps> = ({
  label, value, change, positive, icon, iconBg, sparkPoints, sparkColor,
}) => (
  <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex flex-col gap-2 hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-900/30">
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-lg`}>
        {icon}
      </div>
      <Sparkline points={sparkPoints} color={sparkColor} />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-xl font-black text-white mt-0.5">{value}</p>
    </div>
    <div className={`flex items-center gap-1 text-xs font-bold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
      {positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
      <span>{change} from yesterday</span>
    </div>
  </div>
);

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ data, onReset }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'home' | 'sales' | 'reports' | 'more'>('home');
  const [micActive, setMicActive] = useState(false);

  const greeting = () => {
    const hour = new Date().getHours();
    if (language === 'bn') {
      if (hour < 12) return 'শুভ সকাল';
      if (hour < 17) return 'শুভ দুপুর';
      return 'শুভ সন্ধ্যা';
    }
    if (language === 'hi') {
      if (hour < 12) return 'सुप्रभात';
      if (hour < 17) return 'शुभ दोपहर';
      return 'शुभ संध्या';
    }
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', weekday: 'long',
  });

  const bestSelling = [
    { name: 'Rice', sold: 24, img: '🍚', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30' },
    { name: 'Parle-G Biscuits', sold: 18, img: '🍪', color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30' },
    { name: 'Sunflower Oil', sold: 15, img: '🫙', color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30' },
  ];

  const alerts = [
    { icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, text: '8 products are low in stock', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: <XCircle className="w-4 h-4 text-red-400" />, text: '3 products are out of stock', bg: 'bg-red-500/10 border-red-500/20' },
    { icon: <Clock className="w-4 h-4 text-blue-400" />, text: '5 products are expiring soon', bg: 'bg-blue-500/10 border-blue-500/20' },
  ];

  const quickActions = [
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'New Sale', color: 'from-emerald-500 to-teal-500', textColor: 'text-slate-950' },
    { icon: <Plus className="w-5 h-5" />, label: 'Add Stock', color: 'from-blue-500 to-blue-600', textColor: 'text-white' },
    { icon: <Boxes className="w-5 h-5" />, label: 'Products', color: 'from-amber-500 to-orange-500', textColor: 'text-slate-950' },
    { icon: <Users className="w-5 h-5" />, label: 'Customers', color: 'from-purple-500 to-violet-600', textColor: 'text-white' },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-950 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed top-1/2 -right-32 w-80 h-80 bg-teal-500/8 rounded-full blur-[100px] pointer-events-none" />

      {/* TOP NAV BAR */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <button className="p-2 rounded-xl hover:bg-slate-800 transition-colors" aria-label="Menu">
          <div className="space-y-1">
            <div className="w-5 h-0.5 bg-slate-300 rounded" />
            <div className="w-4 h-0.5 bg-slate-300 rounded" />
            <div className="w-5 h-0.5 bg-slate-300 rounded" />
          </div>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Store className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">{data.shopName || 'My Store'}</p>
            <p className="text-[10px] text-emerald-400 font-medium">▾ Switch Store</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-xl hover:bg-slate-800 transition-colors" aria-label="Notifications">
            <Bell className="w-5 h-5 text-slate-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-950" />
          </button>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 text-sm font-black shadow-lg">
            {(data.ownerName?.[0] || 'O').toUpperCase()}
          </div>
        </div>
      </header>

      {/* SCROLLABLE BODY */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 space-y-5 pt-4">

        {/* GREETING HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800/90 to-emerald-950/60 border border-slate-700/60 p-5 flex items-center justify-between shadow-2xl">
          <div className="flex-1 min-w-0">
            <p className="text-lg font-black text-white">
              {greeting()}, {data.ownerName?.split(' ')[0] || 'Owner'} 👋
            </p>
            <p className="text-xs text-slate-400 mt-1">Here's what's happening in your shop today.</p>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400 font-medium">
              <span className="text-emerald-400">📅</span>
              <span>{today}</span>
            </div>
          </div>
          <div className="w-24 h-24 flex-shrink-0 flex items-end justify-end relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/30 text-4xl">
              🏪
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px]">☀️</div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none animate-shimmer" />
        </div>

        {/* STAT CARDS 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Today's Sales"
            value="₹12,450"
            change="↑ 18%"
            positive={true}
            icon={<ShoppingBag className="w-5 h-5 text-emerald-400" />}
            iconBg="bg-emerald-500/20"
            sparkPoints="0,25 10,20 20,22 30,14 40,16 50,10 60,7 70,5 80,2"
            sparkColor="#10b981"
          />
          <StatCard
            label="Today's Purchases"
            value="₹6,200"
            change="↑ 12%"
            positive={true}
            icon={<ShoppingCart className="w-5 h-5 text-blue-400" />}
            iconBg="bg-blue-500/20"
            sparkPoints="0,28 10,22 20,24 30,18 40,20 50,15 60,12 70,9 80,6"
            sparkColor="#3b82f6"
          />
          <StatCard
            label="Today's Expenses"
            value="₹1,200"
            change="↓ 5%"
            positive={false}
            icon={<Wallet className="w-5 h-5 text-amber-400" />}
            iconBg="bg-amber-500/20"
            sparkPoints="0,5 10,8 20,6 30,12 40,10 50,15 60,13 70,18 80,20"
            sparkColor="#f59e0b"
          />
          <StatCard
            label="Today's Profit"
            value="₹3,150"
            change="↑ 28%"
            positive={true}
            icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
            iconBg="bg-purple-500/20"
            sparkPoints="0,25 10,22 20,18 30,15 40,12 50,10 60,7 70,4 80,2"
            sparkColor="#a855f7"
          />
        </div>

        {/* STOCK SUMMARY */}
        <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Stock Summary</h2>
            <button className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5 hover:text-emerald-300 transition-colors">
              View All Stock <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: '128', label: 'Total Products', icon: <Package className="w-5 h-5 text-emerald-400" />, bg: 'bg-emerald-500/15 border-emerald-500/30' },
              { value: '8', label: 'Low Stock', icon: <AlertTriangle className="w-5 h-5 text-amber-400" />, bg: 'bg-amber-500/15 border-amber-500/30' },
              { value: '3', label: 'Out of Stock', icon: <XCircle className="w-5 h-5 text-red-400" />, bg: 'bg-red-500/15 border-red-500/30' },
              { value: '5', label: 'Expiring Soon', icon: <Clock className="w-5 h-5 text-blue-400" />, bg: 'bg-blue-500/15 border-blue-500/30' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-2 flex flex-col items-center gap-1 ${s.bg}`}>
                {s.icon}
                <p className="text-base font-black text-white">{s.value}</p>
                <p className="text-[9px] text-slate-400 text-center leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div>
          <h2 className="text-sm font-bold text-white mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((a) => (
              <button
                key={a.label}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 hover:border-emerald-500/40 transition-all active:scale-95 group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} ${a.textColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  {a.icon}
                </div>
                <span className="text-[10px] font-bold text-slate-300 text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* NEEDS ATTENTION */}
        <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">Needs Your Attention</h2>
            <button className="text-xs text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">View All</button>
          </div>
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.text} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${a.bg}`}>
                <div className="flex items-center gap-2.5">
                  {a.icon}
                  <span className="text-xs text-slate-300 font-medium">{a.text}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sales Chart */}
          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-white">Today's Sales</h2>
              <button className="text-xs text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">View Report</button>
            </div>
            <p className="text-2xl font-black text-white mb-3">₹12,450</p>
            <svg viewBox="0 0 220 80" className="w-full h-20" preserveAspectRatio="none">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,70 L30,58 L55,62 L80,45 L105,50 L130,35 L155,28 L180,18 L210,8 L220,5 L220,80 L0,80 Z"
                fill="url(#salesGrad)"
              />
              <polyline
                points="0,70 30,58 55,62 80,45 105,50 130,35 155,28 180,18 210,8 220,5"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {[[0,70],[80,45],[155,28],[220,5]].map(([x,y], i) => (
                <circle key={i} cx={x} cy={y} r="3.5" fill="#10b981" />
              ))}
            </svg>
            <div className="flex justify-between text-[9px] text-slate-500 mt-1">
              {['6AM','9AM','12PM','3PM','6PM','9PM'].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>

          {/* Best Selling */}
          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white">Best Selling Today</h2>
              <button className="text-xs text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">View All</button>
            </div>
            <div className="space-y-2.5">
              {bestSelling.map((item) => (
                <div key={item.name} className={`flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r border ${item.color}`}>
                  <div className="w-9 h-9 rounded-xl bg-slate-900/60 flex items-center justify-center text-xl flex-shrink-0">
                    {item.img}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold">{item.sold} Sold</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reset / Logout */}
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-2 rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Switch Store / Logout
          </button>
        </div>
      </main>

      {/* FLOATING MIC BUTTON */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setMicActive((v) => !v)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 ${
            micActive
              ? 'bg-red-500 shadow-red-500/40 animate-pulse'
              : 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/40 hover:scale-110'
          }`}
          aria-label="Voice Assistant"
        >
          <Mic className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* BOTTOM NAV BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80">
        <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
          {[
            { id: 'home', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Home' },
            { id: 'sales', icon: <ShoppingCart className="w-5 h-5" />, label: 'Sales' },
            { id: 'reports', icon: <BarChart2 className="w-5 h-5" />, label: 'Reports' },
            { id: 'more', icon: <MoreHorizontal className="w-5 h-5" />, label: 'More' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-all ${
                activeTab === tab.id ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              <span className={`text-[10px] font-bold ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-500'}`}>
                {tab.label}
              </span>
              {activeTab === tab.id && <div className="w-1 h-1 bg-emerald-400 rounded-full" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};
