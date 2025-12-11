import React from 'react';
import { Edit, Trash2, ExternalLink, Lock, Unlock, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { calculateWithdrawalStatus } from '@/services/firebaseCEX';

const CEXPositionCard = ({ position, onClick, onEdit, onDelete }) => {
  const withdrawalInfo = calculateWithdrawalStatus(position);
  
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
  
  const getIcon = () => {
    if (withdrawalInfo.status === 'Can Withdraw Now') return <Unlock size={18} />;
    if (withdrawalInfo.status === 'Locked') return <Lock size={18} />;
    return <Clock size={18} />;
  };
  
  return (
    <div
      className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl"
      style={{
        borderColor: withdrawalInfo.color === 'emerald' ? 'rgba(16, 185, 129, 0.3)' : 
                     withdrawalInfo.color === 'yellow' ? 'rgba(234, 179, 8, 0.3)' : 
                     'rgba(239, 68, 68, 0.3)',
        boxShadow: withdrawalInfo.color === 'emerald' ? '0 0 15px rgba(16, 185, 129, 0.1)' : 
                   withdrawalInfo.color === 'yellow' ? '0 0 15px rgba(234, 179, 8, 0.1)' : 
                   '0 0 15px rgba(239, 68, 68, 0.1)'
      }}
      data-testid={`cex-position-${position.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1" onClick={onClick}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white">{position.exchange}</h3>
            {position.link && (
              <a
                href={position.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          <p className="text-2xl font-bold text-white mb-1">{position.asset}</p>
          <p className="text-sm text-zinc-400">{position.stakedAmount} tokens</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
              withdrawalInfo.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              withdrawalInfo.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {getIcon()}
            {withdrawalInfo.status}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4" onClick={onClick}>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">USD Value</p>
          <p className="text-sm font-bold text-white">{formatCurrency(position.usdValue || 0)}</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">APY</p>
          <p className="text-sm font-bold text-emerald-400">{position.apy || 0}%</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">Type</p>
          <p className="text-sm font-bold text-white">{position.stakingType}</p>
        </div>
      </div>
      
      {position.unlockDate && withdrawalInfo.status !== 'Can Withdraw Now' && (
        <div className="bg-zinc-800/30 rounded-lg p-2 mb-3" onClick={onClick}>
          <p className="text-xs text-zinc-500">Unlocks: <span className="text-white font-semibold">{formatDate(position.unlockDate)}</span></p>
        </div>
      )}
      
      {position.tags && (
        <div className="flex flex-wrap gap-1 mb-3" onClick={onClick}>
          {position.tags.split(',').map((tag, idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-zinc-700/50 text-zinc-300 rounded">
              {tag.trim()}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">Entry: {formatDate(position.entryDate)}</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(position);
            }}
            className="text-zinc-400 hover:text-white hover:bg-red-500/20"
          >
            <Edit size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(position.id);
            }}
            className="text-zinc-400 hover:text-red-400 hover:bg-red-500/20"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CEXPositionCard;