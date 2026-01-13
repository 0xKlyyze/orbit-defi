import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  LayoutGrid,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  X,
  PieChart as PieIcon,
  Archive,
  ChevronDown,
  ExternalLink,
  FileText
} from 'lucide-react';
import OrbitSelect from '@/components/ui/OrbitSelect';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';
import { toast } from 'sonner';
import PositionFormModal from '@/components/PositionFormModal';

// --- IMPORTS FROM SOURCE A (Functional) ---
import { getPositions, addPosition, updatePosition, deletePosition } from '@/services/firebase';

// --- DESIGN TOKENS ---
const COLORS = {
  bg: '#050505',
  card: '#141414',
  inputBg: '#0A0A0A',
  primary: '#FFE066', // Orbit Yellow
  supply: '#33FFCC',  // Cyan for Assets (In)
  borrow: '#FF6633',  // Orange for Liabilities (Out)
  textMain: '#FFFFFF',
  textMuted: '#888888',
  border: '#222222'
};

// --- HELPER COMPONENTS ---

// 1. Position Card
const PositionCard = ({ data, onEdit, onDelete }) => {
  const isSupply = data.type === 'Supply';
  const accentColor = isSupply ? COLORS.supply : COLORS.borrow;
  const icon = isSupply ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />;

  // Parse numbers safely
  const usdValue = parseFloat(data.usdValue) || 0;
  const amount = parseFloat(data.amount) || 0;
  const apy = parseFloat(data.yieldAPY) || 0;

  return (
    <div
      className={`group relative p-5 rounded-[20px] bg-[#141414] border border-[#222] transition-all hover:border-[#444] hover:-translate-y-1 ${data.status === 'Closed' ? 'opacity-50 grayscale' : ''
        } ${data._isOptimistic ? 'animate-pulse ring-2 ring-[#FFE066]/40' : ''}`}
    >
      {/* Type Indicator Bar */}
      <div
        className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full"
        style={{ backgroundColor: accentColor }}
      ></div>

      <div className="pl-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#222] flex items-center justify-center text-xs font-bold text-white border border-[#333]">
              {data.asset ? data.asset.substring(0, 4) : '???'}
            </div>
            <div>
              <h3 className="text-white font-medium text-sm flex items-center gap-2">
                {/* Clickable Platform Link */}
                {data.link ? (
                  <a
                    href={data.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline decoration-1 underline-offset-2 flex items-center gap-1 hover:text-[#FFE066] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {data.platform}
                    <ExternalLink size={10} className="opacity-50" />
                  </a>
                ) : (
                  <span>{data.platform}</span>
                )}

                <span className="text-[10px] text-[#666] px-1.5 py-0.5 rounded bg-[#0A0A0A] border border-[#222] font-normal">
                  {data.chain}
                </span>
              </h3>
              <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: accentColor }}>
                {icon}
                {data.type ? data.type.toUpperCase() : 'SUPPLY'}
              </div>
            </div>
          </div>

          <button className="text-[#444] hover:text-white transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Numbers */}
        <div className="mb-4">
          <p className="text-[#888] text-[10px] uppercase mb-1">Current Value</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">${usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <p className="text-xs font-mono text-[#666] mt-1">{amount.toLocaleString()} {data.asset}</p>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-[#222] flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#666] uppercase">APY</span>
            <span className={`font-mono text-sm ${isSupply ? 'text-[#33FFCC]' : 'text-[#FF6633]'}`}>
              {apy.toFixed(2)}%
            </span>
          </div>

          {data.status === 'Closed' ? (
            <span className="px-2 py-1 rounded-md bg-[#222] text-[#888] text-[10px] font-bold">CLOSED</span>
          ) : (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(data)}
                className="p-1.5 rounded-lg bg-[#222] text-[#888] hover:text-white transition-colors"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={() => onDelete(data.id)}
                className="p-1.5 rounded-lg bg-[#222] text-[#888] hover:text-[#FF4444] transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- MAIN DASHBOARD COMPONENT ---

const PositionsDashboard = () => {
  // --- STATE FROM SOURCE A ---
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    wallet: 'all',
    search: '',
    showClosed: false
  });

  // --- EFFECTS ---
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    loadPositions();
    const t = setTimeout(() => setPageLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Quick-open new position modal from dashboard pill
  useEffect(() => {
    try {
      const flag = localStorage.getItem('openPositionsForm');
      if (flag === 'true') {
        setEditingPosition(null);
        setIsModalOpen(true);
        localStorage.removeItem('openPositionsForm');
      }
    } catch { }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [positions, filters]);

  // --- LOGIC ---
  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await getPositions();
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

    // Filter Closed
    if (!filters.showClosed) {
      filtered = filtered.filter(p => p.status === 'Active');
    }

    // Filter Wallet
    if (filters.wallet && filters.wallet !== 'all') {
      filtered = filtered.filter(p => p.wallet === filters.wallet);
    }

    // Filter Search (Platform, Asset, Chain)
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        (p.platform && p.platform.toLowerCase().includes(term)) ||
        (p.asset && p.asset.toLowerCase().includes(term)) ||
        (p.chain && p.chain.toLowerCase().includes(term))
      );
    }

    setFilteredPositions(filtered);
  };

  // CRUD Handlers - with Optimistic UI Updates
  const handleSavePosition = async (positionData) => {
    // Close modal immediately for instant feedback
    setIsModalOpen(false);

    if (editingPosition) {
      // Optimistic update for edit
      const optimisticUpdate = { ...editingPosition, ...positionData, _isOptimistic: true };
      setPositions(prev => prev.map(p => p.id === editingPosition.id ? optimisticUpdate : p));
      setEditingPosition(null);
      toast.success('Position updated!');

      try {
        await updatePosition(editingPosition.id, positionData);
        // Mark as no longer optimistic
        setPositions(prev => prev.map(p =>
          p.id === editingPosition.id ? { ...p, _isOptimistic: false } : p
        ));
      } catch (error) {
        console.error('Error updating position:', error);
        // Rollback to original
        setPositions(prev => prev.map(p =>
          p.id === editingPosition.id ? editingPosition : p
        ));
        toast.error('Failed to update position. Changes reverted.');
      }
    } else {
      // Optimistic creation - show immediately
      const tempId = `temp-${Date.now()}`;
      const optimisticPosition = {
        id: tempId,
        ...positionData,
        _isOptimistic: true,
        status: 'Active'
      };

      // Add to list instantly
      setPositions(prev => [optimisticPosition, ...prev]);
      setEditingPosition(null);
      toast.success('Position added!');

      try {
        // Fire backend request in background
        const newPosition = await addPosition(positionData);

        // Replace optimistic with real data
        setPositions(prev => prev.map(p =>
          p.id === tempId ? { ...newPosition, _isOptimistic: false } : p
        ));
      } catch (error) {
        console.error('Error saving position:', error);
        // Rollback - remove the optimistic item
        setPositions(prev => prev.filter(p => p.id !== tempId));
        toast.error('Failed to save position. Please try again.');
      }
    }
  };

  const handleDeletePosition = async (id) => {
    if (!window.confirm('Are you sure you want to delete this position?')) return;

    // Find position before deleting for potential rollback
    const positionToDelete = positions.find(p => p.id === id);

    // Optimistic delete - remove immediately
    setPositions(prev => prev.filter(p => p.id !== id));
    toast.success('Position deleted!');

    try {
      await deletePosition(id);
    } catch (error) {
      console.error('Error deleting position:', error);
      // Rollback - restore the deleted position
      if (positionToDelete) {
        setPositions(prev => [positionToDelete, ...prev]);
      }
      toast.error('Failed to delete position. Restored.');
    }
  };

  const handleAddClick = () => {
    setEditingPosition(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (position) => {
    setEditingPosition(position);
    setIsModalOpen(true);
  };

  // --- DERIVED DATA FOR UI ---
  // Ensure we only calc stats on active positions regardless of view
  const activeStatsPositions = positions.filter(p => p.status === 'Active');

  const totalSupply = activeStatsPositions
    .filter(p => p.type === 'Supply')
    .reduce((acc, p) => acc + (parseFloat(p.usdValue) || 0), 0);

  const totalBorrow = activeStatsPositions
    .filter(p => p.type === 'Borrow')
    .reduce((acc, p) => acc + (parseFloat(p.usdValue) || 0), 0);

  const netWorth = totalSupply - totalBorrow;

  // Chart Data: Asset Allocation (Supply Only)
  const allocationData = useMemo(() => {
    const data = activeStatsPositions
      .filter(p => p.type === 'Supply')
      .reduce((acc, curr) => {
        const existing = acc.find(item => item.name === curr.asset);
        const val = parseFloat(curr.usdValue) || 0;
        if (existing) { existing.value += val; }
        else { acc.push({ name: curr.asset, value: val }); }
        return acc;
      }, [])
      .sort((a, b) => b.value - a.value);

    // Fallback if empty
    if (data.length === 0) return [{ name: 'Empty', value: 1 }];
    return data;
  }, [activeStatsPositions]);

  // Unique Wallets for Filter
  const uniqueWallets = [...new Set(positions.map(p => p.wallet).filter(Boolean))];

  // Chart Colors
  const CHART_COLORS = [COLORS.supply, COLORS.primary, COLORS.borrow, '#FFFFFF', '#888888'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-[#FFE066] text-xl animate-pulse">Loading Positions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-x-hidden font-sans selection:bg-[#FFE066] selection:text-black relative" style={{ backgroundColor: COLORS.bg }}>
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tl from-[#FFE066]/14 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-0 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(1200px 1000px at 12% 12%, rgba(255,224,102,0.22) 0%, rgba(255,224,102,0.12) 34%, transparent 76%)' }} />
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/12 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-[#FFE066]/8 rounded-full blur-[180px]" />
      </div>

      {/* Global sidebar is now provided by App-level layout */}

      {/* 2. Main Content */}
      <main className={`relative z-10 flex-1 p-4 md:p-8 max-w-[1600px] mx-auto transition-all duration-700 ease-out no-scrollbar ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6 md:mb-10">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tight mb-2">Standard Dashboard</h1>
            <p className="text-[#666] flex items-center gap-2 text-xs md:text-sm">
              <span className="w-2 h-2 rounded-full bg-[#FFE066]"></span>
              Manual Portfolio Tracking
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Filter Toggles */}
            <OrbitSelect
              value={filters.wallet}
              onChange={(v) => setFilters(prev => ({ ...prev, wallet: v }))}
              options={['all', ...uniqueWallets]}
              placeholder="All Wallets"
              icon={<Wallet size={16} className="text-[#888]" />}
              className="border-[#333] w-full md:w-48 hover:bg-[#141414]"
              contentClassName="min-w-[200px]"
            />

            {/* Add Button */}
            <button
              onClick={handleAddClick}
              className="h-12 px-8 rounded-full flex items-center justify-center gap-2 font-medium transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,224,102,0.2)] hover:shadow-[0_0_25px_rgba(255,224,102,0.4)]"
              style={{ backgroundColor: COLORS.primary, color: 'black' }}
            >
              <Plus size={20} />
              Add Position
            </button>
          </div>
        </header>

        {/* Top Summary Stats (Bento Row) */}
        <section className="grid grid-cols-12 gap-6 mb-10">

          {/* Net Worth (Hero) */}
          <div
            className="col-span-12 md:col-span-4 lg:col-span-3 p-5 md:p-6 rounded-[24px] flex flex-col justify-between transition-all hover:scale-[1.01]"
            style={{ backgroundColor: COLORS.primary }}
          >
            <div>
              <div className="flex items-center gap-2 mb-2 opacity-75">
                <Wallet size={18} className="text-black" />
                <span className="text-black font-bold text-xs uppercase">Net Worth</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">${netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
            </div>
            <div className="mt-4 pt-4 border-t border-black/10">
              <div className="flex justify-between text-black text-xs font-medium">
                <span>Active Positions</span>
                <span>{activeStatsPositions.length}</span>
              </div>
            </div>
          </div>

          {/* Supply Stats */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 p-5 md:p-6 rounded-[24px] bg-[#141414] border border-[#222]">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-[#33FFCC]/10 text-[#33FFCC]">
                <ArrowUpRight size={18} />
              </div>
              <span className="text-[#888] text-xs uppercase font-bold">Total Supplied</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">${totalSupply.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
            <p className="text-[#33FFCC] text-sm font-medium">Assets</p>
          </div>

          {/* Borrow Stats */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 p-5 md:p-6 rounded-[24px] bg-[#141414] border border-[#222]">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-[#FF6633]/10 text-[#FF6633]">
                <ArrowDownLeft size={18} />
              </div>
              <span className="text-[#888] text-xs uppercase font-bold">Total Borrowed</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">${totalBorrow.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
            <p className="text-[#FF6633] text-sm font-medium">Liabilities</p>
          </div>

          {/* Allocation Chart */}
          <div className="col-span-12 lg:col-span-3 p-6 rounded-[24px] bg-[#141414] border border-[#222] relative flex flex-col justify-center">
            <h3 className="absolute top-6 left-6 text-white text-xs font-bold uppercase">Asset Allocation</h3>
            <div className="w-full h-[120px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    innerRadius={40}
                    outerRadius={55}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
          </div>
        </section>

        {/* Action Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <div className="h-10 px-4 rounded-xl bg-[#141414] border border-[#222] flex items-center gap-2 w-64 focus-within:border-[#FFE066] transition-colors">
              <Search size={16} className="text-[#666]" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Filter positions..."
                className="bg-transparent text-white text-sm outline-none w-full placeholder:text-[#444]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#666] text-sm">Show Closed</span>
            <button
              onClick={() => setFilters(prev => ({ ...prev, showClosed: !prev.showClosed }))}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${filters.showClosed ? 'bg-[#FFE066]' : 'bg-[#222]'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${filters.showClosed ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>

        {/* Positions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPositions.length > 0 ? (
            filteredPositions.map((pos) => (
              <PositionCard
                key={pos.id}
                data={pos}
                onEdit={handleEditClick}
                onDelete={handleDeletePosition}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-[#444] border border-dashed border-[#222] rounded-[24px]">
              <Archive size={48} className="mx-auto mb-4 opacity-50" />
              <p>No positions found.</p>
            </div>
          )}

          {/* Quick Add Placeholder */}
          <button
            onClick={handleAddClick}
            className="border border-dashed border-[#333] rounded-[24px] flex flex-col items-center justify-center min-h-[220px] hover:bg-[#111] hover:border-[#444] transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4 group-hover:bg-[#222] transition-colors">
              <Plus size={24} className="text-[#FFE066]" />
            </div>
            <span className="text-[#888] font-medium text-sm group-hover:text-white transition-colors">Add New Position</span>
          </button>
        </div>

      </main>

      {/* Modal */}
      <PositionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPosition(null);
        }}
        onSave={handleSavePosition}
        initialData={editingPosition}
      />
    </div>
  );
};

export default PositionsDashboard;
