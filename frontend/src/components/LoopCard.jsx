import React from 'react';
import { AlertTriangle, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { getRiskLevel } from '@/services/firebaseLoops';

const LoopCard = ({ loop, onClick }) => {
  const healthFactor = parseFloat(loop.healthFactor) || 0;
  const risk = getRiskLevel(healthFactor);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border rounded-xl p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
      style={{
        borderColor: risk.color === 'emerald' ? 'rgba(16, 185, 129, 0.3)' : 
                     risk.color === 'yellow' ? 'rgba(234, 179, 8, 0.3)' : 
                     'rgba(239, 68, 68, 0.3)',
        boxShadow: risk.color === 'emerald' ? '0 0 20px rgba(16, 185, 129, 0.1)' : 
                   risk.color === 'yellow' ? '0 0 20px rgba(234, 179, 8, 0.1)' : 
                   '0 0 20px rgba(239, 68, 68, 0.1)'
      }}
      data-testid={`loop-card-${loop.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1" data-testid="loop-name">{loop.loopName}</h3>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                risk.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                risk.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
              data-testid="loop-status"
            >
              {risk.status}
            </span>
            <span className="text-xs text-zinc-500">{loop.numberProtocols || 0} Protocols</span>
          </div>
        </div>
        <div className={`p-2 rounded-lg ${
          risk.color === 'emerald' ? 'bg-emerald-500/20' :
          risk.color === 'yellow' ? 'bg-yellow-500/20' :
          'bg-red-500/20'
        }`}>
          {risk.color === 'emerald' ? <TrendingUp className="text-emerald-400" size={20} /> :
           risk.color === 'yellow' ? <AlertTriangle className="text-yellow-400" size={20} /> :
           <AlertTriangle className="text-red-400" size={20} />}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Collateral Value</p>
          <p className="text-lg font-bold text-white" data-testid="collateral-value">
            {formatCurrency(loop.collateralValue || 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Debt Value</p>
          <p className="text-lg font-bold text-white" data-testid="debt-value">
            {formatCurrency(loop.debtValue || 0)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">Leverage</p>
          <p className="text-sm font-bold text-white" data-testid="leverage-ratio">{loop.leverageRatio || '1.0'}x</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">APY</p>
          <p className="text-sm font-bold text-emerald-400" data-testid="apy-aggregate">{loop.yieldApyAggregate || '0'}%</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">Health</p>
          <p className={`text-sm font-bold ${
            risk.color === 'emerald' ? 'text-emerald-400' :
            risk.color === 'yellow' ? 'text-yellow-400' :
            'text-red-400'
          }`} data-testid="health-factor">
            {healthFactor === 999 ? '∞' : healthFactor.toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-1">
          <Activity size={14} />
          <span>Updated {formatDate(loop.lastUpdated)}</span>
        </div>
        <span className="text-zinc-600">Click for details →</span>
      </div>
    </div>
  );
};

export default LoopCard;