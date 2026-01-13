import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Zap,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

// --- DESIGN TOKENS ---
const COLORS = {
  bg: '#050505',
  card: '#141414',
  cardHighlight: '#1A1A1A',
  inputBg: '#0A0A0A',
  primary: '#FFE066', // Orbit Yellow
  cyan: '#33FFCC',
  blue: '#3385FF',
  green: '#14B8A6',
  indigo: '#c69221ff',
  orange: '#FF6633',
  purple: '#D946EF',
  red: '#FF4444',
  textMain: '#FFFFFF',
  textMuted: '#888888',
  border: '#222222'
};

// --- HELPER COMPONENTS ---

const InputField = ({ label, name, value, onChange, placeholder, type = "text", suffix, prefix, helper, className, min, max, step, required, optional }) => (
  <div className={`flex flex-col gap-1.5 w-full ${className}`}>
    <label className="text-xs font-medium uppercase tracking-wide flex items-center gap-1.5">
      <span className={required ? 'text-white' : 'text-[#888]'}>{label}</span>
      {required && <span className="text-[#FFE066] text-[10px]">*</span>}
      {optional && <span className="text-[#555] text-[9px] font-normal normal-case">(optional)</span>}
    </label>
    <div className="relative group">
      {prefix && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">
          {prefix}
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`w-full bg-[#0A0A0A] border text-white rounded-xl px-4 py-3 
          focus:outline-none focus:border-[#FFE066] focus:ring-1 focus:ring-[#FFE066]/50 
          transition-all duration-300 font-medium placeholder:text-[#333] ${prefix ? 'pl-9' : ''}
          ${required ? 'border-[#333]' : 'border-[#222]'}`}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-sm font-medium pointer-events-none">
          {suffix}
        </div>
      )}
    </div>
    {helper && <p className="text-[10px] text-[#555]">{helper}</p>}
  </div>
);

const HealthBar = ({ factor }) => {
  let color = COLORS.cyan;
  let label = "Safe";
  if (factor < 1.1) { color = COLORS.red; label = "Liquidation Risk"; }
  else if (factor < 1.5) { color = COLORS.orange; label = "High Risk"; }
  else if (factor < 1.8) { color = COLORS.primary; label = "Moderate"; }

  // Cap at 3.0 for visual scale
  const percentage = Math.min((factor / 3) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[#888]">Projected Health</span>
        <span style={{ color: color, fontWeight: 600 }}>{factor > 100 ? '∞' : factor.toFixed(2)} ({label})</span>
      </div>
      <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden relative">
        <div className="absolute inset-0 w-full h-full flex opacity-20">
          <div className="w-[33%] bg-red-500"></div>
          <div className="w-[17%] bg-orange-500"></div>
          <div className="w-[50%] bg-green-500"></div>
        </div>
        <div
          className="h-full rounded-full transition-all duration-500 relative z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// --- ADVANCED STEP CARD COMPONENT ---

const AdvancedStepCard = ({ step, index, totalSteps, updateStep, removeStep, moveStep, duplicateStep }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Configuration for different step types
  const getTypeConfig = (type) => {
    switch (type) {
      case 'borrow': return { color: COLORS.orange, icon: <ArrowDownLeft size={16} />, label: 'Borrow' };
      case 'lending': return { color: '#818CF8', icon: <RefreshCw size={16} />, label: 'Re-Supply' }; // Indigo
      case 'swap': return { color: COLORS.indigo, icon: <RefreshCw size={16} />, label: 'Swap' }; // Teal
      case 'leveraged': return { color: COLORS.purple, icon: <Zap size={16} />, label: 'Auto-Loop' };
      default: return { color: COLORS.cyan, icon: <ArrowUpRight size={16} />, label: 'Supply' };
    }
  };

  const config = getTypeConfig(step.stepType);

  const handleChange = (field, value) => {
    updateStep(step.id, field, value);
  };

  return (
    <div className={`group relative bg-[#141414] border rounded-2xl transition-all duration-300 ${isExpanded ? 'border-[#333] shadow-lg' : 'border-[#222] hover:border-[#444]'}`}>
      {/* Connector Line Logic */}
      {index !== totalSteps - 1 && (
        <div className="absolute left-[23px] bottom-[-20px] h-[22px] w-0.5 bg-[#333] -z-10"></div>
      )}

      {/* Header - with inline editable action type, protocol, and asset */}
      <div className="flex items-center gap-3 p-4">
        {/* Step Number */}
        <div className="w-6 h-6 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-[10px] font-mono text-[#888] shrink-0">
          {index + 1}
        </div>

        {/* Action Type Dropdown Chip with Icon */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Icon */}
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <div style={{ color: config.color }}>{config.icon}</div>
          </div>
          {/* Dropdown */}
          <div className="relative">
            <select
              value={step.stepType}
              onChange={(e) => handleChange('stepType', e.target.value)}
              className="appearance-none cursor-pointer pl-2 pr-6 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#141414] min-w-[110px]"
              style={{
                backgroundColor: `${config.color}15`,
                borderColor: `${config.color}40`,
                color: config.color
              }}
            >
              <option value="supply">Supply</option>
              <option value="lending">Re-Supply</option>
              <option value="borrow">Borrow</option>
              <option value="swap">Swap</option>
              <option value="leveraged">Auto-Loop</option>
            </select>
            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: config.color }} />
          </div>
        </div>

        {/* Inline Protocol Input */}
        <div className="relative flex-1 max-w-[180px]" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={step.protocol}
            onChange={(e) => handleChange('protocol', e.target.value)}
            placeholder="Protocol"
            className="w-full bg-transparent border-b border-[#333] text-white text-sm font-medium px-1 py-1 focus:outline-none focus:border-[#FFE066] transition-colors placeholder:text-[#555]"
          />
        </div>

        {/* Separator */}
        <ChevronRight size={14} className="text-[#444] shrink-0" />

        {/* Inline Asset Input */}
        <div className="relative w-[100px]" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={step.asset}
            onChange={(e) => handleChange('asset', e.target.value)}
            placeholder="Asset"
            className="w-full bg-transparent border-b border-[#333] text-white text-sm font-medium px-1 py-1 focus:outline-none focus:border-[#FFE066] transition-colors placeholder:text-[#555] uppercase"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-0.5">
            <button onClick={() => moveStep(index, -1)} disabled={index === 0} className="text-[#444] hover:text-white disabled:opacity-20 p-0.5"><ChevronUp size={12} /></button>
            <button onClick={() => moveStep(index, 1)} disabled={index === totalSteps - 1} className="text-[#444] hover:text-white disabled:opacity-20 p-0.5"><ChevronDown size={12} /></button>
          </div>
          <button onClick={() => duplicateStep(index)} className="p-1.5 text-[#444] hover:text-[#33FFCC] transition-colors rounded-lg hover:bg-[#33FFCC]/10" title="Duplicate step">
            <Copy size={14} />
          </button>
          <button onClick={() => removeStep(index)} className="p-1.5 text-[#444] hover:text-[#FF4444] transition-colors rounded-lg hover:bg-[#FF4444]/10" title="Delete step">
            <Trash2 size={14} />
          </button>
          <button className={`p-1.5 text-[#555] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} onClick={() => setIsExpanded(!isExpanded)}>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
          <div className="h-px w-full bg-[#222] mb-4"></div>

          <div className="grid grid-cols-12 gap-4">
            {/* USD Value - Always Required */}
            <div className="col-span-12 md:col-span-6">
              <InputField
                label="USD Value"
                type="number"
                prefix={<DollarSign size={14} />}
                placeholder="0.00"
                value={step.usdValue}
                onChange={(e) => handleChange('usdValue', e.target.value)}
                required
                helper="Required for calculations"
              />
            </div>

            {/* Amount - Optional */}
            <div className="col-span-12 md:col-span-6">
              <InputField
                label="Amount"
                type="number"
                placeholder="0.00"
                value={step.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                suffix={step.asset || 'tokens'}
                optional
              />
            </div>

            {/* Conditional Logic based on Step Type */}
            {step.stepType === 'leveraged' ? (
              <div className="col-span-12 bg-[#1A1A1A] border border-[#333] border-dashed rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={14} color={COLORS.purple} />
                  <span className="text-xs font-bold text-[#D946EF] uppercase">Auto-Loop Configuration</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="Lending APY"
                    suffix="%"
                    value={step.lendingAPY}
                    onChange={(e) => handleChange('lendingAPY', e.target.value)}
                    required
                  />
                  <InputField
                    label="Borrow APY"
                    suffix="%"
                    value={step.borrowAPY}
                    onChange={(e) => handleChange('borrowAPY', e.target.value)}
                    required
                  />
                  <InputField
                    label="Leverage"
                    suffix="x"
                    value={step.leverage}
                    onChange={(e) => handleChange('leverage', e.target.value)}
                    required
                  />
                </div>
                <div className="mt-4 flex items-center justify-between bg-[#0A0A0A] p-3 rounded-lg border border-[#333]">
                  <span className="text-[#888] text-xs">Calculated Net Yield</span>
                  <span className="text-[#33FFCC] font-mono font-bold text-lg">
                    {((parseFloat(step.leverage || 1) * parseFloat(step.lendingAPY || 0)) - ((parseFloat(step.leverage || 1) - 1) * parseFloat(step.borrowAPY || 0))).toFixed(2)}%
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className={step.stepType === 'borrow' ? 'col-span-6' : 'col-span-12'}>
                  <InputField
                    label={step.stepType === 'borrow' ? 'Borrow Rate' : step.stepType === 'swap' ? 'Swap Fee' : 'Supply Yield'}
                    suffix="%"
                    value={step.apy}
                    onChange={(e) => handleChange('apy', e.target.value)}
                    placeholder={step.stepType === 'swap' ? '0.3' : '0.00'}
                    required
                  />
                </div>
                {/* Only show Liquidation Threshold for Borrow steps */}
                {step.stepType === 'borrow' && (
                  <div className="col-span-6">
                    <InputField
                      label="Liquidation Threshold"
                      placeholder="0.80"
                      helper="Risk factor (0-1)"
                      value={step.liquidationThreshold}
                      onChange={(e) => handleChange('liquidationThreshold', e.target.value)}
                      required
                    />
                  </div>
                )}
              </>
            )}

            {/* Optional: Notes & Link */}
            <div className="col-span-12 mt-1">
              <details className="group">
                <summary className="text-[10px] text-[#555] uppercase tracking-wide cursor-pointer hover:text-[#888] transition-colors list-none flex items-center gap-1">
                  <ChevronRight size={10} className="transition-transform group-open:rotate-90" />
                  Additional Notes
                </summary>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-3 bg-[#0A0A0A] rounded-lg border border-[#1A1A1A]">
                  <InputField
                    label="Notes"
                    prefix={<FileText size={14} />}
                    placeholder="Strategy context..."
                    value={step.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    optional
                  />
                  <InputField
                    label="Protocol Link"
                    prefix={<LinkIcon size={14} />}
                    placeholder="https://app..."
                    value={step.link}
                    onChange={(e) => handleChange('link', e.target.value)}
                    optional
                  />
                </div>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- MAIN WIZARD COMPONENT ---

// Stabilized screen components to avoid remount-triggered animations
const ScreenModeSelectionStable = ({ onSelectQuick, onSelectAdvanced }) => (
  <div className="h-full flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-300">
    <div className="text-center mb-10">
      <h2 className="text-3xl font-bold text-white mb-2">Select Strategy Type</h2>
      <p className="text-[#888]">Choose how you want to construct your position</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
      <button
        onClick={onSelectQuick}
        className="group relative p-8 rounded-[32px] bg-[#141414] border border-[#222] text-left hover:border-[#FFE066] transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,224,102,0.1)]"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#FFE066]/10 flex items-center justify-center mb-6 group-hover:bg-[#FFE066] transition-colors">
          <Zap size={28} className="text-[#FFE066] group-hover:text-black" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Quick Loop</h3>
        <p className="text-[#888] text-sm leading-relaxed">
          Automated iterative lending & borrowing. Ideal for classic "Looping" strategies on Aave, Morpho, or Radiant.
        </p>
      </button>

      <button
        onClick={onSelectAdvanced}
        className="group relative p-8 rounded-[32px] bg-[#141414] border border-[#222] text-left hover:border-[#33FFCC] transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(51,255,204,0.1)]"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#33FFCC]/10 flex items-center justify-center mb-6 group-hover:bg-[#33FFCC] transition-colors">
          <Layers size={28} className="text-[#33FFCC] group-hover:text-black" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Advanced Custom</h3>
        <p className="text-[#888] text-sm leading-relaxed">
          Build complex, multi-protocol strategies. Mix flash loans, swaps, and cross-chain positions step-by-step.
        </p>
      </button>
    </div>
  </div>
);

const ScreenQuickLoopStable = ({ quickForm, setQuickForm }) => (
  <div className="h-full p-4 md:p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6 opacity-60">
          <div className="w-6 h-6 rounded bg-[#FFE066]/20 flex items-center justify-center">
            <Zap size={14} className="text-[#FFE066]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#888]">Quick Loop Configuration</span>
        </div>

        {/* Hero Title Input */}
        <input
          type="text"
          placeholder="Name your strategy..."
          value={quickForm.name}
          onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
          className="w-full bg-transparent text-5xl font-bold text-white placeholder:text-[#333] border-none focus:outline-none focus:ring-0 p-0 mb-6 tracking-tight"
        />

        {/* Meta Row 1: Protocol & Chain */}
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <div className="relative group">
            <div className="flex items-center gap-3 bg-[#141414] border border-[#222] rounded-full px-5 py-2.5 hover:border-[#444] transition-all focus-within:border-[#FFE066]/50 focus-within:bg-[#FFE066]/5">
              <span className="text-[#666] text-xs uppercase font-bold tracking-wider">Protocol</span>
              <div className="w-px h-3 bg-[#333]"></div>
              <input
                type="text"
                value={quickForm.protocol}
                onChange={(e) => setQuickForm({ ...quickForm, protocol: e.target.value })}
                className="bg-transparent text-white text-sm font-medium w-[100px] focus:outline-none placeholder:text-[#444]"
                placeholder="Aave V3"
              />
            </div>
          </div>
          <div className="relative group">
            <div className="flex items-center gap-3 bg-[#141414] border border-[#222] rounded-full px-5 py-2.5 hover:border-[#444] transition-all focus-within:border-[#FFE066]/50 focus-within:bg-[#FFE066]/5">
              <span className="text-[#666] text-xs uppercase font-bold tracking-wider">Chain</span>
              <div className="w-px h-3 bg-[#333]"></div>
              <input
                type="text"
                value={quickForm.chain}
                onChange={(e) => setQuickForm({ ...quickForm, chain: e.target.value })}
                className="bg-transparent text-white text-sm font-medium w-[100px] focus:outline-none placeholder:text-[#444]"
                placeholder="Ethereum"
              />
            </div>
          </div>
        </div>

        {/* Meta Row 2: Asset & Wallet */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative group">
            <div className="flex items-center gap-3 bg-[#141414] border border-[#222] rounded-full px-5 py-2.5 hover:border-[#444] transition-all focus-within:border-[#FFE066]/50 focus-within:bg-[#FFE066]/5">
              <span className="text-[#666] text-xs uppercase font-bold tracking-wider">Asset</span>
              <div className="w-px h-3 bg-[#333]"></div>
              <input
                type="text"
                value={quickForm.asset}
                onChange={(e) => setQuickForm({ ...quickForm, asset: e.target.value })}
                className="bg-transparent text-white text-sm font-medium w-[80px] focus:outline-none placeholder:text-[#444]"
                placeholder="ETH"
              />
            </div>
          </div>
          <div className="relative group">
            <div className="flex items-center gap-3 bg-[#141414] border border-[#222] rounded-full px-5 py-2.5 hover:border-[#444] transition-all focus-within:border-[#FFE066]/50 focus-within:bg-[#FFE066]/5">
              <span className="text-[#666] text-xs uppercase font-bold tracking-wider">Wallet</span>
              <div className="w-px h-3 bg-[#333]"></div>
              <input
                type="text"
                value={quickForm.wallet}
                onChange={(e) => setQuickForm({ ...quickForm, wallet: e.target.value })}
                className="bg-transparent text-white text-sm font-medium w-[120px] focus:outline-none placeholder:text-[#444]"
                placeholder="Ex: Main Safe"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#141414] p-6 rounded-[24px] border border-[#222] mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings size={18} className="text-[#FFE066]" />
          <h3 className="text-white font-medium">Loop Parameters</h3>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <InputField label="Initial Investment" value={quickForm.initialAmount} onChange={(e) => setQuickForm({ ...quickForm, initialAmount: e.target.value })} type="number" prefix={<DollarSign size={14} />} />
          <InputField label="Target Leverage" value={quickForm.leverageTarget} onChange={(e) => setQuickForm({ ...quickForm, leverageTarget: e.target.value })} type="number" suffix="x" helper={`Max safe leverage: ${(1 / (1 - (quickForm.ltv / 100))).toFixed(1)}x`} />
        </div>

        <div className="space-y-6 p-4 bg-[#0A0A0A] rounded-xl border border-[#222]">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#888]">LTV (Loan to Value)</span>
              <span className="text-[#FFE066]">{quickForm.ltv}%</span>
            </div>
            <input type="range" min="50" max="90" value={quickForm.ltv} onChange={(e) => setQuickForm({ ...quickForm, ltv: parseInt(e.target.value) })} className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#FFE066]" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <InputField label="Supply APY" value={quickForm.supplyApy} onChange={(e) => setQuickForm({ ...quickForm, supplyApy: e.target.value })} suffix="%" />
            <InputField label="Borrow APY" value={quickForm.borrowApy} onChange={(e) => setQuickForm({ ...quickForm, borrowApy: e.target.value })} suffix="%" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ScreenAdvancedLoopStable = ({ advForm, setAdvForm, advSteps, updateAdvStep, removeAdvStep, addAdvStep, moveAdvStep, duplicateAdvStep }) => (
  <div className="h-full p-4 md:p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6 opacity-60">
          <div className="w-6 h-6 rounded bg-[#33FFCC]/20 flex items-center justify-center">
            <Layers size={14} className="text-[#33FFCC]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#888]">Strategy Builder</span>
        </div>

        {/* Hero Title Input */}
        <input
          type="text"
          placeholder="Name your strategy..."
          value={advForm.loopName}
          onChange={(e) => setAdvForm({ ...advForm, loopName: e.target.value })}
          className="w-full bg-transparent text-5xl font-bold text-white placeholder:text-[#333] border-none focus:outline-none focus:ring-0 p-0 mb-6 tracking-tight"
        />

        {/* Meta Row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative group">
            <div className="flex items-center gap-3 bg-[#141414] border border-[#222] rounded-full px-5 py-2.5 hover:border-[#444] transition-all focus-within:border-[#33FFCC]/50 focus-within:bg-[#33FFCC]/5">
              <span className="text-[#666] text-xs uppercase font-bold tracking-wider">Wallet</span>
              <div className="w-px h-3 bg-[#333]"></div>
              <input
                type="text"
                value={advForm.wallet}
                onChange={(e) => setAdvForm({ ...advForm, wallet: e.target.value })}
                className="bg-transparent text-white text-sm font-medium w-[120px] focus:outline-none placeholder:text-[#444]"
                placeholder="Ex: Main Safe"
              />
            </div>
          </div>

          <div className="relative group">
            <div className="flex items-center gap-3 bg-[#141414] border border-[#222] rounded-full px-5 py-2.5 hover:border-[#444] transition-all focus-within:border-[#33FFCC]/50 focus-within:bg-[#33FFCC]/5">
              <span className="text-[#666] text-xs uppercase font-bold tracking-wider">Chain</span>
              <div className="w-px h-3 bg-[#333]"></div>
              <input
                type="text"
                value={advForm.chain}
                onChange={(e) => setAdvForm({ ...advForm, chain: e.target.value })}
                className="bg-transparent text-white text-sm font-medium w-[100px] focus:outline-none placeholder:text-[#444]"
                placeholder="Ethereum"
              />
            </div>
          </div>

          <div className="relative group flex-1">
            <div className="flex items-center gap-3 bg-[#141414] border border-[#222] rounded-full px-5 py-2.5 hover:border-[#444] transition-all focus-within:border-[#33FFCC]/50 focus-within:bg-[#33FFCC]/5">
              <span className="text-[#666] text-xs uppercase font-bold tracking-wider">Tags</span>
              <div className="w-px h-3 bg-[#333]"></div>
              <input
                type="text"
                value={advForm.tags}
                onChange={(e) => setAdvForm({ ...advForm, tags: e.target.value })}
                className="bg-transparent text-white text-sm font-medium w-full focus:outline-none placeholder:text-[#444]"
                placeholder="Arbitrum, High Yield..."
              />
            </div>
          </div>
        </div>

        {/* Description - Subtle */}
        <input
          type="text"
          value={advForm.description}
          onChange={(e) => setAdvForm({ ...advForm, description: e.target.value })}
          className="mt-6 w-full bg-transparent text-[#666] text-sm focus:text-[#AAA] focus:outline-none border-b border-transparent focus:border-[#222] py-2 transition-all placeholder:text-[#333]"
          placeholder="Add a brief description or notes regarding this strategy..."
        />
      </div>

      <div className="space-y-2 mb-8 relative">
        {advSteps.length > 1 && (
          <div className="absolute left-[24px] top-6 bottom-6 w-0.5 bg-[#222] z-0"></div>
        )}

        {advSteps.map((s, index) => (
          <AdvancedStepCard
            key={s.id}
            step={s}
            index={index}
            totalSteps={advSteps.length}
            updateStep={updateAdvStep}
            removeStep={removeAdvStep}
            moveStep={moveAdvStep}
            duplicateStep={duplicateAdvStep}
          />
        ))}

        <button
          onClick={addAdvStep}
          className="w-full py-6 mt-4 border border-dashed border-[#333] rounded-2xl flex flex-col items-center justify-center gap-2 text-[#666] hover:bg-[#141414] hover:text-[#33FFCC] hover:border-[#33FFCC]/30 transition-all group z-10 relative bg-[#050505]"
        >
          <div className="p-2 rounded-full bg-[#1A1A1A] group-hover:bg-[#33FFCC]/20 transition-colors">
            <Plus size={20} />
          </div>
          <span className="text-sm font-medium">Add Action Step</span>
        </button>
      </div>
    </div>
  </div>
);

const ScreenReviewStable = ({ mode, quickForm, advForm, simulatedStats }) => (
  <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-[#FFE066] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,224,102,0.3)]">
        <CheckCircle2 size={32} className="text-black" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">Ready to Launch?</h2>
      <p className="text-[#888]">Review your strategy metrics before confirming.</p>
    </div>

    <div className="bg-[#141414] border border-[#222] rounded-[24px] p-8 w-full max-w-lg">
      <div className="flex justify-between items-center mb-6 pb-6 border-b border-[#222]">
        <span className="text-[#888]">Strategy Name</span>
        <span className="text-white font-medium text-lg">{mode === 'quick' ? quickForm.name : advForm.loopName}</span>
      </div>
      <div className="grid grid-cols-2 gap-y-6">
        <div>
          <span className="block text-[#888] text-xs uppercase mb-1">Net APY</span>
          <span className="text-[#33FFCC] font-bold text-xl">{simulatedStats.netApy.toFixed(2)}%</span>
        </div>
        <div className="text-right">
          <span className="block text-[#888] text-xs uppercase mb-1">Leverage</span>
          <span className="text-white font-bold text-xl">{simulatedStats.leverage.toFixed(2)}x</span>
        </div>
        <div>
          <span className="block text-[#888] text-xs uppercase mb-1">Total Collateral</span>
          <span className="text-white font-bold text-xl">${simulatedStats.collateral.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="text-right">
          <span className="block text-[#888] text-xs uppercase mb-1">Total Debt</span>
          <span className="text-[#FF6633] font-bold text-xl">${simulatedStats.debt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      </div>
    </div>
  </div>
);

const OrbitCreateLoop = ({ onClose, onSave, loop }) => {
  // --- STATE ---
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(null);

  // Quick Loop State
  const [quickForm, setQuickForm] = useState({
    name: 'New Strategy',
    protocol: 'Aave V3',
    chain: 'Ethereum',
    asset: 'ETH',
    initialAmount: '',
    leverageTarget: 2,
    ltv: 80,
    supplyApy: '',
    borrowApy: '',
    wallet: ''
  });

  // Advanced Loop State
  const [advForm, setAdvForm] = useState({
    loopName: 'Advanced Strategy',
    chain: 'Ethereum',
    wallet: '',
    description: '',
    tags: ''
  });

  const [advSteps, setAdvSteps] = useState([
    {
      id: 1,
      stepType: 'supply',
      protocol: 'Aave V3',
      asset: 'USDC',
      amount: '',
      usdValue: '',
      apy: '',
      liquidationThreshold: '0.80',
      lendingAPY: '',
      borrowAPY: '',
      leverage: '',
      notes: '',
      link: ''
    }
  ]);

  // Initialize if editing
  useEffect(() => {
    if (loop) {
      if (loop.mode === 'quick') {
        setMode('quick');
        setQuickForm({
          name: loop.loopName || '',
          protocol: loop.protocolBreakdown?.[0]?.name || '',
          chain: loop.blockchain || '',
          asset: loop.collateralAsset || '',
          initialAmount: loop.entryCollateralAmount || '',
          leverageTarget: loop.leverageRatio || 1,
          ltv: 80, // Default as we might not store LTV directly
          supplyApy: '', // These might need to be inferred or stored separately
          borrowApy: ''
        });
        setStep(2);
      } else {
        setMode('advanced');
        setAdvForm({
          loopName: loop.loopName || '',
          chain: loop.blockchain || '',
          description: loop.notesTags || '',
          tags: ''
        });
        if (loop.protocolBreakdown) {
          const toStepType = (act) => {
            const a = (act || '').toString().toLowerCase();
            if (a === 'borrow') return 'borrow';
            if (a === 'swap') return 'swap';
            if (a === 'loop' || a === 'leveraged') return 'leveraged';
            return 'supply';
          };
          setAdvSteps(loop.protocolBreakdown.map((s, i) => ({
            id: i,
            stepType: s.stepType ? s.stepType : toStepType(s.action),
            protocol: s.protocol || s.name || '',
            asset: s.asset || '',
            amount: s.amount || '',
            usdValue: s.usdValue || '',
            apy: s.apy || s.yieldApy || '',
            liquidationThreshold: s.liquidationThreshold || '0.80',
            lendingAPY: s.lendingAPY || '',
            borrowAPY: s.borrowAPY || '',
            leverage: s.leverage || '',
            notes: s.notes || '',
            link: s.link || ''
          })));
        }
        setStep(2);
      }
    }
  }, [loop]);

  // --- ACTIONS FOR ADVANCED STEPS ---
  const updateAdvStep = (id, field, value) => {
    setAdvSteps(steps => steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeAdvStep = (index) => {
    if (advSteps.length > 1) {
      setAdvSteps(steps => steps.filter((_, i) => i !== index));
    }
  };

  const addAdvStep = () => {
    setAdvSteps([...advSteps, {
      id: Date.now(),
      stepType: 'supply',
      protocol: '',
      asset: '',
      amount: '',
      usdValue: '',
      apy: '',
      liquidationThreshold: '0.80',
      lendingAPY: '',
      borrowAPY: '',
      leverage: '',
      notes: '',
      link: ''
    }]);
  };

  const duplicateAdvStep = (index) => {
    const stepToDuplicate = advSteps[index];
    const newStep = {
      ...stepToDuplicate,
      id: Math.max(...advSteps.map(s => s.id)) + 1,
      // Optional: clear specific fields if needed, or keep exact copy
    };

    const newSteps = [...advSteps];
    newSteps.splice(index + 1, 0, newStep);
    setAdvSteps(newSteps);
  };

  const moveAdvStep = (index, direction) => {
    const newSteps = [...advSteps];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newSteps.length) {
      [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
      setAdvSteps(newSteps);
    }
  };

  // --- CALCULATIONS (SIMULATION) ---
  const simulatedStats = useMemo(() => {
    if (mode === 'advanced') {
      // USER EQUITY: Only supply/stake/restake counts as new funds (NOT lending)
      const userEquity = advSteps
        .filter(s => s.stepType === 'supply' || s.stepType === 'stake' || s.stepType === 'restake')
        .reduce((acc, s) => acc + (parseFloat(s.usdValue) || 0), 0);

      // Add leveraged step base equity
      const leveragedEquity = advSteps
        .filter(s => s.stepType === 'leveraged')
        .reduce((acc, s) => acc + (parseFloat(s.usdValue) || 0), 0);

      const totalUserEquity = userEquity + leveragedEquity;

      // TOTAL COLLATERAL: supply + lending + leveraged positions (all count as collateral)
      const totalCollatBase = advSteps
        .filter(s => s.stepType === 'supply' || s.stepType === 'lending' || s.stepType === 'leveraged')
        .reduce((acc, s) => acc + (parseFloat(s.usdValue) || 0), 0);

      const totalDebtBase = advSteps
        .filter(s => s.stepType === 'borrow')
        .reduce((acc, s) => acc + (parseFloat(s.usdValue) || 0), 0);

      // For leveraged steps, debt implicit: (Leverage - 1) * Equity
      const leveragedDebt = advSteps
        .filter(s => s.stepType === 'leveraged')
        .reduce((acc, s) => {
          const equity = parseFloat(s.usdValue) || 0;
          const lev = parseFloat(s.leverage) || 1;
          return acc + (equity * (lev - 1));
        }, 0);

      const finalDebt = totalDebtBase + leveragedDebt;

      // Adjust collateral for leveraged (Total Exposure increment)
      const leveragedCollatDelta = advSteps
        .filter(s => s.stepType === 'leveraged')
        .reduce((acc, s) => {
          const equity = parseFloat(s.usdValue) || 0;
          const lev = parseFloat(s.leverage) || 1;
          return acc + (equity * lev) - equity;
        }, 0);

      const finalCollat = totalCollatBase + leveragedCollatDelta;

      // LEVERAGE: Now based on user equity, not net exposure (collat - debt)
      const leverage = totalUserEquity > 0 ? finalCollat / totalUserEquity : 1;

      // Approximate net APY: weighted supply vs borrow (including leveraged effective yield)
      let weightedSupplyApy = 0;
      let weightedBorrowApy = 0;
      advSteps.forEach(s => {
        const val = parseFloat(s.usdValue) || 0;
        if (s.stepType === 'leveraged') {
          const lev = parseFloat(s.leverage || 1);
          const lend = parseFloat(s.lendingAPY || 0);
          const bor = parseFloat(s.borrowAPY || 0);
          const net = (lev * lend) - ((lev - 1) * bor);
          weightedSupplyApy += val * net;
        } else {
          const apy = parseFloat(s.apy || 0);
          // Both supply and lending generate yield
          if (s.stepType === 'supply' || s.stepType === 'lending') weightedSupplyApy += (val * apy);
          if (s.stepType === 'borrow') weightedBorrowApy += (val * apy);
        }
      });

      const netReturn = weightedSupplyApy - weightedBorrowApy;
      // NET APY: Calculated as return on USER EQUITY (not total exposure)
      const netApy = totalUserEquity > 0 ? netReturn / totalUserEquity : 0;

      // Health Factor approximation: Collateral * avg(liqThreshold or 0.825) / Debt
      const avgLiq = advSteps.length > 0 ? (
        advSteps.reduce((acc, s) => acc + (parseFloat(s.liquidationThreshold || 0.825)), 0) / advSteps.length
      ) : 0.825;
      const health = finalDebt > 0 ? (finalCollat * avgLiq) / finalDebt : 999;

      return {
        collateral: finalCollat,
        debt: finalDebt,
        netApy: netApy,
        health: health,
        leverage: leverage || 1,
        grossApy: totalUserEquity > 0 ? weightedSupplyApy / totalUserEquity : 0,
        borrowCostApy: totalUserEquity > 0 ? weightedBorrowApy / totalUserEquity : 0,
        totalUserEquity
      };
    }

    // Quick Loop Logic
    const initAmount = parseFloat(quickForm.initialAmount) || 0;
    const ltvDecimal = quickForm.ltv / 100;

    // Calculate final position based on Target Leverage
    // Leverage = Collateral / Equity. Equity = InitAmount.
    // Collateral = InitAmount * Leverage
    const targetLev = parseFloat(quickForm.leverageTarget) || 1;
    const maxLev = 1 / (1 - ltvDecimal);

    // Cap leverage at max mathematical leverage based on LTV
    const actualLev = Math.min(targetLev, maxLev);

    const finalCollateral = initAmount * actualLev;
    const finalDebt = finalCollateral - initAmount;

    const supplyYield = (finalCollateral * (parseFloat(quickForm.supplyApy) || 0)) / 100;
    const borrowCost = (finalDebt * (parseFloat(quickForm.borrowApy) || 0)) / 100;

    const netApy = initAmount > 0 ? ((supplyYield - borrowCost) / initAmount) * 100 : 0;

    // Health Factor = (Collateral * LiquidationThreshold) / Debt
    // Assuming Liquidation Threshold is LTV + 5% for safety buffer estimation
    const liqThreshold = ltvDecimal + 0.05;
    const health = finalDebt > 0 ? (finalCollateral * liqThreshold) / finalDebt : 999;

    return {
      collateral: finalCollateral,
      debt: finalDebt,
      netApy: netApy,
      health: health,
      leverage: actualLev,
      grossApy: initAmount > 0 ? (supplyYield / initAmount) * 100 : 0,
      borrowCostApy: initAmount > 0 ? (borrowCost / initAmount) * 100 : 0,
      totalUserEquity: initAmount
    };
  }, [quickForm, mode, advSteps]);

  // --- SUBMIT HANDLER ---
  const handleFinalSubmit = () => {
    let submissionData = {};

    if (mode === 'quick') {
      // Construct Loop Object from Quick Form
      submissionData = {
        loopName: quickForm.name,
        blockchain: quickForm.chain,
        collateralAsset: quickForm.asset,
        entryCollateralAmount: parseFloat(quickForm.initialAmount),
        collateralValue: simulatedStats.collateral,
        debtValue: simulatedStats.debt,
        leverageRatio: simulatedStats.leverage,
        yieldApyAggregate: simulatedStats.netApy,
        healthFactor: simulatedStats.health,
        mode: 'quick',
        notesTags: 'Quick Loop Strategy',
        // Generate synthetic protocol breakdown for the detail view
        protocolBreakdown: [
          {
            action: 'Supply',
            name: quickForm.protocol,
            asset: quickForm.asset,
            apy: quickForm.supplyApy,
            usdValue: simulatedStats.collateral.toString()
          },
          {
            action: 'Borrow',
            name: quickForm.protocol,
            asset: quickForm.asset, // Often borrowed asset is same in looping, or we can assume stable
            apy: quickForm.borrowApy,
            usdValue: simulatedStats.debt.toString()
          }
        ]
      };
    } else {
      // Construct Loop Object from Advanced Steps (mockup-compatible shape)
      const stepTypeToAction = (t) => {
        if (t === 'borrow') return 'Borrow';
        if (t === 'swap') return 'Swap';
        if (t === 'leveraged') return 'Loop';
        return 'Supply';
      };
      const protocolBreakdown = advSteps.map(s => ({
        stepType: s.stepType,
        action: stepTypeToAction(s.stepType),
        protocol: s.protocol,
        name: s.protocol, // duplication for compatibility
        asset: s.asset,
        amount: s.amount,
        usdValue: s.usdValue,
        apy: s.stepType === 'leveraged'
          ? ((parseFloat(s.leverage || 1) * parseFloat(s.lendingAPY || 0)) - ((parseFloat(s.leverage || 1) - 1) * parseFloat(s.borrowAPY || 0)))
          : s.apy,
        lendingAPY: s.lendingAPY,
        borrowAPY: s.borrowAPY,
        leverage: s.leverage,
        liquidationThreshold: s.liquidationThreshold,
        notes: s.notes,
        link: s.link
      }));

      submissionData = {
        loopName: advForm.loopName,
        blockchain: advForm.chain,
        collateralAsset: advSteps[0]?.asset || 'Multi',
        entryCollateralAmount: 0,
        collateralValue: simulatedStats.collateral,
        debtValue: simulatedStats.debt,
        leverageRatio: simulatedStats.leverage,
        yieldApyAggregate: simulatedStats.netApy,
        healthFactor: simulatedStats.health,
        mode: 'advanced',
        notesTags: advForm.description + (advForm.tags ? `, ${advForm.tags}` : ''),
        protocolBreakdown
      };
    }

    onSave(submissionData);
    onClose();
  };

  // --- SUB-SCREENS ---

  const ScreenModeSelection = () => (
    <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Select Strategy Type</h2>
        <p className="text-[#888]">Choose how you want to construct your position</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <button
          onClick={() => { setMode('quick'); setStep(2); }}
          className="group relative p-8 rounded-[32px] bg-[#141414] border border-[#222] text-left hover:border-[#FFE066] transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,224,102,0.1)]"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#FFE066]/10 flex items-center justify-center mb-6 group-hover:bg-[#FFE066] transition-colors">
            <Zap size={28} className="text-[#FFE066] group-hover:text-black" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Quick Loop</h3>
          <p className="text-[#888] text-sm leading-relaxed">
            Automated iterative lending & borrowing. Ideal for classic "Looping" strategies on Aave, Morpho, or Radiant.
          </p>
        </button>

        <button
          onClick={() => { setMode('advanced'); setStep(2); }}
          className="group relative p-8 rounded-[32px] bg-[#141414] border border-[#222] text-left hover:border-[#33FFCC] transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(51,255,204,0.1)]"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#33FFCC]/10 flex items-center justify-center mb-6 group-hover:bg-[#33FFCC] transition-colors">
            <Layers size={28} className="text-[#33FFCC] group-hover:text-black" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Advanced Custom</h3>
          <p className="text-[#888] text-sm leading-relaxed">
            Build complex, multi-protocol strategies. Mix flash loans, swaps, and cross-chain positions step-by-step.
          </p>
        </button>
      </div>
    </div>
  );

  const ScreenQuickLoop = () => (
    <div className="h-full p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFE066] flex items-center justify-center">
            <Zap size={16} className="text-black" />
          </div>
          Configure Loop
        </h2>

        <div className="bg-[#141414] p-6 rounded-[24px] border border-[#222] mb-6 space-y-4">
          <InputField
            label="Strategy Name"
            value={quickForm.name}
            onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Protocol" value={quickForm.protocol} onChange={(e) => setQuickForm({ ...quickForm, protocol: e.target.value })} suffix={<ChevronDown size={14} />} />
            <InputField label="Chain" value={quickForm.chain} onChange={(e) => setQuickForm({ ...quickForm, chain: e.target.value })} suffix={<ChevronDown size={14} />} />
          </div>
          <InputField label="Asset" value={quickForm.asset} onChange={(e) => setQuickForm({ ...quickForm, asset: e.target.value })} suffix={<ChevronDown size={14} />} />
        </div>

        <div className="bg-[#141414] p-6 rounded-[24px] border border-[#222] mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings size={18} className="text-[#FFE066]" />
            <h3 className="text-white font-medium">Loop Parameters</h3>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <InputField label="Initial Investment" value={quickForm.initialAmount} onChange={(e) => setQuickForm({ ...quickForm, initialAmount: e.target.value })} type="number" prefix={<DollarSign size={14} />} />
            <InputField label="Target Leverage" value={quickForm.leverageTarget} onChange={(e) => setQuickForm({ ...quickForm, leverageTarget: e.target.value })} type="number" suffix="x" helper={`Max safe leverage: ${(1 / (1 - (quickForm.ltv / 100))).toFixed(1)}x`} />
          </div>

          <div className="space-y-6 p-4 bg-[#0A0A0A] rounded-xl border border-[#222]">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#888]">LTV (Loan to Value)</span>
                <span className="text-[#FFE066]">{quickForm.ltv}%</span>
              </div>
              <input type="range" min="50" max="90" value={quickForm.ltv} onChange={(e) => setQuickForm({ ...quickForm, ltv: parseInt(e.target.value) })} className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#FFE066]" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <InputField label="Supply APY" value={quickForm.supplyApy} onChange={(e) => setQuickForm({ ...quickForm, supplyApy: e.target.value })} suffix="%" />
              <InputField label="Borrow APY" value={quickForm.borrowApy} onChange={(e) => setQuickForm({ ...quickForm, borrowApy: e.target.value })} suffix="%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ScreenAdvancedLoop = () => (
    <div className="h-full p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#33FFCC] flex items-center justify-center">
            <Layers size={16} className="text-black" />
          </div>
          Strategy Builder
        </h2>

        {/* Global Strategy Info */}
        <div className="bg-[#141414] p-6 rounded-[24px] border border-[#222] mb-8 space-y-4">
          <InputField
            label="Strategy Name"
            placeholder="e.g. Pendle + Morpho Arb"
            value={advForm.loopName}
            onChange={(e) => setAdvForm({ ...advForm, loopName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Chain"
              placeholder="Ethereum"
              value={advForm.chain}
              onChange={(e) => setAdvForm({ ...advForm, chain: e.target.value })}
            />
            <InputField
              label="Tags (Comma separated)"
              placeholder="Arbitrum, High Yield"
              value={advForm.tags}
              onChange={(e) => setAdvForm({ ...advForm, tags: e.target.value })}
            />
          </div>
          <InputField
            label="Description / Notes"
            placeholder="Context..."
            value={advForm.description}
            onChange={(e) => setAdvForm({ ...advForm, description: e.target.value })}
          />
        </div>

        {/* Dynamic Steps List */}
        <div className="space-y-2 mb-8 relative">
          {/* Vertical Connector Line for the whole list */}
          {advSteps.length > 1 && (
            <div className="absolute left-[24px] top-6 bottom-6 w-0.5 bg-[#222] z-0"></div>
          )}

          {advSteps.map((s, index) => (
            <AdvancedStepCard
              key={s.id}
              step={s}
              index={index}
              totalSteps={advSteps.length}
              updateStep={updateAdvStep}
              removeStep={removeAdvStep}
              moveStep={moveAdvStep}
            />
          ))}

          {/* Add Step Button */}
          <button
            onClick={addAdvStep}
            className="w-full py-6 mt-4 border border-dashed border-[#333] rounded-2xl flex flex-col items-center justify-center gap-2 text-[#666] hover:bg-[#141414] hover:text-[#33FFCC] hover:border-[#33FFCC]/30 transition-all group z-10 relative bg-[#050505]"
          >
            <div className="p-2 rounded-full bg-[#1A1A1A] group-hover:bg-[#33FFCC]/20 transition-colors">
              <Plus size={20} />
            </div>
            <span className="text-sm font-medium">Add Action Step</span>
          </button>
        </div>
      </div>
    </div>
  );

  const ScreenReview = () => (
    <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#FFE066] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,224,102,0.3)]">
          <CheckCircle2 size={32} className="text-black" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Ready to Launch?</h2>
        <p className="text-[#888]">Review your strategy metrics before confirming.</p>
      </div>

      <div className="bg-[#141414] border border-[#222] rounded-[24px] p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-[#222]">
          <span className="text-[#888]">Strategy Name</span>
          <span className="text-white font-medium text-lg">{mode === 'quick' ? quickForm.name : advForm.loopName}</span>
        </div>
        <div className="grid grid-cols-2 gap-y-6">
          <div>
            <span className="block text-[#888] text-xs uppercase mb-1">Net APY</span>
            <span className="text-[#33FFCC] font-bold text-xl">{simulatedStats.netApy.toFixed(2)}%</span>
          </div>
          <div className="text-right">
            <span className="block text-[#888] text-xs uppercase mb-1">Leverage</span>
            <span className="text-white font-bold text-xl">{simulatedStats.leverage.toFixed(2)}x</span>
          </div>
          <div>
            <span className="block text-[#888] text-xs uppercase mb-1">Total Collateral</span>
            <span className="text-white font-bold text-xl">${simulatedStats.collateral.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="text-right">
            <span className="block text-[#888] text-xs uppercase mb-1">Total Debt</span>
            <span className="text-[#FF6633] font-bold text-xl">${simulatedStats.debt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // --- MAIN RENDER ---

  return createPortal(
    <div className="fixed inset-0 z-[1000000] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
      <div className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-[1400px] bg-[#050505] rounded-none md:rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl border-0 md:border border-[#222] relative">

        {/* LEFT SIDE: Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="h-20 px-8 flex items-center justify-between border-b border-[#111]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => step > 1 ? setStep(step - 1) : null}
                className={`p-2 rounded-full hover:bg-[#222] transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <ArrowRight size={20} className="rotate-180 text-white" />
              </button>
              <span className="text-[#666] text-sm tracking-widest uppercase font-medium">
                {step === 1 ? 'Step 1/3: Selection' : step === 2 ? 'Step 2/3: Configuration' : 'Step 3/3: Review'}
              </span>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-[#111] text-white hover:bg-[#222]">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden bg-[#050505]">
            {step === 1 && (
              <ScreenModeSelectionStable
                onSelectQuick={() => { setMode('quick'); setStep(2); }}
                onSelectAdvanced={() => { setMode('advanced'); setStep(2); }}
              />
            )}
            {step === 2 && mode === 'quick' && (
              <ScreenQuickLoopStable
                quickForm={quickForm}
                setQuickForm={setQuickForm}
              />
            )}
            {step === 2 && mode === 'advanced' && (
              <ScreenAdvancedLoopStable
                advForm={advForm}
                setAdvForm={setAdvForm}
                advSteps={advSteps}
                updateAdvStep={updateAdvStep}
                removeAdvStep={removeAdvStep}
                addAdvStep={addAdvStep}
                moveAdvStep={moveAdvStep}
                duplicateAdvStep={duplicateAdvStep}
              />
            )}
            {step === 3 && (
              <ScreenReviewStable
                mode={mode}
                quickForm={quickForm}
                advForm={advForm}
                simulatedStats={simulatedStats}
              />
            )}
          </div>

          <div className="h-24 px-8 border-t border-[#111] flex items-center justify-between bg-[#050505]">
            <button onClick={onClose} className="px-6 py-3 rounded-full text-[#888] hover:text-white transition-colors text-sm font-medium">Cancel Process</button>
            {step < 3 ? (
              <button
                disabled={step === 1 && !mode}
                onClick={() => step === 1 ? setStep(2) : setStep(3)}
                className="px-8 py-3 rounded-full bg-[#FFE066] text-black font-semibold flex items-center gap-2 hover:bg-[#FFD633] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                className="px-8 py-3 rounded-full bg-[#33FFCC] text-black font-semibold flex items-center gap-2 hover:bg-[#22EEBB] transition-colors"
              >
                <CheckCircle2 size={18} />
                Confirm & Create Loop
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Real-time Stats - Hidden on Mobile */}
        <div className="hidden md:flex w-[420px] bg-[#101010] border-l border-[#222] p-8 flex-col relative z-10 overflow-y-auto shrink-0">
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#FFE066]" />
              Projected Analysis
            </h3>
            <p className="text-[#666] text-xs">Simulated based on current strategy</p>
          </div>

          <div className="space-y-6">
            {/* NET APY CARD */}
            <div className="p-6 rounded-[24px] bg-[#1A1A1A] border border-[#222] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <RefreshCw size={80} />
              </div>

              <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Projected Net APY</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold text-[#33FFCC] text-shadow-glow">
                  {simulatedStats.netApy.toFixed(2)}%
                </span>
              </div>

              {/* APY Breakdown */}
              <div className="space-y-2 pt-4 border-t border-[#333]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#888]">Gross Yield</span>
                  <span className="text-white font-medium">+{simulatedStats.grossApy.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-[#111] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#33FFCC]" style={{ width: '100%' }}></div>
                </div>

                <div className="flex justify-between text-xs mt-3">
                  <span className="text-[#888]">Borrow Cost</span>
                  <span className="text-[#FF6633] font-medium">-{simulatedStats.borrowCostApy.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-[#111] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF6633]" style={{ width: `${(simulatedStats.borrowCostApy / (simulatedStats.grossApy || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* EARNINGS ESTIMATOR */}
            <div className="p-6 rounded-[24px] bg-[#141414] border border-[#222]">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-[#33FFCC]/10 text-[#33FFCC]">
                  <DollarSign size={14} />
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-wide">Est. Earnings</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0A0A] p-3 rounded-xl border border-[#222]">
                  <p className="text-[#666] text-[10px] uppercase mb-1">Monthly</p>
                  <p className="text-white font-mono font-medium">
                    ${((simulatedStats.totalUserEquity * (simulatedStats.netApy / 100)) / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-[#0A0A0A] p-3 rounded-xl border border-[#222]">
                  <p className="text-[#666] text-[10px] uppercase mb-1">Yearly</p>
                  <p className="text-[#33FFCC] font-mono font-medium">
                    ${(simulatedStats.totalUserEquity * (simulatedStats.netApy / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>

            {/* HEALTH & POSITION */}
            <div className="p-6 rounded-[24px] bg-[#141414] border border-[#222]">
              <HealthBar factor={simulatedStats.health} />

              <div className="mt-6 pt-6 border-t border-[#222]">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[#888] text-[10px] uppercase">Effective Leverage</p>
                  <p className="text-white font-mono text-sm">{simulatedStats.leverage.toFixed(2)}x</p>
                </div>
                <div className="w-full bg-[#111] h-1.5 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-[#D946EF]" style={{ width: `${(simulatedStats.leverage / 5) * 100}%` }}></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[#888] text-[10px] uppercase mb-1">Equity</p>
                    <p className="text-sm font-mono text-white border-l-2 border-[#33FFCC] pl-2">
                      ${simulatedStats.totalUserEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#888] text-[10px] uppercase mb-1">Total Debt</p>
                    <p className="text-sm font-mono text-[#FF6633] border-l-2 border-[#FF6633] pl-2">
                      ${simulatedStats.debt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OrbitCreateLoop;