import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Mail, 
  Lock, 
  Sparkles, 
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Globe
} from 'lucide-react';

// --- DESIGN TOKENS & STYLES ---
const COLORS = {
  bg: '#050505',
  card: '#141414',
  primary: '#FFE066', // Orbit Yellow
  ai: '#8B5CF6',      // AI Violet
  textMuted: '#888888',
};

// --- CSS ANIMATIONS (Injected for the Orbit Effect) ---
const styles = `
  @keyframes orbit-rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
  }
  .orbit-ring {
    animation: orbit-rotate 60s linear infinite;
  }
  .orbit-ring-reverse {
    animation: orbit-rotate 80s linear infinite reverse;
  }
  .floating-card {
    animation: float 6s ease-in-out infinite;
  }
  .bg-grid-pattern {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  }
`;

// --- COMPONENTS ---

const InputField = ({ label, type, placeholder, icon }) => (
  <div className="space-y-2 group">
    <label className="text-xs font-bold text-[#666] uppercase tracking-wider group-focus-within:text-[#FFE066] transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666] group-focus-within:text-white transition-colors">
        {icon}
      </div>
      <input 
        type={type} 
        placeholder={placeholder}
        className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-[#444] focus:outline-none focus:border-[#FFE066] focus:ring-1 focus:ring-[#FFE066]/20 transition-all font-medium"
      />
    </div>
  </div>
);

const LoginScreenMockup = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-[#050505] text-white font-sans overflow-hidden relative selection:bg-[#FFE066] selection:text-black">
      <style>{styles}</style>

      {/* BACKGROUND NOISE & GRID */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 z-0 pointer-events-none"></div>
      
      {/* LEFT PANEL: LOGIN FORM */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center items-center relative z-20 p-8 lg:p-16 border-r border-[#111] bg-[#050505]/95 backdrop-blur-sm">
        
        <div className={`w-full max-w-md space-y-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Logo Area */}
          <div className="mb-12">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE066] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,224,102,0.2)]">
               <div className="w-5 h-5 bg-black rounded-sm transform rotate-45"></div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Dive into the Orbit.</h1>
            <p className="text-[#888]">
              Your command center for DeFi yields, looping strategies, and cross-chain risk management.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <InputField 
              label="Email Address" 
              type="email" 
              placeholder="commander@orbit.fi" 
              icon={<Mail size={18} />} 
            />
            
            <div className="space-y-2">
              <InputField 
                label="Password" 
                type="password" 
                placeholder="••••••••••••" 
                icon={<Lock size={18} />} 
              />
              <div className="flex justify-end">
                <a href="#" className="text-xs text-[#666] hover:text-[#FFE066] transition-colors">Forgot Password?</a>
              </div>
            </div>

            <button className="w-full py-4 rounded-xl bg-[#FFE066] text-black font-bold text-lg hover:bg-[#FFD633] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#FFE066]/20 flex items-center justify-center gap-2 group">
              <span>Initialize Session</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer */}
          <div className="pt-8 border-t border-[#222] flex items-center justify-between text-sm text-[#666]">
            <span>Don't have access?</span>
            <a href="#" className="text-white font-medium hover:text-[#FFE066] transition-colors">Request Invite</a>
          </div>

          {/* Trust Indicators */}
          <div className="flex gap-6 pt-4">
             <div className="flex items-center gap-2 text-[10px] text-[#444] uppercase tracking-wider">
                <ShieldCheck size={14} className="text-[#33FFCC]" />
                <span>Local Encryption</span>
             </div>
             <div className="flex items-center gap-2 text-[10px] text-[#444] uppercase tracking-wider">
                <Cpu size={14} className="text-[#8B5CF6]" />
                <span>AI Powered</span>
             </div>
             <div className="flex items-center gap-2 text-[10px] text-[#444] uppercase tracking-wider">
                <Globe size={14} />
                <span>No IP Logging</span>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: VISUALIZATION */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-gradient-to-br from-[#050505] via-[#0A0A0A] to-[#111]">
        
        {/* Glowing Orbs Background */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#8B5CF6] rounded-full blur-[180px] opacity-[0.1] animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#FFE066] rounded-full blur-[180px] opacity-[0.08]"></div>

        {/* The Orbit System (CSS Rings) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           {/* Ring 1 */}
           <div className="w-[800px] h-[800px] rounded-full border border-[#222] absolute orbit-ring opacity-30">
              <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-[#333] rounded-full"></div>
           </div>
           {/* Ring 2 */}
           <div className="w-[600px] h-[600px] rounded-full border border-[#222] absolute orbit-ring-reverse opacity-40">
              <div className="absolute bottom-1/2 -left-1.5 w-3 h-3 bg-[#444] rounded-full"></div>
           </div>
           {/* Ring 3 */}
           <div className="w-[400px] h-[400px] rounded-full border border-[#333] absolute orbit-ring opacity-50">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 w-3 h-3 bg-[#FFE066] rounded-full shadow-[0_0_15px_rgba(255,224,102,0.5)]"></div>
           </div>
        </div>

        {/* The Floating Dashboard Preview Card */}
        <div className={`relative z-30 transform transition-all duration-1000 delay-300 floating-card ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
           
           {/* Glass Card */}
           <div className="w-[420px] bg-[#141414]/80 backdrop-blur-xl border border-[#333] p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
              {/* Highlight gradient on card */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFE066] to-[#8B5CF6]"></div>
              
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Total Net Worth</p>
                    <h2 className="text-4xl font-bold text-white">$158,240.00</h2>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-[#FFE066]/10 flex items-center justify-center text-[#FFE066]">
                    <Sparkles size={20} />
                 </div>
              </div>

              {/* Fake Chart Lines */}
              <div className="flex items-end gap-2 h-16 mb-8 opacity-50">
                 <div className="w-1/6 bg-[#333] h-[40%] rounded-t-sm"></div>
                 <div className="w-1/6 bg-[#333] h-[60%] rounded-t-sm"></div>
                 <div className="w-1/6 bg-[#333] h-[50%] rounded-t-sm"></div>
                 <div className="w-1/6 bg-[#333] h-[80%] rounded-t-sm"></div>
                 <div className="w-1/6 bg-[#FFE066] h-[95%] rounded-t-sm shadow-[0_0_15px_rgba(255,224,102,0.3)]"></div>
                 <div className="w-1/6 bg-[#333] h-[70%] rounded-t-sm"></div>
              </div>

              {/* Status List */}
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0A] border border-[#222]">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-[#33FFCC] animate-pulse"></div>
                       <span className="text-sm font-medium">Loop Strategy #1</span>
                    </div>
                    <span className="text-[#33FFCC] text-sm">+18.5% APY</span>
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0A] border border-[#222]">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-[#8B5CF6]"></div>
                       <span className="text-sm font-medium">AI Risk Check</span>
                    </div>
                    <span className="text-white text-sm flex items-center gap-1">
                       <CheckCircle2 size={12} className="text-[#8B5CF6]" /> Optimized
                    </span>
                 </div>
              </div>

              {/* Decor */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FFE066] rounded-full blur-[60px] opacity-10"></div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default LoginScreenMockup;
