import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Layers, Activity, BrainCircuit } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: LayoutGrid, label: 'Positions' },
    { to: '/liquid-restaking', icon: Layers, label: 'Liquid Restaking' },
    { to: '/cex-staking', icon: Activity, label: 'CEX Staking' },
    { to: '/ai-dashboard', icon: BrainCircuit, label: 'AI Dashboard' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-8 border-r border-[#111] z-50 bg-[#050505]">
      <div className="w-10 h-10 rounded-xl bg-[#FFE066] mb-12 flex items-center justify-center shadow-[0_0_15px_rgba(255,224,102,0.3)]">
        <div className="w-4 h-4 bg-black rounded-sm transform rotate-45"></div>
      </div>
      <nav className="flex flex-col gap-8 w-full items-center">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={`p-3 rounded-xl transition-colors cursor-pointer ${
                isActive ? 'bg-[#141414] text-[#FFE066]' : 'text-[#444] hover:text-white'
              }`}
            >
              <Icon size={24} />
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;