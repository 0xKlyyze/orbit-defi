import React from 'react';
import { X, ExternalLink, Edit, Trash2, Zap, Settings, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { getRiskLevel } from '@/utils/loopCalculations';

const LoopModal = ({ loop, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen || !loop) return null;
  
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" data-testid="loop-modal-overlay">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-zinc-900/95 to-black/95 backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-2xl shadow-red-500/10">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-950/80 to-orange-950/80 backdrop-blur-md px-6 py-4 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white" data-testid="modal-loop-name">{loop.loopName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    risk.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    risk.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {risk.level} - {risk.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onEdit}
                variant="ghost"
                size="sm"
                data-testid="edit-loop-button"
                className="text-zinc-400 hover:text-white hover:bg-red-500/20"
              >
                <Edit size={18} />
              </Button>
              <Button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this loop?')) {
                    onDelete(loop.id);
                  }
                }}
                variant="ghost"
                size="sm"
                data-testid="delete-loop-button"
                className="text-zinc-400 hover:text-red-400 hover:bg-red-500/20"
              >
                <Trash2 size={18} />
              </Button>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors"
                data-testid="close-modal-button"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-500 mb-1">Collateral Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(loop.collateralValue || 0)}</p>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-500 mb-1">Debt Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(loop.debtValue || 0)}</p>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-500 mb-1">Leverage Ratio</p>
              <p className="text-2xl font-bold text-orange-400">{loop.leverageRatio || '1.0'}x</p>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-500 mb-1">Aggregate APY</p>
              <p className="text-2xl font-bold text-emerald-400">{loop.yieldApyAggregate || '0'}%</p>
            </div>
          </div>

          {/* Health Factor */}
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-zinc-300">Health Factor</p>
              <p className={`text-2xl font-bold ${
                risk.color === 'emerald' ? 'text-emerald-400' :
                risk.color === 'yellow' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {healthFactor === 999 ? '∞' : healthFactor.toFixed(2)}
              </p>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  risk.color === 'emerald' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                  risk.color === 'yellow' ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                  'bg-gradient-to-r from-red-600 to-red-400'
                }`}
                style={{ width: `${Math.min((healthFactor / 3) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>Critical (&lt;1.5)</span>
              <span>Warning (1.5-2.0)</span>
              <span>Safe (&gt;2.0)</span>
            </div>
          </div>

          {/* Assets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4">
              <p className="text-sm font-semibold text-zinc-300 mb-2">Collateral Asset</p>
              <p className="text-lg text-white">{loop.collateralAsset || 'N/A'}</p>
              <p className="text-sm text-zinc-500 mt-1">Entry: {formatCurrency(loop.entryCollateralAmount || 0)}</p>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4">
              <p className="text-sm font-semibold text-zinc-300 mb-2">Borrowed Asset</p>
              <p className="text-lg text-white">{loop.borrowedAsset || 'N/A'}</p>
              <p className="text-sm text-zinc-500 mt-1">Amount: {formatCurrency(loop.borrowedAmount || 0)}</p>
            </div>
          </div>

          {/* Protocol Breakdown */}
          {loop.protocolBreakdown && loop.protocolBreakdown.length > 0 && (
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Protocol Breakdown</h3>
              <div className="space-y-3">
                {loop.protocolBreakdown.map((protocol, index) => (
                  <div
                    key={index}
                    className="bg-zinc-800/50 rounded-lg p-3 flex items-start justify-between"
                    data-testid={`protocol-${index}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white">{protocol.name}</p>
                        {protocol.link && (
                          <a
                            href={protocol.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-zinc-700/50 px-2 py-1 rounded">
                          Type: {protocol.positionType}
                        </span>
                        <span className="bg-zinc-700/50 px-2 py-1 rounded">
                          Asset: {protocol.asset}
                        </span>
                        <span className="bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded">
                          APY: {protocol.yieldApy}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4">
              <p className="text-sm font-semibold text-zinc-300 mb-2">Liquidation Threshold</p>
              <p className="text-lg text-white">{loop.liquidationThreshold ? `${(loop.liquidationThreshold * 100).toFixed(0)}%` : 'N/A'}</p>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4">
              <p className="text-sm font-semibold text-zinc-300 mb-2">Number of Protocols</p>
              <p className="text-lg text-white">{loop.numberProtocols || 0}</p>
            </div>
          </div>

          {/* Notes/Tags */}
          {loop.notesTags && (
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4">
              <p className="text-sm font-semibold text-zinc-300 mb-2">Notes/Tags</p>
              <p className="text-white whitespace-pre-wrap">{loop.notesTags}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex gap-4 text-xs text-zinc-500">
            <div>
              <span className="font-semibold">Created:</span> {formatDate(loop.createdAt)}
            </div>
            <div>
              <span className="font-semibold">Last Updated:</span> {formatDate(loop.lastUpdated)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoopModal;