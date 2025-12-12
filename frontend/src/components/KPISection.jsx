import React from 'react';
import { Wallet, TrendingUp, ShieldAlert, Activity, Zap, Layers, Landmark, ArrowRight, RefreshCcw } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

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

const KPISection = ({ stats }) => {
  return (
    <div className="grid grid-cols-12 gap-6 mb-8">
      {/* 1. Net Aggregated Worth - Hero Widget */}
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
                <span className="text-gray-400 font-medium">Net Aggregated Worth</span>
              </div>
              <h2 className="text-5xl font-bold text-white tracking-tight mb-4">
                ${stats?.total_net_worth?.toLocaleString() ?? '0.00'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[#33FFCC] bg-[#33FFCC]/10 px-3 py-1 rounded-full text-sm font-medium">
                  <TrendingUp className="w-3 h-3" />
                  +2.4% (24h)
                </span>
              </div>
            </div>
            
            {/* Mini Area Chart */}
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
        </div>
      </div>

      {/* 2. Yield Pulse Widget */}
      <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[#141414] rounded-[32px] p-6 border border-[#222] flex flex-col justify-between">
         <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B5CF6]/10 rounded-xl">
              <Activity className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Yield Pulse</h3>
              <p className="text-xs text-gray-400">Aggregated Earnings</p>
            </div>
          </div>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#33FFCC] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#33FFCC]"></span>
          </span>
        </div>
        
        <div className="space-y-4">
           <div className="flex justify-between items-center p-4 bg-[#1A1A1A] rounded-2xl border border-[#222]">
              <div>
                <span className="block text-gray-400 text-xs uppercase tracking-wide">Avg. APY</span>
                <span className="text-2xl font-bold text-[#33FFCC]">{stats?.yield_apy}%</span>
              </div>
              <div className="text-right">
                <span className="block text-gray-400 text-xs uppercase tracking-wide">Est. Monthly</span>
                <span className="text-2xl font-bold text-white">${stats?.monthly_income}</span>
              </div>
           </div>
        </div>
      </div>

      {/* 3. Active Loops Widget */}
      <div className="col-span-12 md:col-span-6 lg:col-span-6 bg-[#141414] rounded-[32px] p-6 border border-[#222] group hover:border-[#FFE066]/30 transition-all">
         <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FFE066]/10 rounded-xl">
              <RefreshCcw className="w-5 h-5 text-[#FFE066]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Active Loops</h3>
              <p className="text-xs text-gray-400">{stats?.breakdown?.loops?.count ?? 0} Strategies Deployed</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#FFE066]/10 border border-[#FFE066]/20">
             <span className="text-xs font-bold text-[#FFE066]">{stats?.breakdown?.loops?.apy ?? 0}% APY</span>
          </div>
        </div>
        
        <div className="flex items-end justify-between">
           <div>
              <span className="text-3xl font-bold text-white">${stats?.breakdown?.loops?.value?.toLocaleString() ?? '0'}</span>
              <p className="text-gray-500 text-sm mt-1">Total Loop Value</p>
           </div>
           <button className="p-2 rounded-full bg-[#222] text-gray-400 group-hover:bg-[#FFE066] group-hover:text-black transition-all">
              <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* 4. Staked in CEX Widget */}
      <div className="col-span-12 md:col-span-6 lg:col-span-6 bg-[#141414] rounded-[32px] p-6 border border-[#222] group hover:border-[#FF6633]/30 transition-all">
         <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF6633]/10 rounded-xl">
              <Landmark className="w-5 h-5 text-[#FF6633]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Staked in CEX</h3>
              <p className="text-xs text-gray-400">{stats?.breakdown?.cex?.count ?? 0} Active Positions</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#FF6633]/10 border border-[#FF6633]/20">
             <span className="text-xs font-bold text-[#FF6633]">{stats?.breakdown?.cex?.apy ?? 0}% APY</span>
          </div>
        </div>
        
        <div className="flex items-end justify-between">
           <div>
              <span className="text-3xl font-bold text-white">${stats?.breakdown?.cex?.value?.toLocaleString() ?? '0'}</span>
              <p className="text-gray-500 text-sm mt-1">Total Staked Value</p>
           </div>
           <button className="p-2 rounded-full bg-[#222] text-gray-400 group-hover:bg-[#FF6633] group-hover:text-black transition-all">
              <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>

    </div>
  );
};

export default KPISection;
