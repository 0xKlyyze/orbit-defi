import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Wallet, 
  Activity, 
  ArrowUpRight, 
  ArrowRight, 
  Zap, 
  ShieldAlert, 
  Layers, 
  BrainCircuit,
  MessageSquare,
  TrendingUp,
  Bell,
  LayoutGrid,
  PieChart as PieIcon,
  Command,
  Maximize2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';

// --- DESIGN TOKENS ---
const COLORS = {
  bg: '#050505',
  card: '#141414',
  primary: '#FFE066', // Orbit Yellow
  ai: '#8B5CF6',      // AI Violet
  cyan: '#33FFCC',
  orange: '#FF6633',
  red: '#FF4444',
  glass: 'rgba(20, 20, 20, 0.6)',
  border: '#222'
};

// --- MOCK DATA ---

// 1. Overall Portfolio History
const portfolioHistory = [
  { date: 'Mon', value: 142000 },
  { date: 'Tue', value: 145000 },
  { date: 'Wed', value: 143500 },
  { date: 'Thu', value: 148000 },
  { date: 'Fri', value: 154610 },
  { date: 'Sat', value: 156000 },
  { date: 'Sun', value: 158200 },
];

// 2. Risk Radar Data (Aggregated across modules)
const riskMetrics = [
  { subject: 'Liquidation', A: 80, fullMark: 100 }, // High means Safe
  { subject: 'Volatility', A: 65, fullMark: 100 },
  { subject: 'Protocol', A: 90, fullMark: 100 },
  { subject: 'Peg', A: 70, fullMark: 100 },
  { subject: 'Strategy', A: 85, fullMark: 100 },
];

// 3. AI Insights
const aiInsights = [
  {
    id: 1,
    type: 'opportunity',
    title: 'Yield Optimization',
    message: 'Move 5,000 USDC from Binance (Flexible) to Aave V3 Base. Projected yield increase: +8.2% APY.',
    impact: '+$410/yr',
    icon: <TrendingUp size={16} />
  },
  {
    id: 2,
    type: 'warning',
    title: 'Health Decay',
    message: 'ETH price volatility detected. "Loop #3 (Blast)" health factor dropped to 1.15. Recommendation: Repay debt or add collateral.',
    impact: 'High Risk',
    icon: <ShieldAlert size={16} />
  },
  {
    id: 3,
    type: 'info',
    title: 'Upcoming Unlock',
    message: 'Your 12.5 ETH staked on Kraken unlocks in 3 days. Prepare for reallocation.',
    impact: 'Liquidity',
    icon: <Activity size={16} />
  }
];

// --- COMPONENTS ---

const AIChatBar = () => (
  <div className="relative w-full max-w-2xl mx-auto mb-10 group z-20">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFE066] to-[#8B5CF6] rounded-full opacity-20 group-hover:opacity-50 blur transition duration-500"></div>
    <div className="relative flex items-center bg-[#141414] rounded-full px-6 h-16 border border-[#222] shadow-2xl">
      <Sparkles className="text-[#8B5CF6] mr-4 animate-pulse" size={20} />
      <input 
        type="text" 
        placeholder="Ask Orbit AI... (e.g. 'Simulate ETH drop to $2000' or 'Show my total stablecoin exposure')"
        className="flex-1 bg-transparent text-white placeholder:text-[#666] outline-none text-lg"
      />
      <div className="flex items-center gap-2 text-[#444]">
        <span className="text-xs border border-[#333] px-2 py-1 rounded bg-[#0A0A0A]">⌘ K</span>
        <button className="p-2 hover:text-white transition-colors"><ArrowRight size={20} /></button>
      </div>
    </div>
  </div>
);

const InsightCard = ({ data }) => {
  const isWarning = data.type === 'warning';
  const accent = isWarning ? COLORS.orange : COLORS.ai;
  
  return (
    <div className="p-5 rounded-[24px] bg-[#141414] border border-[#222] hover:border-[#444] transition-all hover:-translate-y-1 relative overflow-hidden group">
      {/* Glow Effect */}
      <div 
        className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: accent }}
      ></div>
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center bg-opacity-10"
            style={{ backgroundColor: `${accent}20`, color: accent }}
          >
            {data.icon}
          </div>
          <span className="text-sm font-bold text-white">{data.title}</span>
        </div>
        <span 
          className="text-[10px] px-2 py-1 rounded-full border bg-black/50"
          style={{ borderColor: `${accent}40`, color: accent }}
        >
          {data.impact}
        </span>
      </div>
      
      <p className="text-[#888] text-sm leading-relaxed mb-4">
        {data.message}
      </p>

      <button className="text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all" style={{ color: accent }}>
        View Details <ArrowRight size={12} />
      </button>
    </div>
  );
};

const StatCard = ({ label, value, sub, trend, color }) => (
  <div className="p-6 rounded-[24px] bg-[#141414] border border-[#222] relative overflow-hidden">
    <div className="relative z-10">
      <p className="text-[#666] text-xs uppercase tracking-wider mb-2">{label}</p>
      <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: color }}>{sub}</span>
        {trend && (
           <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222] text-[#888]">{trend}</span>
        )}
      </div>
    </div>
    {/* Background Decoration */}
    <div 
      className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-20"
      style={{ backgroundColor: color }}
    ></div>
  </div>
);

// --- MAIN DASHBOARD ---

const OrbitAIDashboardMockup = () => {
  const [activeView, setActiveView] = useState('overview');

  return (
    <div className="min-h-screen font-sans selection:bg-[#8B5CF6] selection:text-white flex bg-[#050505]">
      
      {/* 1. Sidebar (Consistent) */}
      <aside className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-8 border-r border-[#111] z-50 bg-[#050505]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE066] to-[#FFAA33] mb-12 flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(255,224,102,0.3)]">
          <div className="w-4 h-4 bg-black rounded-sm transform rotate-45"></div>
        </div>
        <nav className="flex flex-col gap-8 w-full items-center">
          <div className="p-3 rounded-xl bg-[#1A1A1A] text-[#8B5CF6] border border-[#8B5CF6]/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <BrainCircuit size={24} />
          </div>
          <div className="p-3 rounded-xl text-[#444] hover:text-white transition-colors cursor-pointer relative group">
            <Layers size={24} />
            <span className="absolute left-14 bg-[#222] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Loops</span>
          </div>
          <div className="p-3 rounded-xl text-[#444] hover:text-white transition-colors cursor-pointer relative group">
            <LayoutGrid size={24} />
             <span className="absolute left-14 bg-[#222] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Lending</span>
          </div>
          <div className="p-3 rounded-xl text-[#444] hover:text-white transition-colors cursor-pointer relative group">
            <Activity size={24} />
             <span className="absolute left-14 bg-[#222] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Staking</span>
          </div>
        </nav>
        <div className="mt-auto flex flex-col gap-6 items-center">
          <div className="p-3 text-[#444] hover:text-white cursor-pointer"><Bell size={20} /></div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
        </div>
      </aside>

      {/* 2. Main Content */}
      <main className="flex-1 ml-20 p-8 max-w-[1600px] mx-auto relative">
        
        {/* Background Ambient Mesh */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
           <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-[#8B5CF6] rounded-full blur-[180px] opacity-[0.07]"></div>
           <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-[#FFE066] rounded-full blur-[180px] opacity-[0.05]"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10">
          
          {/* Header */}
          <header className="flex justify-between items-center mb-12">
             <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
                   Good evening, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE066] to-[#FFAA33]">Commander</span>
                </h1>
                <p className="text-[#666] text-sm flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-[#33FFCC] animate-pulse"></span>
                   Orbit AI Systems Online
                </p>
             </div>
             <div className="flex gap-4">
                <button className="px-4 py-2 rounded-full bg-[#141414] border border-[#222] text-[#888] text-sm hover:text-white hover:border-[#444] transition-colors">
                   Customize Layout
                </button>
             </div>
          </header>

          {/* AI Search / Command */}
          <AIChatBar />

          {/* KPI Grid */}
          <div className="grid grid-cols-12 gap-6 mb-12">
             
             {/* Total Net Worth (Hero) */}
             <div className="col-span-12 lg:col-span-4 p-8 rounded-[32px] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#222] relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                   <div>
                      <div className="flex items-center gap-2 mb-4">
                         <div className="p-2 rounded-lg bg-[#FFE066]/10 text-[#FFE066]"><Wallet size={20} /></div>
                         <span className="text-[#888] font-medium text-xs uppercase tracking-wider">Net Aggregated Worth</span>
                      </div>
                      <h2 className="text-5xl font-bold text-white tracking-tighter mb-2">$158,200.00</h2>
                      <p className="text-[#33FFCC] flex items-center gap-1 text-sm font-medium">
                         <TrendingUp size={14} /> +2.4% (24h)
                      </p>
                   </div>
                   
                   {/* Mini Area Chart */}
                   <div className="h-24 w-full mt-4 -mx-2">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={portfolioHistory}>
                            <defs>
                               <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#FFE066" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#FFE066" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke="#FFE066" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>

             {/* Secondary Stats */}
             <div className="col-span-12 md:col-span-6 lg:col-span-2 space-y-6">
                <StatCard 
                   label="Active Loops" 
                   value="4" 
                   sub="High Risk: 1" 
                   color="#33FFCC"
                />
                <StatCard 
                   label="Staked in CEX" 
                   value="$42.5k" 
                   sub="Unlock: 3 Days" 
                   color="#8B5CF6"
                />
             </div>

             {/* Risk Radar (AI Analysis) */}
             <div className="col-span-12 md:col-span-6 lg:col-span-3 p-6 rounded-[32px] bg-[#141414] border border-[#222] relative flex flex-col items-center justify-center">
                <div className="absolute top-6 left-6 flex items-center gap-2">
                   <ShieldAlert size={16} className="text-[#FF6633]" />
                   <span className="text-white text-xs font-bold uppercase">Risk Heatmap</span>
                </div>
                <div className="w-full h-[200px] mt-6">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={riskMetrics}>
                         <PolarGrid stroke="#333" />
                         <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                         <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                         <Radar name="Portfolio" dataKey="A" stroke="#8B5CF6" strokeWidth={2} fill="#8B5CF6" fillOpacity={0.3} />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>
                <div className="absolute bottom-4 text-[10px] text-[#666]">
                   AI Assessment: <span className="text-[#33FFCC]">Resilient</span>
                </div>
             </div>

             {/* Yield Widget */}
             <div className="col-span-12 lg:col-span-3 p-6 rounded-[32px] bg-[#141414] border border-[#222] relative">
                <div className="flex justify-between items-center mb-6">
                   <span className="text-white text-xs font-bold uppercase">Yield Pulse</span>
                   <div className="w-2 h-2 rounded-full bg-[#33FFCC] animate-ping"></div>
                </div>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-xs">🌀</div>
                         <div>
                            <p className="text-white text-sm font-medium">Loop APY</p>
                            <p className="text-[#666] text-xs">Aggregated</p>
                         </div>
                      </div>
                      <span className="text-[#33FFCC] font-mono text-lg">18.5%</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-xs">🏦</div>
                         <div>
                            <p className="text-white text-sm font-medium">Lending</p>
                            <p className="text-[#666] text-xs">Supply Side</p>
                         </div>
                      </div>
                      <span className="text-[#33FFCC] font-mono text-lg">4.2%</span>
                   </div>
                   <div className="pt-4 border-t border-[#222] mt-2">
                      <p className="text-[#888] text-xs">Est. Monthly Income</p>
                      <p className="text-white font-bold text-xl mt-1">$1,240.50</p>
                   </div>
                </div>
             </div>
          </div>

          {/* AI Insights Stream */}
          <section>
             <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-[#8B5CF6]" size={20} />
                <h2 className="text-xl font-bold text-white">Orbit Intelligence Stream</h2>
                <span className="bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs px-2 py-0.5 rounded border border-[#8B5CF6]/30">3 New</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiInsights.map(insight => (
                   <InsightCard key={insight.id} data={insight} />
                ))}
             </div>
          </section>

          {/* Quick Actions Bar (Bottom Floating) */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#141414]/90 backdrop-blur-xl border border-[#222] rounded-full px-2 py-2 flex items-center gap-2 shadow-2xl z-40">
             <button className="w-10 h-10 rounded-full bg-[#222] text-[#888] hover:text-white flex items-center justify-center transition-colors">
                <PlusIcon />
             </button>
             <div className="w-px h-6 bg-[#333]"></div>
             <ActionIcon icon={<Layers size={18}/>} label="New Loop" shortcut="L" />
             <ActionIcon icon={<LayoutGrid size={18}/>} label="Lend" shortcut="S" />
             <ActionIcon icon={<Activity size={18}/>} label="Stake" shortcut="C" />
             <div className="w-px h-6 bg-[#333]"></div>
             <button className="px-4 py-2 rounded-full bg-[#FFE066] text-black font-bold text-sm hover:bg-[#FFD633] transition-colors">
                Sync Data
             </button>
          </div>

        </div>
      </main>
    </div>
  );
};

// --- Sub-components for cleanliness ---
const ActionIcon = ({ icon, label, shortcut }) => (
  <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#222] rounded-full text-[#888] hover:text-white transition-all group">
     {icon}
     <span className="text-sm font-medium">{label}</span>
     <span className="text-[10px] bg-[#000] px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{shortcut}</span>
  </button>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default OrbitAIDashboardMockup;
