import React, { useMemo } from 'react';
import { 
  X, 
  ArrowLeft, 
  ExternalLink, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Layers, 
  ArrowRight, 
  AlertTriangle, 
  Wallet, 
  Edit2, 
  Trash2,
  Copy,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  YAxis, 
  Tooltip as RechartsTooltip 
} from 'recharts';

// --- DESIGN TOKENS ---
const COLORS = {
  bg: '#050505',
  card: '#141414',
  cardHighlight: '#1A1A1A',
  primary: '#FFE066', // Orbit Yellow
  cyan: '#33FFCC',
  orange: '#FF6633',
  red: '#FF4444',
  border: '#222'
};

// --- MOCK HISTORY DATA (For the mini chart) ---
const mockHistoryData = [
  { val: 10000 }, { val: 10200 }, { val: 10150 }, { val: 10400 }, 
  { val: 10800 }, { val: 11000 }, { val: 11250 }
];

// --- SUB-COMPONENTS ---

const StatCard = ({ label, value, subValue, icon: Icon, color = 'white', trend }) => (
  <div className="bg-[#141414] border border-[#222] p-6 rounded-[24px] relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={64} color={color} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} color={color} />
        <span className="text-[#888] text-xs uppercase font-bold tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {subValue && <div className="text-sm font-mono text-[#666]">{subValue}</div>}
      {trend && (
        <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#33FFCC] bg-[#33FFCC]/10 px-2 py-1 rounded">
          <TrendingUp size={12} /> {trend}
        </div>
      )}
    </div>
  </div>
);

const RiskGauge = ({ healthFactor, liquidationPrice, currentPrice }) => {
  // Logic: 1.0 is death, 3.0 is safe.
  const percentage = Math.min(Math.max((healthFactor - 1) / 2 * 100, 0), 100);
  
  let statusColor = COLORS.cyan;
  let statusText = "Safe";
  if (healthFactor < 1.2) { statusColor = COLORS.red; statusText = "Critical"; }
  else if (healthFactor < 1.6) { statusColor = COLORS.orange; statusText = "Warning"; }

  return (
    <div className="bg-[#141414] border border-[#222] p-6 rounded-[24px] flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-white font-medium flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#888]" />
            Risk Health
          </h3>
          <p className="text-[#666] text-xs mt-1">Liquidation proximity</p>
        </div>
        <div className="text-right">
           <span className="block text-3xl font-bold" style={{ color: statusColor }}>{healthFactor.toFixed(2)}</span>
           <span className="text-xs font-bold uppercase tracking-widest" style={{ color: statusColor }}>{statusText}</span>
        </div>
      </div>

      {/* The Gauge Bar */}
      <div className="relative h-6 bg-[#0A0A0A] rounded-full w-full overflow-hidden border border-[#222] mb-6">
        {/* Zones */}
        <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-[#FF4444]/20 border-r border-[#FF4444]/30"></div>
        <div className="absolute left-[10%] top-0 bottom-0 w-[20%] bg-[#FF6633]/20 border-r border-[#FF6633]/30"></div>
        
        {/* Indicator */}
        <div 
          className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_15px_white] transition-all duration-1000 ease-out z-10"
          style={{ left: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#222]">
        <div>
           <span className="text-[#666] text-xs uppercase block mb-1">Current Price</span>
           <span className="text-white font-mono text-lg">${currentPrice}</span>
        </div>
        <div className="text-right">
           <span className="text-[#FF4444] text-xs uppercase block mb-1">Liq. Price</span>
           <span className="text-[#FF4444] font-mono text-lg">${liquidationPrice}</span>
        </div>
      </div>
    </div>
  );
};

const StrategyVisualizer = ({ protocols }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 no-scrollbar">
      {protocols.map((proto, index) => (
        <React.Fragment key={index}>
          {/* Node */}
          <div className="flex-shrink-0 bg-[#1A1A1A] border border-[#333] p-3 rounded-xl min-w-[140px] flex flex-col items-center text-center relative group hover:border-[#FFE066] transition-colors">
             <div className="text-[10px] uppercase text-[#666] mb-1 font-bold">{proto.action}</div>
             <div className="text-white font-bold text-sm mb-1">{proto.name}</div>
             <div className="text-[#33FFCC] text-xs font-mono">{proto.asset}</div>
             
             {/* APY Badge */}
             <div className="absolute -top-2 -right-2 bg-[#222] border border-[#333] text-[10px] px-1.5 py-0.5 rounded text-[#FFE066]">
               {proto.apy}%
             </div>
          </div>

          {/* Connector */}
          {index < protocols.length - 1 && (
            <div className="flex-shrink-0 text-[#444]">
              <ArrowRight size={16} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// --- MAIN COMPONENT ---

const LoopDetailModal = ({ isOpen, onClose, loop, onEdit, onDelete }) => {
  if (!isOpen || !loop) return null;

  // Safe parsing
  const collateral = parseFloat(loop.collateralValue) || 0;
  const debt = parseFloat(loop.debtValue) || 0;
  const netEquity = collateral - debt;
  const leverage = parseFloat(loop.leverageRatio) || 0;
  const healthFactor = parseFloat(loop.healthFactor) || 0;
  const apy = parseFloat(loop.yieldApyAggregate) || 0;
  
  const normalizeAction = (type) => {
    const t = (type || '').toString().toLowerCase();
    if (t === 'supply') return 'Supply';
    if (t === 'stake') return 'Stake';
    if (t === 'restake') return 'Restake';
    if (t === 'borrow') return 'Borrow';
    if (t === 'swap') return 'Swap';
    if (t === 'leveraged') return 'Leveraged';
    return type || 'Step';
  };

  const deriveProtocols = (lp) => {
    if (!lp) return [];
    if (Array.isArray(lp.protocolBreakdown) && lp.protocolBreakdown.length > 0) {
      return lp.protocolBreakdown.map((p) => ({
        name: p.name || 'Protocol',
        action: normalizeAction(p.positionType),
        asset: p.asset || '',
        apy: p.yieldApy !== undefined ? parseFloat(p.yieldApy) : 0,
        link: p.link
      }));
    }
    if (lp.mode === 'advanced' && Array.isArray(lp.steps) && lp.steps.length > 0) {
      return lp.steps.map((s) => ({
        name: s.protocol || 'Protocol',
        action: normalizeAction(s.stepType),
        asset: s.asset || '',
        apy: s.apy !== undefined ? parseFloat(s.apy) : 0,
        link: s.link
      }));
    }
    if (lp.mode === 'quick' && lp.quickConfig) {
      const qc = lp.quickConfig;
      const arr = [];
      arr.push({
        name: qc.protocol || 'Protocol',
        action: 'Supply',
        asset: qc.lendingAsset || qc.borrowingAsset || '',
        apy: qc.lendingAPY !== undefined ? parseFloat(qc.lendingAPY) : 0
      });
      const iterations = Array.isArray(qc.iterations) ? qc.iterations : [];
      const borrowCount = Math.max(iterations.length, 1);
      for (let i = 0; i < borrowCount; i++) {
        arr.push({
          name: qc.protocol || 'Protocol',
          action: 'Borrow',
          asset: qc.borrowingAsset || qc.lendingAsset || '',
          apy: qc.borrowingAPY !== undefined ? -Math.abs(parseFloat(qc.borrowingAPY)) : 0
        });
      }
      return arr;
    }
    if (Array.isArray(lp.protocols) && lp.protocols.length > 0) {
      return lp.protocols.map((p) => ({
        name: p.name || 'Protocol',
        action: normalizeAction(p.action || p.stepType),
        asset: p.asset || '',
        apy: p.apy !== undefined ? parseFloat(p.apy) : (p.yieldApy !== undefined ? parseFloat(p.yieldApy) : 0),
        link: p.link
      }));
    }
    return [];
  };

  const protocols = useMemo(() => deriveProtocols(loop), [loop]);

  // Mock Liquidation Price logic (since we might not have it in basic schema)
  const currentPrice = 3450; 
  const liquidationPrice = currentPrice * 0.85; // Mock calculation

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Main Container */}
      <div className="w-full h-full md:h-[95vh] md:w-[95vw] md:max-w-[1400px] bg-[#050505] md:rounded-[32px] md:border border-[#222] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#FFE066]/5 to-transparent pointer-events-none" />

        {/* --- HEADER --- */}
        <header className="flex justify-between items-center p-6 border-b border-[#1A1A1A] z-10 bg-[#050505]/80 backdrop-blur-md sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#1A1A1A] text-[#888] hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">{loop.loopName || 'Untitled Strategy'}</h1>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  healthFactor < 1.5 ? 'bg-[#FF4444]/10 border-[#FF4444] text-[#FF4444]' : 'bg-[#33FFCC]/10 border-[#33FFCC] text-[#33FFCC]'
                }`}>
                  {healthFactor < 1.5 ? 'Risk High' : 'Active'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#666] mt-1">
                <span>{loop.blockchain || 'Multi-chain'}</span>
                <span>•</span>
                <span>Created on {loop.createdAt ? new Date(loop.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onEdit(loop)}
              className="px-4 py-2 rounded-full bg-[#1A1A1A] border border-[#333] text-white text-sm font-medium hover:bg-[#222] flex items-center gap-2"
            >
              <Edit2 size={14} /> Edit
            </button>
            <button 
              onClick={() => onDelete(loop.id)}
              className="p-2 rounded-full bg-[#1A1A1A] border border-[#333] text-[#FF4444] hover:bg-[#FF4444]/10 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </header>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar">
          
          {/* 1. Strategy Visualization */}
          <section>
             <div className="flex justify-between items-end mb-4">
                <h2 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                   <Layers size={16} className="text-[#FFE066]" /> Strategy Flow
                </h2>
             </div>
             <div className="bg-[#141414] border border-[#222] p-6 rounded-[24px]">
                <StrategyVisualizer protocols={protocols} />
             </div>
          </section>

          {/* 2. KPI Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Net Equity" 
              value={`$${netEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              subValue="Realizable Value"
              icon={Wallet}
              color={COLORS.primary}
              trend="+2.4%"
            />
            <StatCard 
              label="Aggregate APY" 
              value={`${apy.toFixed(2)}%`}
              subValue="Net Yield (Leveraged)"
              icon={TrendingUp}
              color={COLORS.cyan}
            />
            <StatCard 
              label="Total Debt" 
              value={`$${debt.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              subValue={`${leverage.toFixed(2)}x Leverage`}
              icon={Activity}
              color={COLORS.orange}
            />
             {/* Mini Chart Card */}
             <div className="bg-[#141414] border border-[#222] p-6 rounded-[24px] relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span className="text-[#888] text-xs uppercase font-bold tracking-wider">Performance</span>
                  <div className="text-xl font-bold text-white mt-1">30 Day Trend</div>
                </div>
                <div className="h-[60px] w-full mt-4 -mb-4 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockHistoryData}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFE066" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FFE066" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="val" stroke="#FFE066" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </section>

          {/* 3. Risk & Protocol Breakdown */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Risk Gauge */}
            <div className="lg:col-span-1">
               <RiskGauge 
                 healthFactor={healthFactor} 
                 currentPrice={currentPrice} 
                 liquidationPrice={liquidationPrice} 
               />
            </div>

            {/* Right: Detailed Protocol Table */}
            <div className="lg:col-span-2 bg-[#141414] border border-[#222] rounded-[24px] overflow-hidden flex flex-col">
               <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#1A1A1A]">
                  <h3 className="text-white font-medium">Protocol Breakdown</h3>
                  <button className="text-[#FFE066] text-xs font-bold uppercase hover:underline">Add Leg</button>
               </div>
               
               <div className="flex-1 overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-[#111] text-[#666] text-xs uppercase font-medium">
                     <tr>
                       <th className="px-6 py-4">Protocol</th>
                       <th className="px-6 py-4">Action</th>
                       <th className="px-6 py-4">Asset</th>
                       <th className="px-6 py-4 text-right">APY</th>
                       <th className="px-6 py-4 text-right">Link</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[#222]">
                     {protocols.map((p, i) => (
                       <tr key={i} className="group hover:bg-[#1A1A1A] transition-colors">
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center text-xs font-bold text-white border border-[#333]">
                                {(p.name && p.name[0]) || '?'}
                              </div>
                              <span className="text-white font-medium">{p.name}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded text-xs font-medium border ${
                             p.action === 'Borrow' ? 'border-[#FF6633]/30 text-[#FF6633] bg-[#FF6633]/10' :
                             p.action === 'Supply' || p.action === 'Stake' ? 'border-[#33FFCC]/30 text-[#33FFCC] bg-[#33FFCC]/10' :
                             'border-[#888]/30 text-[#888] bg-[#888]/10'
                           }`}>
                             {p.action}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-[#CCC] font-mono text-sm">{p.asset}</td>
                         <td className={`px-6 py-4 text-right font-mono text-sm ${parseFloat(p.apy) >= 0 ? 'text-[#33FFCC]' : 'text-[#FF6633]'}`}>
                           {p.apy}%
                         </td>
                         <td className="px-6 py-4 text-right">
                           <button className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#333] transition-colors">
                             <ExternalLink size={14} />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </section>

          {/* 4. Notes Section */}
          <section className="bg-[#141414] border border-[#222] p-6 rounded-[24px]">
             <h3 className="text-[#888] text-xs uppercase font-bold mb-4 flex items-center gap-2">
               <Info size={14} /> Strategy Notes
             </h3>
             <p className="text-[#CCC] leading-relaxed text-sm">
               {loop.notesTags || "No notes added for this strategy. Add notes to track your thesis, entry points, and exit conditions."}
             </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default LoopDetailModal;