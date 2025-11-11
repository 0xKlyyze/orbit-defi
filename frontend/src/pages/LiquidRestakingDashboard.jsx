import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import LoopCard from '@/components/LoopCard';
import LoopModal from '@/components/LoopModal';
import LoopFormSelector from '@/components/LoopFormSelector';
import QuickLoopForm from '@/components/QuickLoopForm';
import AdvancedLoopForm from '@/components/AdvancedLoopForm';
import RestakingCharts from '@/components/RestakingCharts';
import RestakingFilters from '@/components/RestakingFilters';
import { getLoops, addLoop, updateLoop, deleteLoop } from '@/services/firebaseLoops';
import { getRiskLevel } from '@/utils/loopCalculations';

const LiquidRestakingDashboard = () => {
  const [loops, setLoops] = useState([]);
  const [filteredLoops, setFilteredLoops] = useState([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isQuickFormOpen, setIsQuickFormOpen] = useState(false);
  const [isAdvancedFormOpen, setIsAdvancedFormOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoop, setSelectedLoop] = useState(null);
  const [editingLoop, setEditingLoop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    wallet: 'all',
    chain: 'all',
    status: 'All'
  });

  useEffect(() => {
    loadLoops();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [loops, filters]);

  const loadLoops = async () => {
    try {
      setLoading(true);
      const data = await getLoops();
      setLoops(data);
      toast.success('Loops loaded successfully');
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
      filtered = filtered.filter(l => l.chain === filters.chain);
    }

    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(l => {
        const healthFactor = parseFloat(l.healthFactor) || 0;
        const risk = getRiskLevel(healthFactor);
        return risk.status === filters.status;
      });
    }

    setFilteredLoops(filtered);
  };

  const handleSaveLoop = async (loopData) => {
    try {
      if (editingLoop) {
        await updateLoop(editingLoop.id, loopData);
        setLoops(loops.map(l => 
          l.id === editingLoop.id ? { ...l, ...loopData } : l
        ));
        toast.success('Loop updated successfully');
      } else {
        const newLoop = await addLoop(loopData);
        setLoops([newLoop, ...loops]);
        toast.success('Loop added successfully');
      }
      setEditingLoop(null);
    } catch (error) {
      console.error('Error saving loop:', error);
      toast.error('Failed to save loop');
    }
  };

  const handleDeleteLoop = async (id) => {
    try {
      await deleteLoop(id);
      setLoops(loops.filter(l => l.id !== id));
      setIsModalOpen(false);
      setSelectedLoop(null);
      toast.success('Loop deleted successfully');
    } catch (error) {
      console.error('Error deleting loop:', error);
      toast.error('Failed to delete loop');
    }
  };

  const handleLoopClick = (loop) => {
    setSelectedLoop(loop);
    setIsModalOpen(true);
  };

  const handleEditLoop = (loop) => {
    setEditingLoop(loop || selectedLoop);
    setIsModalOpen(false);
    setIsFormOpen(true);
  };

  const handleAddLoop = () => {
    setEditingLoop(null);
    setIsFormOpen(true);
  };

  // Calculate aggregate stats
  const totalCollateral = filteredLoops.reduce((sum, l) => sum + (parseFloat(l.collateralValue) || 0), 0);
  const totalDebt = filteredLoops.reduce((sum, l) => sum + (parseFloat(l.debtValue) || 0), 0);
  const avgLeverage = filteredLoops.length > 0 ? 
    filteredLoops.reduce((sum, l) => sum + (parseFloat(l.leverageRatio) || 0), 0) / filteredLoops.length : 0;
  
  // Calculate overall health
  const avgHealthFactor = filteredLoops.length > 0 ?
    filteredLoops.reduce((sum, l) => {
      const hf = parseFloat(l.healthFactor) || 0;
      return sum + (hf === 999 ? 10 : hf);
    }, 0) / filteredLoops.length : 0;
  const overallRisk = getRiskLevel(avgHealthFactor);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950/20 flex items-center justify-center">
        <div className="text-white text-xl" data-testid="loading-indicator">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="liquid-restaking-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Liquid Restaking Loops</h2>
          <p className="text-zinc-400">Track your complex DeFi positions</p>
        </div>
        <Button
          onClick={handleAddLoop}
          data-testid="add-loop-button"
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/20 px-6 py-6 text-lg"
        >
          <Plus className="mr-2" size={20} />
          Add Loop
        </Button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6 shadow-xl" data-testid="total-collateral-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-zinc-400 text-sm font-medium">Total Collateral</h3>
            <DollarSign className="text-red-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white" data-testid="total-collateral">
            ${totalCollateral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-orange-500/20 rounded-xl p-6 shadow-xl" data-testid="total-debt-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-zinc-400 text-sm font-medium">Total Debt</h3>
            <TrendingDown className="text-orange-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white" data-testid="total-debt">
            ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6 shadow-xl" data-testid="avg-leverage-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-zinc-400 text-sm font-medium">Avg Leverage</h3>
            <Activity className="text-red-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white" data-testid="avg-leverage">
            {avgLeverage.toFixed(2)}x
          </p>
        </div>

        <div 
          className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border rounded-xl p-6 shadow-xl" 
          style={{
            borderColor: overallRisk.color === 'emerald' ? 'rgba(16, 185, 129, 0.3)' : 
                        overallRisk.color === 'yellow' ? 'rgba(234, 179, 8, 0.3)' : 
                        'rgba(239, 68, 68, 0.3)'
          }}
          data-testid="overall-risk-card"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-zinc-400 text-sm font-medium">Overall Risk</h3>
            <AlertTriangle 
              className={overallRisk.color === 'emerald' ? 'text-emerald-400' :
                        overallRisk.color === 'yellow' ? 'text-yellow-400' :
                        'text-red-400'}
              size={20} 
            />
          </div>
          <p 
            className={`text-3xl font-bold ${
              overallRisk.color === 'emerald' ? 'text-emerald-400' :
              overallRisk.color === 'yellow' ? 'text-yellow-400' :
              'text-red-400'
            }`}
            data-testid="overall-risk-level"
          >
            {overallRisk.level}
          </p>
        </div>
      </div>

      {/* Filters */}
      <RestakingFilters
        filters={filters}
        onFilterChange={setFilters}
        loops={loops}
      />

      {/* Charts */}
      <RestakingCharts loops={filteredLoops} />

      {/* Loop Cards */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">
          Loops ({filteredLoops.length})
        </h3>
        {filteredLoops.length === 0 ? (
          <div className="bg-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-12 text-center" data-testid="empty-loops-state">
            <p className="text-zinc-500 text-lg mb-4">No loops found</p>
            <p className="text-zinc-600 mb-6">Start tracking your liquid restaking positions by adding your first loop</p>
            <Button
              onClick={handleAddLoop}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white"
            >
              <Plus className="mr-2" size={18} />
              Add Your First Loop
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="loops-grid">
            {filteredLoops.map(loop => (
              <LoopCard
                key={loop.id}
                loop={loop}
                onClick={() => handleLoopClick(loop)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <LoopModal
        loop={selectedLoop}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLoop(null);
        }}
        onEdit={handleEditLoop}
        onDelete={handleDeleteLoop}
      />

      <LoopForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLoop(null);
        }}
        onSave={handleSaveLoop}
        loop={editingLoop}
      />
    </div>
  );
};

export default LiquidRestakingDashboard;