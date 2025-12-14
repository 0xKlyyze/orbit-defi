import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Search, 
  Unlock, 
  Lock, 
  Clock, 
  Wallet, 
  Layers, 
  MoreVertical, 
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { toast } from 'sonner';
import OrbitSelect from '@/components/ui/OrbitSelect';

// --- IMPORTS FROM SOURCE A (Functional) ---
import CEXPositionForm from '@/components/CEXPositionForm';
import { 
  getCEXPositions, 
  addCEXPosition, 
  updateCEXPosition, 
  deleteCEXPosition, 
  calculateWithdrawalStatus 
} from '@/services/firebaseCEX';

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

// 1. Withdrawal Status Badge/Bar
const WithdrawalStatusBar = ({ position }) => {
  const { status, daysRemaining } = calculateWithdrawalStatus(position);
  
  let color = COLORS.textMuted;
  let label = status;
  let barColor = '#333';
  let width = '100%';

  if (status === 'Can Withdraw Now') {
    color = COLORS.cyan;
    barColor = COLORS.cyan;
  } else if (status === 'Locked') {
    color = COLORS.orange;
    barColor = COLORS.orange;
    // visual approximation of time remaining if we had total duration, 
    // for now just full bar for locked
  } else if (status === 'Pending') {
    color = COLORS.primary;
    barColor = COLORS.primary;
  }

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: COLORS.textMuted }}>
          {status === 'Locked' && daysRemaining ? `${daysRemaining} days left` : 'Status'}
        </span>
        <span style={{ color: color, fontWeight: 600 }}>{label}</span>
      </div>
      <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: width, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
};

// 2. CEX Position Card
const CEXPositionCard = ({ position, onClick, onEdit, onDelete }) => {
  const usdValue = parseFloat(position.usdValue) || 0;
  const apy = parseFloat(position.apy) || 0;
  const amount = parseFloat(position.amount) || 0;
  
  // Handle tags
  const tags = typeof position.tags === 'string' 
    ? position.tags.split(',').filter(t => t.trim() !== '') 
    : [];

  return (
    <div 
      className="group relative p-6 rounded-[24px] transition-all duration-300 hover:-translate-y-1"
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
              {position.exchange}
            </h3>
          </div>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#222] text-[#888] border border-[#333]">
              {position.asset}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#222] text-[#888] border border-[#333]">
               Staking
            </span>
          </div>
        </div>
        <div className="flex gap-2">
            {/* Edit/Action Menu Placeholder */}
            <button 
                onClick={(e) => { e.stopPropagation(); onEdit(position); }}
                className="text-[#444] hover:text-white transition-colors"
            >
             <MoreVertical size={20} />
            </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Value (USD)</p>
          <p className="text-white text-xl font-medium">${usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div>
          <p className="text-[#888] text-xs uppercase tracking-wider mb-1">APY</p>
          <p style={{ color: COLORS.cyan }} className="text-xl font-medium">{apy.toFixed(2)}%</p>
        </div>
        <div className="col-span-2">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Amount</p>
          <p className="text-[#ddd] text-lg font-medium">
            {amount.toLocaleString()} <span className="text-sm text-[#666]">{position.asset}</span>
          </p>
        </div>
      </div>

      {/* Status Section */}
      <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#222]">
        <WithdrawalStatusBar position={position} />
      </div>

      {/* Tags & Footer */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] text-[#666]">#{tag.trim()}</span>
          ))}
        </div>
        {/* Delete Button (Subtle) */}
        <button 
            onClick={(e) => { e.stopPropagation(); onDelete(position.id); }}
            className="text-[10px] text-red-900 hover:text-red-500 transition-colors"
        >
            Delete
        </button>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD ---

const CEXStakingDashboard = () => {
  // --- STATE FROM SOURCE A ---
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [withdrawalFilter, setWithdrawalFilter] = useState('All');
  const [showWithdrawn, setShowWithdrawn] = useState(false);

  // --- ORBIT UI STATE ---
  const [activeTab, setActiveTab] = useState('active'); // Maps to showWithdrawn logic

  // Page load animation state (must be before any conditional returns)
  const [pageReady, setPageReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPageReady(true), 30);
    return () => clearTimeout(t);
  }, []);

  // --- EFFECTS ---
  useEffect(() => {
    loadPositions();
  }, []);

  // Quick-open CEX position form from dashboard pill
  useEffect(() => {
    try {
      const flag = localStorage.getItem('openCEXPositionForm');
      if (flag === 'true') {
        setEditingPosition(null);
        setIsFormOpen(true);
        localStorage.removeItem('openCEXPositionForm');
      }
    } catch {}
  }, []);

  useEffect(() => {
    applyFilters();
  }, [positions, searchTerm, withdrawalFilter, showWithdrawn, activeTab]);

  // --- LOGIC ---
  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await getCEXPositions();
      setPositions(data);
    } catch (error) {
      console.error('Error loading positions:', error);
      toast.error('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...positions];

    // Tab Logic (Visual Tab -> Logical Filter)
    if (activeTab === 'history') {
        // Show only withdrawn or closed positions
        filtered = filtered.filter(p => p.status === 'Withdrawn' || p.status === 'Closed');
    } else {
        // Active Tab: Show current positions (Active + Locked)
        filtered = filtered.filter(p => p.status === 'Active' || p.status === 'Locked');
    }

    // Withdrawal Status Filter
    if (withdrawalFilter !== 'All') {
      filtered = filtered.filter(p => {
        const withdrawalInfo = calculateWithdrawalStatus(p);
        return withdrawalInfo.status === withdrawalFilter;
      });
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.exchange.toLowerCase().includes(term) ||
        p.asset.toLowerCase().includes(term) ||
        (p.tags && p.tags.toLowerCase().includes(term)) ||
        (p.notes && p.notes.toLowerCase().includes(term))
      );
    }

    // Sort by priority (Can Withdraw Now first)
    filtered.sort((a, b) => {
      const aInfo = calculateWithdrawalStatus(a);
      const bInfo = calculateWithdrawalStatus(b);
      return aInfo.priority - bInfo.priority;
    });

    setFilteredPositions(filtered);
  };

  const handleSavePosition = async (positionData) => {
    try {
      if (editingPosition) {
        await updateCEXPosition(editingPosition.id, positionData);
        setPositions(prev => prev.map(p => 
          p.id === editingPosition.id ? { ...p, ...positionData } : p
        ));
        toast.success('Position updated successfully');
      } else {
        const newPosition = await addCEXPosition(positionData);
        setPositions(prev => [newPosition, ...prev]);
        toast.success('Position added successfully');
      }
      setEditingPosition(null);
    } catch (error) {
      console.error('Error saving position:', error);
      toast.error('Failed to save position');
    }
  };

  const handleDeletePosition = async (id) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        await deleteCEXPosition(id);
        setPositions(positions.filter(p => p.id !== id));
        toast.success('Position deleted successfully');
      } catch (error) {
        console.error('Error deleting position:', error);
        toast.error('Failed to delete position');
      }
    }
  };

  const handleAddPosition = () => {
    setEditingPosition(null);
    setIsFormOpen(true);
  };

  // --- STATS CALCULATION ---
  const activePositions = positions.filter(p => p.status === 'Active' || p.status === 'Locked');
  const totalValue = activePositions.reduce((sum, p) => sum + (parseFloat(p.usdValue) || 0), 0);
  
  const averageAPY = activePositions.length > 0
    ? activePositions.reduce((sum, p) => sum + (parseFloat(p.apy) || 0), 0) / activePositions.length
    : 0;

  const withdrawableNowCount = activePositions.filter(p => {
    const info = calculateWithdrawalStatus(p);
    return info.status === 'Can Withdraw Now';
  }).length;

  // Pie Chart Data: Allocation by Asset
  const assetDistributionData = useMemo(() => {
    const distribution = {};
    activePositions.forEach(p => {
        const val = parseFloat(p.usdValue) || 0;
        if(val > 0) {
            distribution[p.asset] = (distribution[p.asset] || 0) + val;
        }
    });
    
    // Convert to array and take top 4 + others
    let data = Object.keys(distribution).map(asset => ({
        name: asset,
        value: distribution[asset]
    })).sort((a, b) => b.value - a.value);

    // Color palette for chart
    const chartColors = [COLORS.cyan, COLORS.primary, COLORS.blue, COLORS.orange, COLORS.red];

    return data.map((d, i) => ({
        ...d,
        color: chartColors[i % chartColors.length]
    }));
  }, [activePositions]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-[#FFE066] text-xl animate-pulse">Loading CEX Dashboard...</div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen font-sans selection:bg-[#FFE066] selection:text-black transition-all duration-500 ${pageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ backgroundColor: COLORS.bg }}>
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tl from-[#FFE066]/14 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-0 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(1200px 1000px at 12% 12%, rgba(255,224,102,0.22) 0%, rgba(255,224,102,0.12) 34%, transparent 76%)' }} />
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/12 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-[#FFE066]/8 rounded-full blur-[180px]" />
      </div>
      <main className="relative z-10 p-8 max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-white text-3xl font-bold tracking-tight mb-2">CEX Staking</h1>
            <p className="text-[#666] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#33FFCC]"></span>
              Centralized Exchange Positions
            </p>
          </div>
          
          <div className="flex gap-4 items-center">
            {/* Search Input (Styled like Orbit) */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={16} className="text-[#666] group-focus-within:text-[#FFE066] transition-colors" />
                </div>
                <input 
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 pl-11 pr-6 rounded-full bg-transparent border border-[#333] text-white focus:border-[#FFE066] focus:outline-none transition-colors w-48 hover:bg-[#141414]"
                />
            </div>

            {/* Status Filter Dropdown */}
            {(() => {
              const statusIcon = (
                withdrawalFilter === 'Can Withdraw Now' ? <Unlock size={16} className="text-[#33FFCC]" /> :
                withdrawalFilter === 'Locked' ? <Lock size={16} className="text-[#FF6633]" /> :
                withdrawalFilter === 'Pending' ? <Clock size={16} className="text-[#FFE066]" /> :
                <Layers size={16} className="text-[#888]" />
              );
              return (
                <OrbitSelect
                  value={withdrawalFilter}
                  onChange={(val) => setWithdrawalFilter(val)}
                  options={["All", "Can Withdraw Now", "Pending", "Locked"]}
                  placeholder="All Status"
                  icon={statusIcon}
                  className="min-w-[180px] border-[#333] hover:bg-[#141414]"
                  contentClassName="border-[#333]"
                />
              );
            })()}
            
            {/* Primary Action */}
            <button 
              onClick={handleAddPosition}
              className="h-12 px-8 rounded-full flex items-center gap-2 font-medium transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,224,102,0.2)] hover:shadow-[0_0_25px_rgba(255,224,102,0.4)]"
              style={{ backgroundColor: COLORS.primary, color: COLORS.textDark }}
            >
              <Plus size={20} />
              Add Position
            </button>
          </div>
        </header>

        {/* Hero / Bento Grid Summary */}
        <section className="grid grid-cols-12 gap-6 mb-12">
          
          {/* Card 1: Total Value (Hero Yellow) */}
          <div 
            className="col-span-12 lg:col-span-4 p-8 rounded-[32px] flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01]"
            style={{ backgroundColor: COLORS.primary }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <DollarSign size={20} className="text-black" />
                <span className="text-black font-medium text-sm uppercase tracking-wide">Total Staked Value</span>
              </div>
              <h2 className="text-5xl font-bold text-black tracking-tight mb-4">
                ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h2>
              <div className="inline-flex items-center gap-1 bg-black/10 px-3 py-1 rounded-full text-black text-sm font-medium">
                <Activity size={16} />
                <span>{activePositions.length} Active Positions</span>
              </div>
            </div>
            {/* Decoration */}
            <div className="absolute right-[-20px] bottom-[-40px] w-48 h-48 bg-white/20 rounded-full blur-2xl"></div>
          </div>

          {/* Card 2: APY & Unlocked Metrics (Standard Dark) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-5 p-8 rounded-[32px] bg-[#141414] border border-[#222]">
            <div className="flex justify-between mb-8">
              <div>
                <p className="text-[#888] text-sm uppercase mb-1">Average APY</p>
                <p className="text-white text-3xl font-semibold flex items-center gap-2">
                   <TrendingUp size={24} className="text-[#33FFCC]" />
                   {averageAPY.toFixed(2)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#888] text-sm uppercase mb-1">Withdrawable Now</p>
                <p className={`text-3xl font-semibold ${withdrawableNowCount > 0 ? 'text-[#33FFCC]' : 'text-[#666]'}`}>
                  {withdrawableNowCount}
                </p>
              </div>
            </div>
            
            {/* Visualization of Unlock Status */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#666]">Liquidity Status</span>
              </div>
              {/* Simple visual bar approximating locked vs unlocked count */}
              <div className="w-full h-3 bg-[#222] rounded-full overflow-hidden flex">
                 <div className="h-full bg-[#33FFCC]" style={{ width: `${(withdrawableNowCount / (activePositions.length || 1)) * 100}%` }}></div>
              </div>
              <div className="flex gap-4 mt-3">
                 <div className="flex items-center gap-2 text-xs text-[#666]">
                    <div className="w-2 h-2 rounded-full bg-[#33FFCC]"></div> Liquid
                 </div>
                 <div className="flex items-center gap-2 text-xs text-[#666]">
                    <div className="w-2 h-2 rounded-full bg-[#222]"></div> Locked
                 </div>
              </div>
            </div>
          </div>

          {/* Card 3: Asset Distribution Chart */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3 p-6 rounded-[32px] bg-[#141414] border border-[#222] flex flex-col items-center justify-center relative">
             <h3 className="absolute top-6 left-6 text-white text-sm font-medium">Asset Allocation</h3>
             <div className="w-full h-[160px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetDistributionData.length > 0 ? assetDistributionData : [{name:'None', value:1, color:'#333'}]}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {(assetDistributionData.length > 0 ? assetDistributionData : [{name:'None', value:1, color:'#333'}]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#222', borderColor: '#333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             {/* Center Text in Donut */}
             <div className="absolute inset-0 flex items-center justify-center pt-4 pointer-events-none">
                <div className="text-center">
                   <span className="block text-2xl font-bold text-white">{assetDistributionData.length}</span>
                   <span className="text-[10px] uppercase text-[#666]">Assets</span>
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
            Active Positions ({positions.filter(p => p.status === 'Active' || p.status === 'Locked').length})
            {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFE066] rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-white' : 'text-[#666] hover:text-[#999]'}`}
          >
            History / Withdrawn
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFE066] rounded-t-full"></div>}
          </button>
          <button 
             className="ml-auto flex items-center gap-2 text-[#666] hover:text-white text-sm"
          >
            <TrendingUp size={14} />
            Analytics View
          </button>
        </div>

        {/* Positions Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPositions.map((position) => (
            <CEXPositionCard 
              key={position.id} 
              position={position} 
              onEdit={() => {
                setEditingPosition(position);
                setIsFormOpen(true);
              }}
              onDelete={handleDeletePosition}
            />
          ))}

          {/* "Add New" Placeholder Card */}
          <button 
            onClick={handleAddPosition}
            className="group border border-dashed border-[#333] rounded-[24px] flex flex-col items-center justify-center min-h-[300px] hover:bg-[#111] hover:border-[#444] transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4 group-hover:bg-[#222] transition-colors">
              <Plus size={32} className="text-[#FFE066]" />
            </div>
            <span className="text-white font-medium">Add New Position</span>
            <span className="text-[#666] text-sm mt-2">Manual Entry</span>
          </button>
        </section>

      </main>

      {/* --- HIDDEN FUNCTIONAL MODAL --- */}
      <CEXPositionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPosition(null);
        }}
        onSave={handleSavePosition}
        position={editingPosition}
      />
    </div>
  );
};

export default CEXStakingDashboard;
