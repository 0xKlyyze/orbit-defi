import React from 'react';
import { Wallet, TrendingUp, ShieldAlert, Activity, Zap, Layers, Landmark } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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

const riskData = [
  { subject: 'Volatility', A: 120, fullMark: 150 },
  { subject: 'Impermanent Loss', A: 98, fullMark: 150 },
  { subject: 'Smart Contract', A: 86, fullMark: 150 },
  { subject: 'Liquidation', A: 99, fullMark: 150 },
  { subject: 'Peg Loss', A: 85, fullMark: 150 },
  { subject: 'Collateral', A: 65, fullMark: 150 },
];

const KPISection = ({ stats }) => {
  return (
    <div className="grid grid-cols-12 gap-6 mb-8">
      {/* Total Net Worth - Hero Card */}
      <div className="col-span-12 lg:col-span-8 relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#141414] to-[#0A0A0A] rounded-[32px] border border-[#222] overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        </div>
        
        <div className="relative p-8 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#FFE066]/10 rounded-xl">
                  <Wallet className="w-5 h-5 text-[#FFE066]" />
                </div>
                <span className="text-gray-400 font-medium">Total Net Worth</span>
              </div>
              <h2 className="text-5xl font-bold text-white tracking-tight mb-4">
                ${stats?.total_net_worth?.toLocaleString() ?? '...'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[#33FFCC] bg-[#33FFCC]/10 px-3 py-1 rounded-full text-sm font-medium">
                  <TrendingUp className="w-3 h-3" />
                  +{stats?.change_24h}% (24h)
                </span>
                <span className="text-gray-500 text-sm ml-2">
                   {stats?.active_protocols ?? 0} Active Sources
                </span>
              </div>
            </div>
            {/* Mini Chart */}
            <div className="h-[100px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioHistory}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#33FFCC" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#33FFCC" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#33FFCC" strokeWidth={2} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Breakdown Mini-Bar */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-[#222]/50">
             <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase">Loops</span>
                <span className="text-white font-mono">${stats?.breakdown?.loops?.value?.toLocaleString() ?? '0'}</span>
             </div>
             <div className="w-px h-8 bg-[#333]"></div>
             <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase">DeFi</span>
                <span className="text-white font-mono">${stats?.breakdown?.defi?.value?.toLocaleString() ?? '0'}</span>
             </div>
             <div className="w-px h-8 bg-[#333]"></div>
             <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase">CEX</span>
                <span className="text-white font-mono">${stats?.breakdown?.cex?.value?.toLocaleString() ?? '0'}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Yield Widget (Updated with Breakdown) */}
      <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[#141414] rounded-[32px] p-6 border border-[#222]">
         <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B5CF6]/10 rounded-xl">
              <Activity className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Yield Pulse</h3>
              <p className="text-xs text-gray-400">Aggregated Income</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#33FFCC] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#33FFCC]"></span>
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
           {/* Total APY & Income */}
           <div className="flex justify-between items-center p-4 bg-[#1A1A1A] rounded-2xl border border-[#222]">
              <div>
                <span className="block text-gray-400 text-xs">Avg. APY</span>
                <span className="text-xl font-bold text-[#33FFCC]">{stats?.yield_apy}%</span>
              </div>
              <div className="text-right">
                <span className="block text-gray-400 text-xs">Est. Monthly</span>
                <span className="text-xl font-bold text-white">${stats?.monthly_income}</span>
              </div>
           </div>

           {/* Yield Breakdown List */}
           <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#222] transition-colors">
                 <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#FFE066]" />
                    <span className="text-sm text-gray-300">Looping</span>
                 </div>
                 <span className="text-sm font-mono text-[#FFE066]">{stats?.breakdown?.loops?.apy ?? 0}%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#222] transition-colors">
                 <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#3385FF]" />
                    <span className="text-sm text-gray-300">DeFi Positions</span>
                 </div>
                 <span className="text-sm font-mono text-[#3385FF]">{stats?.breakdown?.defi?.apy ?? 0}%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#222] transition-colors">
                 <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-[#FF6633]" />
                    <span className="text-sm text-gray-300">CEX Staking</span>
                 </div>
                 <span className="text-sm font-mono text-[#FF6633]">{stats?.breakdown?.cex?.apy ?? 0}%</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default KPISection;
