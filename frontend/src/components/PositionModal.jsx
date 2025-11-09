import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

const PositionModal = ({ isOpen, onClose, onSave, position = null }) => {
  const [formData, setFormData] = useState({
    platform: '',
    chain: '',
    wallet: '',
    amount: '',
    usdValue: '',
    entryDate: '',
    yieldAPY: '',
    link: '',
    status: 'Active',
    notesTags: ''
  });

  useEffect(() => {
    if (position) {
      setFormData(position);
    } else {
      setFormData({
        platform: '',
        chain: '',
        wallet: '',
        amount: '',
        usdValue: '',
        entryDate: new Date().toISOString().split('T')[0],
        yieldAPY: '',
        link: '',
        status: 'Active',
        notesTags: ''
      });
    }
  }, [position, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" data-testid="position-modal-overlay">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-zinc-900/95 to-black/95 backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-2xl shadow-red-500/10">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-950/80 to-orange-950/80 backdrop-blur-md px-6 py-4 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white" data-testid="modal-title">
              {position ? 'Edit Position' : 'Add New Position'}
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
              data-testid="modal-close-button"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" data-testid="position-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-zinc-300">Platform</Label>
              <Input
                id="platform"
                data-testid="input-platform"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                required
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="e.g., Aave, Uniswap"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chain" className="text-zinc-300">Chain</Label>
              <Input
                id="chain"
                data-testid="input-chain"
                value={formData.chain}
                onChange={(e) => setFormData({ ...formData, chain: e.target.value })}
                required
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="e.g., Ethereum, Polygon"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet" className="text-zinc-300">Wallet</Label>
              <Input
                id="wallet"
                data-testid="input-wallet"
                value={formData.wallet}
                onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
                required
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="Wallet name or address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-zinc-300">Amount</Label>
              <Input
                id="amount"
                data-testid="input-amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="Token amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usdValue" className="text-zinc-300">USD Value</Label>
              <Input
                id="usdValue"
                data-testid="input-usd-value"
                type="number"
                step="0.01"
                value={formData.usdValue}
                onChange={(e) => setFormData({ ...formData, usdValue: e.target.value })}
                required
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryDate" className="text-zinc-300">Entry Date</Label>
              <Input
                id="entryDate"
                data-testid="input-entry-date"
                type="date"
                value={formData.entryDate}
                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                required
                className="bg-zinc-900/50 border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yieldAPY" className="text-zinc-300">Yield APY (%)</Label>
              <Input
                id="yieldAPY"
                data-testid="input-yield-apy"
                type="number"
                step="0.01"
                value={formData.yieldAPY}
                onChange={(e) => setFormData({ ...formData, yieldAPY: e.target.value })}
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-zinc-300">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger data-testid="select-status" className="bg-zinc-900/50 border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-red-500/30">
                  <SelectItem value="Active" className="text-white hover:bg-red-500/20">Active</SelectItem>
                  <SelectItem value="Closed" className="text-white hover:bg-red-500/20">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link" className="text-zinc-300">Link (Optional)</Label>
            <Input
              id="link"
              data-testid="input-link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notesTags" className="text-zinc-300">Notes/Tags</Label>
            <Textarea
              id="notesTags"
              data-testid="input-notes-tags"
              value={formData.notesTags}
              onChange={(e) => setFormData({ ...formData, notesTags: e.target.value })}
              className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20 min-h-[80px]"
              placeholder="e.g., airdrop farming, high risk"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              data-testid="cancel-button"
              className="flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="save-button"
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/20"
            >
              {position ? 'Update Position' : 'Add Position'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PositionModal;