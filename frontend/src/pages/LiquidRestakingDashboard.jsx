import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  ArrowUpRight, 
  Wallet, 
  Layers, 
  Plus, 
  TrendingUp, 
  Activity, 
  MoreVertical, 
  ChevronDown,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { toast } from 'sonner';

// --- IMPORTS FROM SOURCE A (Functional) ---
// Assuming these paths exist based on the provided functional code
import LoopModal from '@/components/LoopModal';
import CreateLoopModal from '@/components/CreateLoopModal';
import { getLoops, addLoop, updateLoop, deleteLoop } from '@/services/firebaseLoops';
import { getRiskLevel } from '@/utils/loopCalculations';

// --- DESIGN SYSTEM CONSTANTS ---
const COLORS = {
  bg: '#050505',
  card: '#141414',
  cardHighlight: '#1A1A1A',
  primary: '#FFE066', // Orbit Yellow
  cyan: '#33FFCC',
  blue: '#3385FF',
  orange: '#FF6633',
  red: '#FF4444',
  textMain: '#FFFFFF',
  textMuted: '#888888',
  textDark: '#111111'
};

// --- SUB-COMPONENTS ---

// 1. Health Bar Component
const HealthBar = ({ factor }) => {
  // Logic adapted to match Source A's risk assessment if needed, 
  // but keeping visual fidelity of Source B
  let color = COLORS.cyan;
  let label = "Safe";
  
  // Assuming Health Factor < 1.1 is critical, < 1.5 is warning (Standard DeFi)
  if (factor < 1.2) {
    color = COLORS.orange; 
    label = "Critical";
  } else if (factor < 1.6) {
    color = COLORS.primary; 
    label = "Warning";
  }

  // Cap visualization width at 3.0 = 100%
  const percentage = Math.min((factor / 3) * 100, 100);

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: COLORS.textMuted }}>Health Factor</span>
        <span style={{ color: color, fontWeight: 600 }}>
          {factor > 100 ? '∞' : factor.toFixed(2)} ({label})
        </span>
      </div>
      <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// 2. Loop Card Component (Adapted to Source A Data Model)
const LoopCard = ({ loop, onClick }) => {
  // Parse numeric values safely
  const collateral = parseFloat(loop.collateralValue) || 0;
  const debt = parseFloat(loop.debtValue) || 0;
  const netValue = collateral - debt;
  const apy = parseFloat(loop.yieldApyAggregate) || 0;
  const leverage = parseFloat(loop.leverageRatio) || 0;
  const healthFactor = parseFloat(loop.healthFactor) || 0;
  
  // Handle tags (Source A might store as string or array)
  const tags = typeof loop.notesTags === 'string' 
    ? loop.notesTags.split(',').filter(t => t.trim() !== '') 
    : (Array.isArray(loop.notesTags) ? loop.notesTags : []);

  // Format Date
  const lastUpdated = loop.updatedAt 
    ? new Date(loop.updatedAt.seconds * 1000).toLocaleDateString() 
    : 'Unknown';

  // Determine Risk Status for Icon
  const isRisky = healthFactor < 1.6 && healthFactor > 0;

  return (
    <div 
      onClick={onClick}
      className="group relative p-6 rounded-[24px] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      style={{ 
        backgroundColor: COLORS.card,
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
      }}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white text-lg font-medium tracking-tight truncate max-w-[180px]">
              {loop.loopName || 'Untitled Loop'}
            </h3>
            {isRisky && (
              <AlertTriangle size={16} color={COLORS.orange} />
            )}
          </div>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#222] text-[#888] border border-[#333]">
              {loop.blockchain || loop.chain || 'Multi'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#222] text-[#888] border border-[#333]">
              {loop.numberProtocols || (loop.protocols ? loop.protocols.length : 0)} Protocols
            </span>
          </div>
        </div>
        <button className="text-[#444] hover:text-white transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Collateral</p>
          <p className="text-white text-xl font-medium">${collateral.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div>
          <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Debt</p>
          <p className="text-white text-xl font-medium">${debt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div>
          <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Net Equity</p>
          <p className="text-[#ddd] text-lg font-medium">${netValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div>
          <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Agg. APY</p>
          <p style={{ color: COLORS.cyan }} className="text-lg font-medium">{apy.toFixed(2)}%</p>
        </div>
      </div>

      {/* Health & Leverage Section */}
      <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#222]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#888] text-xs">Leverage</span>
          <span className="text-white font-mono bg-[#333] px-2 py-0.5 rounded text-sm">
            {leverage.toFixed(2)}x
          </span>
        </div>
        <HealthBar factor={healthFactor} />
      </div>

      {/* Tags & Footer */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] text-[#666]">#{tag.trim()}</span>
          ))}
        </div>
        <span className="text-[10px] text-[#444]">Updated {lastUpdated}</span>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

const OrbitLoopDashboard = () => {
  // --- LOGIC FROM SOURCE A ---
  const [loops, setLoops] = useState([]);
  const [filteredLoops, setFilteredLoops] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailLoop, setDetailLoop] = useState(null);
  const [editingLoop, setEditingLoop] = useState(null);
  
  // Filter State
  const [filters, setFilters] = useState({
    wallet: 'all',
    chain: 'all',
    status: 'All'
  });

  // UI State from Source B
  const [activeTab, setActiveTab] = useState('active');

  // Load Data
  useEffect(() => {
    loadLoops();
  }, []);

  // Quick-open Create Loop form from dashboard pill
  useEffect(() => {
    try {
      const flag = localStorage.getItem('openCreateLoopModal');
      if (flag === 'true') {
        setEditingLoop(null);
        setIsCreateModalOpen(true);
        localStorage.removeItem('openCreateLoopModal');
      }
    } catch {}
  }, []);

  // Apply Filters
  useEffect(() => {
    applyFilters();
  }, [loops, filters, activeTab]);

  const loadLoops = async () => {
    try {
      setLoading(true);
      const data = await getLoops();
      setLoops(data);
    } catch (error) {
      console.error('Error loading loops:', error);
      toast.error('Failed to load loops');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...loops];

    if (filters.wallet && filters.wallet !== 'all') {
      filtered = filtered.filter(l => l.wallet === filters.wallet);
    }

    if (filters.chain && filters.chain !== 'all') {
      filtered = filtered.filter(l => (l.blockchain === filters.chain || l.chain === filters.chain));
    }

    // Tab Logic (Mocking History vs Active)
    if (activeTab === 'history') {
        // Assuming history means closed loops or similar. 
        // If 'status' field exists in data, we use it.
        // Otherwise, this is a placeholder filter.
        filtered = filtered.filter(l => l.status === 'Closed' || l.collateralValue === 0);
    } else {
        filtered = filtered.filter(l => l.status !== 'Closed');
    }

    setFilteredLoops(filtered);
  };

  // CRUD Handlers
  const handleSaveLoop = async (loopData) => {
    try {
      if (editingLoop) {
        await updateLoop(editingLoop.id, loopData);
        setLoops(loops.map(l => l.id === editingLoop.id ? { ...l, ...loopData } : l));
        toast.success('Loop updated successfully');
      } else {
        const newLoop = await addLoop(loopData);
        setLoops([newLoop, ...loops]);
        toast.success('Loop added successfully');
      }
      setEditingLoop(null);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error saving loop:', error);
      toast.error('Failed to save loop');
    }
  };

  const handleDeleteLoop = async (id) => {
    try {
      await deleteLoop(id);
      setLoops(loops.filter(l => l.id !== id));
      setDetailLoop(null);
      toast.success('Loop deleted successfully');
    } catch (error) {
      console.error('Error deleting loop:', error);
      toast.error('Failed to delete loop');
    }
  };

  const handleLoopClick = (loop) => {
  setDetailLoop(loop);
};

  // Create/Edit flow handled by CreateLoopModal exclusively

  const handleEditLoop = (loop) => {
    setEditingLoop(loop);
    setIsCreateModalOpen(true);
  };

  const handleAddLoop = () => {
    setEditingLoop(null);
    setIsCreateModalOpen(true);
  };

  // --- CALCULATIONS ---
  const totalCollateral = filteredLoops.reduce((sum, l) => sum + (parseFloat(l.collateralValue) || 0), 0);
  const totalDebt = filteredLoops.reduce((sum, l) => sum + (parseFloat(l.debtValue) || 0), 0);
  const netWorth = totalCollateral - totalDebt;
  
  const avgHealthFactor = filteredLoops.length > 0 ?
    filteredLoops.reduce((sum, l) => {
      const hf = parseFloat(l.healthFactor) || 0;
      return sum + (hf > 100 ? 10 : hf); // Cap infinite health for avg calc
    }, 0) / filteredLoops.length : 0;

  // Derive Data for Pie Chart
  const riskDistributionData = useMemo(() => {
    const safe = filteredLoops.filter(l => (parseFloat(l.healthFactor) || 0) >= 1.6).length;
    const warning = filteredLoops.filter(l => {
        const hf = parseFloat(l.healthFactor) || 0;
        return hf >= 1.2 && hf < 1.6;
    }).length;
    const critical = filteredLoops.filter(l => (parseFloat(l.healthFactor) || 0) < 1.2).length;

    return [
      { name: 'Safe', value: safe, color: COLORS.cyan },
      { name: 'Warning', value: warning, color: COLORS.primary },
      { name: 'Critical', value: critical, color: COLORS.orange },
    ].filter(d => d.value > 0);
  }, [filteredLoops]);

  // Derive Unique Options for Filters
  const uniqueWallets = [...new Set(loops.map(l => l.wallet).filter(Boolean))];
  const uniqueChains = [...new Set(loops.map(l => l.blockchain || l.chain).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-[#FFE066] text-xl animate-pulse">Loading Orbit Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-[#FFE066] selection:text-black" style={{ backgroundColor: COLORS.bg }}>
      
      {/* Global sidebar is now provided by App-level layout */}

      {/* 2. Main Content */}
      <main className="pl-20 p-8 max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Active Loops</h1>
            <p className="text-[#666] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#33FFCC]"></span>
              Global Overview & Risk Management
            </p>
          </div>
          
          <div className="flex gap-4">
            {/* Wallet Filter */}
            <div className="relative">
              <button className="h-12 px-6 rounded-full border border-[#333] text-white flex items-center gap-2 hover:bg-[#141414] transition-colors w-48 justify-between">
                <div className="flex items-center gap-2 truncate">
                  <Wallet size={16} className="text-[#888]" />
                  <span className="truncate">{filters.wallet === 'all' ? 'All Wallets' : filters.wallet}</span>
                </div>
                <ChevronDown size={14} className="text-[#444]" />
              </button>
              <select 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={filters.wallet}
                onChange={(e) => setFilters(prev => ({ ...prev, wallet: e.target.value }))}
              >
                <option value="all">All Wallets</option>
                {uniqueWallets.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            {/* Chain Filter */}
            <div className="relative">
              <button className="h-12 px-6 rounded-full border border-[#333] text-white flex items-center gap-2 hover:bg-[#141414] transition-colors w-48 justify-between">
                <div className="flex items-center gap-2 truncate">
                  <Layers size={16} className="text-[#888]" />
                  <span className="truncate">{filters.chain === 'all' ? 'All Chains' : filters.chain}</span>
                </div>
                <ChevronDown size={14} className="text-[#444]" />
              </button>
              <select 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={filters.chain}
                onChange={(e) => setFilters(prev => ({ ...prev, chain: e.target.value }))}
              >
                <option value="all">All Chains</option>
                {uniqueChains.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            {/* Primary Action */}
            <button 
              onClick={handleAddLoop}
              className="h-12 px-8 rounded-full flex items-center gap-2 font-medium transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,224,102,0.2)] hover:shadow-[0_0_25px_rgba(255,224,102,0.4)]"
              style={{ backgroundColor: COLORS.primary, color: COLORS.textDark }}
            >
              <Plus size={20} />
              Add Loop
            </button>
          </div>
        </header>

        {/* Hero / Bento Grid Summary */}
        <section className="grid grid-cols-12 gap-6 mb-12">
          
          {/* Card 1: Total Equity (Hero Yellow) */}
          <div 
            className="col-span-12 lg:col-span-4 p-8 rounded-[32px] flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01]"
            style={{ backgroundColor: COLORS.primary }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Wallet size={20} className="text-black" />
                <span className="text-black font-medium text-sm uppercase tracking-wide">Total Net Equity</span>
              </div>
              <h2 className="text-5xl font-bold text-black tracking-tight mb-4">
                ${netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h2>
              {/* Mock metric for visual fidelity */}
              <div className="inline-flex items-center gap-1 bg-black/10 px-3 py-1 rounded-full text-black text-sm font-medium">
                <ArrowUpRight size={16} />
                <span>Active Positions</span>
              </div>
            </div>
            {/* Decoration */}
            <div className="absolute right-[-20px] bottom-[-40px] w-48 h-48 bg-white/20 rounded-full blur-2xl"></div>
          </div>

          {/* Card 2: Debt & Leverage Metrics (Standard Dark) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-5 p-8 rounded-[32px] bg-[#141414] border border-[#222]">
            <div className="flex justify-between mb-8">
              <div>
                <p className="text-[#888] text-sm uppercase mb-1">Total Active Debt</p>
                <p className="text-white text-3xl font-semibold">${totalDebt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="text-right">
                <p className="text-[#888] text-sm uppercase mb-1">Avg. Health Factor</p>
                <p className={`text-3xl font-semibold ${avgHealthFactor < 1.5 ? 'text-[#FF6633]' : 'text-[#33FFCC]'}`}>
                  {avgHealthFactor.toFixed(2)}
                </p>
              </div>
            </div>
            
            {/* Visualization Bar for Aggregate Leverage */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#666]">Aggregate Leverage Distribution</span>
              </div>
              {/* Visual Mock of distribution based on fixed percentages for design fidelity, 
                  could be calculated if backend supported leverage buckets */}
              <div className="w-full h-3 bg-[#222] rounded-full overflow-hidden flex">
                <div className="w-[40%] bg-[#3385FF]"></div>
                <div className="w-[30%] bg-[#33FFCC]"></div>
                <div className="w-[30%] bg-[#FF6633]"></div>
              </div>
              <div className="flex gap-4 mt-3">
                 <div className="flex items-center gap-2 text-xs text-[#666]">
                    <div className="w-2 h-2 rounded-full bg-[#3385FF]"></div> Low
                 </div>
                 <div className="flex items-center gap-2 text-xs text-[#666]">
                    <div className="w-2 h-2 rounded-full bg-[#33FFCC]"></div> Med
                 </div>
                 <div className="flex items-center gap-2 text-xs text-[#666]">
                    <div className="w-2 h-2 rounded-full bg-[#FF6633]"></div> High
                 </div>
              </div>
            </div>
          </div>

          {/* Card 3: Risk Distribution Chart */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3 p-6 rounded-[32px] bg-[#141414] border border-[#222] flex flex-col items-center justify-center relative">
             <h3 className="absolute top-6 left-6 text-white text-sm font-medium">Loop Risk Levels</h3>
             <div className="w-full h-[160px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData.length > 0 ? riskDistributionData : [{name:'None', value:1, color:'#333'}]}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {(riskDistributionData.length > 0 ? riskDistributionData : [{name:'None', value:1, color:'#333'}]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#222', borderColor: '#333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             {/* Center Text in Donut */}
             <div className="absolute inset-0 flex items-center justify-center pt-4 pointer-events-none">
                <div className="text-center">
                   <span className="block text-2xl font-bold text-white">{filteredLoops.length}</span>
                   <span className="text-[10px] uppercase text-[#666]">Loops</span>
                </div>
             </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-[#222] mb-8">
          <button 
            onClick={() => setActiveTab('active')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'active' ? 'text-white' : 'text-[#666] hover:text-[#999]'}`}
          >
            Active Loops ({loops.filter(l => l.status !== 'Closed').length})
            {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFE066] rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-white' : 'text-[#666] hover:text-[#999]'}`}
          >
            History
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFE066] rounded-t-full"></div>}
          </button>
          <button 
             className="ml-auto flex items-center gap-2 text-[#666] hover:text-white text-sm"
          >
            <TrendingUp size={14} />
            Analytics View
          </button>
        </div>

        {/* Loops Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLoops.map((loop) => (
            <LoopCard 
              key={loop.id} 
              loop={loop} 
              onClick={() => handleLoopClick(loop)}
            />
          ))}

          {/* "Add New" Placeholder Card */}
          <button 
            onClick={handleAddLoop}
            className="group border border-dashed border-[#333] rounded-[24px] flex flex-col items-center justify-center min-h-[300px] hover:bg-[#111] hover:border-[#444] transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4 group-hover:bg-[#222] transition-colors">
              <Plus size={32} className="text-[#FFE066]" />
            </div>
            <span className="text-white font-medium">Create New Loop</span>
            <span className="text-[#666] text-sm mt-2">Manual Entry</span>
          </button>
        </section>

      </main>

      {/* --- HIDDEN FUNCTIONAL MODALS --- */}
     <LoopModal 
   isOpen={!!detailLoop}
   onClose={() => setDetailLoop(null)}
   loop={detailLoop}
   onEdit={(l) => {
      setDetailLoop(null);
      handleEditLoop(l); // Opens the form modal
   }}
   onDelete={handleDeleteLoop}
/>

      {isCreateModalOpen && (
        <CreateLoopModal
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingLoop(null);
          }}
          onSave={handleSaveLoop}
          loop={editingLoop}
        />
      )}
    </div>
  );
};

export default OrbitLoopDashboard;