import React from 'react';
import { Edit, Trash2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

const PositionTable = ({ positions, onEdit, onDelete }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto" data-testid="position-table">
      <div className="min-w-full bg-zinc-900/30 backdrop-blur-md rounded-xl border border-red-500/20 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-red-950/50 to-orange-950/50 border-b border-red-500/20">
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">Platform</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">Chain</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">Wallet</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">USD Value</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">APY</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">Entry Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {positions.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-12 text-center text-zinc-500" data-testid="empty-state">
                  No positions found. Click "Add Position" to get started.
                </td>
              </tr>
            ) : (
              positions.map((position) => (
                <tr
                  key={position.id}
                  className="hover:bg-red-500/5 transition-colors"
                  data-testid={`position-row-${position.id}`}
                >
                  <td className="px-4 py-4 text-sm text-white font-medium" data-testid={`platform-${position.id}`}>
                    <div className="flex items-center gap-2">
                      {position.platform}
                      {position.link && (
                        <a
                          href={position.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-400 hover:text-red-300"
                          data-testid={`link-${position.id}`}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-300" data-testid={`chain-${position.id}`}>{position.chain}</td>
                  <td className="px-4 py-4 text-sm text-zinc-300" data-testid={`wallet-${position.id}`}>{position.wallet}</td>
                  <td className="px-4 py-4 text-sm text-zinc-300" data-testid={`amount-${position.id}`}>{position.amount}</td>
                  <td className="px-4 py-4 text-sm text-white font-semibold" data-testid={`usd-value-${position.id}`}>
                    {formatCurrency(position.usdValue)}
                  </td>
                  <td className="px-4 py-4 text-sm text-emerald-400" data-testid={`apy-${position.id}`}>
                    {position.yieldAPY ? `${position.yieldAPY}%` : '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-400" data-testid={`entry-date-${position.id}`}>
                    {formatDate(position.entryDate)}
                  </td>
                  <td className="px-4 py-4 text-sm" data-testid={`status-${position.id}`}>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        position.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-700/30 text-zinc-400 border border-zinc-600/30'
                      }`}
                    >
                      {position.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(position)}
                        data-testid={`edit-button-${position.id}`}
                        className="text-zinc-400 hover:text-white hover:bg-red-500/20"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(position.id)}
                        data-testid={`delete-button-${position.id}`}
                        className="text-zinc-400 hover:text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {positions.length > 0 && positions.some(p => p.notesTags) && (
        <div className="mt-4 space-y-2" data-testid="notes-section">
          {positions
            .filter(p => p.notesTags)
            .map(position => (
              <div
                key={position.id}
                className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-lg px-4 py-3"
                data-testid={`notes-${position.id}`}
              >
                <div className="text-xs text-zinc-500 mb-1">{position.platform} - {position.chain}</div>
                <div className="text-sm text-zinc-300">{position.notesTags}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default PositionTable;