import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutGrid, Bell, User } from 'lucide-react';
import AIChatBar from '../components/AIChatBar';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/stats`);
        setStats(statsRes.data);

        // Fetch AI Analysis (Insights + Risk)
        const analysisRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/insights`);
        
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

  const handleChatResponse = (query, response) => {
    setChatHistory(prev => [
      ...prev, 
      { role: 'user', content: query },
      { role: 'model', content: response }
    ]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-8 ml-20"> {/* ml-20 to account for fixed sidebar */}
      {/* Ambient Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFE066]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-2">
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
                        <p className="text-sm">{msg.content}</p>
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
      </div>
    </div>
  );
};

export default OrbitAIDashboard;
