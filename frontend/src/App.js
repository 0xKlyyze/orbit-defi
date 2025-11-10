import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navigation from '@/components/Navigation';
import PositionsDashboard from '@/pages/PositionsDashboard';
import LiquidRestakingDashboard from '@/pages/LiquidRestakingDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950/20" data-testid="orbit-app">
      <Toaster position="top-right" theme="dark" />
      
      <BrowserRouter>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <header className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-2" data-testid="app-title">
              Orbit<span className="text-red-500">.</span>
            </h1>
            <p className="text-zinc-400 text-lg mb-6">DeFi Position Tracker</p>
            <Navigation />
          </header>

          <Routes>
            <Route path="/" element={<PositionsDashboard />} />
            <Route path="/liquid-restaking" element={<LiquidRestakingDashboard />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;