import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { calculateUnlockDate } from '@/services/firebaseCEX';

const CEXPositionForm = ({ isOpen, onClose, onSave, position = null }) => {
  const [formData, setFormData] = useState({
    exchange: '',
    asset: '',
    stakedAmount: '',
    usdValue: '',
    stakingType: 'Flexible',
    lockPeriodDays: '',
    apy: '',
    entryDate: new Date().toISOString().split('T')[0],
    unlockDate: '',
    tags: '',
    notes: '',
    link: '',
    status: 'Active'
  });

  useEffect(() => {
    if (position) {
      setFormData({
        exchange: position.exchange || '',
        asset: position.asset || '',
        stakedAmount: position.stakedAmount || '',
        usdValue: position.usdValue || '',
        stakingType: position.stakingType || 'Flexible',
        lockPeriodDays: position.lockPeriodDays || '',
        apy: position.apy || '',
        entryDate: position.entryDate || new Date().toISOString().split('T')[0],
        unlockDate: position.unlockDate || '',
        tags: position.tags || '',
        notes: position.notes || '',
        link: position.link || '',
        status: position.status || 'Active'
      });
    } else {
      setFormData({
        exchange: '',
        asset: '',
        stakedAmount: '',
        usdValue: '',
        stakingType: 'Flexible',
        lockPeriodDays: '',
        apy: '',
        entryDate: new Date().toISOString().split('T')[0],
        unlockDate: '',
        tags: '',
        notes: '',
        link: '',
        status: 'Active'
      });
    }
  }, [position, isOpen]);

  // Auto-calculate unlock date when relevant fields change
  useEffect(() => {
    if (formData.stakingType !== 'Flexible' && formData.entryDate && formData.lockPeriodDays) {
      const unlockDate = calculateUnlockDate(formData.entryDate, formData.stakingType, formData.lockPeriodDays);
      setFormData(prev => ({ ...prev, unlockDate }));
    } else if (formData.stakingType === 'Flexible') {
      setFormData(prev => ({ ...prev, unlockDate: '' }));
    }
  }, [formData.entryDate, formData.stakingType, formData.lockPeriodDays]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      stakedAmount: parseFloat(formData.stakedAmount) || 0,
      usdValue: parseFloat(formData.usdValue) || 0,
      apy: parseFloat(formData.apy) || 0,
      lockPeriodDays: formData.stakingType !== 'Flexible' ? parseInt(formData.lockPeriodDays) || 0 : 0
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" data-testid="cex-position-form">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-zinc-900/95 to-black/95 backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-2xl shadow-red-500/10">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-950/80 to-orange-950/80 backdrop-blur-md px-6 py-4 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {position ? 'Edit CEX Position' : 'Add CEX Position'}
            </h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exchange" className="text-zinc-300">Exchange *</Label>
              <Input
                id="exchange"
                data-testid="input-exchange"
                value={formData.exchange}
                onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                required
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="e.g., Binance, Coinbase"
              />
            </div>

            <div>
              <Label htmlFor="asset" className="text-zinc-300">Asset/Token *</Label>
              <Input
                id="asset"
                data-testid="input-asset"
                value={formData.asset}
                onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                required
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="e.g., ETH, BTC"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stakedAmount" className="text-zinc-300">Staked Amount *</Label>
              <Input
                id="stakedAmount"
                data-testid="input-staked-amount"
                type="number"
                step="0.000001"
                value={formData.stakedAmount}
                onChange={(e) => setFormData({ ...formData, stakedAmount: e.target.value })}
                required
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="1.5"
              />
            </div>

            <div>
              <Label htmlFor="usdValue" className="text-zinc-300">USD Value *</Label>
              <Input
                id="usdValue"
                data-testid="input-usd-value"
                type="number"
                step="0.01"
                value={formData.usdValue}
                onChange={(e) => setFormData({ ...formData, usdValue: e.target.value })}
                required
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="5000.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stakingType" className="text-zinc-300">Staking Type *</Label>
              <Select
                value={formData.stakingType}
                onValueChange={(value) => setFormData({ ...formData, stakingType: value })}
              >
                <SelectTrigger data-testid="select-staking-type" className="bg-zinc-900/50 border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-red-500/30">
                  <SelectItem value="Flexible" className="text-white hover:bg-red-500/20">Flexible</SelectItem>
                  <SelectItem value="Locked" className="text-white hover:bg-red-500/20">Locked</SelectItem>
                  <SelectItem value="Withdraw-in-n-days" className="text-white hover:bg-red-500/20">Withdraw-in-n-days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.stakingType !== 'Flexible' && (
              <div>
                <Label htmlFor="lockPeriodDays" className="text-zinc-300">Lock Period (Days) *</Label>
                <Input
                  id="lockPeriodDays"
                  data-testid="input-lock-period"
                  type="number"
                  value={formData.lockPeriodDays}
                  onChange={(e) => setFormData({ ...formData, lockPeriodDays: e.target.value })}
                  required={formData.stakingType !== 'Flexible'}
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="30"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="apy" className="text-zinc-300">APY (%) *</Label>
              <Input
                id="apy"
                data-testid="input-apy"
                type="number"
                step="0.01"
                value={formData.apy}
                onChange={(e) => setFormData({ ...formData, apy: e.target.value })}
                required
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="5.5"
              />
            </div>

            <div>
              <Label htmlFor="entryDate" className="text-zinc-300">Entry Date *</Label>
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
          </div>

          {formData.unlockDate && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
              <p className="text-sm text-emerald-400">Calculated Unlock Date: <span className="font-bold">{formData.unlockDate}</span></p>
            </div>
          )}

          <div>
            <Label htmlFor="tags" className="text-zinc-300">Tags (comma-separated)</Label>
            <Input
              id="tags"
              data-testid="input-tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
              placeholder="e.g., Promo, High Yield"
            />
          </div>

          <div>
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

          <div>
            <Label htmlFor="notes" className="text-zinc-300">Notes</Label>
            <Textarea
              id="notes"
              data-testid="input-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20 min-h-[80px]"
              placeholder="Additional notes..."
            />
          </div>

          <div>
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
                <SelectItem value="Withdrawn" className="text-white hover:bg-red-500/20">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="save-cex-position"
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

export default CEXPositionForm;