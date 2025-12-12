import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LayoutGrid, Bell, User, Layers, Activity, RefreshCw, Plus, ChevronDown } from 'lucide-react';
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
import { useToast } from "@/hooks/use-toast";

const OrbitAIDashboard = () => {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const { toast } = useToast();
  const [selectedAction, setSelectedAction] = useState(null);
  const [isActionModalOpen, setActionModalOpen] = useState(false);
  const [isCreateLoopOpen, setIsCreateLoopOpen] = useState(false);
  const [editingLoop, setEditingLoop] = useState(null);
  const [isCEXFormOpen, setIsCEXFormOpen] = useState(false);
  const [cexEditing, setCexEditing] = useState(null);
  const [isPositionsFormOpen, setIsPositionsFormOpen] = useState(false);
  const [positionsEditing, setPositionsEditing] = useState(null);
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
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

  const refreshData = async () => {
    setStats(null);
    setInsights([]);
    setRiskMetrics(null);
    setRiskScore(null);
    try {
      const base = process.env.REACT_APP_BACKEND_URL || '/api';
      const statsRes = await axios.get(`${base}/dashboard/stats`);
      setStats(statsRes.data);

      const analysisRes = await axios.get(`${base}/dashboard/insights`);
      if (analysisRes.data) {
        setInsights(analysisRes.data.insights || []);
        setRiskMetrics(analysisRes.data.risk_metrics || []);
        setRiskScore(analysisRes.data.risk_score);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      toast({
        title: "Connection Error",
        description: "Could not load dashboard data.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setStats(null);
      setInsights([]);
      setRiskMetrics(null);
      setRiskScore(null);
      try {
        const base = process.env.REACT_APP_BACKEND_URL || '/api';
        const statsRes = await axios.get(`${base}/dashboard/stats`);
        setStats(statsRes.data);

        // Fetch AI Analysis (Insights + Risk)
        const analysisRes = await axios.get(`${base}/dashboard/insights`);
        
        if (analysisRes.data) {
            setInsights(analysisRes.data.insights || []);
            setRiskMetrics(analysisRes.data.risk_metrics || []);
            setRiskScore(analysisRes.data.risk_score);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        toast({
          title: "Connection Error",
          description: "Could not load dashboard data.",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, [toast]);

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
  <div className="min-h-screen bg-black text-white p-6 md:p-8">
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFE066]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
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
                     <div className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === 'user' 
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
               <span className="bg-[#8B5CF6] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                 {insights.length} NEW
               </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>
        {/* Quick Actions Pill - Simplified */}
        <div ref={pillRef} className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#141414]/90 backdrop-blur-xl border border-[#222] rounded-full py-2 px-3 flex items-center gap-2 shadow-2xl z-40">
          <button
            className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-md text-white hover:bg-[#222] hover:rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30"
            title="Add a new position"
            aria-label="Add Position"
            onClick={() => setIsTypePickerOpen((v) => !v)}
          >
            <Plus size={16} />
            <span className="text-sm font-semibold">Add Position</span>
            <ChevronDown size={16} />
          </button>
          <div className="w-px h-6 bg-[#333]" />
          <button
            className="w-10 h-10 rounded-full bg-[#FFE066] text-black font-bold text-sm hover:bg-[#FFD633] transition-colors flex items-center justify-center"
            title="Refresh data"
            aria-label="Refresh"
            onClick={refreshData}
          >
            <RefreshCw size={16} />
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
