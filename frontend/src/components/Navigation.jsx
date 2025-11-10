import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, TrendingUp } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="flex gap-2 mb-6" data-testid="dashboard-navigation">
      <Link
        to="/"
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
          isActive('/')
            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20'
            : 'bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-red-500/20'
        }`}
        data-testid="nav-positions"
      >
        <BarChart3 size={20} />
        Positions Tracker
      </Link>
      <Link
        to="/liquid-restaking"
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
          isActive('/liquid-restaking')
            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20'
            : 'bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-red-500/20'
        }`}
        data-testid="nav-liquid-restaking"
      >
        <TrendingUp size={20} />
        Liquid Restaking
      </Link>
    </nav>
  );
};

export default Navigation;