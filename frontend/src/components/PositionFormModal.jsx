import React, { useState, useEffect } from 'react';
import { X, ExternalLink, FileText } from 'lucide-react';
import { toast } from 'sonner';

const PositionFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    type: 'Supply',
    platform: '',
    chain: '',
    asset: '',
    amount: '',
    usdValue: '',
    yieldAPY: '',
    wallet: '',
    link: '',
    notes: '',
    status: 'Active'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'Supply',
        platform: initialData.platform || '',
        chain: initialData.chain || '',
        asset: initialData.asset || '',
        amount: initialData.amount || '',
        usdValue: initialData.usdValue || '',
        yieldAPY: initialData.yieldAPY || '',
        wallet: initialData.wallet || '',
        link: initialData.link || '',
        notes: initialData.notes || '',
        status: initialData.status || 'Active'
      });
    } else {
      setFormData({
        type: 'Supply',
        platform: '',
        chain: '',
        asset: '',
        amount: '',
        usdValue: '',
        yieldAPY: '',
        wallet: '',
        link: '',
        notes: '',
        status: 'Active'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.platform || !formData.asset) {
      toast.error('Please fill in Platform and Asset');
      return;
    }
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#141414] border border-[#222] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="p-8 pb-0 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{initialData ? 'Edit Position' : 'Add Position'}</h2>
          <button onClick={onClose} className="p-2 bg-[#222] rounded-full text-white hover:bg-[#333]"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="bg-[#0A0A0A] p-1 rounded-xl flex border border-[#222]">
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'Supply' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.type === 'Supply' ? 'bg-[#33FFCC] text-black shadow-lg' : 'text-[#666] hover:text-white'}`}
              >
                Supply (Asset)
              </button>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'Borrow' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.type === 'Borrow' ? 'bg-[#FF6633] text-black shadow-lg' : 'text-[#666] hover:text-white'}`}
              >
                Borrow (Debt)
              </button>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-xs text-[#666] uppercase font-bold">Protocol</label>
                 <input 
                   name="platform" 
                   value={formData.platform} 
                   onChange={handleChange}
                   type="text" 
                   placeholder="e.g. Aave" 
                   className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs text-[#666] uppercase font-bold">Chain</label>
                 <input 
                   name="chain" 
                   value={formData.chain} 
                   onChange={handleChange}
                   type="text" 
                   placeholder="e.g. Ethereum" 
                   className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors" 
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-xs text-[#666] uppercase font-bold">Platform Link (URL)</label>
              <div className="relative">
                <ExternalLink size={16} className="absolute left-4 top-3.5 text-[#444]" />
                <input 
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  type="url" 
                  placeholder="https://app.aave.com..." 
                  className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors" 
                />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-xs text-[#666] uppercase font-bold">Asset</label>
                 <input 
                   name="asset" 
                   value={formData.asset} 
                   onChange={handleChange}
                   type="text" 
                   placeholder="USDC" 
                   className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs text-[#666] uppercase font-bold">Amount</label>
                 <input 
                   name="amount" 
                   value={formData.amount} 
                   onChange={handleChange}
                   type="number" 
                   step="any"
                   placeholder="0.00" 
                   className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none font-mono transition-colors" 
                 />
              </div>
           </div>

           <div className="space-y-2">
               <label className="text-xs text-[#666] uppercase font-bold">Current USD Value</label>
               <input 
                 name="usdValue" 
                 value={formData.usdValue} 
                 onChange={handleChange}
                 type="number" 
                 step="any"
                 placeholder="$ 0.00" 
                 className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none font-mono transition-colors" 
               />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-xs text-[#666] uppercase font-bold">APY (%)</label>
                 <input 
                   name="yieldAPY" 
                   value={formData.yieldAPY} 
                   onChange={handleChange}
                   type="number" 
                   step="any"
                   placeholder="4.5" 
                   className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs text-[#666] uppercase font-bold">Wallet</label>
                 <input 
                   name="wallet" 
                   value={formData.wallet} 
                   onChange={handleChange}
                   type="text" 
                   placeholder="Main Vault" 
                   className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors" 
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-xs text-[#666] uppercase font-bold">Notes</label>
              <div className="relative">
                <FileText size={16} className="absolute left-4 top-3.5 text-[#444]" />
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Strategy details, liquidation points..." 
                  className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#FFE066] outline-none transition-colors resize-none" 
                />
              </div>
           </div>

           <div className="pt-2 flex">
              <button type="submit" className="w-full py-4 rounded-xl bg-[#FFE066] text-black font-bold text-lg hover:bg-[#FFD633] transition-colors shadow-lg shadow-[#FFE066]/20">
                 {initialData ? 'Update Position' : 'Confirm Position'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default PositionFormModal;