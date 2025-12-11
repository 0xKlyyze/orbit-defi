import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { calculateHealthFactor, calculateLeverageRatio } from '@/services/firebaseLoops';

const LoopForm = ({ isOpen, onClose, onSave, loop = null }) => {
  const [formData, setFormData] = useState({
    loopName: '',
    collateralAsset: '',
    collateralValue: '',
    entryCollateralAmount: '',
    borrowedAsset: '',
    borrowedAmount: '',
    debtValue: '',
    yieldApyAggregate: '',
    liquidationThreshold: '0.75',
    numberProtocols: '',
    notesTags: '',
    protocolBreakdown: []
  });

  const [protocols, setProtocols] = useState([{
    name: '',
    positionType: '',
    asset: '',
    yieldApy: '',
    link: ''
  }]);

  useEffect(() => {
    if (loop) {
      setFormData({
        loopName: loop.loopName || '',
        collateralAsset: loop.collateralAsset || '',
        collateralValue: loop.collateralValue || '',
        entryCollateralAmount: loop.entryCollateralAmount || '',
        borrowedAsset: loop.borrowedAsset || '',
        borrowedAmount: loop.borrowedAmount || '',
        debtValue: loop.debtValue || '',
        yieldApyAggregate: loop.yieldApyAggregate || '',
        liquidationThreshold: loop.liquidationThreshold || '0.75',
        numberProtocols: loop.numberProtocols || '',
        notesTags: loop.notesTags || '',
        protocolBreakdown: loop.protocolBreakdown || []
      });
      if (loop.protocolBreakdown && loop.protocolBreakdown.length > 0) {
        setProtocols(loop.protocolBreakdown);
      }
    } else {
      setFormData({
        loopName: '',
        collateralAsset: '',
        collateralValue: '',
        entryCollateralAmount: '',
        borrowedAsset: '',
        borrowedAmount: '',
        debtValue: '',
        yieldApyAggregate: '',
        liquidationThreshold: '0.75',
        numberProtocols: '',
        notesTags: '',
        protocolBreakdown: []
      });
      setProtocols([{
        name: '',
        positionType: '',
        asset: '',
        yieldApy: '',
        link: ''
      }]);
    }
  }, [loop, isOpen]);

  const addProtocol = () => {
    setProtocols([...protocols, {
      name: '',
      positionType: '',
      asset: '',
      yieldApy: '',
      link: ''
    }]);
  };

  const removeProtocol = (index) => {
    setProtocols(protocols.filter((_, i) => i !== index));
  };

  const updateProtocol = (index, field, value) => {
    const updated = [...protocols];
    updated[index][field] = value;
    setProtocols(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const collateralValue = parseFloat(formData.collateralValue) || 0;
    const debtValue = parseFloat(formData.debtValue) || 0;
    const liquidationThreshold = parseFloat(formData.liquidationThreshold) || 0.75;
    
    const healthFactor = calculateHealthFactor(collateralValue, debtValue, liquidationThreshold);
    const leverageRatio = calculateLeverageRatio(collateralValue, debtValue);
    
    const loopData = {
      ...formData,
      collateralValue,
      debtValue,
      entryCollateralAmount: parseFloat(formData.entryCollateralAmount) || 0,
      borrowedAmount: parseFloat(formData.borrowedAmount) || 0,
      yieldApyAggregate: parseFloat(formData.yieldApyAggregate) || 0,
      liquidationThreshold,
      numberProtocols: protocols.filter(p => p.name).length,
      healthFactor: healthFactor.toFixed(2),
      leverageRatio: leverageRatio.toFixed(2),
      protocolBreakdown: protocols.filter(p => p.name)
    };
    
    onSave(loopData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" data-testid="loop-form-overlay">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-zinc-900/95 to-black/95 backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-2xl shadow-red-500/10">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-950/80 to-orange-950/80 backdrop-blur-md px-6 py-4 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white" data-testid="form-title">
              {loop ? 'Edit Loop' : 'Add New Loop'}
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
              data-testid="form-close-button"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6" data-testid="loop-form">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="loopName" className="text-zinc-300">Loop Name *</Label>
              <Input
                id="loopName"
                data-testid="input-loop-name"
                value={formData.loopName}
                onChange={(e) => setFormData({ ...formData, loopName: e.target.value })}
                required
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="e.g., ETH-USDC Leveraged Yield"
              />
            </div>
          </div>

          {/* Collateral Info */}
          <div className="bg-zinc-800/30 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Collateral Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="collateralAsset" className="text-zinc-300">Asset *</Label>
                <Input
                  id="collateralAsset"
                  data-testid="input-collateral-asset"
                  value={formData.collateralAsset}
                  onChange={(e) => setFormData({ ...formData, collateralAsset: e.target.value })}
                  required
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="e.g., ETH"
                />
              </div>
              <div>
                <Label htmlFor="collateralValue" className="text-zinc-300">Current Value (USD) *</Label>
                <Input
                  id="collateralValue"
                  data-testid="input-collateral-value"
                  type="number"
                  step="0.01"
                  value={formData.collateralValue}
                  onChange={(e) => setFormData({ ...formData, collateralValue: e.target.value })}
                  required
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="10000"
                />
              </div>
              <div>
                <Label htmlFor="entryCollateralAmount" className="text-zinc-300">Entry Amount (USD)</Label>
                <Input
                  id="entryCollateralAmount"
                  data-testid="input-entry-collateral"
                  type="number"
                  step="0.01"
                  value={formData.entryCollateralAmount}
                  onChange={(e) => setFormData({ ...formData, entryCollateralAmount: e.target.value })}
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="10000"
                />
              </div>
            </div>
          </div>

          {/* Debt Info */}
          <div className="bg-zinc-800/30 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Debt Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="borrowedAsset" className="text-zinc-300">Borrowed Asset *</Label>
                <Input
                  id="borrowedAsset"
                  data-testid="input-borrowed-asset"
                  value={formData.borrowedAsset}
                  onChange={(e) => setFormData({ ...formData, borrowedAsset: e.target.value })}
                  required
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="e.g., USDC"
                />
              </div>
              <div>
                <Label htmlFor="debtValue" className="text-zinc-300">Debt Value (USD) *</Label>
                <Input
                  id="debtValue"
                  data-testid="input-debt-value"
                  type="number"
                  step="0.01"
                  value={formData.debtValue}
                  onChange={(e) => setFormData({ ...formData, debtValue: e.target.value })}
                  required
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="5000"
                />
              </div>
              <div>
                <Label htmlFor="borrowedAmount" className="text-zinc-300">Borrowed Amount (USD)</Label>
                <Input
                  id="borrowedAmount"
                  data-testid="input-borrowed-amount"
                  type="number"
                  step="0.01"
                  value={formData.borrowedAmount}
                  onChange={(e) => setFormData({ ...formData, borrowedAmount: e.target.value })}
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="5000"
                />
              </div>
            </div>
          </div>

          {/* Yield & Risk */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="yieldApyAggregate" className="text-zinc-300">Aggregate APY (%) *</Label>
              <Input
                id="yieldApyAggregate"
                data-testid="input-apy-aggregate"
                type="number"
                step="0.01"
                value={formData.yieldApyAggregate}
                onChange={(e) => setFormData({ ...formData, yieldApyAggregate: e.target.value })}
                required
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="8.5"
              />
            </div>
            <div>
              <Label htmlFor="liquidationThreshold" className="text-zinc-300">Liquidation Threshold (0-1)</Label>
              <Input
                id="liquidationThreshold"
                data-testid="input-liquidation-threshold"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.liquidationThreshold}
                onChange={(e) => setFormData({ ...formData, liquidationThreshold: e.target.value })}
                className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                placeholder="0.75"
              />
            </div>
          </div>

          {/* Protocol Breakdown */}
          <div className="bg-zinc-800/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Protocol Breakdown</h3>
              <Button
                type="button"
                onClick={addProtocol}
                size="sm"
                data-testid="add-protocol-button"
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white"
              >
                <Plus size={16} className="mr-1" />
                Add Protocol
              </Button>
            </div>
            
            {protocols.map((protocol, index) => (
              <div key={index} className="bg-zinc-900/50 rounded-lg p-4 space-y-3" data-testid={`protocol-form-${index}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-zinc-400">Protocol {index + 1}</span>
                  {protocols.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeProtocol(index)}
                      variant="ghost"
                      size="sm"
                      data-testid={`remove-protocol-${index}`}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    data-testid={`protocol-name-${index}`}
                    value={protocol.name}
                    onChange={(e) => updateProtocol(index, 'name', e.target.value)}
                    placeholder="Protocol Name (e.g., Aave)"
                    className="bg-zinc-800/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  />
                  <Input
                    data-testid={`protocol-position-type-${index}`}
                    value={protocol.positionType}
                    onChange={(e) => updateProtocol(index, 'positionType', e.target.value)}
                    placeholder="Position Type (e.g., Lending)"
                    className="bg-zinc-800/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  />
                  <Input
                    data-testid={`protocol-asset-${index}`}
                    value={protocol.asset}
                    onChange={(e) => updateProtocol(index, 'asset', e.target.value)}
                    placeholder="Asset (e.g., ETH)"
                    className="bg-zinc-800/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  />
                  <Input
                    data-testid={`protocol-apy-${index}`}
                    type="number"
                    step="0.01"
                    value={protocol.yieldApy}
                    onChange={(e) => updateProtocol(index, 'yieldApy', e.target.value)}
                    placeholder="APY (e.g., 5.5)"
                    className="bg-zinc-800/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  />
                  <Input
                    data-testid={`protocol-link-${index}`}
                    type="url"
                    value={protocol.link}
                    onChange={(e) => updateProtocol(index, 'link', e.target.value)}
                    placeholder="Link (https://...)"
                    className="col-span-2 bg-zinc-800/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notesTags" className="text-zinc-300">Notes/Tags</Label>
            <Textarea
              id="notesTags"
              data-testid="input-notes-tags"
              value={formData.notesTags}
              onChange={(e) => setFormData({ ...formData, notesTags: e.target.value })}
              className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20 min-h-[80px]"
              placeholder="e.g., airdrop farming, high risk, conservative strategy"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              data-testid="cancel-form-button"
              className="flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="save-form-button"
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/20"
            >
              {loop ? 'Update Loop' : 'Add Loop'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoopForm;