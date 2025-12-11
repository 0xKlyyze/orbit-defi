import React from 'react';
import { Wallet, TrendingUp, ShieldAlert, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Mock Data for Charts
const portfolioHistory = [
  { name: 'Mon', value: 120000 },
  { name: 'Tue', value: 122000 },
  { name: 'Wed', value: 121500 },
  { name: 'Thu', value: 123800 },
  { name: 'Fri', value: 124500 },
  { name: 'Sat', value: 126000 },
  { name: 'Sun', value: 128450 },
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
        </div>
      </div>

      {/* Risk Radar */}
      <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[#141414] rounded-[32px] p-6 border border-[#222] relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF6633]/10 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-[#FF6633]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Risk Analysis</h3>
              <p className="text-xs text-gray-400">AI Safety Score: <span className="text-[#33FFCC]">{stats?.risk_score ?? 0}/100</span></p>
            </div>
          </div>
        </div>
        <div className="h-[200px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
              <Radar name="Portfolio" dataKey="A" stroke="#FF6633" strokeWidth={2} fill="#FF6633" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Yield Widget */}
      <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[#141414] rounded-[32px] p-6 border border-[#222]">
         <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B5CF6]/10 rounded-xl">
              <Activity className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Active Yield</h3>
              <p className="text-xs text-gray-400">{stats?.active_protocols ?? 0} Active Protocols</p>
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
           <div className="flex justify-between items-center p-4 bg-[#1A1A1A] rounded-2xl border border-[#222]">
              <span className="text-gray-400 text-sm">Avg. APY</span>
              <span className="text-xl font-bold text-[#33FFCC]">{stats?.yield_apy}%</span>
           </div>
           <div className="flex justify-between items-center p-4 bg-[#1A1A1A] rounded-2xl border border-[#222]">
              <span className="text-gray-400 text-sm">Est. Monthly</span>
              <span className="text-xl font-bold text-white">${stats?.monthly_income}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default KPISection;
