import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Filter, X } from 'lucide-react';

const Filters = ({ filters, onFilterChange, positions }) => {
  const uniqueWallets = [...new Set(positions.map(p => p.wallet))];
  const uniqueChains = [...new Set(positions.map(p => p.chain))];
  const uniquePlatforms = [...new Set(positions.map(p => p.platform))];

  const hasActiveFilters = (filters.wallet && filters.wallet !== 'all') || (filters.chain && filters.chain !== 'all') || (filters.platform && filters.platform !== 'all') || !filters.showClosed;

  const clearFilters = () => {
    onFilterChange({
      wallet: 'all',
      chain: 'all',
      platform: 'all',
      showClosed: true
    });
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6" data-testid="filters-container">
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
            data-testid="clear-filters-button"
            className="text-zinc-400 hover:text-white hover:bg-red-500/20"
          >
            <X size={16} className="mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="wallet-filter" className="text-zinc-300 text-sm">Wallet</Label>
          <Select
            value={filters.wallet || 'all'}
            onValueChange={(value) => onFilterChange({ ...filters, wallet: value })}
          >
            <SelectTrigger id="wallet-filter" data-testid="filter-wallet" className="bg-zinc-900/50 border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/20">
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

        <div className="space-y-2">
          <Label htmlFor="chain-filter" className="text-zinc-300 text-sm">Chain</Label>
          <Select
            value={filters.chain || 'all'}
            onValueChange={(value) => onFilterChange({ ...filters, chain: value })}
          >
            <SelectTrigger id="chain-filter" data-testid="filter-chain" className="bg-zinc-900/50 border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/20">
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

        <div className="space-y-2">
          <Label htmlFor="platform-filter" className="text-zinc-300 text-sm">Platform</Label>
          <Select
            value={filters.platform}
            onValueChange={(value) => onFilterChange({ ...filters, platform: value })}
          >
            <SelectTrigger id="platform-filter" data-testid="filter-platform" className="bg-zinc-900/50 border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/20">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-red-500/30">
              <SelectItem value="" className="text-white hover:bg-red-500/20">All Platforms</SelectItem>
              {uniquePlatforms.map(platform => (
                <SelectItem key={platform} value={platform} className="text-white hover:bg-red-500/20">
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="show-closed" className="text-zinc-300 text-sm">Show Closed</Label>
          <div className="flex items-center space-x-2 h-10">
            <Switch
              id="show-closed"
              data-testid="toggle-closed-positions"
              checked={filters.showClosed}
              onCheckedChange={(checked) => onFilterChange({ ...filters, showClosed: checked })}
              className="data-[state=checked]:bg-red-600"
            />
            <span className="text-sm text-zinc-400">
              {filters.showClosed ? 'Showing' : 'Hidden'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;