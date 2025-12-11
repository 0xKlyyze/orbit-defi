import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { calculateQuickModeMetrics, getRiskLevel } from '@/utils/loopCalculations';

const QuickLoopForm = ({ isOpen, onClose, onSave, loop = null, basicInfo = null }) => {
  const [formData, setFormData] = useState({
    loopName: '',
    description: '',
    tags: '',
    protocol: '',
    lendingAsset: '',
    borrowingAsset: '',
    initialDepositAmount: '',
    initialDepositUSD: '',
    lendingAPY: '',
    borrowingAPY: '',
    liquidationThreshold: '0.75'
  });

  const [iterations, setIterations] = useState([
    { iterationNumber: 1, borrowAmount: '', borrowUSD: '', ltvRatio: 0 }
  ]);

  const [calculatedMetrics, setCalculatedMetrics] = useState(null);

  useEffect(() => {
    if (loop && loop.mode === 'quick') {
      setFormData({
        loopName: loop.loopName || '',
        description: loop.description || '',
        tags: loop.tags?.join(', ') || '',
        wallet: loop.wallet || '',
        blockchain: loop.blockchain || '',
        protocol: loop.quickConfig?.protocol || '',
        lendingAsset: loop.quickConfig?.lendingAsset || '',
        borrowingAsset: loop.quickConfig?.borrowingAsset || '',
        initialDepositAmount: loop.quickConfig?.initialDeposit?.amount || '',
        initialDepositUSD: loop.quickConfig?.initialDeposit?.usd || '',
        lendingAPY: loop.quickConfig?.lendingAPY || '',
        borrowingAPY: loop.quickConfig?.borrowingAPY || '',
        liquidationThreshold: loop.quickConfig?.liquidationThreshold || '0.75'
      });
      if (loop.quickConfig?.iterations) {
        setIterations(loop.quickConfig.iterations);
      }
    } else if (basicInfo) {
      setFormData({
        loopName: basicInfo.loopName || '',
        description: basicInfo.description || '',
        tags: basicInfo.tags || '',
        wallet: basicInfo.wallet || '',
        blockchain: basicInfo.blockchain || '',
        protocol: '',
        lendingAsset: '',
        borrowingAsset: '',
        initialDepositAmount: '',
        initialDepositUSD: '',
        lendingAPY: '',
        borrowingAPY: '',
        liquidationThreshold: '0.75'
      });
    }
  }, [loop, basicInfo, isOpen]);

  useEffect(() => {
    calculateMetrics();
  }, [formData, iterations]);

  const calculateMetrics = () => {
    const config = {
      initialDeposit: {
        amount: parseFloat(formData.initialDepositAmount) || 0,
        usd: parseFloat(formData.initialDepositUSD) || 0
      },
      lendingAPY: parseFloat(formData.lendingAPY) || 0,
      borrowingAPY: parseFloat(formData.borrowingAPY) || 0,
      liquidationThreshold: parseFloat(formData.liquidationThreshold) || 0.75,
      iterations: iterations.map(iter => ({
        ...iter,
        borrowAmount: parseFloat(iter.borrowAmount) || 0,
        borrowUSD: parseFloat(iter.borrowUSD) || 0
      }))
    };

    const metrics = calculateQuickModeMetrics(config);
    setCalculatedMetrics(metrics);
  };

  const addIteration = () => {
    setIterations([
      ...iterations,
      { iterationNumber: iterations.length + 1, borrowAmount: '', borrowUSD: '', ltvRatio: 0 }
    ]);
  };

  const removeIteration = (index) => {
    if (iterations.length > 1) {
      setIterations(iterations.filter((_, i) => i !== index).map((iter, i) => ({
        ...iter,
        iterationNumber: i + 1
      })));
    }
  };

  const updateIteration = (index, field, value) => {
    const updated = [...iterations];
    updated[index][field] = value;

    // Auto-calculate LTV ratio
    if (field === 'borrowUSD') {
      const availableCollateral = index === 0
        ? parseFloat(formData.initialDepositUSD) || 0
        : parseFloat(iterations[index - 1].borrowUSD) || 0;
      
      const borrowUSD = parseFloat(value) || 0;
      updated[index].ltvRatio = availableCollateral > 0 ? (borrowUSD / availableCollateral) * 100 : 0;
    }

    setIterations(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!calculatedMetrics) return;

    const loopData = {
      loopName: formData.loopName,
      description: formData.description,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      wallet: formData.wallet,
      blockchain: formData.blockchain,
      mode: 'quick',
      quickConfig: {
        protocol: formData.protocol,
        lendingAsset: formData.lendingAsset,
        borrowingAsset: formData.borrowingAsset || formData.lendingAsset,
        initialDeposit: {
          amount: parseFloat(formData.initialDepositAmount) || 0,
          usd: parseFloat(formData.initialDepositUSD) || 0
        },
        lendingAPY: parseFloat(formData.lendingAPY) || 0,
        borrowingAPY: parseFloat(formData.borrowingAPY) || 0,
        liquidationThreshold: parseFloat(formData.liquidationThreshold) || 0.75,
        iterations: iterations.map(iter => ({
          iterationNumber: iter.iterationNumber,
          borrowAmount: parseFloat(iter.borrowAmount) || 0,
          borrowUSD: parseFloat(iter.borrowUSD) || 0,
          ltvRatio: iter.ltvRatio
        }))
      },
      totalCollateral: calculatedMetrics.totalCollateral,
      totalBorrowed: calculatedMetrics.totalBorrowed,
      leverageRatio: calculatedMetrics.leverageRatio.toFixed(2),
      healthFactor: calculatedMetrics.healthFactor.toFixed(2),
      yieldApyAggregate: calculatedMetrics.netAPY.toFixed(2),
      collateralValue: calculatedMetrics.totalCollateral,
      debtValue: calculatedMetrics.totalBorrowed,
      numberProtocols: 1
    };

    onSave(loopData);
  };

  if (!isOpen) return null;

  const risk = calculatedMetrics ? getRiskLevel(calculatedMetrics.healthFactor) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" data-testid="quick-loop-form">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-zinc-900/95 to-black/95 backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-2xl shadow-red-500/10">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-950/80 to-orange-950/80 backdrop-blur-md px-6 py-4 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Quick Loop Builder</h2>
              <p className="text-sm text-zinc-400">Iterative lending-borrowing loop</p>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loop Info Display */}
          <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
            <h3 className="text-lg font-bold text-white mb-2">{formData.loopName}</h3>
            <div className="flex flex-wrap gap-2 text-sm text-zinc-400">
              {formData.wallet && <span>Wallet: {formData.wallet}</span>}
              {formData.blockchain && <span>• {formData.blockchain}</span>}
            </div>
          </div>

          {/* Protocol & Assets */}
          <div className="bg-zinc-800/30 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Protocol & Assets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="protocol" className="text-zinc-300">Protocol *</Label>
                <Input
                  id="protocol"
                  data-testid="input-protocol"
                  value={formData.protocol}
                  onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                  required
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="e.g., Aave V3, Morpho"
                />
              </div>
              <div>
                <Label htmlFor="lendingAsset" className="text-zinc-300">Lending Asset *</Label>
                <Input
                  id="lendingAsset"
                  data-testid="input-lending-asset"
                  value={formData.lendingAsset}
                  onChange={(e) => setFormData({ ...formData, lendingAsset: e.target.value })}
                  required
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="e.g., USDC, ETH"
                />
              </div>
              <div>
                <Label htmlFor="borrowingAsset" className="text-zinc-300">Borrowing Asset</Label>
                <Input
                  id="borrowingAsset"
                  data-testid="input-borrowing-asset"
                  value={formData.borrowingAsset}
                  onChange={(e) => setFormData({ ...formData, borrowingAsset: e.target.value })}
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="Same as lending if empty"
                />
              </div>
            </div>
          </div>

          {/* Initial Deposit */}
          <div className="bg-zinc-800/30 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Initial Deposit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initialDepositAmount" className="text-zinc-300">Token Amount *</Label>
                <Input
                  id="initialDepositAmount"
                  data-testid="input-initial-amount"
                  type="number"
                  step="0.000001"
                  value={formData.initialDepositAmount}
                  onChange={(e) => setFormData({ ...formData, initialDepositAmount: e.target.value })}
                  required
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="initialDepositUSD" className="text-zinc-300">USD Value *</Label>
                <Input
                  id="initialDepositUSD"
                  data-testid="input-initial-usd"
                  type="number"
                  step="0.01"
                  value={formData.initialDepositUSD}
                  onChange={(e) => setFormData({ ...formData, initialDepositUSD: e.target.value })}
                  required
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="1000.00"
                />
              </div>
            </div>
          </div>

          {/* APY & Risk Parameters */}
          <div className="bg-zinc-800/30 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">APY & Risk Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="lendingAPY" className="text-zinc-300">Lending APY (%) *</Label>
                <Input
                  id="lendingAPY"
                  data-testid="input-lending-apy"
                  type="number"
                  step="0.01"
                  value={formData.lendingAPY}
                  onChange={(e) => setFormData({ ...formData, lendingAPY: e.target.value })}
                  required
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="3.5"
                />
              </div>
              <div>
                <Label htmlFor="borrowingAPY" className="text-zinc-300">Borrowing APY (%) *</Label>
                <Input
                  id="borrowingAPY"
                  data-testid="input-borrowing-apy"
                  type="number"
                  step="0.01"
                  value={formData.borrowingAPY}
                  onChange={(e) => setFormData({ ...formData, borrowingAPY: e.target.value })}
                  required
                  className="bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                  placeholder="2.5"
                />
              </div>
              <div>
                <Label htmlFor="liquidationThreshold" className="text-zinc-300">Liquidation Threshold</Label>
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
          </div>

          {/* Iterations */}
          <div className="bg-zinc-800/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Borrow Iterations</h3>
              <Button
                type="button"
                onClick={addIteration}
                size="sm"
                data-testid="add-iteration"
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white"
              >
                <Plus size={16} className="mr-1" />
                Add Iteration
              </Button>
            </div>

            {iterations.map((iteration, index) => (
              <div key={index} className="bg-zinc-900/50 rounded-lg p-4 space-y-3" data-testid={`iteration-${index}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-400">Loop {iteration.iterationNumber}</span>
                  {iterations.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeIteration(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-zinc-400">Borrow Amount (Tokens)</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={iteration.borrowAmount}
                      onChange={(e) => updateIteration(index, 'borrowAmount', e.target.value)}
                      className="bg-zinc-800/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                      placeholder="800"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">Borrow USD Value</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={iteration.borrowUSD}
                      onChange={(e) => updateIteration(index, 'borrowUSD', e.target.value)}
                      className="bg-zinc-800/50 border-red-500/30 text-white placeholder:text-zinc-600 focus:border-red-500 focus:ring-red-500/20"
                      placeholder="800.00"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">LTV Ratio</Label>
                    <div className="h-10 flex items-center px-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-400 text-sm">
                      {iteration.ltvRatio.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Calculated Metrics */}
          {calculatedMetrics && (
            <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="text-red-400" size={20} />
                <h3 className="text-lg font-semibold text-white">Calculated Metrics</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Total Collateral</p>
                  <p className="text-lg font-bold text-white">
                    ${calculatedMetrics.totalCollateral.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Total Borrowed</p>
                  <p className="text-lg font-bold text-white">
                    ${calculatedMetrics.totalBorrowed.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Leverage</p>
                  <p className="text-lg font-bold text-orange-400">
                    {calculatedMetrics.leverageRatio.toFixed(2)}x
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Net APY</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {calculatedMetrics.netAPY.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Health Factor</p>
                  <p className={`text-lg font-bold ${
                    risk?.color === 'emerald' ? 'text-emerald-400' :
                    risk?.color === 'yellow' ? 'text-yellow-400' :
                    risk?.color === 'orange' ? 'text-orange-400' :
                    'text-red-400'
                  }`}>
                    {calculatedMetrics.healthFactor === 999 ? '∞' : calculatedMetrics.healthFactor.toFixed(2)}
                  </p>
                </div>
              </div>

              {risk && (
                <div className={`mt-4 p-3 rounded-lg border ${
                  risk.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30' :
                  risk.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  risk.color === 'orange' ? 'bg-orange-500/10 border-orange-500/30' :
                  'bg-red-500/10 border-red-500/30'
                }`}>
                  <p className={`text-sm font-semibold ${
                    risk.color === 'emerald' ? 'text-emerald-400' :
                    risk.color === 'yellow' ? 'text-yellow-400' :
                    risk.color === 'orange' ? 'text-orange-400' :
                    'text-red-400'
                  }`}>
                    Risk Level: {risk.level}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
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
              data-testid="save-quick-loop"
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/20"
            >
              {loop ? 'Update Loop' : 'Create Loop'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickLoopForm;
