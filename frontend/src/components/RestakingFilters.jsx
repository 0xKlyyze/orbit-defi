import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Filter, X } from 'lucide-react';

const RestakingFilters = ({ filters, onFilterChange, loops }) => {
  const uniqueWallets = [...new Set(loops.map(l => l.wallet).filter(Boolean))];
  const uniqueChains = [...new Set(loops.map(l => l.chain).filter(Boolean))];
  const uniqueStatuses = ['All', 'Active', 'In-risk'];

  const hasActiveFilters = (filters.wallet && filters.wallet !== 'all') || 
                          (filters.chain && filters.chain !== 'all') || 
                          (filters.status && filters.status !== 'All');

  const clearFilters = () => {
    onFilterChange({
      wallet: 'all',
      chain: 'all',
      status: 'All'
    });
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6" data-testid="restaking-filters">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="text-red-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            data-testid="clear-restaking-filters"
            className="text-zinc-400 hover:text-white hover:bg-red-500/20"
          >
            <X size={16} className="mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {uniqueWallets.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="wallet-filter-restaking" className="text-zinc-300 text-sm">Wallet</Label>
            <Select
              value={filters.wallet || 'all'}
              onValueChange={(value) => onFilterChange({ ...filters, wallet: value })}
            >
              <SelectTrigger id="wallet-filter-restaking" data-testid="filter-wallet-restaking" className="bg-zinc-900/50 border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/20">
                <SelectValue placeholder="All Wallets" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-red-500/30">
                <SelectItem value="all" className="text-white hover:bg-red-500/20">All Wallets</SelectItem>
                {uniqueWallets.map(wallet => (
                  <SelectItem key={wallet} value={wallet} className="text-white hover:bg-red-500/20">
                    {wallet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {uniqueChains.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="chain-filter-restaking" className="text-zinc-300 text-sm">Chain</Label>
            <Select
              value={filters.chain || 'all'}
              onValueChange={(value) => onFilterChange({ ...filters, chain: value })}
            >
              <SelectTrigger id="chain-filter-restaking" data-testid="filter-chain-restaking" className="bg-zinc-900/50 border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/20">
                <SelectValue placeholder="All Chains" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-red-500/30">
                <SelectItem value="all" className="text-white hover:bg-red-500/20">All Chains</SelectItem>
                {uniqueChains.map(chain => (
                  <SelectItem key={chain} value={chain} className="text-white hover:bg-red-500/20">
                    {chain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="status-filter-restaking" className="text-zinc-300 text-sm">Status</Label>
          <Select
            value={filters.status || 'All'}
            onValueChange={(value) => onFilterChange({ ...filters, status: value })}
          >
            <SelectTrigger id="status-filter-restaking" data-testid="filter-status-restaking" className="bg-zinc-900/50 border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/20">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-red-500/30">
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status} className="text-white hover:bg-red-500/20">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default RestakingFilters;