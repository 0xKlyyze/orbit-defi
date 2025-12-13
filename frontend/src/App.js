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
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
import OrbitPortalMockup from '@/components/components-mockups/OrbitPortalMockup';
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950/20" data-testid="orbit-app">
      <Toaster position="top-right" theme="dark" />
      
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/request-access" element={<OrbitPortalMockup />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
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
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;