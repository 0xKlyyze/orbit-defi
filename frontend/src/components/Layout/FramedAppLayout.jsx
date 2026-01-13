import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, Wallet, RefreshCw, Landmark, User, Minus, Square, X } from 'lucide-react';

// Window controls (safe no-ops when not in Electron)
const WindowControls = ({ isVisible }) => {
  const handleMinimize = () => window.electronAPI?.minimize();
  const handleMaximize = () => window.electronAPI?.toggleMaximize();
  const handleClose = () => window.electronAPI?.close();

  return (
    <div
      className={`
        absolute top-0 left-0 right-0 h-12 flex items-center justify-end px-4 z-50
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}
        bg-gradient-to-b from-[#0a0a0a]/80 to-transparent
      `}
    >
      <div className="flex space-x-2">
        <button
          onClick={handleMinimize}
          className="w-8 h-8 rounded-full bg-[#333] hover:bg-[#444] flex items-center justify-center transition-colors"
          title="Minimize"
        >
          <Minus size={14} className="text-white" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-8 h-8 rounded-full bg-[#2b2b2b] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors"
          title="Maximize"
        >
          <Square size={12} className="text-white" />
        </button>
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-full bg-[#7a1a1a] hover:bg-[#9a2a2a] flex items-center justify-center transition-colors"
          title="Close"
        >
          <X size={14} className="text-white" />
        </button>
      </div>
    </div>
  );
};

// Navigation link
const MainNavLink = ({ to, label, icon: Icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex flex-col items-center justify-center gap-2 w-16 h-16 rounded-2xl
      transition-all duration-200 group
      ${isActive ? 'bg-[#141414] text-[#FFE066] border border-[#222]' : 'text-[#666] hover:text-white hover:bg-[#0f0f0f]'}
    `}
    title={label}
  >
    <Icon size={24} strokeWidth={1.75} />
    <span className="text-[10px] font-medium">{label}</span>
  </NavLink>
);

const FramedAppLayout = ({ children }) => {
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setShowControls(e.clientY <= 50);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const mainNavItems = [
    { to: '/ai-dashboard', label: 'Home', icon: Brain },
    { to: '/positions', label: 'Positions', icon: Wallet },
    { to: '/liquid-restaking', label: 'Loops', icon: RefreshCw },
    { to: '/cex-staking', label: 'CEX', icon: Landmark },
  ];

  return (
    <div className="h-screen w-screen bg-[#050505] flex antialiased overflow-hidden relative">

      {/* Global subtle gradient across the entire background frame */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#FFE066]/10 via-transparent to-transparent" />
      {/* Additional radial glow to intensify yellow at top-left without touching line 85 */}
      <div
        className="pointer-events-none absolute inset-0 z-0 mix-blend-screen"
        style={{
          backgroundImage:
            'radial-gradient(1200px 1000px at 12% 12%, rgba(255,224,102,0.14) 0%, rgba(255,224,102,0.06) 34%, transparent 76%)',
        }}
      />

      {/* Framing Navigation - Hidden on Mobile */}
      <nav className="hidden md:flex w-20 flex-shrink-0 flex-col items-center py-6 gap-4 relative">
        {/* App Icon */}
        <div className="w-14 h-14 rounded-xl flex items-center justify-center translate-x-1">
          <img src="/logo.png" alt="App Logo" className="w-14 h-14 object-contain bg-transparent" style={{ background: 'transparent' }} />
        </div>

        {/* Main Navigation */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 translate-x-1">
          {mainNavItems.map(item => (
            <MainNavLink key={item.to} {...item} />
          ))}
        </div>

        {/* Utilities */}
        <div className="flex flex-col items-center gap-3 translate-x-1">
          <NavLink
            to="/profile"
            title="Profile"
            className={({ isActive }) => `
              p-3 rounded-xl transition-colors
              ${isActive ? 'bg-[#141414] text-[#FFE066] border border-[#222]' : 'bg-[#0a0a0a] border border-[#222] text-[#666] hover:bg-[#141414] hover:text-white'}
            `}
          >
            <User size={18} />
          </NavLink>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION PILL */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 p-1.5 rounded-full bg-[#141414]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {mainNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                 p-3 rounded-full transition-all duration-300 relative group
                 ${isActive ? 'bg-[#FFE066] text-black shadow-[0_0_15px_rgba(255,224,102,0.4)]' : 'text-[#888] hover:text-white hover:bg-white/5'}
               `}
            >
              <item.icon size={20} strokeWidth={2} />
              {/* Active Dot Indicator (Optional flair) */}
              {/* {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FFE066]" />} */}
            </NavLink>
          ))}

          <div className="w-px h-6 bg-white/10 mx-1"></div>

          <NavLink
            to="/profile"
            className={({ isActive }) => `
               p-3 rounded-full transition-all duration-300
               ${isActive ? 'bg-[#33FFCC] text-black shadow-[0_0_15px_rgba(51,255,204,0.4)]' : 'text-[#888] hover:text-white hover:bg-white/5'}
             `}
          >
            <User size={20} strokeWidth={2} />
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 h-screen p-0 md:p-2">
        {/* Gradient frame wrapper */}
        <div className="h-full w-full rounded-none md:rounded-xl p-0 md:p-[2px] bg-transparent md:bg-gradient-to-tl from-[#FFE066]/12 via-transparent to-transparent">
          <main className="h-full w-full bg-[#050505] md:bg-[#141414] border-0 md:border border-[#222] rounded-none md:rounded-xl overflow-hidden relative">
            <div className="h-full overflow-y-auto pb-24 md:pb-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default FramedAppLayout;
