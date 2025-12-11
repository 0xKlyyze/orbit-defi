import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from '@/components/Sidebar';
import PositionsDashboard from '@/pages/PositionsDashboard';
import LiquidRestakingDashboard from '@/pages/LiquidRestakingDashboard';
import CEXStakingDashboard from '@/pages/CEXStakingDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950/20" data-testid="orbit-app">
      <Toaster position="top-right" theme="dark" />
      
      <BrowserRouter>
        <Sidebar />
        <Routes>
          <Route path="/" element={<PositionsDashboard />} />
          <Route path="/liquid-restaking" element={<LiquidRestakingDashboard />} />
          <Route path="/cex-staking" element={<CEXStakingDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;