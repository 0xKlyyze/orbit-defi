import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import FramedAppLayout from '@/components/Layout/FramedAppLayout';
import PositionsDashboard from '@/pages/PositionsDashboard';
import LiquidRestakingDashboard from '@/pages/LiquidRestakingDashboard';
import CEXStakingDashboard from '@/pages/CEXStakingDashboard';

import OrbitAIDashboard from '@/pages/OrbitAIDashboard';
import Profile from '@/pages/Profile';
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950/20" data-testid="orbit-app">
      <Toaster position="top-right" theme="dark" />
      
      <BrowserRouter>
        <FramedAppLayout>
          <Routes>
            <Route path="/" element={<OrbitAIDashboard />} />
            <Route path="/positions" element={<PositionsDashboard />} />
            <Route path="/liquid-restaking" element={<LiquidRestakingDashboard />} />
            <Route path="/cex-staking" element={<CEXStakingDashboard />} />
            <Route path="/ai-dashboard" element={<OrbitAIDashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </FramedAppLayout>
      </BrowserRouter>
    </div>
  );
}

export default App;