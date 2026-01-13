import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LayoutGrid, Bell, User, Layers, Activity, RefreshCw, Plus, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import CreateLoopModal from '@/components/CreateLoopModal';
import CEXPositionForm from '@/components/CEXPositionForm';
import PositionFormModal from '@/components/PositionFormModal';
import { addLoop } from '@/services/firebaseLoops';
import { addCEXPosition } from '@/services/firebaseCEX';
import { addPosition } from '@/services/firebase';
import AIChatBar from '../components/AIChatBar';
import MarkdownMessage from '../components/MarkdownMessage';
import KPISection from '../components/KPISection';
import InsightCard from '../components/InsightCard';
import { InsightSkeletonGrid } from '../components/InsightCardSkeleton';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const OrbitAIDashboard = () => {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState(null);
  const [isActionModalOpen, setActionModalOpen] = useState(false);
  const [isCreateLoopOpen, setIsCreateLoopOpen] = useState(false);
  const [editingLoop, setEditingLoop] = useState(null);
  const [isCEXFormOpen, setIsCEXFormOpen] = useState(false);
  const [cexEditing, setCexEditing] = useState(null);
  const [isPositionsFormOpen, setIsPositionsFormOpen] = useState(false);
  const [positionsEditing, setPositionsEditing] = useState(null);
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const pillRef = useRef(null);

  const actionLabel = (type) => {
    if (type === 'loop') return 'New Loop';
    if (type === 'cexStake') return 'CEX Stake';
    return 'Traditional Position';
  };

  const handleActionTrigger = (type) => {
    setSelectedAction(type);
    setIsTypePickerOpen(false);
    if (type === 'loop') {
      setEditingLoop(null);
      setIsCreateLoopOpen(true);
      toast({ title: 'Looping', description: 'Create a new loop' });
    } else if (type === 'cexStake') {
      setCexEditing(null);
      setIsCEXFormOpen(true);
      toast({ title: 'CEX', description: 'Create a new CEX position' });
    } else {
      setPositionsEditing(null);
      setIsPositionsFormOpen(true);
      toast({ title: 'Lending/Borrowing', description: 'Create a new position' });
    }
  };

  const handleProceed = () => {
    toast({
      title: 'Action Initiated',
      description: `${actionLabel(selectedAction)} started`,
    });
    setActionModalOpen(false);
  };

  const apiBase = () => {
    const env = process.env.REACT_APP_BACKEND_URL;
    if (env) return env;
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    return isLocal ? 'http://localhost:4000/api' : 'https://orbit-api-614830362243.europe-west9.run.app/api';
  };

  const refreshData = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to load your dashboard.",
        variant: "destructive"
      });
      return;
    }
    setStats(null);
    setInsights([]);
    setRiskMetrics(null);
    setRiskScore(null);
    try {
      const statsRes = await axios.get(`${apiBase()}/dashboard/stats`);
      setStats(statsRes.data);

      const analysisRes = await axios.get(`${apiBase()}/dashboard/insights`);
      if (analysisRes.data) {
        setInsights(analysisRes.data.insights || []);
        setRiskMetrics(analysisRes.data.risk_metrics || []);
        setRiskScore(analysisRes.data.risk_score);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      const status = error?.response?.status;
      const description = status === 401
        ? "Unauthorized. Please sign in."
        : status === 403
          ? "Access forbidden. The API is not publicly accessible."
          : "Could not load dashboard data.";
      toast({ title: "Connection Error", description, variant: "destructive" });
    }
  };

  // Force regenerate AI insights (bypass cache)
  const regenerateInsights = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to regenerate insights.",
        variant: "destructive"
      });
      return;
    }
    setIsRegenerating(true);
    setInsights([]);
    setRiskMetrics(null);
    setRiskScore(null);
    try {
      // Use generate-analysis endpoint which always creates fresh insights
      const context = await axios.get(`${apiBase()}/dashboard/stats`);
      setStats(context.data);

      const analysisRes = await axios.post(`${apiBase()}/dashboard/generate-analysis`, {
        portfolio_data: context.data
      });

      if (analysisRes.data) {
        setInsights(analysisRes.data.insights || []);
        toast({
          title: "AI Insights Regenerated",
          description: "Fresh analysis has been generated.",
        });
      }

      // Also refresh the full insights to get risk metrics
      const fullRes = await axios.get(`${apiBase()}/dashboard/insights`);
      if (fullRes.data) {
        setRiskMetrics(fullRes.data.risk_metrics || null);
        setRiskScore(fullRes.data.risk_score);
      }
    } catch (error) {
      console.error("Failed to regenerate insights", error);
      toast({
        title: "Regeneration Failed",
        description: "Could not generate new insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setStats(null);
      setInsights([]);
      setRiskMetrics(null);
      setRiskScore(null);
      try {
        const statsRes = await axios.get(`${apiBase()}/dashboard/stats`);
        setStats(statsRes.data);

        // Fetch AI Analysis (Insights + Risk)
        const analysisRes = await axios.get(`${apiBase()}/dashboard/insights`);

        if (analysisRes.data) {
          setInsights(analysisRes.data.insights || []);
          setRiskMetrics(analysisRes.data.risk_metrics || []);
          setRiskScore(analysisRes.data.risk_score);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        const status = error?.response?.status;
        const description = status === 401
          ? "Unauthorized. Please sign in."
          : status === 403
            ? "Access forbidden. The API is not publicly accessible."
            : "Could not load dashboard data.";
        toast({ title: "Connection Error", description, variant: "destructive" });
      }
    };

    fetchData();
  }, [user, toast]);

  // Keyboard shortcuts: A opens Add Position picker, R refreshes data
  useEffect(() => {
    const onKey = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'a') {
        setIsTypePickerOpen(true);
      } else if (key === 'r') {
        refreshData();
      } else if (key === 'escape') {
        setIsTypePickerOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close type picker when clicking outside the pill container
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isTypePickerOpen && pillRef.current && !pillRef.current.contains(e.target)) {
        setIsTypePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTypePickerOpen]);

  useEffect(() => {
    const handler = (e) => {
      const tag = (e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '');
      if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'l') handleActionTrigger('loop');
      if (k === 's') handleActionTrigger('cexStake');
      if (k === 'c') handleActionTrigger('traditional');
      if (k === 'escape') setActionModalOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toast]);

  const handleChatResponse = (query, response) => {
    setChatHistory(prev => [
      ...prev,
      { role: 'user', content: query },
      { role: 'model', content: response }
    ]);
  };

  // Save handlers for inline modals
  const handleSaveLoop = async (loopData) => {
    try {
      const newLoop = await addLoop(loopData);
      setIsCreateLoopOpen(false);
      setEditingLoop(null);
      toast({ title: 'Loop created', description: 'Your loop was created successfully.' });
      refreshData();
    } catch (error) {
      console.error('Error creating loop:', error);
      toast({ title: 'Failed to create loop', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleSaveCEXPosition = async (positionData) => {
    try {
      const newPos = await addCEXPosition(positionData);
      setIsCEXFormOpen(false);
      setCexEditing(null);
      toast({ title: 'CEX position created', description: 'Position added successfully.' });
      refreshData();
    } catch (error) {
      console.error('Error creating CEX position:', error);
      toast({ title: 'Failed to create position', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleSavePosition = async (positionData) => {
    try {
      const newPos = await addPosition(positionData);
      setIsPositionsFormOpen(false);
      setPositionsEditing(null);
      toast({ title: 'Position created', description: 'Position added successfully.' });
      refreshData();
    } catch (error) {
      console.error('Error creating position:', error);
      toast({ title: 'Failed to create position', description: 'Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Ambient Background (Restored) */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tl from-[#FFE066]/14 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-0 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(1200px 1000px at 12% 12%, rgba(255,224,102,0.22) 0%, rgba(255,224,102,0.12) 34%, transparent 76%)' }} />
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/12 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-[#FFE066]/8 rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Mobile Header (New Unified Standard) */}
        <header className="md:hidden flex flex-col gap-4 mb-6">
          {/* Row 1: Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] flex items-center justify-center border border-[#222]">
              <img src="/logo.png" alt="Orbit Logo" className="w-5 h-5 object-contain" />
            </div>
            <h1 className="text-white text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">Orbit AI</h1>
          </div>
        </header>

        {/* Desktop Header (Spacious) */}
        <header className="hidden md:flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-2 pb-1">
              Good evening, Commander
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#33FFCC] rounded-full animate-pulse" />
              <span className="text-[#33FFCC] text-sm font-medium tracking-wide uppercase">Orbit AI Systems Online</span>
            </div>
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-full text-sm font-medium transition-all hover:border-[#8B5CF6]/50 group">
            <LayoutGrid className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            Customize Layout
          </button>
        </header>

        {/* AI Chat Bar */}
        <AIChatBar onChatResponse={handleChatResponse} />

        {/* Chat History Display (Temporary for MVP) */}
        {chatHistory.length > 0 && (
          <div className="mb-8 p-6 bg-[#141414] border border-[#222] rounded-[24px]">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Conversation</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                    ? 'bg-[#8B5CF6]/20 text-white rounded-tr-none'
                    : 'bg-[#222] text-gray-300 rounded-tl-none'
                    }`}>
                    {msg.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <MarkdownMessage content={msg.content} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Grid - Passing AI Data */}
        <KPISection stats={stats} riskMetrics={riskMetrics} riskScore={riskScore} />

        {/* Insights Stream */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">Orbit Intelligence Stream</h2>
              {insights.length > 0 ? (
                <span className="bg-[#8B5CF6] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {insights.length} NEW
                </span>
              ) : !stats && (
                <span className="bg-[#333] text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  Loading...
                </span>
              )}
            </div>
          </div>

          {/* Show skeleton loaders when insights are empty and stats haven't loaded yet */}
          {insights.length === 0 && !stats ? (
            <InsightSkeletonGrid count={3} />
          ) : insights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-[#222] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#8B5CF6]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No insights yet</h3>
              <p className="text-gray-400 text-sm max-w-md">
                Click "Regenerate AI" to generate fresh AI-powered insights about your portfolio.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
        </section>
        {/* Quick Actions Pill - Simplified */}
        <div ref={pillRef} className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-[#141414]/90 backdrop-blur-xl border border-[#222] rounded-full py-2 px-3 flex items-center gap-2 shadow-2xl z-40 transition-all duration-300">
          <button
            className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-md text-white hover:bg-[#222] hover:rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30"
            title="Add a new position"
            aria-label="Add Position"
            onClick={() => setIsTypePickerOpen((v) => !v)}
          >
            <Plus size={16} />
            <span className="text-xs md:text-sm font-semibold whitespace-nowrap">Add Position</span>
            <ChevronDown size={16} />
          </button>
          <div className="w-px h-6 bg-[#333]" />
          <button
            className="w-10 h-10 rounded-full bg-[#FFE066] text-black font-bold text-sm hover:bg-[#FFD633] transition-colors flex items-center justify-center"
            title="Refresh dashboard data"
            aria-label="Refresh Data"
            onClick={refreshData}
          >
            <RefreshCw size={16} />
          </button>
          <div className="w-px h-6 bg-[#333]" />
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isRegenerating
              ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] cursor-wait'
              : 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white hover:from-[#7C3AED] hover:to-[#8B5CF6] hover:shadow-lg hover:shadow-[#8B5CF6]/25'
              }`}
            title="Regenerate AI insights"
            aria-label="Regenerate AI Insights"
            onClick={regenerateInsights}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            <span className="hidden sm:inline">{isRegenerating ? 'Generating...' : 'Regenerate AI'}</span>
          </button>

          {isTypePickerOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-16 bg-[#141414] border border-[#222] rounded-2xl p-2 shadow-2xl w-[340px]">
              <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#222] text-[#bbb] hover:text-white transition-colors" onClick={() => handleActionTrigger('loop')}>
                  <Layers size={18} />
                  <span className="text-xs font-medium">Add Loop</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#222] text-[#bbb] hover:text-white transition-colors" onClick={() => handleActionTrigger('traditional')}>
                  <LayoutGrid size={18} />
                  <span className="text-xs font-medium">Add Lending</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#222] text-[#bbb] hover:text-white transition-colors" onClick={() => handleActionTrigger('cexStake')}>
                  <Activity size={18} />
                  <span className="text-xs font-medium">Add CEX</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Inline Creation Modals */}
        {isCreateLoopOpen && (
          <CreateLoopModal
            onClose={() => { setIsCreateLoopOpen(false); setEditingLoop(null); }}
            onSave={handleSaveLoop}
            loop={editingLoop}
          />
        )}

        <CEXPositionForm
          isOpen={isCEXFormOpen}
          onClose={() => { setIsCEXFormOpen(false); setCexEditing(null); }}
          onSave={handleSaveCEXPosition}
          position={cexEditing}
        />

        <PositionFormModal
          isOpen={isPositionsFormOpen}
          onClose={() => { setIsPositionsFormOpen(false); setPositionsEditing(null); }}
          onSave={handleSavePosition}
          initialData={positionsEditing}
        />
      </div>
    </div>
  );
};

const ActionIcon = ({ icon, label, shortcut, onClick }) => (
  <button className="flex items-center gap-2 px-4 py-2 hover:bg-[#222] rounded-full text-[#888] hover:text-white transition-all group" onClick={onClick}>
    {icon}
    <span className="text-sm font-medium">{label}</span>
    <span className="text-[10px] bg-[#000] px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{shortcut}</span>
  </button>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default OrbitAIDashboard;
