import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  Layers, 
  Calendar, 
  Tag, 
  FileText, 
  Lock, 
  Unlock, 
  CheckCircle2,
  Building2,
  Coins
} from 'lucide-react';

// --- DESIGN TOKENS ---
const COLORS = {
  bg: '#050505',
  card: '#141414',
  inputBg: '#0A0A0A',
  primary: '#FFE066', // Orbit Yellow
  cyan: '#33FFCC',
  orange: '#FF6633',
  red: '#FF4444',
  border: '#222222'
};

// --- HELPER COMPONENT: STYLIZED INPUT ---
const InputField = ({ label, name, value, onChange, placeholder, type = "text", step, suffix, prefix, className, min }) => (
  <div className={`flex flex-col gap-1.5 w-full ${className}`}>
    <label className="text-xs font-medium text-[#888] uppercase tracking-wide">{label}</label>
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
        step={step}
        className={`w-full bg-[#0A0A0A] border border-[#222] text-white rounded-xl px-4 py-3 
          focus:outline-none focus:border-[#FFE066] focus:ring-1 focus:ring-[#FFE066]/50 
          transition-all duration-300 font-medium placeholder:text-[#333] ${prefix ? 'pl-9' : ''}`}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-sm font-medium pointer-events-none">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

// --- MAIN MODAL COMPONENT ---

const CEXPositionForm = ({ isOpen, onClose, onSave, position }) => {
  // --- STATE ---
  const [formData, setFormData] = useState({
    exchange: '',
    asset: '',
    amount: '',
    usdValue: '',
    apy: '',
    status: 'Active', // 'Active' (Flexible), 'Locked', 'Withdrawn'
    unlockDate: '',
    tags: '',
    notes: ''
  });

  // Load data if editing
  useEffect(() => {
    if (position) {
      setFormData({
        exchange: position.exchange || '',
        asset: position.asset || '',
        amount: position.amount || '',
        usdValue: position.usdValue || '',
        apy: position.apy || '',
        status: position.status || 'Active',
        unlockDate: position.unlockDate || '',
        tags: position.tags || '',
        notes: position.notes || ''
      });
    } else {
      // Reset defaults
      setFormData({
        exchange: '',
        asset: '',
        amount: '',
        usdValue: '',
        apy: '',
        status: 'Active',
        unlockDate: '',
        tags: '',
        notes: ''
      });
    }
  }, [position, isOpen]);

  if (!isOpen) return null;

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.exchange || !formData.asset) {
      // Simple validation
      return; 
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#141414] border border-[#222] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="p-8 pb-0 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {position ? 'Edit Position' : 'New Staking Position'}
            </h2>
            <p className="text-[#666] text-xs mt-1">Track centralized exchange assets</p>
          </div>
          <button onClick={onClose} className="p-2 bg-[#222] rounded-full text-white hover:bg-[#333] transition-colors">
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           
           {/* 1. STATUS TOGGLE */}
           <div className="bg-[#0A0A0A] p-1 rounded-xl flex border border-[#222]">
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'Active' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.status === 'Active' ? 'bg-[#33FFCC] text-black shadow-lg' : 'text-[#666] hover:text-white'}`}
              >
                <Unlock size={14} /> Flexible / Active
              </button>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'Locked' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.status === 'Locked' ? 'bg-[#FF6633] text-black shadow-lg' : 'text-[#666] hover:text-white'}`}
              >
                <Lock size={14} /> Locked
              </button>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'Withdrawn' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.status === 'Withdrawn' ? 'bg-[#333] text-white' : 'text-[#666] hover:text-white'}`}
              >
                Withdrawn
              </button>
           </div>

           {/* 2. CORE INFO */}
           <div className="grid grid-cols-2 gap-4">
              <InputField 
                label="Exchange" 
                name="exchange"
                value={formData.exchange} 
                onChange={handleChange}
                placeholder="e.g. Binance" 
                prefix={<Building2 size={14} />}
              />
              <InputField 
                label="Asset" 
                name="asset"
                value={formData.asset} 
                onChange={handleChange}
                placeholder="e.g. DOT" 
                prefix={<Coins size={14} />}
              />
           </div>

           {/* 3. FINANCIALS */}
           <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <InputField 
                  label="Amount" 
                  name="amount"
                  type="number"
                  step="any"
                  value={formData.amount} 
                  onChange={handleChange}
                  placeholder="0.00" 
                  className="font-mono"
                />
              </div>
              <div className="col-span-6">
                <InputField 
                  label="USD Value" 
                  name="usdValue"
                  type="number"
                  step="any"
                  value={formData.usdValue} 
                  onChange={handleChange}
                  placeholder="0.00" 
                  prefix={<DollarSign size={14} />}
                  className="font-mono"
                />
              </div>
              <div className="col-span-12">
                <InputField 
                  label="APY / APR" 
                  name="apy"
                  type="number"
                  step="any"
                  value={formData.apy} 
                  onChange={handleChange}
                  placeholder="5.0" 
                  suffix="%"
                />
              </div>
           </div>

           {/* 4. LOCK DETAILS (CONDITIONAL) */}
           {formData.status === 'Locked' && (
             <div className="bg-[#1A1A1A] border border-[#FF6633]/30 rounded-xl p-4 animate-in slide-in-from-top-2">
               <div className="flex items-center gap-2 mb-3">
                 <Lock size={14} className="text-[#FF6633]" />
                 <span className="text-xs font-bold text-[#FF6633] uppercase">Lock Configuration</span>
               </div>
               <InputField 
                 label="Unlock Date" 
                 name="unlockDate"
                 type="date"
                 value={formData.unlockDate} 
                 onChange={handleChange}
                 prefix={<Calendar size={14} />}
                 className="bg-[#111]"
               />
             </div>
           )}

           {/* 5. METADATA */}
           <div className="space-y-4 pt-2 border-t border-[#222]">
              <InputField 
                label="Tags" 
                name="tags"
                value={formData.tags} 
                onChange={handleChange}
                placeholder="High Yield, Long Term..." 
                prefix={<Tag size={14} />}
              />
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-medium text-[#888] uppercase tracking-wide">Notes</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-3.5 text-[#666]" />
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Strategy details..." 
                    className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl pl-9 pr-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors resize-none text-sm" 
                  />
                </div>
              </div>
           </div>

           {/* FOOTER ACTIONS */}
           <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-4 rounded-xl border border-[#333] text-[#888] font-bold text-sm hover:bg-[#222] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-[2] py-4 rounded-xl bg-[#FFE066] text-black font-bold text-lg hover:bg-[#FFD633] transition-colors shadow-lg shadow-[#FFE066]/20 flex items-center justify-center gap-2"
              >
                 <CheckCircle2 size={18} />
                 {position ? 'Update Position' : 'Confirm Position'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default CEXPositionForm;