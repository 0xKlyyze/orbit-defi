import React, { useState, useEffect } from 'react';
import '@/App.css';
import { Plus, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'sonner';
import PositionModal from '@/components/PositionModal';
import PositionTable from '@/components/PositionTable';
import Filters from '@/components/Filters';
import Charts from '@/components/Charts';
import { getPositions, addPosition, updatePosition, deletePosition } from '@/services/firebase';

function App() {
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    wallet: '',
    chain: '',
    platform: '',
    showClosed: true
  });

  useEffect(() => {
    loadPositions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [positions, filters]);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await getPositions();
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

    if (filters.wallet) {
      filtered = filtered.filter(p => p.wallet === filters.wallet);
    }

    if (filters.chain) {
      filtered = filtered.filter(p => p.chain === filters.chain);
    }

    if (filters.platform) {
      filtered = filtered.filter(p => p.platform === filters.platform);
    }

    if (!filters.showClosed) {
      filtered = filtered.filter(p => p.status === 'Active');
    }

    setFilteredPositions(filtered);
  };

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
      setEditingPosition(null);
    } catch (error) {
      console.error('Error saving position:', error);
      toast.error('Failed to save position');
    }
  };

  const handleEditPosition = (position) => {
    setEditingPosition(position);
    setIsModalOpen(true);
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

  const handleAddPosition = () => {
    setEditingPosition(null);
    setIsModalOpen(true);
  };

  const totalValue = filteredPositions
    .filter(p => p.status === 'Active')
    .reduce((sum, p) => sum + (parseFloat(p.usdValue) || 0), 0);

  const averageAPY = filteredPositions
    .filter(p => p.status === 'Active' && p.yieldAPY)
    .reduce((sum, p, _, arr) => {
      const apy = parseFloat(p.yieldAPY) || 0;
      return sum + apy / arr.length;
    }, 0);

  const activePositionsCount = filteredPositions.filter(p => p.status === 'Active').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950/20 flex items-center justify-center">
        <div className="text-white text-xl" data-testid="loading-indicator">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950/20" data-testid="orbit-dashboard">
      <Toaster position="top-right" theme="dark" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2" data-testid="app-title">
                Orbit<span className="text-red-500">.</span>
              </h1>
              <p className="text-zinc-400 text-lg">DeFi Position Tracker</p>
            </div>
            <Button
              onClick={handleAddPosition}
              data-testid="add-position-button"
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/20 px-6 py-6 text-lg"
            >
              <Plus className="mr-2" size={20} />
              Add Position
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6 shadow-xl" data-testid="total-value-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-zinc-400 text-sm font-medium">Total Value</h3>
              <DollarSign className="text-red-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-white" data-testid="total-value">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-orange-500/20 rounded-xl p-6 shadow-xl" data-testid="average-apy-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-zinc-400 text-sm font-medium">Average APY</h3>
              <Percent className="text-orange-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-white" data-testid="average-apy">
              {averageAPY.toFixed(2)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6 shadow-xl" data-testid="active-positions-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-zinc-400 text-sm font-medium">Active Positions</h3>
              <TrendingUp className="text-red-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-white" data-testid="active-positions-count">
              {activePositionsCount}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <Filters
            filters={filters}
            onFilterChange={setFilters}
            positions={positions}
          />
        </div>

        <div className="mb-8">
          <Charts positions={filteredPositions.filter(p => p.status === 'Active')} />
        </div>

        <div>
          <PositionTable
            positions={filteredPositions}
            onEdit={handleEditPosition}
            onDelete={handleDeletePosition}
          />
        </div>
      </div>

      <PositionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPosition(null);
        }}
        onSave={handleSavePosition}
        position={editingPosition}
      />
    </div>
  );
}

export default App;