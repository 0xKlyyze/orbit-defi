import React from 'react';
import { X, Zap, Settings } from 'lucide-react';
import { Button } from './ui/button';

const LoopFormSelector = ({ isOpen, onClose, onSelectMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" data-testid="loop-mode-selector">
      <div className="relative w-full max-w-3xl bg-gradient-to-br from-zinc-900/95 to-black/95 backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-2xl shadow-red-500/10 p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          data-testid="close-selector"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-white mb-2">Create New Loop</h2>
        <p className="text-zinc-400 mb-8">Choose the mode that best fits your strategy</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Mode */}
          <button
            onClick={() => onSelectMode('quick')}
            data-testid="select-quick-mode"
            className="group bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl hover:border-red-500/40"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                <Zap className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Quick Loop</h3>
                <p className="text-sm text-zinc-500">Fast & Simple</p>
              </div>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              Perfect for classic iterative lending-borrowing loops on a single protocol (e.g., Aave, Morpho).
            </p>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                One protocol, one asset pair
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                Define iterations & borrow amounts
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                Auto-calculated APY & health factor
              </li>
            </ul>
          </button>

          {/* Advanced Mode */}
          <button
            onClick={() => onSelectMode('advanced')}
            data-testid="select-advanced-mode"
            className="group bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 backdrop-blur-md border border-orange-500/20 rounded-xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl hover:border-orange-500/40"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                <Settings className="text-orange-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Advanced Loop</h3>
                <p className="text-sm text-zinc-500">Full Control</p>
              </div>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              For complex strategies with multiple assets, protocols, swaps, and custom step ordering.
            </p>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                Multi-protocol, multi-asset support
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                Custom step-by-step builder
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                Flexible position composition
              </li>
            </ul>
          </button>
        </div>

        <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
          <p className="text-sm text-zinc-400">
            <span className="font-semibold text-zinc-300">💡 Tip:</span> Start with Quick Loop for simple strategies. 
            Use Advanced Loop for complex multi-step positions or if you need more control.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoopFormSelector;