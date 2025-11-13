import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, Activity, Search, Unlock, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import CEXPositionCard from '@/components/CEXPositionCard';
import CEXPositionForm from '@/components/CEXPositionForm';
import { getCEXPositions, addCEXPosition, updateCEXPosition, deleteCEXPosition, calculateWithdrawalStatus } from '@/services/firebaseCEX';

const CEXStakingDashboard = () => {
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [withdrawalFilter, setWithdrawalFilter] = useState('All');
  const [showWithdrawn, setShowWithdrawn] = useState(false);

  useEffect(() => {
    loadPositions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [positions, searchTerm, withdrawalFilter, showWithdrawn]);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await getCEXPositions();
      setPositions(data);
      toast.success('Positions loaded successfully');
    } catch (error) {
      console.error('Error loading positions:', error);
      toast.error('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...positions];

    // Filter by withdrawn status
    if (!showWithdrawn) {
      filtered = filtered.filter(p => p.status === 'Active');
    }

    // Filter by withdrawal status
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

    // Sort by withdrawal priority (Can Withdraw Now first)
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
        setPositions(positions.map(p => 
          p.id === editingPosition.id ? { ...p, ...positionData } : p
        ));
        toast.success('Position updated successfully');
      } else {
        const newPosition = await addCEXPosition(positionData);
        setPositions([newPosition, ...positions]);
        toast.success('Position added successfully');
      }
      setEditingPosition(null);
    } catch (error) {
      console.error('Error saving position:', error);
      toast.error('Failed to save position');
    }
  };

  const handleEditPosition = (position) => {
    setEditingPosition(position);
    setIsFormOpen(true);
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

  // Calculate aggregated stats
  const activePositions = positions.filter(p => p.status === 'Active');
  const totalValue = activePositions.reduce((sum, p) => sum + (parseFloat(p.usdValue) || 0), 0);
  const averageAPY = activePositions.length > 0
    ? activePositions.reduce((sum, p) => sum + (parseFloat(p.apy) || 0), 0) / activePositions.length
    : 0;

  const withdrawableNow = activePositions.filter(p => {
    const info = calculateWithdrawalStatus(p);
    return info.status === 'Can Withdraw Now';
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950/20 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="cex-staking-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">CEX Staking</h2>
          <p className="text-zinc-400">Track your centralized exchange staking positions</p>
        </div>
        <Button
          onClick={handleAddPosition}
          data-testid="add-cex-position-button"
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/20 px-6 py-6 text-lg"
        >
          <Plus className="mr-2" size={20} />
          Add Position
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-zinc-400 text-sm font-medium">Total Value</h3>
            <DollarSign className="text-red-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-orange-500/20 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-zinc-400 text-sm font-medium">Average APY</h3>
            <TrendingUp className="text-orange-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">
            {averageAPY.toFixed(2)}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-zinc-400 text-sm font-medium">Active Positions</h3>
            <Activity className="text-red-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">
            {activePositions.length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-emerald-500/20 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-zinc-400 text-sm font-medium">Withdrawable Now</h3>
            <Unlock className="text-emerald-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">
            {withdrawableNow}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by exchange, asset, tags, or notes..."
                className="pl-10 bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setWithdrawalFilter('All')}
              variant={withdrawalFilter === 'All' ? 'default' : 'outline'}
              className={withdrawalFilter === 'All' ? 'bg-red-600 hover:bg-red-500' : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'}
            >
              All
            </Button>
            <Button
              onClick={() => setWithdrawalFilter('Can Withdraw Now')}
              variant={withdrawalFilter === 'Can Withdraw Now' ? 'default' : 'outline'}
              className={withdrawalFilter === 'Can Withdraw Now' ? 'bg-emerald-600 hover:bg-emerald-500' : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'}
            >
              <Unlock size={16} className="mr-1" />
              Can Withdraw
            </Button>
            <Button
              onClick={() => setWithdrawalFilter('Pending')}
              variant={withdrawalFilter === 'Pending' ? 'default' : 'outline'}
              className={withdrawalFilter === 'Pending' ? 'bg-yellow-600 hover:bg-yellow-500' : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'}
            >
              <Clock size={16} className="mr-1" />
              Pending
            </Button>
            <Button
              onClick={() => setWithdrawalFilter('Locked')}
              variant={withdrawalFilter === 'Locked' ? 'default' : 'outline'}
              className={withdrawalFilter === 'Locked' ? 'bg-red-600 hover:bg-red-500' : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'}
            >
              <Lock size={16} className="mr-1" />
              Locked
            </Button>
            <Button
              onClick={() => setShowWithdrawn(!showWithdrawn)}
              variant={showWithdrawn ? 'default' : 'outline'}
              className={showWithdrawn ? 'bg-zinc-600 hover:bg-zinc-500' : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'}
            >
              Show Withdrawn
            </Button>
          </div>
        </div>
      </div>

      {/* Positions Grid */}
      {filteredPositions.length === 0 ? (
        <div className="bg-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-12 text-center">
          <p className="text-zinc-500 text-lg mb-4">No positions found</p>
          <p className="text-zinc-600 mb-6">Start tracking your CEX staking positions</p>
          <Button
            onClick={handleAddPosition}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white"
          >
            <Plus className="mr-2" size={18} />
            Add Your First Position
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPositions.map(position => (
            <CEXPositionCard
              key={position.id}
              position={position}
              onClick={() => {}}
              onEdit={handleEditPosition}
              onDelete={handleDeletePosition}
            />
          ))}
        </div>
      )}

      {/* Form */}
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
