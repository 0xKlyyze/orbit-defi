import React from 'react';
import { Wallet, TrendingUp, ShieldAlert, Activity, RefreshCcw, Landmark } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Mock Data for Charts (Keep until we implement history collection)
const portfolioHistory = [
  { name: 'Mon', value: 13500 },
  { name: 'Tue', value: 13600 },
  { name: 'Wed', value: 13550 },
  { name: 'Thu', value: 13700 },
  { name: 'Fri', value: 13770 },
  { name: 'Sat', value: 13800 },
  { name: 'Sun', value: 13850 },
];

// Fallback Risk Data if AI hasn't loaded yet
const DEFAULT_RISK_METRICS = [
    { subject: 'Liquidation', A: 50, fullMark: 100 },
    { subject: 'Volatility', A: 50, fullMark: 100 },
    { subject: 'Protocol', A: 50, fullMark: 100 },
    { subject: 'Peg', A: 50, fullMark: 100 },
    { subject: 'Strategy', A: 50, fullMark: 100 },
];

const StatCard = ({ label, value, sub, trend, color }) => (
  <div className="p-6 rounded-[24px] bg-[#141414] border border-[#222] relative overflow-hidden h-[calc(50%-12px)] flex flex-col justify-center">
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

const KPISection = ({ stats, riskMetrics, riskScore }) => {
  // Use AI data if available, else default
  const currentRiskData = riskMetrics || DEFAULT_RISK_METRICS;
  const currentRiskScore = riskScore || 50;
  
  const getRiskLabel = (score) => {
      if (score >= 80) return "Resilient";
      if (score >= 60) return "Moderate";
      return "High Risk";
  };

  return (
    <div className="grid grid-cols-12 gap-6 mb-12">

      {/* 1. Total Net Worth (Hero) */}
      <div className="col-span-12 lg:col-span-4 p-8 rounded-[32px] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#222] relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-[#FFE066]/10 text-[#FFE066]"><Wallet size={20} /></div>
                  <span className="text-[#888] font-medium text-xs uppercase tracking-wider">Net Aggregated Worth</span>
              </div>
              <h2 className="text-5xl font-bold text-white tracking-tighter mb-2">
                ${stats?.total_net_worth?.toLocaleString() ?? '0.00'}
              </h2>
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

      {/* 2. Secondary Stats (Active Loops & Staked in CEX) */}
      <div className="col-span-12 md:col-span-6 lg:col-span-2 space-y-6">
        <StatCard 
            label="Active Loops"
            value={stats?.breakdown?.loops?.count ?? 0}
            sub={`${stats?.breakdown?.loops?.apy ?? 0}% APY`}
            color="#33FFCC"
        />
        <StatCard 
            label="Staked in CEX"
            value={`$${(stats?.breakdown?.cex?.value / 1000).toFixed(1)}k`}
            sub={`${stats?.breakdown?.cex?.apy ?? 0}% APY`}
            color="#8B5CF6"
        />
      </div>

      {/* 3. Risk Radar - POPULATED BY AI */}
      <div className="col-span-12 md:col-span-6 lg:col-span-3 p-6 rounded-[32px] bg-[#141414] border border-[#222] relative flex flex-col items-center justify-center">
        <div className="absolute top-6 left-6 flex items-center gap-2">
            <ShieldAlert size={16} className="text-[#FF6633]" />
            <span className="text-white text-xs font-bold uppercase">Risk Heatmap</span>
        </div>
        <div className="w-full h-[200px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={currentRiskData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Portfolio" dataKey="A" stroke="#8B5CF6" strokeWidth={2} fill="#8B5CF6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
        </div>
        <div className="absolute bottom-4 text-[10px] text-[#666]">
            AI Assessment: <span className="text-[#33FFCC]">{getRiskLabel(currentRiskScore)}</span>
        </div>
      </div>

      {/* 4. Yield Pulse Widget */}
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
              <span className="text-[#33FFCC] font-mono text-lg">{stats?.breakdown?.loops?.apy ?? 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-xs">🏦</div>
                  <div>
                    <p className="text-white text-sm font-medium">Lending</p>
                    <p className="text-[#666] text-xs">Supply Side</p>
                  </div>
              </div>
              <span className="text-[#33FFCC] font-mono text-lg">{stats?.breakdown?.defi?.apy ?? 0}%</span>
            </div>
            <div className="pt-4 border-t border-[#222] mt-2">
              <p className="text-[#888] text-xs">Est. Monthly Income</p>
              <p className="text-white font-bold text-xl mt-1">${stats?.monthly_income?.toLocaleString() ?? '0.00'}</p>
            </div>
        </div>
      </div>

    </div>
  );
};

export default KPISection;
