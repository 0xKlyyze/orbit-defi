import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Key, 
  Radio, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  Lock, 
  Terminal,
  Cpu,
  Sparkles
} from 'lucide-react';

// --- STYLES & ANIMATIONS ---
const styles = `
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.5); }
  }
  @keyframes drift {
    0% { transform: translate(0, 0); }
    100% { transform: translate(-20px, -40px); }
  }
  @keyframes success-pulse {
    0% { box-shadow: 0 0 0 0 rgba(51, 255, 204, 0.4); }
    70% { box-shadow: 0 0 0 20px rgba(51, 255, 204, 0); }
    100% { box-shadow: 0 0 0 0 rgba(51, 255, 204, 0); }
  }
  .scanline-overlay {
    background: linear-gradient(to bottom, transparent, rgba(255, 224, 102, 0.1), transparent);
    animation: scanline 3s linear infinite;
  }
  .star {
    position: absolute;
    background: white;
    border-radius: 50%;
  }
  .crt-flicker {
    animation: opacity 0.1s infinite;
  }
`;

const OrbitPortalMockup = () => {
  const [view, setView] = useState('selection'); // 'selection' | 'code' | 'waitlist' | 'success'
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [bgOffset, setBgOffset] = useState({ x: 0, y: 0 });

  // Mouse parallax effect
  const handleMouseMove = (e) => {
    const x = (window.innerWidth - e.pageX * 2) / 50;
    const y = (window.innerHeight - e.pageY * 2) / 50;
    setBgOffset({ x, y });
  };

  // Simulate Processing
  const handleSubmit = async (type) => {
    if (!inputValue) {
      setError('Input required');
      return;
    }
    
    setError('');
    setIsLoading(true);

    // Mock API delay
    setTimeout(() => {
      setIsLoading(false);
      // Mock validation
      if (type === 'code' && inputValue !== 'ORBIT-BETA') {
        setError('INVALID ACCESS VECTOR');
      } else {
        setView('success');
      }
    }, 1500);
  };

  // Reset state when going back
  const goBack = () => {
    setView('selection');
    setInputValue('');
    setError('');
  };

  return (
    <div 
      className="min-h-screen w-full bg-[#050505] text-white font-sans overflow-hidden relative flex items-center justify-center selection:bg-[#FFE066] selection:text-black"
      onMouseMove={handleMouseMove}
    >
      <style>{styles}</style>

      {/* --- LAYER 1: DYNAMIC SPACE BACKGROUND --- */}
      <div 
        className="absolute inset-0 pointer-events-none transition-transform duration-200 ease-out"
        style={{ transform: `translate(${bgOffset.x}px, ${bgOffset.y}px)` }}
      >
        {/* Nebulas */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#8B5CF6] rounded-full blur-[200px] opacity-[0.07]"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[#FFE066] rounded-full blur-[200px] opacity-[0.05]"></div>
        
        {/* Stars (Static Generation for Demo) */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.5 + 0.2,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite alternate`
            }}
          ></div>
        ))}
      </div>

      {/* --- LAYER 2: THE INTERFACE CONTAINER --- */}
      <div className="relative z-10 w-full max-w-md p-6">
        
        {/* Header Logo Area */}
        <div className={`flex flex-col items-center mb-12 transition-all duration-700 ${view === 'success' ? 'opacity-0 -translate-y-10 pointer-events-none' : 'opacity-100'}`}>
          <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#333] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,224,102,0.15)] relative overflow-hidden group">
             {/* Logo Scanline */}
             <div className="absolute inset-0 scanline-overlay opacity-30"></div>
             <div className="w-6 h-6 bg-[#FFE066] rounded-sm transform rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">ORBIT PROTOCOL</h1>
          <p className="text-[#666] text-sm uppercase tracking-widest">
            System Initialization <span className="animate-pulse">...</span>
          </p>
        </div>

        {/* --- MAIN CARD --- */}
        <div className="relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#222] rounded-[32px] overflow-hidden shadow-2xl min-h-[400px] flex flex-col">
          
          {/* Top Decorative Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] via-[#FFE066] to-[#8B5CF6] opacity-80"></div>

          <div className="flex-1 p-8 flex flex-col justify-center relative">
            
            {/* VIEW 1: SELECTION */}
            {view === 'selection' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button 
                  onClick={() => setView('code')}
                  className="w-full group relative p-5 rounded-2xl border border-[#333] bg-[#141414] hover:bg-[#1A1A1A] hover:border-[#FFE066] transition-all duration-300 text-left"
                >
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#333] group-hover:text-[#FFE066] transition-colors">
                    <Key size={24} />
                  </div>
                  <h3 className="text-white font-bold mb-1">Access Code</h3>
                  <p className="text-[#666] text-xs">I have a beta clearance key.</p>
                </button>

                <div className="flex items-center gap-4 text-[#333] text-xs uppercase tracking-widest my-2 justify-center">
                  <div className="h-px bg-[#222] flex-1"></div>
                  <span>Or</span>
                  <div className="h-px bg-[#222] flex-1"></div>
                </div>

                <button 
                  onClick={() => setView('waitlist')}
                  className="w-full group relative p-5 rounded-2xl border border-[#333] bg-transparent hover:bg-[#141414] hover:border-[#8B5CF6] transition-all duration-300 text-left"
                >
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#333] group-hover:text-[#8B5CF6] transition-colors">
                    <Radio size={24} />
                  </div>
                  <h3 className="text-[#888] group-hover:text-white font-bold mb-1 transition-colors">Join Waitlist</h3>
                  <p className="text-[#444] text-xs">Request early transmission uplink.</p>
                </button>
              </div>
            )}

            {/* VIEW 2: INPUT (Generic for both Code & Waitlist) */}
            {(view === 'code' || view === 'waitlist') && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <button onClick={goBack} className="flex items-center gap-2 text-[#666] hover:text-white text-xs uppercase tracking-widest mb-8 transition-colors">
                  <ChevronLeft size={14} /> Return
                </button>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {view === 'code' ? 'Security Clearance' : 'Establish Uplink'}
                    </h2>
                    <p className="text-[#888] text-sm">
                      {view === 'code' 
                        ? 'Enter your alpha-numeric access vector.' 
                        : 'Secure your position in the launch sequence.'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="relative group">
                      <div className={`absolute -inset-0.5 rounded-xl blur opacity-30 transition duration-500 ${view === 'code' ? 'bg-[#FFE066]' : 'bg-[#8B5CF6]'}`}></div>
                      <div className="relative flex items-center bg-[#050505] rounded-xl border border-[#333] group-focus-within:border-white transition-colors">
                         <div className="pl-4 text-[#666]">
                           {view === 'code' ? <Lock size={18} /> : <Terminal size={18} />}
                         </div>
                         <input 
                            autoFocus
                            type={view === 'code' ? "text" : "email"}
                            value={inputValue}
                            onChange={(e) => {
                              setInputValue(e.target.value.toUpperCase());
                              setError('');
                            }}
                            placeholder={view === 'code' ? "XXXX-XXXX-XXXX" : "COMMANDER@ORBIT.FI"}
                            className="w-full bg-transparent p-4 text-white placeholder:text-[#333] focus:outline-none font-mono tracking-wider uppercase"
                         />
                      </div>
                    </div>

                    {error && (
                      <div className="text-[#FF4444] text-xs font-mono flex items-center gap-2 animate-in slide-in-from-top-1">
                        <span className="w-1.5 h-1.5 bg-[#FF4444] rounded-full animate-pulse"></span>
                        {error}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleSubmit(view)}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      view === 'code' 
                      ? 'bg-[#FFE066] hover:bg-[#FFD633] shadow-[0_0_20px_rgba(255,224,102,0.2)]' 
                      : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <span>{view === 'code' ? 'AUTHENTICATE' : 'TRANSMIT SIGNAL'}</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 3: SUCCESS */}
            {view === 'success' && (
              <div className="text-center animate-in zoom-in-95 duration-700 flex flex-col items-center">
                <div 
                  className="w-20 h-20 rounded-full bg-[#33FFCC]/10 flex items-center justify-center mb-6 text-[#33FFCC] border border-[#33FFCC]/30"
                  style={{ animation: 'success-pulse 2s infinite' }}
                >
                  <CheckCircle2 size={40} />
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-2">ACCESS GRANTED</h2>
                <p className="text-[#888] text-sm mb-8">
                  Welcome to the vanguard, Commander. <br/>
                  Orbit is initializing your personal dashboard.
                </p>

                <div className="w-full bg-[#141414] rounded-lg p-4 border border-[#333] font-mono text-xs text-left space-y-2 opacity-80">
                   <div className="flex justify-between text-[#666]">
                      <span> LOADING_ASSETS...</span>
                      <span className="text-[#33FFCC]">DONE</span>
                   </div>
                   <div className="flex justify-between text-[#666]">
                      <span> CONNECTING_NODES...</span>
                      <span className="text-[#33FFCC]">DONE</span>
                   </div>
                   <div className="flex justify-between text-[#666]">
                      <span> DECRYPTING_UI...</span>
                      <span className="animate-pulse text-[#FFE066]">PROCESSING</span>
                   </div>
                </div>

                <div className="mt-8">
                   <button className="px-8 py-3 rounded-full border border-[#333] hover:bg-[#141414] hover:text-white text-[#666] text-sm transition-colors">
                      Enter Dashboard
                   </button>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Footer Info */}
          <div className="p-4 bg-[#080808] border-t border-[#1A1A1A] flex justify-between items-center text-[10px] text-[#444] uppercase tracking-wider font-mono">
             <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-[#FFE066] animate-pulse' : 'bg-[#33FFCC]'}`}></div>
                <span>Status: {isLoading ? 'Handshaking' : 'Online'}</span>
             </div>
             <div>
                v0.8.2_BETA
             </div>
          </div>
        </div>

        {/* Floating Abstract Element */}
        <div className="absolute -top-12 -right-12 text-[#222] animate-pulse opacity-50 z-0">
           <Cpu size={120} strokeWidth={0.5} />
        </div>

      </div>
    </div>
  );
};

export default OrbitPortalMockup;