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
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip
} from 'recharts';
import { toast } from 'sonner';

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
      className={`group relative p-5 rounded-[20px] bg-[#141414] border border-[#222] transition-all hover:border-[#444] hover:-translate-y-1 ${data.status === 'Closed' ? 'opacity-50 grayscale' : ''}`}
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

// 2. Functional Add/Edit Modal
const PositionFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    type: 'Supply',
    platform: '',
    chain: '',
    asset: '',
    amount: '',
    usdValue: '',
    yieldAPY: '',
    wallet: '',
    link: '',
    notes: '',
    status: 'Active'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'Supply',
        platform: initialData.platform || '',
        chain: initialData.chain || '',
        asset: initialData.asset || '',
        amount: initialData.amount || '',
        usdValue: initialData.usdValue || '',
        yieldAPY: initialData.yieldAPY || '',
        wallet: initialData.wallet || '',
        link: initialData.link || '',
        notes: initialData.notes || '',
        status: initialData.status || 'Active'
      });
    } else {
      // Reset defaults for new entry
      setFormData({
        type: 'Supply',
        platform: '',
        chain: '',
        asset: '',
        amount: '',
        usdValue: '',
        yieldAPY: '',
        wallet: '',
        link: '',
        notes: '',
        status: 'Active'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.platform || !formData.asset) {
      toast.error("Please fill in Platform and Asset");
      return;
    }
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#141414] border border-[#222] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="p-8 pb-0 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{initialData ? 'Edit Position' : 'Add Position'}</h2>
          <button onClick={onClose} className="p-2 bg-[#222] rounded-full text-white hover:bg-[#333]"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           {/* Toggle Type */}
           <div className="bg-[#0A0A0A] p-1 rounded-xl flex border border-[#222]">
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'Supply' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.type === 'Supply' ? 'bg-[#33FFCC] text-black shadow-lg' : 'text-[#666] hover:text-white'}`}
              >
                Supply (Asset)
              </button>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'Borrow' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.type === 'Borrow' ? 'bg-[#FF6633] text-black shadow-lg' : 'text-[#666] hover:text-white'}`}
              >
                Borrow (Debt)
              </button>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-xs text-[#666] uppercase font-bold">Protocol</label>
                 <input 
                   name="platform" 
                   value={formData.platform} 
                   onChange={handleChange}
                   type="text" 
                   placeholder="e.g. Aave" 
                   className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs text-[#666] uppercase font-bold">Chain</label>
                 <input 
                   name="chain" 
                   value={formData.chain} 
                   onChange={handleChange}
                   type="text" 
                   placeholder="e.g. Ethereum" 
                   className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors" 
                 />
              </div>
           </div>

           {/* New Field: Link */}
           <div className="space-y-2">
              <label className="text-xs text-[#666] uppercase font-bold">Platform Link (URL)</label>
              <div className="relative">
                <ExternalLink size={16} className="absolute left-4 top-3.5 text-[#444]" />
                <input 
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  type="url" 
                  placeholder="https://app.aave.com..." 
                  className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors" 
                />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-xs text-[#666] uppercase font-bold">Asset</label>
                 <input 
                   name="asset" 
                   value={formData.asset} 
                   onChange={handleChange}
                   type="text" 
                   placeholder="USDC" 
                   className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs text-[#666] uppercase font-bold">Amount</label>
                 <input 
                   name="amount" 
                   value={formData.amount} 
                   onChange={handleChange}
                   type="number" 
                   step="any"
                   placeholder="0.00" 
                   className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none font-mono transition-colors" 
                 />
              </div>
           </div>

           <div className="space-y-2">
               <label className="text-xs text-[#666] uppercase font-bold">Current USD Value</label>
               <input 
                 name="usdValue" 
                 value={formData.usdValue} 
                 onChange={handleChange}
                 type="number" 
                 step="any"
                 placeholder="$ 0.00" 
                 className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none font-mono transition-colors" 
               />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-xs text-[#666] uppercase font-bold">APY (%)</label>
                 <input 
                   name="yieldAPY" 
                   value={formData.yieldAPY} 
                   onChange={handleChange}
                   type="number" 
                   step="any"
                   placeholder="4.5" 
                   className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs text-[#666] uppercase font-bold">Wallet</label>
                 <input 
                   name="wallet" 
                   value={formData.wallet} 
                   onChange={handleChange}
                   type="text" 
                   placeholder="Main Vault" 
                   className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors" 
                 />
              </div>
           </div>

           {/* New Field: Notes */}
           <div className="space-y-2">
              <label className="text-xs text-[#666] uppercase font-bold">Notes</label>
              <div className="relative">
                <FileText size={16} className="absolute left-4 top-3.5 text-[#444]" />
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Strategy details, liquidation points..." 
                  className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors resize-none" 
                />
              </div>
           </div>

           <div className="pt-2 flex">
              <button type="submit" className="w-full py-4 rounded-xl bg-[#FFE066] text-black font-bold text-lg hover:bg-[#FFD633] transition-colors shadow-lg shadow-[#FFE066]/20">
                 {initialData ? 'Update Position' : 'Confirm Position'}
              </button>
           </div>
        </form>
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
  useEffect(() => {
    loadPositions();
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

  // CRUD Handlers
  const handleSavePosition = async (positionData) => {
    try {
      if (editingPosition) {
        await updatePosition(editingPosition.id, positionData);
        setPositions(positions.map(p => 
          p.id === editingPosition.id ? { ...p, ...positionData } : p
        ));
        toast.success('Position updated successfully');
      } else {
        const newPosition = await addPosition(positionData);
        setPositions([newPosition, ...positions]);
        toast.success('Position added successfully');
      }
      setIsModalOpen(false);
      setEditingPosition(null);
    } catch (error) {
      console.error('Error saving position:', error);
      toast.error('Failed to save position');
    }
  };

  const handleDeletePosition = async (id) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        await deletePosition(id);
        setPositions(positions.filter(p => p.id !== id));
        toast.success('Position deleted successfully');
      } catch (error) {
        console.error('Error deleting position:', error);
        toast.error('Failed to delete position');
      }
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
      .sort((a,b) => b.value - a.value);
    
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
    <div className="min-h-screen flex font-sans selection:bg-[#FFE066] selection:text-black" style={{ backgroundColor: COLORS.bg }}>
      
      {/* Global sidebar is now provided by App-level layout */}

      {/* 2. Main Content */}
      <main className="flex-1 ml-20 p-8 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Standard Dashboard</h1>
            <p className="text-[#666] flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-[#FFE066]"></span>
              Manual Portfolio Tracking
            </p>
          </div>
          
          <div className="flex gap-4">
             {/* Filter Toggles */}
             <div className="relative">
                <button className="h-12 px-6 rounded-full border border-[#333] text-white flex items-center gap-2 hover:bg-[#141414] transition-colors bg-[#050505] min-w-[160px] justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet size={16} className="text-[#888]" />
                    <span className="truncate max-w-[100px]">{filters.wallet === 'all' ? 'All Wallets' : filters.wallet}</span>
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

             {/* Add Button */}
             <button 
               onClick={handleAddClick}
               className="h-12 px-8 rounded-full flex items-center gap-2 font-medium transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,224,102,0.2)] hover:shadow-[0_0_25px_rgba(255,224,102,0.4)]"
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
             className="col-span-12 md:col-span-4 lg:col-span-3 p-6 rounded-[24px] flex flex-col justify-between transition-all hover:scale-[1.01]"
             style={{ backgroundColor: COLORS.primary }}
           >
              <div>
                 <div className="flex items-center gap-2 mb-2 opacity-75">
                    <Wallet size={18} className="text-black" />
                    <span className="text-black font-bold text-xs uppercase">Net Worth</span>
                 </div>
                 <h2 className="text-4xl font-bold text-black tracking-tight">${netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
              </div>
              <div className="mt-4 pt-4 border-t border-black/10">
                 <div className="flex justify-between text-black text-xs font-medium">
                    <span>Active Positions</span>
                    <span>{activeStatsPositions.length}</span>
                 </div>
              </div>
           </div>

           {/* Supply Stats */}
           <div className="col-span-12 md:col-span-4 lg:col-span-3 p-6 rounded-[24px] bg-[#141414] border border-[#222]">
              <div className="flex items-center gap-2 mb-6">
                 <div className="p-2 rounded-lg bg-[#33FFCC]/10 text-[#33FFCC]">
                    <ArrowUpRight size={18} />
                 </div>
                 <span className="text-[#888] text-xs uppercase font-bold">Total Supplied</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">${totalSupply.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
              <p className="text-[#33FFCC] text-sm font-medium">Assets</p>
           </div>

           {/* Borrow Stats */}
           <div className="col-span-12 md:col-span-4 lg:col-span-3 p-6 rounded-[24px] bg-[#141414] border border-[#222]">
              <div className="flex items-center gap-2 mb-6">
                 <div className="p-2 rounded-lg bg-[#FF6633]/10 text-[#FF6633]">
                    <ArrowDownLeft size={18} />
                 </div>
                 <span className="text-[#888] text-xs uppercase font-bold">Total Borrowed</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">${totalBorrow.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
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
