import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, ChevronUp, ChevronDown, Save, Layers, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { calculateAdvancedModeMetrics, getRiskLevel } from '@/utils/loopCalculations';

const STEP_TYPES = [
  { value: 'supply', label: 'Supply/Lend/Stake', icon: '💰', color: 'emerald' },
  { value: 'borrow', label: 'Borrow', icon: '📤', color: 'orange' },
  { value: 'swap', label: 'Swap', icon: '🔄', color: 'blue' },
  { value: 'leveraged', label: 'Leveraged Position', icon: '⚡', color: 'purple', description: 'Protocol does the loop for you' }
];

const AdvancedLoopForm = ({ isOpen, onClose, onSave, loop = null, basicInfo = null }) => {
  const [formData, setFormData] = useState({
    loopName: '',
    description: '',
    tags: ''
  });

  const [steps, setSteps] = useState([
    {
      id: Date.now(),
      stepNumber: 1,
      stepType: 'supply',
      protocol: '',
      asset: '',
      amount: '',
      usdValue: '',
      apy: '',
      liquidationThreshold: '0.75',
      notes: '',
      link: '',
      // Leveraged position specific fields
      lendingAPY: '',
      borrowAPY: '',
      leverage: ''
    }
  ]);

  const [calculatedMetrics, setCalculatedMetrics] = useState(null);
  const [showStepDetails, setShowStepDetails] = useState({});

  useEffect(() => {
    if (loop && loop.mode === 'advanced') {
      setFormData({
        loopName: loop.loopName || '',
        description: loop.description || '',
        tags: loop.tags?.join(', ') || '',
        wallet: loop.wallet || '',
        blockchain: loop.blockchain || ''
      });
      if (loop.steps && loop.steps.length > 0) {
        setSteps(loop.steps.map((step, index) => ({
          id: step.id || Date.now() + index,
          stepNumber: index + 1,
          ...step
        })));
      }
    } else if (basicInfo) {
      setFormData({
        loopName: basicInfo.loopName || '',
        description: basicInfo.description || '',
        tags: basicInfo.tags || '',
        wallet: basicInfo.wallet || '',
        blockchain: basicInfo.blockchain || ''
      });
    }
  }, [loop, basicInfo, isOpen]);

  useEffect(() => {
    calculateMetrics();
  }, [steps]);

  const calculateMetrics = () => {
    const validSteps = steps.map(step => ({
      stepType: step.stepType,
      usdValue: parseFloat(step.usdValue) || 0,
      apy: parseFloat(step.apy) || 0,
      liquidationThreshold: parseFloat(step.liquidationThreshold) || 0.75,
      asset: step.asset,
      protocol: step.protocol
    }));

    const metrics = calculateAdvancedModeMetrics(validSteps);
    setCalculatedMetrics(metrics);
  };

  const addStep = () => {
    const newStep = {
      id: Date.now(),
      stepNumber: steps.length + 1,
      stepType: 'supply',
      protocol: '',
      asset: '',
      amount: '',
      usdValue: '',
      apy: '',
      liquidationThreshold: '0.75',
      notes: '',
      link: '',
      // Leveraged position specific fields
      lendingAPY: '',
      borrowAPY: '',
      leverage: ''
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (index) => {
    if (steps.length > 1) {
      const updated = steps.filter((_, i) => i !== index);
      // Renumber steps
      setSteps(updated.map((step, i) => ({ ...step, stepNumber: i + 1 })));
    }
  };

  const moveStepUp = (index) => {
    if (index > 0) {
      const updated = [...steps];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      // Renumber
      setSteps(updated.map((step, i) => ({ ...step, stepNumber: i + 1 })));
    }
  };

  const moveStepDown = (index) => {
    if (index < steps.length - 1) {
      const updated = [...steps];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      // Renumber
      setSteps(updated.map((step, i) => ({ ...step, stepNumber: i + 1 })));
    }
  };

  const updateStep = (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    
    // Auto-calculate APY for leveraged positions
    if (updated[index].stepType === 'leveraged') {
      const lendingAPY = parseFloat(updated[index].lendingAPY) || 0;
      const borrowAPY = parseFloat(updated[index].borrowAPY) || 0;
      const leverage = parseFloat(updated[index].leverage) || 1;
      
      // Formula: APY = L * a_L - (L-1) * a_B
      const calculatedAPY = (leverage * lendingAPY) - ((leverage - 1) * borrowAPY);
      updated[index].apy = calculatedAPY.toFixed(2);
    }
    
    setSteps(updated);
  };

  const duplicateStep = (index) => {
    const stepToDuplicate = { ...steps[index] };
    const newStep = {
      ...stepToDuplicate,
      id: Date.now(),
      stepNumber: steps.length + 1
    };
    setSteps([...steps, newStep]);
  };

  const toggleStepDetails = (stepId) => {
    setShowStepDetails(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
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
      mode: 'advanced',
      steps: steps.map((step, index) => ({
        stepNumber: index + 1,
        stepType: step.stepType,
        protocol: step.protocol,
        asset: step.asset,
        amount: parseFloat(step.amount) || 0,
        usdValue: parseFloat(step.usdValue) || 0,
        apy: parseFloat(step.apy) || 0,
        liquidationThreshold: parseFloat(step.liquidationThreshold) || 0.75,
        notes: step.notes,
        link: step.link,
        // Include leveraged position fields
        ...(step.stepType === 'leveraged' && {
          lendingAPY: parseFloat(step.lendingAPY) || 0,
          borrowAPY: parseFloat(step.borrowAPY) || 0,
          leverage: parseFloat(step.leverage) || 1
        })
      })),
      totalCollateral: calculatedMetrics.totalCollateral,
      totalBorrowed: calculatedMetrics.totalBorrowed,
      leverageRatio: calculatedMetrics.leverageRatio.toFixed(2),
      healthFactor: calculatedMetrics.healthFactor.toFixed(2),
      yieldApyAggregate: calculatedMetrics.aggregateAPY.toFixed(2),
      netExposure: calculatedMetrics.netExposure,
      collateralValue: calculatedMetrics.totalCollateral,
      debtValue: calculatedMetrics.totalBorrowed,
      numberProtocols: [...new Set(steps.map(s => s.protocol).filter(Boolean))].length
    };

    onSave(loopData);
  };

  if (!isOpen) return null;

  const risk = calculatedMetrics ? getRiskLevel(calculatedMetrics.healthFactor) : null;

  const getStepTypeConfig = (type) => {
    return STEP_TYPES.find(t => t.value === type) || STEP_TYPES[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" data-testid="advanced-loop-form">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-zinc-900/95 to-black/95 backdrop-blur-xl border border-orange-500/20 rounded-2xl shadow-2xl shadow-orange-500/10">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-950/80 to-red-950/80 backdrop-blur-md px-6 py-4 border-b border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Advanced Loop Builder</h2>
              <p className="text-sm text-zinc-400">Complex multi-step strategy creator</p>
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

          {/* Steps Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ArrowRight size={20} className="text-orange-400" />
                Strategy Steps ({steps.length})
              </h3>
              <Button
                type="button"
                onClick={addStep}
                size="sm"
                data-testid="add-step"
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white"
              >
                <Plus size={16} className="mr-1" />
                Add Step
              </Button>
            </div>

            {/* Step Cards */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const stepConfig = getStepTypeConfig(step.stepType);
                const isExpanded = showStepDetails[step.id];

                return (
                  <div
                    key={step.id}
                    className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-zinc-700/50 rounded-xl overflow-hidden"
                    data-testid={`step-${index}`}
                  >
                    {/* Step Header */}
                    <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex flex-col gap-1">
                            <Button
                              type="button"
                              onClick={() => moveStepUp(index)}
                              disabled={index === 0}
                              variant="ghost"
                              size="sm"
                              className="h-5 w-8 p-0 text-zinc-500 hover:text-white disabled:opacity-30"
                            >
                              <ChevronUp size={14} />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => moveStepDown(index)}
                              disabled={index === steps.length - 1}
                              variant="ghost"
                              size="sm"
                              className="h-5 w-8 p-0 text-zinc-500 hover:text-white disabled:opacity-30"
                            >
                              <ChevronDown size={14} />
                            </Button>
                          </div>
                          
                          <span className="text-2xl">{stepConfig.icon}</span>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-zinc-400">Step {step.stepNumber}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                stepConfig.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                                stepConfig.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                                stepConfig.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-purple-500/20 text-purple-400'
                              }`}>
                                {stepConfig.label}
                              </span>
                            </div>
                            {step.protocol && step.asset && (
                              <p className="text-sm text-zinc-400">
                                {step.protocol} • {step.asset} {step.usdValue && `($${parseFloat(step.usdValue).toFixed(2)})`}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            onClick={() => toggleStepDetails(step.id)}
                            variant="ghost"
                            size="sm"
                            className="text-zinc-400 hover:text-white"
                          >
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => duplicateStep(index)}
                            variant="ghost"
                            size="sm"
                            data-testid={`duplicate-step-${index}`}
                            className="text-zinc-400 hover:text-white"
                          >
                            <Save size={16} />
                          </Button>
                          {steps.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeStep(index)}
                              variant="ghost"
                              size="sm"
                              data-testid={`remove-step-${index}`}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step Details */}
                    {isExpanded && (
                      <div className="p-4 space-y-4">
                        {/* Step Type */}
                        <div>
                          <Label className="text-zinc-300 text-sm">Step Type *</Label>
                          <Select
                            value={step.stepType}
                            onValueChange={(value) => updateStep(index, 'stepType', value)}
                          >
                            <SelectTrigger data-testid={`step-type-${index}`} className="bg-zinc-900/50 border-orange-500/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-orange-500/30">
                              {STEP_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value} className="text-white hover:bg-orange-500/20">
                                  {type.icon} {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Protocol & Asset */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-zinc-300 text-sm">Protocol *</Label>
                            <Input
                              data-testid={`step-protocol-${index}`}
                              value={step.protocol}
                              onChange={(e) => updateStep(index, 'protocol', e.target.value)}
                              className="bg-zinc-900/50 border-orange-500/30 text-white placeholder:text-zinc-600"
                              placeholder="e.g., Aave, Morpho, Uniswap"
                            />
                          </div>
                          <div>
                            <Label className="text-zinc-300 text-sm">Asset/Token *</Label>
                            <Input
                              data-testid={`step-asset-${index}`}
                              value={step.asset}
                              onChange={(e) => updateStep(index, 'asset', e.target.value)}
                              className="bg-zinc-900/50 border-orange-500/30 text-white placeholder:text-zinc-600"
                              placeholder="e.g., ETH, USDC, wstETH"
                            />
                          </div>
                        </div>

                        {/* Amount & USD Value */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-zinc-300 text-sm">Token Amount</Label>
                            <Input
                              data-testid={`step-amount-${index}`}
                              type="number"
                              step="0.000001"
                              value={step.amount}
                              onChange={(e) => updateStep(index, 'amount', e.target.value)}
                              className="bg-zinc-900/50 border-orange-500/30 text-white placeholder:text-zinc-600"
                              placeholder="1000"
                            />
                          </div>
                          <div>
                            <Label className="text-zinc-300 text-sm">USD Value *</Label>
                            <Input
                              data-testid={`step-usd-${index}`}
                              type="number"
                              step="0.01"
                              value={step.usdValue}
                              onChange={(e) => updateStep(index, 'usdValue', e.target.value)}
                              className="bg-zinc-900/50 border-orange-500/30 text-white placeholder:text-zinc-600"
                              placeholder="1000.00"
                            />
                          </div>
                        </div>

                        {/* APY & Liquidation Threshold */}
                        {step.stepType === 'leveraged' ? (
                          // Leveraged position specific fields
                          <div className="space-y-4">
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                              <p className="text-xs text-purple-400 mb-2">⚡ Leveraged Position: Protocol handles the loop automatically</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label className="text-zinc-300 text-sm">Lending APY (%)</Label>
                                <Input
                                  data-testid={`step-lending-apy-${index}`}
                                  type="number"
                                  step="0.01"
                                  value={step.lendingAPY}
                                  onChange={(e) => updateStep(index, 'lendingAPY', e.target.value)}
                                  className="bg-zinc-900/50 border-orange-500/30 text-white placeholder:text-zinc-600"
                                  placeholder="10.5"
                                />
                              </div>
                              <div>
                                <Label className="text-zinc-300 text-sm">Borrow APY (%)</Label>
                                <Input
                                  data-testid={`step-borrow-apy-${index}`}
                                  type="number"
                                  step="0.01"
                                  value={step.borrowAPY}
                                  onChange={(e) => updateStep(index, 'borrowAPY', e.target.value)}
                                  className="bg-zinc-900/50 border-orange-500/30 text-white placeholder:text-zinc-600"
                                  placeholder="8.5"
                                />
                              </div>
                              <div>
                                <Label className="text-zinc-300 text-sm">Leverage (x)</Label>
                                <Input
                                  data-testid={`step-leverage-${index}`}
                                  type="number"
                                  step="0.1"
                                  min="1"
                                  value={step.leverage}
                                  onChange={(e) => updateStep(index, 'leverage', e.target.value)}
                                  className="bg-zinc-900/50 border-orange-500/30 text-white placeholder:text-zinc-600"
                                  placeholder="3"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-zinc-300 text-sm">Calculated Net APY (%)</Label>
                                <div className="h-10 flex items-center px-3 bg-zinc-900/50 border border-emerald-500/30 rounded-lg text-emerald-400 font-semibold">
                                  {step.apy || '0.00'}%
                                </div>
                              </div>
                              <div>
                                <Label className="text-zinc-300 text-sm">Max Liquidation Threshold</Label>
                                <Input
                                  data-testid={`step-lt-${index}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="1"
                                  value={step.liquidationThreshold}
                                  onChange={(e) => updateStep(index, 'liquidationThreshold', e.target.value)}
                                  className="bg-zinc-900/50 border-orange-500/30 text-white placeholder:text-zinc-600"
                                  placeholder="0.75"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (step.stepType === 'supply' || step.stepType === 'borrow') && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-zinc-300 text-sm">
                                {step.stepType === 'borrow' ? 'Borrow APY (%)' : 'Yield APY (%)'}
                              </Label>
                              <Input
                                data-testid={`step-apy-${index}`}
                                type="number"
                                step="0.01"
                                value={step.apy}
                                onChange={(e) => updateStep(index, 'apy', e.target.value)}
                                className="bg-zinc-900/50 border-orange-500/30 text-white placeholder:text-zinc-600"
                                placeholder="5.5"
                              />
                            </div>
                            {step.stepType === 'supply' && (
                              <div>
                                <Label className="text-zinc-300 text-sm">Liquidation Threshold</Label>
                                <Input
                                  data-testid={`step-lt-${index}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="1"
                                  value={step.liquidationThreshold}
                                  onChange={(e) => updateStep(index, 'liquidationThreshold', e.target.value)}
                                  className="bg-zinc-900/50 border-orange-500/30 text-white placeholder:text-zinc-600"
                                  placeholder="0.75"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Link */}
                        <div>
                          <Label className="text-zinc-300 text-sm">Protocol Link (Optional)</Label>
                          <Input
                            data-testid={`step-link-${index}`}
                            type="url"
                            value={step.link}
                            onChange={(e) => updateStep(index, 'link', e.target.value)}
                            className="bg-zinc-900/50 border-orange-500/30 text-white placeholder:text-zinc-600"
                            placeholder="https://..."
                          />
                        </div>

                        {/* Notes */}
                        <div>
                          <Label className="text-zinc-300 text-sm">Notes</Label>
                          <Textarea
                            data-testid={`step-notes-${index}`}
                            value={step.notes}
                            onChange={(e) => updateStep(index, 'notes', e.target.value)}
                            className="bg-zinc-900/50 border-orange-500/30 text-white placeholder:text-zinc-600"
                            placeholder="Additional notes about this step..."
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calculated Metrics */}
          {calculatedMetrics && (
            <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-orange-500/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="text-orange-400" size={20} />
                <h3 className="text-lg font-semibold text-white">Calculated Metrics</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
                  <p className="text-xs text-zinc-500 mb-1">Net Exposure</p>
                  <p className="text-lg font-bold text-white">
                    ${calculatedMetrics.netExposure.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Leverage</p>
                  <p className="text-lg font-bold text-orange-400">
                    {calculatedMetrics.leverageRatio.toFixed(2)}x
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Aggregate APY</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {calculatedMetrics.aggregateAPY.toFixed(2)}%
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
                  <p className="text-xs text-zinc-500 mt-1">
                    Based on {steps.filter(s => s.stepType === 'supply' || s.stepType === 'leveraged').length} collateral step(s) 
                    and {steps.filter(s => s.stepType === 'borrow').length} borrow step(s)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-zinc-800">
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
              data-testid="save-advanced-loop"
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-500/20"
            >
              {loop ? 'Update Loop' : 'Create Loop'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedLoopForm;
