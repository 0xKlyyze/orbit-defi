import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Brain, Wallet, RefreshCw, Landmark, User } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { to: '/ai-dashboard', icon: Brain, label: 'AI Dashboard' },
    { to: '/positions', icon: Wallet, label: 'Positions' },
    { to: '/liquid-restaking', icon: RefreshCw, label: 'Liquid Restaking' },
    { to: '/cex-staking', icon: Landmark, label: 'CEX Staking' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center pt-8 border-r border-[#111] z-50 bg-[#050505]">
      <div className="mb-14 w-14 h-14 rounded-xl bg-[#0a0a0a] flex items-center justify-center shadow-[0_0_14px_rgba(0,0,0,0.25)]">
        <img
          src="/logo.png"
          alt="App Logo"
          className="w-14 h-14 object-contain rounded-md"
        />
      </div>
      <nav className="flex flex-col gap-8 w-full items-center flex-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to === '/ai-dashboard' && location.pathname === '/');
          const isAIDashboard = to === '/ai-dashboard';
          return (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={`p-3 rounded-xl transition-colors cursor-pointer ${
                isActive ? 'bg-[#141414] text-[#FFE066]' : 'text-[#444] hover:text-white'
              } ${isAIDashboard ? 'bg-gradient-to-br from-[#7C3AED]/20 via-[#8B5CF6]/10 to-[#A78BFA]/5 shadow-[0_0_18px_rgba(139,92,246,0.2)] hover:from-[#7C3AED]/30 hover:via-[#8B5CF6]/20 hover:to-[#A78BFA]/10' : ''}`}
            >
              <Icon size={24} className={isAIDashboard ? 'text-[#A78BFA]' : ''} />
            </NavLink>
          );
        })}
      </nav>
      {/* Bottom Profile avatar-style button */}
      <div className="absolute bottom-[15px] left-1/2 -translate-x-1/2">
        <NavLink
          to="/profile"
          aria-label="Profile"
          title="Profile"
          className="group inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#60A5FA] shadow-[0_0_18px_rgba(96,165,250,0.22)] border border-[#1F1F1F] hover:shadow-[0_0_22px_rgba(96,165,250,0.3)]"
        >
          <User size={18} className="opacity-80" />
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;